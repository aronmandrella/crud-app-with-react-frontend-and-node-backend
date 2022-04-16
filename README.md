# Basic CRUD app with React front-end and Node.js back-end (full-stack skills showcase)

![ui_demo](https://raw.githubusercontent.com/aronmandrella/crud-app-with-react-frontend-and-node-backend/master/ui_demo_1.PNG)

## How to install and run tests

Tested with: Windows 10, Node.js v16.14.0 (Latest Node.js v16.14.2 has some issues with NPM workspaces)

```bash
npm ci
npm run postinstall

npm test
```

## How to run

Frontend

```bash
# Development mode
npm run dev:frontend

# Production mode
npm run start:frontend
```

Backend

```bash
# Development mode
npm run dev:backend

# Production mode
npm run start:backend
```

## Specifications:

✔️ Uses Next.js + React + Nest.js (wrapper around express.js) + SQLite + TypeORM + TypeScript.

✔️ User can do CRUD (create, read, update, delete) operations on events

✔️ API payloads are validated both in front-end and in back-end

✔️ Has tests

✔️ Front-end and back-end share TypeScript interfaces

✔️ Monorepo structure that makes installing and running scripts easy

✔️ Responsive UI.
