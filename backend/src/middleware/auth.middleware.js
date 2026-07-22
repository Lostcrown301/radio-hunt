/*
Purpose:
Protects routes that require an authenticated user.

Should contain:
- Reading authentication credentials from requests
- Calling token verification utilities
- Attaching authenticated user context to the request

Should NOT contain:
- Login or registration logic
- Database write operations
- Password hashing
- Controller response workflows except middleware errors
*/
