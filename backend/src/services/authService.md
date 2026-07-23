# `auth.service.js`

## Purpose

Coordinates authentication use cases and business rules.

### Should contain

- Registration flow orchestration
- Login flow orchestration
- Email verification flow
- Refresh token flow
- Logout flow
- Password reset flow
- Account deletion flow
- Calls to repositories for database access
- Calls to utility modules (password, JWT, OTP, cookies, email, etc.)

### Should NOT contain

- Express request or response handling
- Raw SQL or database queries
- Route definitions
- Validation schema definitions

---

# Responsibilities

## Registration

### `registerUser(userData)`

**Responsibilities**

- Check if email already exists
- Check if username already exists
- Hash password
- Create user
- Create user statistics
- Generate verification OTP
- Send verification email
- Return created user

---

## Login

### `loginUser(credentials)`

**Responsibilities**

- Find user by email or username
- Verify password
- Check if email is verified
- Generate access token
- Generate refresh token
- Store refresh token
- Return authentication data

---

## Email Verification

### `verifyEmailOtp(userId, otp)`

**Responsibilities**

- Validate OTP
- Mark email as verified
- Delete OTP
- Return success

---

### `resendVerificationOtp(userId)`

**Responsibilities**

- Check resend cooldown
- Generate new OTP
- Send verification email

---

## Refresh Token

### `refreshAccessToken(refreshToken)`

**Responsibilities**

- Verify refresh token
- Check token exists in database
- Rotate refresh token
- Generate new access token
- Return new tokens

---

## Logout

### `logoutUser(refreshToken)`

**Responsibilities**

- Delete refresh token
- Return success

---

### `logoutAllDevices(userId)`

**Responsibilities**

- Delete all refresh tokens for user
- Return success

---

## Password Reset

### `requestPasswordReset(email)`

**Responsibilities**

- Find user
- Generate reset OTP
- Store OTP
- Send reset email

---

### `verifyPasswordResetOtp(userId, otp)`

**Responsibilities**

- Validate reset OTP
- Allow password reset

---

### `resetPassword(userId, newPassword)`

**Responsibilities**

- Hash new password
- Update password
- Delete all refresh tokens
- Delete reset OTP

---

## Account Deletion

### `deleteAccount(userId)`

**Responsibilities**

- Schedule account deletion
- Revoke refresh tokens
- Return success

---

### `cancelAccountDeletion(userId)`

**Responsibilities**

- Cancel scheduled deletion
- Restore account

---

# Typical Flow

```
Auth Route
    │
    ▼
Auth Controller
    │
    ▼
Auth Service
    ├── findUserByEmail()
    ├── findUserByUsername()
    ├── hashPassword()
    ├── createUser()
    ├── generateTokens()
    ├── saveRefreshToken()
    └── sendVerificationEmail()
    │
    ▼
Repositories
(Database only)

Utilities
(password.js, jwt.js, otp.js, cookie.js, email.js)
```

---

# Recommended Public Functions

```js
registerUser(userData)

loginUser(credentials)

verifyEmailOtp(userId, otp)

resendVerificationOtp(userId)

refreshAccessToken(refreshToken)

logoutUser(refreshToken)

logoutAllDevices(userId)

requestPasswordReset(email)

verifyPasswordResetOtp(userId, otp)

resetPassword(userId, newPassword)

deleteAccount(userId)

cancelAccountDeletion(userId)
```