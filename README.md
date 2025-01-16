# User Authentication API 

![Tech](https://skills-icons.vercel.app/api/icons?i=js,node,expressjs,mongodb,jwt)

This API is a user authentication API that provides authentication and user management functionalities. It includes features such as user signup, login, logout, **email verification**, **password reset**, and user authorization. This API uses tools such as `JWT`, `nodemailer`, `mongoose` etc. in order to achieve tasks.

## Features
- **User Signup**: Allows new users to register.
- **User Login**: Allows registered users to log in.
- **User Logout**: Allows logged-in users to log out.
- **Email Verification**: Sends a verification email to users upon signup. Users can verify their email adresses by clicking the link in the email.
- **Password Reset**: Users can reset their forgotten passwords by clicking the link which is sent to the email.
- **Authorization Middleware**: Protects routes from unauthorized access.

## Routes

### Auth Routes
#### `GET` `/auth/`
Test route to check if the auth service is running.

**Response:**
```json
{
  "message": "Hello Auth",
  "success": true
}
```

#### `POST` `/auth/signup`
Registers a new user. After registering the user on **MongoDB**, a cookie with **JWT** token is set on the browser.
This request also sends an email to the user's email adress in order to verify the user.
 
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": "user_id",
  "verified": false,
  "success": true
}
```

#### `POST` `/auth/login`
Logs in an existing user. After checking the user credentials on **MongoDB**, a cookie with **JWT** token is set on the browser.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": "user_id",
  "verified": false,
  "success": true
}
```

#### `GET` `/auth/logout`
Logs out the current user by replacing **JWT** token with an empty one.

**Response:**
```json
{
  "message": "User logged out",
  "loggedOut": true,
  "success": true
}
```

#### `GET` `/auth/check`
Checks if the user is authenticated. This route can be used to protect client-side routes.

**Response:**
```json
{
  "authorized": true,
  "userId": "user_id",
  "verified": false,
  "success": true
}
```

#### `POST` `/auth/verify`
Verifies the user with the **JWT** token which is sent to the user's email adress on signup process. This function changes the `verified` state for the user after verifying.

**Request Body:**
```json
{
  "token": "string"
}
```

**Response:**
```json
{
  "verified": true,
  "message": "User verified",
  "success": true
}
```

#### `POST` `/auth/reset`
Sends a password reset email to the email adress. This email includes a link to change the password. This link expires after 5 minutes.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Reset email sent",
  "success": true
}
```

#### `POST` `/auth/reset/:token` 
Provided token is verified and the password is changed.

**Request Body:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Password reset successful",
  "success": true
}
```

### Protected Routes
#### `GET` `/`
A protected route that returns a greeting message along with the user ID. This is an example route to improve API further and add aditional features.

**Response:**
```json
{
  "message": "Hello World!",
  "userId": "user_id"
}
```

## Error Handling
An object with `error` property is returned on the errors which happened during different processes. This property can be accessed to check if the process was successful or not.
*Note:* Error handling can be improved.  

## Middleware
- **requireAuth**: Middleware to protect routes from unauthorized access.
- **checkUser**: Middleware to check if the user is authenticated and attach the user ID to the request.

## Models
- **User**: Mongoose schema for user data, including email, password, verification status, and menus.

## Environment Variables
These are the environmental variables which is used in the API. In order to use API on your project, create `.env` file and provide variables shown below.
- `JWT_SECRET`: Secret key for JWT token generation.
- `MONGO_URI`: MongoDB connection string.
- `CLIENT_ORIGIN`: Client application URL.
- `SMTP_HOST`: SMTP server host for sending emails.
- `SMTP_PORT`: SMTP server port.
- `SMTP_USER`: SMTP server user.
- `SMTP_PASS`: SMTP server password.
- `SMTP_SENDER`: Email sender information.

## Installation

### Prerequisites
- **Node.js** must be installed.
- **MongoDB** database must be set up.

### Steps
1. **Clone the repository**:
    ```sh
    git clone <repository-url>
    cd menu-app/api
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following variables:
    ```properties
    JWT_SECRET="your_jwt_secret"
    MONGO_URI="your_mongo_uri"
    CLIENT_ORIGIN="your_client_origin"
    SMTP_HOST="your_smtp_host"
    SMTP_PORT=587
    SMTP_USER="your_smtp_user"
    SMTP_PASS="your_smtp_pass"
    SMTP_SENDER="your_smtp_sender"
    ```

4. **Run the server**:
    ```sh
    npm run dev
    ```

5. **Access the API**:
    The API will be running at `http://localhost:3000`.
