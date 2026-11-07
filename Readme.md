# Blog Application

A full-stack blogging platform built using the MERN stack. This application allows users to register, log in, create and manage blog posts, upload images, and interact with blog content through comments and likes.

## Features

- User Registration and Login
- JWT-based Authentication and Authorization
- Create, Read, Update, and Delete Blog Posts
- Image Upload Functionality
- Rich Text Editor for Blog Content
- Blog Details Page
- User-Specific Blog Management
- Add and View Comments
- Delete Comments with Ownership Permissions
- Like and Unlike Blog Posts
- Blog Search Functionality
- Responsive User Interface

## Technologies Used

### Frontend
- React.js
- Vite
- React Router DOM
- Axios
- React Quill
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- MongoDB Native Driver
- JSON Web Token (JWT)
- bcryptjs
- Multer
- dotenv
- CORS

## Project Structure

```text
Blog-Application/
│
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   │
│   ├── routes/
│   │   └── auth.js
│   │
│   ├── uploads/
│   │   ├── 1794086399918-DR.jpeg
│   │   ├── 1794087275358-cardata-Naive_Bayes.png
│   │   └── 1794087284641-DR.jpeg
│   │
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   │
│   │   ├── pages/
│   │   │   ├── BlogDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Muhammad-Nabi016/Blogs-Application
cd Blog-Application
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite, usually:

```text
http://localhost:5173
```

## Application Functionality

### Authentication
Users can register and log in securely. JWT authentication protects routes and restricts blog management operations to authorized users.

### Blog Management
Authenticated users can create new blog posts, edit their own posts, and delete their own posts.

### Image Upload
Users can upload images with blog posts. Uploaded images are stored in the backend uploads directory.

### Rich Text Editor
A rich text editor allows users to format blog content while creating and editing posts.

### Comments and Likes
Users can comment on blog posts and like or unlike posts. Comment deletion is restricted according to ownership permissions.

## Database

The application uses MongoDB for storing application data.

Main collections:
- users
- blogs
- comments

## Security

- Password hashing with bcryptjs
- JWT-based authentication
- Protected backend routes
- Ownership-based authorization
- Environment variables for sensitive configuration

## Author

Muhammad Nabi