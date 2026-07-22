# Authentication Guide

This guide is an offline reference for the future Radio Hunt authentication system. It explains where each file belongs, what each file should do, and what must stay out of it.

No authentication implementation exists in these placeholder files yet. The goal is to keep the structure clean before adding code.

## Adapted Project Structure

The backend already uses a layer-first structure:

```text
backend/src/
  controllers/
    auth.controller.js
  services/
    auth.service.js
  routes/
    auth.routes.js
  middleware/
    auth.middleware.js
  validators/
    auth.validator.js
  repositories/
    auth.repository.js
  utils/
    jwt.js
    password.js
    otp.js
    cookies.js
  auth/
    index.js
```

Instead of creating duplicate folders under `src/auth/controllers`, `src/auth/services`, and so on, auth files are placed inside the existing backend layers.

## auth.controller.js

### Purpose

Receives authentication-related HTTP requests and returns HTTP responses.

### Responsibilities

- Read request body, params, cookies, and headers.
- Call validation before doing work.
- Call the auth service for registration, login, logout, OTP verification, and token refresh.
- Return success responses.
- Pass errors to Express error handling when that is added.

### What Goes Inside

- Controller functions such as `register`, `login`, `verifyOtp`, `refreshToken`, and `logout`.
- Response formatting for auth endpoints.
- Calls to `auth.service.js`.

### What Should Never Go Inside

- Drizzle queries.
- Redis commands.
- Password hashing.
- JWT signing or verification.
- OTP generation.

### Dependencies

- `auth.validator.js`
- `auth.service.js`
- Express request and response objects

### Example Workflow

1. A request reaches `POST /auth/login`.
2. The controller validates the request body.
3. The controller calls the auth service.
4. The service returns tokens or an error.
5. The controller sends the HTTP response.

### Common Mistakes

- Putting SQL queries directly in the controller.
- Hashing passwords in the controller.
- Returning raw internal errors to the client.
- Mixing HTTP concerns with business rules.

## auth.service.js

### Purpose

Coordinates authentication use cases and business rules.

### Responsibilities

- Decide the steps required for registration, login, OTP verification, refresh token, and logout.
- Call repositories for database work.
- Call utilities for password hashing, JWT creation, OTP generation, and cookie configuration.
- Coordinate Redis usage through a proper Redis helper or repository when implemented.

### What Goes Inside

- Auth workflow functions.
- Business checks such as "email already exists" or "OTP is expired".
- Calls to repository and utility modules.

### What Should Never Go Inside

- Express route definitions.
- `req` and `res` response handling.
- Raw SQL scattered across multiple functions.
- Validation schema declarations.

### Dependencies

- `auth.repository.js`
- `password.js`
- `jwt.js`
- `otp.js`
- Redis helper or Redis client layer when implemented

### Example Workflow

1. The controller calls `login`.
2. The service asks the repository for the user by email.
3. The service uses the password utility to compare passwords.
4. The service uses the JWT utility to create tokens.
5. The service tells the repository to store the refresh token.
6. The service returns a clean result to the controller.

### Common Mistakes

- Importing Express in the service.
- Sending HTTP responses from the service.
- Hiding database queries in utility files.
- Making one huge service function that handles every auth path.

## auth.routes.js

### Purpose

Defines authentication endpoint paths and connects them to controller functions.

### Responsibilities

- Create the auth router.
- Map endpoints to controller methods.
- Attach route-specific middleware where needed.

### What Goes Inside

- Routes such as `POST /register`, `POST /login`, `POST /verify-otp`, `POST /refresh`, and `POST /logout`.
- Middleware references for protected auth routes.

### What Should Never Go Inside

- Password hashing.
- JWT signing.
- Drizzle queries.
- Full request handling logic.

### Dependencies

- Express router
- `auth.controller.js`
- `auth.middleware.js` when needed

### Example Workflow

1. The main server mounts auth routes at `/api/auth`.
2. `auth.routes.js` maps `POST /login` to the login controller.
3. The controller handles the request.

### Common Mistakes

- Writing inline route handlers with full business logic.
- Importing database tables into route files.
- Doing validation directly in routes instead of validators/controllers.

## auth.middleware.js

### Purpose

Protects routes that require a valid authenticated user.

### Responsibilities

- Read access tokens from headers or cookies.
- Call JWT verification helpers.
- Attach authenticated user data to the request.
- Stop unauthorized requests before they reach controllers.

### What Goes Inside

- Middleware such as `requireAuth`.
- Optional middleware such as `requireVerifiedEmail` or role checks if roles are added later.

### What Should Never Go Inside

- Login logic.
- Registration logic.
- Password hashing.
- Creating refresh tokens.
- Large database workflows.

### Dependencies

- `jwt.js`
- Optional repository lookup if token payload must be checked against the database

### Example Workflow

1. A protected route receives a request.
2. Middleware reads the access token.
3. Middleware verifies the token.
4. Middleware attaches `req.user`.
5. The request continues to the controller.

### Common Mistakes

- Treating middleware as a controller.
- Returning inconsistent error response formats.
- Trusting decoded tokens without verification.
- Doing too many database calls for every protected request.

## auth.validator.js

### Purpose

Keeps authentication input validation rules in one place.

### Responsibilities

- Validate registration input.
- Validate login input.
- Validate OTP input.
- Validate refresh token input.

### What Goes Inside

- Validation schemas or validation functions.
- Field-level rules for email, username, password, and OTP.
- Normalization rules if needed, such as trimming email.

### What Should Never Go Inside

- Database queries.
- Password hashing.
- JWT signing.
- Redis calls.
- Sending HTTP responses unless using a validation middleware pattern later.

### Dependencies

- A validation library if one is added later, or plain JavaScript validation helpers.

### Example Workflow

1. The controller receives a registration request.
2. The controller calls the registration validator.
3. Invalid input is rejected before the service runs.
4. Valid input is passed to the auth service.

### Common Mistakes

- Checking email availability here. That belongs in the service/repository flow.
- Performing password hashing here.
- Letting invalid input reach the service.

## auth.repository.js

### Purpose

Owns authentication-related database access.

### Responsibilities

- Find users by email, username, or id.
- Create users.
- Create user stats during registration.
- Store refresh token hashes.
- Delete refresh tokens during logout.
- Query refresh tokens during refresh flows.

### What Goes Inside

- Drizzle queries related to auth.
- Database transactions for multi-step writes such as creating a user and user stats.
- Small data access functions with clear names.

### What Should Never Go Inside

- Express request or response handling.
- Password hashing.
- JWT signing.
- OTP generation.
- Email sending.

### Dependencies

- Drizzle database instance from `src/db/db.js`
- Tables from `src/db/schema`

### Example Workflow

1. The auth service asks whether an email exists.
2. The repository queries the users table.
3. The repository returns the result.
4. The service decides the next step.

### Common Mistakes

- Returning raw database errors directly to controllers.
- Mixing business decisions into query functions.
- Hashing passwords before inserts inside the repository.

## jwt.js

### Purpose

Contains reusable JWT helper responsibilities.

### Responsibilities

- Sign access tokens.
- Sign refresh tokens if refresh tokens are JWT-based.
- Verify access tokens.
- Verify refresh tokens if needed.
- Keep token payload formatting consistent.

### What Goes Inside

- Token helper functions.
- Token expiration constants.
- JWT payload construction helpers.

### What Should Never Go Inside

- Express route handlers.
- Database queries.
- Redis commands.
- Password hashing.

### Dependencies

- JWT library when installed or configured.
- Environment variables such as JWT secrets and expiration values.

### Example Workflow

1. The auth service asks for a new access token.
2. `jwt.js` signs the payload.
3. The token is returned to the service.
4. The service returns it to the controller.

### Common Mistakes

- Storing secrets directly in code.
- Putting user lookup queries in token helpers.
- Adding too much user data to token payloads.

## password.js

### Purpose

Contains password security helper responsibilities.

### Responsibilities

- Hash plain text passwords.
- Compare login passwords with stored password hashes.
- Keep password hashing options in one place.

### What Goes Inside

- Password hash helper.
- Password compare helper.
- Optional password strength helper if needed.

### What Should Never Go Inside

- User creation queries.
- Login controller logic.
- JWT creation.
- Redis calls.

### Dependencies

- Password hashing library when installed or configured.

### Example Workflow

1. During registration, the auth service sends the plain password to `password.js`.
2. `password.js` returns a hash.
3. The service passes the hash to the repository.

### Common Mistakes

- Saving plain passwords.
- Comparing passwords manually.
- Choosing hashing settings in multiple places.

## otp.js

### Purpose

Contains OTP helper responsibilities.

### Responsibilities

- Generate OTP values.
- Format OTP expiration values.
- Hash OTP values if OTPs should not be stored as plain text.

### What Goes Inside

- OTP generation helper.
- OTP expiration helper constants.
- OTP normalization helper if needed.

### What Should Never Go Inside

- Redis storage commands.
- Email sending.
- Database queries.
- Express controllers.

### Dependencies

- Node crypto utilities or another secure random generator when implemented.

### Example Workflow

1. The auth service asks `otp.js` to generate an OTP.
2. The service stores the OTP using Redis logic.
3. The service triggers the email sending layer when it exists.

### Common Mistakes

- Using predictable OTPs.
- Storing OTPs without expiration.
- Sending emails directly from the OTP helper.

## cookies.js

### Purpose

Keeps auth cookie configuration consistent.

### Responsibilities

- Build cookie options.
- Help set auth cookies.
- Help clear auth cookies.
- Keep production and development cookie settings organized.

### What Goes Inside

- Cookie option builders.
- Helper functions for secure, httpOnly, sameSite, maxAge, and path options.

### What Should Never Go Inside

- JWT signing.
- Password hashing.
- Database queries.
- Registration or login workflow logic.

### Dependencies

- Express response object if helper functions directly set cookies.
- Environment variables for production cookie behavior.

### Example Workflow

1. The controller receives tokens from the service.
2. The controller calls `cookies.js` to apply refresh token cookie settings.
3. The response is sent.

### Common Mistakes

- Hardcoding production cookie settings without environment awareness.
- Storing access tokens in unsafe cookies without a clear strategy.
- Mixing token generation into cookie helpers.

## src/auth/index.js

### Purpose

Acts as a future module entry point for authentication exports.

### Responsibilities

- Re-export auth routes, controllers, services, or helpers when useful.
- Provide a single auth module import location if the project chooses that style.

### What Goes Inside

- Re-export statements after implementation begins.
- Lightweight module composition only.

### What Should Never Go Inside

- Auth business logic.
- Database queries.
- JWT generation.
- Password hashing.

### Dependencies

- Auth layer files that need to be re-exported.

### Example Workflow

1. The backend wants one auth module import.
2. `src/auth/index.js` exports the auth router.
3. The server imports from the auth module instead of deep paths.

### Common Mistakes

- Turning the index file into a large implementation file.
- Hiding business logic in module exports.
- Creating circular imports between layers.

## Complete Authentication Flow

### Registration

```text
User
v
Validation
v
Check email availability
v
Hash password
v
Generate OTP
v
Store OTP in Redis
v
Send OTP
v
Verify OTP
v
Create user
v
Create user_stats
v
Generate JWT
v
Return tokens
```

### Login

```text
User
v
Validation
v
Verify password
v
Generate JWT
v
Store refresh token
v
Return tokens
```

### Refresh Token

```text
Refresh Token
v
Verify
v
Issue new access token
```

### Logout

```text
Delete refresh token
v
Success
```
