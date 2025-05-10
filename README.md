
# 📸 Social Media Backend API

This project is a complete social media backend built with **Node.js**, **GraphQL**, **MySQL**, and **Sequelize ORM**. It includes RESTful APIs and GraphQL endpoints with authentication, posting, comments, likes, and rating features.

---

## 🚀 Getting Started

### 1️⃣ Create the MySQL Database

First, create a database called:

```
social_media_db
```

You can do this from MySQL Workbench or the command line:

```sql
CREATE DATABASE social_media_db;
```

---

### 2️⃣ Set Up Environment Variables

Create a `.env` file at the root of your project with the following variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=social_media_db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Run Seed Script (Optional for test data)

```bash
node seed.js
```

This will insert test users, posts, and comments.

---

### 5️⃣ Start the Server

```bash
npm start
```

The server will run at `http://localhost:6050`

---

## 📜 Logs

All key actions (signup, login, post creation, updates, deletions, etc.) are logged in `log.txt`. This helps with debugging and auditing.

---

## 🌐 API Endpoints

### 🔑 Authentication

| Method | Endpoint        | Description             | Input (REST Body / GraphQL)         |
|--------|------------------|--------------------------|-------------------------------------|
| POST   | `/api/users/signup` | Register new user      | `username, email, password, bio, file` (form-data) |
| POST   | `/api/users/login`  | Login user & get token | `email, password` |
| GraphQL | `login` mutation   | Same as above          | `mutation { login(email, password) { token } }` |
| GraphQL | `signup` mutation  | Same as above          | `mutation { signup(input: { username, ... }) }` |

---

### 👤 Users

| Method | Endpoint              | Description             | Input / Args |
|--------|------------------------|--------------------------|--------------|
| GET    | `/api/users/getAllUsers` | Get all users (admin) | token in header |
| POST   | `/api/users/getUserById` | Get specific/self user | `{ adminUserSearch: id }` |
| PUT    | `/api/users/updateUser` | Update current user     | `{ username, bio, file }` |
| DELETE | `/api/users/deleteUser` | Delete user (admin/self) | `{ deleteuserid }` |
| GraphQL | `user`, `users` query | Same as above | `query { user(id) }`, `query { users }` |

---

### 📸 Posts

| Method | Endpoint              | Description         | Input |
|--------|------------------------|----------------------|-------|
| POST   | `/api/posts/createPost` | Create a post       | `{ caption, file(s) }` |
| GET    | `/api/posts/getAllPosts` | All posts (admin)   | none |
| POST   | `/api/posts/getPostById` | One post by ID      | `{ id }` |
| PUT    | `/api/posts/updatePost` | Update post         | `{ id, caption, file(s) }` |
| DELETE | `/api/posts/deletePost` | Delete post         | `{ id }` |
| GraphQL | `createPost`, `post`   | Same as above       | `mutation { createPost(input: { caption }) }` |

---

### 💬 Comments

| Method | Endpoint                    | Description       | Input |
|--------|------------------------------|--------------------|-------|
| POST   | `/api/comments/addComment`   | Add comment        | `{ content, postId, parentCommentId }` |
| POST   | `/api/comments/getCommentsByPost` | Fetch comments | `{ postId }` |
| DELETE | `/api/comments/deleteComment` | Delete comment     | `{ id }` |
| GraphQL | `addComment`, `commentsByPost` | Same as above | `mutation { addComment(input: { content, postId }) }` |

---

### ❤️ Likes

| Method | Endpoint              | Description       | Input |
|--------|------------------------|--------------------|-------|
| POST   | `/api/likes/addlike`   | Like/unlike post   | `{ postId }` |
| GraphQL | `toggleLike` mutation | Same as above     | `mutation { toggleLike(postId: 1) }` |

---

### ⭐ Ratings

| Method | Endpoint                 | Description       | Input |
|--------|---------------------------|--------------------|-------|
| POST   | `/api/ratings/ratePost`   | Rate a post        | `{ postId, rating }` |
| GraphQL | `ratePost` mutation      | Same as above      | `mutation { ratePost(postId: 1, rating: 4) }` |

---

## 📦 Technologies Used

- Node.js
- Express (REST)
- GraphQL (Apollo compatible)
- Sequelize ORM
- MySQL
- Cloudinary (Image Uploads)
- JWT Authentication
- bcrypt (Password hashing)
- dotenv
- graphql-upload

---

## ✍️ Author

Built with ❤️ for full-featured GraphQL & REST backend learning and testing.

---
