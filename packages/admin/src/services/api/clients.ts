import { api } from './index';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  coordinates: { x: number; y: number } | null;
  created_at: string;
  updated_at: string;
}

export interface GetClientsParams {
  signal?: AbortSignal;
}

export interface GetClientsResult extends Array<Client> {}

export async function getClients({ signal }: GetClientsParams) {
  const response = await api<GetClientsResult>({ path: '/clients', signal });
  return response.data;
}

export interface AddClientParams {
  name: string;
  email: string;
  phone: string;
  coordinates?: { x: number; y: number } | null;
}

export interface AddClientResult extends Client {}

export async function addClient(params: AddClientParams) {
  const [method, path] = ['POST', '/clients'];
  const data = { ...params };
  const response = await api<AddClientResult>({ method, path, data });
  return response.data;
}

export interface GetClientsRouteParams {
  signal?: AbortSignal;
}

export interface GetClientsRouteResult extends Array<Client> {}

export async function getClientsRoute({ signal }: GetClientsRouteParams) {
  const response = await api<GetClientsRouteResult>({ path: '/clients/route', signal });
  return response.data;
}
