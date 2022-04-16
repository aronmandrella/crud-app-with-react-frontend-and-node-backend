# Basic CRUD app with React front-end and Node.js back-end (full-stack skills showcase)

![ui_demo](https://raw.githubusercontent.com/aronmandrella/crud-app-with-react-frontend-and-node-backend/master/ui_demo_1.PNG)

## How to install and run tests

Build with: Windows 10, Node.js v16.14.0 (Latest Node.js v16.14.2 has some issues with NPM workspaces)

```bash
npm ci
npm run postinstall

npm test
```

### About tests

I didn't write tests for every single function, but I think I've tested the most important functionalities.

Some of tests probably are not that useful, since sometimes the same thing is tested by multiple
tests, hoverer my main goal was to create various test examples, that cover various scenarios (unit/integration/e2e/components/hooks/functions).

For simplicity I export/import some examples/helpers directly between tests. They could be extracted into separate files,
or be defined in 'jest.config.ts'.

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

✔️ Uses Next.js + React + Nest.js (wrapper around express.js) + SQLite + TypeORM + TypeScript + Jest + @testing-library/react.

✔️ User can do CRUD (create, read, update, delete) operations on events

✔️ API payloads are validated both in front-end and in back-end

✔️ Has frontend and backend tests (unit / integration / end-to-end)

✔️ Front-end and back-end share TypeScript interfaces

✔️ Monorepo structure that makes installing and running scripts easy

✔️ Responsive UI.
