import cors from '@fastify/cors';
import type { JSONSchemaType } from 'ajv';
import fastify from 'fastify';
import pg from 'pg';
import dotenv from 'dotenv';

interface Point {
  x: number;
  y: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  coordinates: Point | null;
  created_at: Date;
  updated_at: Date;
}

interface AddOClientDTO {
  name: string;
  email: string;
  phone: string;
  coordinates?: Point | null;
}

interface ClientWithCoordinates extends Omit<Client, 'coordinates'> {
  coordinates: Point;
}

function calculateDistance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function findNearestNeighbor<T extends Point>(point: T, remainingPoints: T[]): T {
  if (remainingPoints.length === 0) {
    throw new Error('No remaining points');
  }

  let nearestNeighbor = remainingPoints[0] as T;
  let shortestDistance = calculateDistance(point, nearestNeighbor);

  for (let i = 1; i < remainingPoints.length; i++) {
    const distance = calculateDistance(point, remainingPoints[i] as T);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestNeighbor = remainingPoints[i] as T;
    }
  }

  return nearestNeighbor;
}

function applyTwoOpt<T extends Point>(route: T[]): T[] {
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length - 1; j++) {
        const distanceBefore = calculateDistance(route[i] as T, route[i + 1] as T) + calculateDistance(route[j] as T, route[j + 1] as T);
        const distanceAfter = calculateDistance(route[i] as T, route[j] as T) + calculateDistance(route[i + 1] as T, route[j + 1] as T);

        if (distanceAfter < distanceBefore) {
          route.splice(i + 1, j - i, ...route.slice(i + 1, j + 1).reverse());
          improved = true;
        }
      }
    }
  }

  return route;
}

dotenv.config();

const database = new pg.Pool({ connectionString: process.env.POSTGRES_URL });

const server = fastify();

server.register(cors);

server.setErrorHandler((error, request, reply) => {
  console.error(error);
  reply.status(500);
  reply.send({ message: 'Internal Server Error' });
});

server.get('/api/clients', {
  handler: async (request, reply) => {
    const sql = 'SELECT * FROM clients';
    const query = await database.query<Client>(sql);
    const clients = query.rows;
    reply.status(200);
    reply.send(clients);
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
        coordinates: {
          type: 'object',
          additionalProperties: false,
          required: ['x', 'y'],
          properties: { x: { type: 'number' }, y: { type: 'number' } },
          nullable: true,
        },
      },
    } satisfies JSONSchemaType<AddOClientDTO>,
  },
  handler: async (request, reply) => {
    const requestBody = request.body as AddOClientDTO;
    const { name, email, phone } = requestBody;

    const coordinates = requestBody.coordinates
      ? `(${requestBody.coordinates.x}, ${requestBody.coordinates.y})`
      : null;

    const sql = 'INSERT INTO clients (name, email, phone, coordinates) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [name, email, phone, coordinates];
    const query = await database.query(sql, values);
    const client = query.rows[0] as Client;
    reply.code(201);
    reply.send(client);
  },
});

server.get('/api/clients/route', {
  handler: async (request, reply) => {
    const sql = 'SELECT * FROM clients WHERE coordinates IS NOT NULL';
    const query = await database.query<ClientWithCoordinates>(sql);
    const clients = query.rows;

    if (clients.length < 2) {
      reply.code(200);
      reply.send(clients);
      return;
    }

    type PointWithId = Point & { id: string };
    const initialPoint: PointWithId = { x: 0, y: 0, id: 'initial' };
    const remainingPoints = clients.map<PointWithId>((client) => ({ ...client.coordinates, id: client.id }));
    const route: PointWithId[] = [initialPoint];

    while (remainingPoints.length > 0) {
      const nearestNeighbor = findNearestNeighbor<PointWithId>(route[route.length - 1] as PointWithId, remainingPoints);
      route.push(nearestNeighbor);
      remainingPoints.splice(remainingPoints.indexOf(nearestNeighbor), 1);
    }

    const clientsMap = new Map<string, ClientWithCoordinates>(clients.map((client) => [client.id, client]));

    const sortedClients = applyTwoOpt(route)
      .map((point) => clientsMap.get(point.id) as ClientWithCoordinates)
      .filter(Boolean);

    reply.code(200);
    reply.send(sortedClients);
  },
});

await server.listen({ port: 3333, host: '0.0.0.0' });
console.log('server listening on port 3333');
