import fastify from 'fastify';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const database = new pg.Pool({ connectionString: process.env.POSTGRES_URL });

const server = fastify();

server.get('/clients', async () => {
  const clientsQuery = await database.query('SELECT * FROM clients');
  return clientsQuery.rows;
});

await server.listen({ port: 3333, host: '0.0.0.0' });
console.log('server listening on port 3333');
