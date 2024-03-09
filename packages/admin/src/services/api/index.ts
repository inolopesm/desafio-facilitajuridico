interface ApiRequest {
  method?: string;
  path: string;
  data?: any;
  signal?: AbortSignal;
}

if (import.meta.env.VITE_API_BASE_URL === undefined) {
  throw new Error('VITE_API_BASE_URL is not defined');
}

export async function api<T = any>(request: ApiRequest) {
  const init: RequestInit = {};

  if (request.method !== undefined) {
    init.method = request.method;
  }

  if (request.data !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(request.data);
  }

  if (request.signal !== undefined) {
    init.signal = request.signal;
  }

  const url = `${import.meta.env.VITE_API_BASE_URL}${request.path}`;
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return { data: data as T };
}
