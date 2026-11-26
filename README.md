# Wassila

Digital platform for women in rural and peri-urban agricultural and artisanal communities in Tunisia (MERN stack).

> Work in progress. Full documentation is written in Phase 8.

## Quick start (development, Docker)

```bash
cp .env.example .env
npm run up
```

- API health: http://localhost:4000/api/v1/health
- Readiness (checks the database): http://localhost:4000/api/v1/health/ready
- Client: http://localhost:5173 (available after Phase 1, Part 2)

After adding a new npm dependency, rebuild with `npm run up:fresh`.

## Structure

- `client/`: React frontend (own Dockerfile)
- `server/`: Express backend (own Dockerfile)
- `docker-compose.yml`: orchestrates client, server and MongoDB