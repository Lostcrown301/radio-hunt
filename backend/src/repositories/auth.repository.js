/*
Purpose:
Isolates authentication-related data access.

Should contain:
- User lookup queries for authentication
- Refresh token persistence queries
- User and user_stats creation queries for registration

Should NOT contain:
- Express request or response handling
- Password hashing
- JWT generation
- Route definitions
*/

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { usersTable } from './db/schema';

const db = drizzle(process.env.DATABASE_URL);

async function createUser(userData) {
    await db.insert(usersTable).values(userData);
    console.log('New user created!')
}