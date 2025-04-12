# Resume Project - Issue Tracker

A full-stack issue tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Project Structure

```
./
├── frontend/     # React frontend application
├── backend/      # Express.js backend API
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/issue-tracker
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The backend server will start on http://localhost:5000

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend application will start on http://localhost:5173

## Database Choice

This project uses MongoDB as its database for several reasons:

- **Flexible Schema**: MongoDB's document model allows for flexible and evolving data structures, which is ideal for an issue tracking system where requirements might change over time.
- **JSON-like Documents**: MongoDB stores data in BSON format, which aligns well with JavaScript/Node.js applications.
- **Scalability**: MongoDB provides horizontal scalability and can handle large amounts of data and traffic.
- **Rich Query API**: Supports complex queries and aggregations needed for reporting and filtering issues.

## Database Setup

1. Install MongoDB on your system if you haven't already.
2. Start the MongoDB service.
3. The application will automatically create the necessary collections when it first runs.

## Initial Data Seeding (Optional)

If you want to seed the database with initial data:

1. Navigate to the backend directory
2. Run the seeding script:
   ```bash
   npm run seed
   ```

## Assumptions and Design Decisions

1. **Authentication**: The system uses JWT (JSON Web Tokens) for authentication.
2. **Authorization**: Role-based access control is implemented (Admin, User).
3. **API Security**: CORS is enabled and configured for secure cross-origin requests.
4. **Frontend Framework**: Uses Vite for faster development and better performance.
5. **State Management**: Implements React Context for global state management.

## Development Approach

- **Backend Architecture**: Follows MVC pattern with separate routes, controllers, and models.
- **API Design**: RESTful API design principles with proper error handling and validation.
- **Frontend Structure**: Component-based architecture with reusable UI components.
- **Code Quality**: Implements proper error handling, input validation, and security best practices.

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set production environment variables for both frontend and backend.

3. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request