# Backend Architecture

This document explains the production-oriented backend architecture for Radio Hunt. The goal is to keep each layer focused so the backend stays easy to test, debug, and extend.

## High-Level Request Flow

```text
Request
v
Route
v
Validator
v
Controller
v
Service
v
Repository
v
Database / Redis
v
Repository
v
Service
v
Controller
v
Response
```

## Controllers

Controllers handle HTTP-level work.

They are responsible for reading request data, calling validators and services, and sending responses. Controllers should stay thin. They should not know how passwords are hashed, how Redis stores OTPs, or how Drizzle queries are written.

Allowed to call:

- Validators
- Services
- Response helpers if added later

Should not call:

- Database tables directly
- Redis directly
- Low-level utilities unless the utility is only about HTTP response formatting

## Services

Services contain application workflows and business decisions.

For authentication, a service would decide the steps for registration, login, OTP verification, token refresh, and logout. It coordinates repositories and utilities, but it does not send HTTP responses.

Allowed to call:

- Repositories
- Utilities
- Redis helper layer when implemented
- External provider helpers, such as an email sender, when implemented

Should not call:

- Express route objects
- Express response methods
- Raw request handlers

## Repositories

Repositories isolate database access.

They are the place for Drizzle queries related to a specific domain. For auth, this means finding users, creating users, creating user stats, storing refresh tokens, and deleting refresh tokens.

Allowed to call:

- Drizzle database instance
- Drizzle schema tables

Should not call:

- Controllers
- Express request or response objects
- JWT helpers
- Password helpers
- Email sending helpers

## Middleware

Middleware runs before controllers when a route needs pre-processing or protection.

Authentication middleware will eventually verify access tokens and attach authenticated user context to the request. Middleware is useful for reusable checks that multiple routes need.

Allowed to call:

- Token verification utilities
- Small lookup helpers when absolutely needed
- `next()` to continue the request

Should not call:

- Registration or login services
- Password hashing logic
- Large database workflows

## Validators

Validators protect the application from bad input.

They define what valid request data looks like before the controller passes data to the service. Validators should check shape, required fields, formats, lengths, and simple constraints.

Allowed to call:

- Validation libraries or local validation helpers

Should not call:

- Database
- Redis
- JWT helpers
- Password helpers

## Routes

Routes define the public HTTP API surface.

A route file maps URL paths and HTTP methods to middleware and controller functions. Route files should read like a table of contents for that feature.

Allowed to call:

- Controllers
- Middleware

Should not call:

- Services directly unless the project intentionally uses a route-handler style
- Repositories
- Database
- Redis
- Password or JWT utilities

## Utils

Utilities hold reusable helpers that do one focused job.

For authentication, utilities may include JWT helpers, password helpers, OTP helpers, and cookie helpers. Utilities should be reusable and should not know the full business workflow.

Allowed to call:

- Standard library helpers
- Focused third-party libraries when installed
- Environment variables when needed for configuration

Should not call:

- Controllers
- Routes
- Repositories
- Database directly
- Redis directly unless the utility is explicitly a Redis utility

## Database

The database stores persistent application data.

For Radio Hunt, PostgreSQL stores users, user stats, refresh token records, and any future long-term game or account data. Persistent data belongs in PostgreSQL when it must survive server restarts and should be queryable later.

Database access should happen through repositories, not controllers or routes.

## Redis

Redis stores short-lived or fast-access data.

For authentication, Redis is useful for OTPs, rate limits, temporary registration state, and short-lived verification data. Redis data should be treated as temporary unless the project explicitly designs it otherwise.

Redis access should be wrapped in a small helper or service layer so the rest of the app does not scatter Redis commands everywhere.

## Drizzle

Drizzle ORM maps JavaScript schema definitions to PostgreSQL tables and queries.

In this project, Drizzle owns the database schema, relations, migrations, and query building. Schema files define tables. Migration files record database changes. The runtime database instance lives in `src/db/db.js`.

Drizzle should be used inside repositories, not directly inside controllers or routes.

## Layer Calling Rules

Use these rules to keep the backend clean:

```text
routes -> middleware/controllers
controllers -> validators/services
services -> repositories/utils/redis helpers
repositories -> database
utils -> focused libraries or standard Node helpers
middleware -> utils and small lookup helpers
```

Avoid these calls:

```text
controllers -> database
routes -> database
repositories -> controllers
utils -> controllers
validators -> database
```

## Practical Example: Future Login Request

```text
POST /api/auth/login
v
auth.routes.js selects the login controller
v
auth.controller.js validates request input
v
auth.controller.js calls auth.service.js
v
auth.service.js asks auth.repository.js for the user
v
auth.repository.js queries PostgreSQL with Drizzle
v
auth.service.js uses password and JWT utilities
v
auth.service.js asks repository to store refresh token metadata
v
auth.controller.js returns tokens to the client
```

## Why This Structure Works

- Controllers stay simple and HTTP-focused.
- Services keep workflows readable.
- Repositories make database access easy to find.
- Validators stop bad data early.
- Middleware protects routes consistently.
- Utils prevent repeated security-sensitive helper code.
- Drizzle keeps schema and migrations organized.
- Redis is reserved for temporary, fast data.
