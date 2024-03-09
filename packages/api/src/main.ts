import cors from '@fastify/cors';
import type { JSONSchemaType } from 'ajv';
import fastify from 'fastify';
import pg from 'pg';
import dotenv from 'dotenv';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

interface AddOClientDTO {
  name: string;
  email: string;
  phone: string;
}

dotenv.config();

const database = new pg.Pool({ connectionString: process.env.POSTGRES_URL });

const server = fastify();

server.register(cors);

server.get('/api/clients', {
  handler: async (request, reply) => {
    const sql = 'SELECT * FROM clients';
    const query = await database.query<Client>(sql);
    reply.status(200);
    reply.send(query.rows);
  },
});

server.get<{ Params: { id: string } }>('/api/clients/:id', {
  schema: {
    params: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: { id: { type: 'string', format: 'uuid' } },
    },
  },
  handler: async (request, reply) => {
    const { id } = request.params;
    const sql = 'SELECT * FROM clients WHERE id = $1';
    const values = [id];
    const query = await database.query<Client>(sql, values);

    if (query.rowCount === 0) {
      reply.code(404);
      reply.send({ message: 'client not found' });
      return;
    }

    const client = query.rows[0] as Client;

    reply.code(200);
    reply.send(client);
  },
});

server.post('/api/clients', {
  schema: {
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'email', 'phone'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255, format: 'email' },
        phone: { type: 'string', minLength: 1, maxLength: 255 },
      },
    } satisfies JSONSchemaType<AddOClientDTO>,
  },
  handler: async (request, reply) => {
    const { name, email, phone } = request.body as AddOClientDTO;
    const sql = 'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, phone];
    const query = await database.query(sql, values);
    const client = query.rows[0] as Client;
    reply.code(201);
    reply.send(client);
  },
});

await server.listen({ port: 3333, host: '0.0.0.0' });
console.log('server listening on port 3333');
