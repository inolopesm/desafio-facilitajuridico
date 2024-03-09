# desafio-facilitajuridico

https://docs.google.com/document/d/1D9UFnRlWfUUlizmGV-8EIKT8YXpjO2Fxzw7ch1muz9U/edit


## Pré-Requisitos

- Node v18
- NPM v10
- PostgreSQL v16

## Instalação

```
npm ci
```

## Configuração

### api

Crie um arquivo chamado `.env` dentro de `packages/api` utilizando como base o arquivo `.env.example`

### admin

Crie um arquivo chamado `.env.local` dentro de `packages/admin` utilizando como base o arquivo `.env.example`

## Execução

### Modo de Desenvolvimento

- `api`: `npm run dev -w packages/api`
- `admin`: `npm run dev -w packages/admin`

### Modo de Produção

- `api`: `npm start -w packages/api`
- `admin`: `npm run build -w packages/api`*

\* você precisará servir os arquivos estáticos em algum lugar ou de alguma forma, através por exemplo de um NGINX ou similar
