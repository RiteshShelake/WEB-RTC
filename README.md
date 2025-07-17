#WEB RTC APP

A full-stack Zoom-like video conferencing app built using **React**, **Node.js**, **MongoDB**, and **Socket.IO**. This project allows users to register, log in, create or join meetings, and communicate in real-time through audio/video and chat.

---

## 🔥 Features

- 👤 User Authentication (Sign Up / Login)
- 📅 Create and Join Meetings
- 🎥 Real-time Video and Audio Chat (via Socket.IO/WebRTC)
- ⏱️ Meeting Timer and User Tracking
- 📜 Clean and Responsive UI

---

## 🧰 Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Frontend    | React, HTML, CSS            |
| Backend     | Node.js, Express.js         |
| Database    | MongoDB                     |
| Real-Time   | Socket.IO                   |
| Authentication | JWT (JSON Web Tokens)   |



## 🚀 Getting Started

### ✅ Prerequisites

- Node.js and npm installed
- MongoDB running locally or MongoDB Atlas
- Internet connection (for WebRTC)

---

### ⚙️ Backend Setup

```bash
cd backend
npm install


PORT=5000
MONGO_URI=your_mongodb_connection_url
JWT_SECRET=your_jwt_secret_key

