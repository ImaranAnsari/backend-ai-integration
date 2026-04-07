# CODEMAYA Smart Q&A API

Node.js + Express backend with MongoDB, JWT auth, rate limiting, and a grounded RAG-style Q&A endpoint using LangChain.

## Features

- Modular backend architecture: `routes/`, `services/`, `models/`, `controllers/`
- Seed script with 5 domain docs (`yarn seed`)
- `GET /api/docs` for sanity check
- `POST /api/ask` with retrieval + LangChain prompt + schema-validated output
- JWT auth (`/api/auth/register`, `/api/auth/login`)
- Per-user rate limit for `/api/ask` (10 requests/minute)
- Structured ask logging (`userId`, question, latencyMs, confidence)
- Global error handler
- Bonus: `GET /api/ask/history` for last 10 Q&A pairs
- Bonus: `docker-compose.yml`

## Tech Stack

- Express
- MongoDB + Mongoose
- LangChain + OpenAI
- Zod
- JWT
- express-rate-limit
- Jest + Supertest

## Quick Setup (under 5 mins)

1. Install dependencies:

```bash
yarn install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Update required env values:

- `OPENAI_API_KEY` (required)
- `JWT_SECRET` (required)
- `MONGO_URI` / `MONGO_DB_NAME` (defaults already provided for assignment)

4. Seed data:

```bash
yarn seed
```

5. Start server:

```bash
yarn dev
```

Server runs at: `http://localhost:5000`

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongo_uri
MONGO_DB_NAME=codemaya
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

## API Endpoints

### Health

```bash
curl http://localhost:5000/health
```

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Imran","email":"imran@example.com","password":"pass1234"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"imran@example.com","password":"pass1234"}'
```

### List docs

```bash
curl http://localhost:5000/api/docs
```

### Ask (JWT required)

```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the refund policy?"}'
```

Sample response:

```json
{
  "answer": "Customers are eligible for a refund within 7 days of purchase. Approved refunds are processed within 5-7 business days.",
  "sources": ["<doc_id>"],
  "confidence": "high"
}
```

### Ask history (JWT required)

```bash
curl http://localhost:5000/api/ask/history \
  -H "Authorization: Bearer <TOKEN>"
```

## Testing

```bash
yarn test
```

Includes one passing `POST /api/ask` endpoint test (with mocks).
