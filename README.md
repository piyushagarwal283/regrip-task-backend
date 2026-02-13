# REGRIP Task Management Backend

Backend assignment for REGRIP – Task Management System with email OTP authentication, JWT, rate limiting, activity logging, and Swagger API documentation. 

## Tech Stack

- Node.js + Express.js
- PostgreSQL (via Sequelize ORM)
- JWT (access + refresh tokens)
- Joi for input validation
- express-rate-limit for rate limiting
- Swagger (swagger-jsdoc + swagger-ui-express) for API docs [web:42][web:56][web:59]

---

## 1. Project Links (Deliverables)

-> **GitHub Repository:**  
  https://github.com/piyushagarwal283/regrip-task-backend

-> **Hosted Backend URL:**  
  https://regrip-backend-h5uw.onrender.com 
  Example health check: https://regrip-backend-h5uw.onrender.com/api/health`

-> **API Documentation (Swagger UI):**  
  https://regrip-backend-h5uw.onrender.com/api-docs`

---

## 2. How to Run the Project Locally

### Prerequisites

- Node.js (v16+ recommended)
- PostgreSQL (local or remote)
- Git

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/piyushagarwal283/regrip-task-backend
cd regrip-task-backend

# 2. Install dependencies
npm install

# 3. Create PostgreSQL database (example)
# In psql or any PostgreSQL client:
CREATE DATABASE regrip_tasks;

# 4. Create .env file from example
cp .env.example .env   # (or create manually)

# 5. Update .env values with your local DB credentials

# 6. Run the server (development)
npm run dev

# Or production-style
npm start
The server runs on http://localhost:3000 by default.
Health check endpoint: GET /api/health → returns { "status": "ok" }. [web:42][web:54]
```


## 3. Environment Variables (.env.example)
Create .env based on this template:
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=regrip_tasks
DB_USER=regrip_tasks_user
DB_PASS=nRHGlO7URvPQwnODqPp0vUbegODtv2Yp
DB_SSL=true

# JWT secrets
ACCESS_TOKEN_SECRET=regrip_access_123
REFRESH_TOKEN_SECRET=regrip_refresh_123


## 4. API Documentation
Swagger UI is available at:

Local: http://localhost:3000/api-docs

Hosted: https://regrip-backend-h5uw.onrender.com/api-docs


## 5. Authentication & Security
Auth Flow (Email OTP + JWT)
Request OTP – POST /api/auth/request-otp

Body:
{
  "email": "Piyushagrawal@gmail.com"
}
Instead of sending an actual email, it creates a 6-digit OTP, saves it in the database with a 5-minute expiration time, and (in development) logs the OTP to the server console.

Action log: OTP_REQUESTED.


Verify OTP & Login – POST /api/auth/verify-otp

Body:
{
  "email": "Piyushagarwal@gmail.com",
  "otp": "123456"
}

- Confirms that the OTP matches the user and is not expired or consumed.

Regarding achievement:

OTP is marked as consumed.

The user is marked as verified.

provides a temporary access token (for example, 15 minutes).

provides a database-stored refresh token (such as seven days).

Logs either LOGIN_SUCCESS or LOGIN_FAILED. [file:1][web:6]

- Refresh Access Token – POST /api/auth/refresh

Body:
{
  "refreshToken": "..."
}
Verifies refresh token from Database (not expired, not revoked).
Returns a new access token and logs TOKEN_REFRESH.

-> Management of Tokens
Access tokens are sent in the Authorisation: Bearer <token> header and have a brief lifespan.

Refresh tokens can be revoked upon logout and are kept in a RefreshToken table.

A centralised auth.middleware.js is used by all protected routes to attach req.user and validate JWT. [web:39] [web:40]

## 6. Core Task APIs (Authenticated)
All these endpoints require Authorization: Bearer <accessToken> header.

Create Task – POST /api/tasks

Body:
{
  "title": "My task",
  "description": "optional",
  "status": "PENDING"
}
Generates a task associated with the user (UserId) that has been authenticated.

TASK_CREATED logs.

-> GET /api/tasks to view tasks

    Gives the authenticated user back all of their tasks.

    TASK_LIST_VIEWED logs.

->PUT /api/tasks/:id to update the task

    Body (any subset):

    JSON:
    {
    "title": "Updated title",
    "description": "Updated description",
    "status": "IN_PROGRESS"
    }

    Before updating, an authorisation middleware is used to make sure the task is owned by the person making the request.

    TASK_UPDATED logs.

->Task Delete: DELETE /api/tasks/:id

    Only if the task belongs to the user is it deleted.

    [file:1] Logs TASK_DELETED
    Ownership is enforced via a middleware that checks Task.UserId === req.user.id in the database query, so users cannot access/modify others’ tasks.

## 7. Issues with Middleware and Cross-Cutting
-> Middleware for Authentication (auth.middleware.js)

    takes JWT out of the Authorization header.

    uses ACCESS_TOKEN_SECRET to verify the token.

    Attached as req.user are { id, email}.

-> Middleware for Authorization (authorize.middleware.js)

    retrieves the task by id and UserId for task routes.

    If the task is not the user's, it returns 404.

-> Validation of Input (validate.middleware.js + Joi)

    Every route has a Joi schema (for tasks and auth, for example).

    400 with a clear message is returned for invalid input.

-> Limiting Rates (rateLimit.middleware.js)

    strict restrictions on:

    Requests for OTP (/auth/request-otp)
    To stop misuse, /api/* endpoints are generally throttled. [file:1][web:7][web:10]

-> Error.middleware.js, which handles errors globally

    sends a consistent JSON response after catching thrown errors:
    { "message": "..." }
## 8. Activity Recording
Important system and user actions are recorded by the system in an ActivityLog table, including:

->Events related to security:

  Requested OTP

  LOGIN_SUCCESS

  LOGIN_FAILED

  REFRESH TOKEN
  
Task-related activities:

  TASK_CREATED

  TASK_UPDATED

  TASK DELETED

Other:

  Views of the task list (TASK_LIST_VIEWED)

  For usage analysis and security reviews, this offers an audit trail. [file:1]

## 9. Assumptions, Architecture, and Design Decisions
Buildings
  Structure in layers:

    Routes: specify endpoints and include middleware and validation.

    Controllers are in charge of logging, database operations, and business logic.

    Models: PostgreSQL tables are mapped to Sequencing models (User, Task, OTP, RefreshToken, and ActivityLog).

  Database:

    PostgreSQL was selected for Render's simple deployment.

    SQL is abstracted and relations and migrations-style sync are managed with Sequelize. [web:56][web:59]

Auth Design & Security
    Email OTP passwordless login streamlines user experience and eliminates the need to store passwords.

    JWT access tokens with a short lifespan reduce the impact of leaks.

    Better session control and revocation are made possible by refreshed tokens that are kept in the database.

    Input validation and rate limiting protect against malformed and brute-force attacks. [file:1][web:7][web:10]

Presumptions
    Rather than integrating a real SMTP provider, email delivery in developmentis simulated by logging OTP to the server console.

    By connecting an SMS provider to the OTP sending tool, phone OTP/SMS can be added even though it is not currently implemented.
    For this assignment, a single-region deployment on Render is adequate; more reliable networking and secret management may be needed in production environments





## ** https://github.com/piyushagarwal283/regrip-task-backend**
## **https://regrip-backend-h5uw.onrender.com**

