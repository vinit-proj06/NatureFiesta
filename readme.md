## Contributors
- Adarsh Pathak — Core development and backend
- Vinit Prajapati — Frontend UI and project integration

## Note
This is a group project uploaded with the consent of all contributors.


🌿 NATUREFIESTA

A Web-Based Platform for Managing Small-Scale Business Operations in Gardening, Fertilizers, and Handlooms

NatureFiesta is a centralized web application designed to help small-scale entrepreneurs efficiently manage **orders, inventory, and customer interactions** by replacing traditional call- and message-based workflows with a modern digital system.


📌 Problem Statement

Managing business operations through calls and messages is inefficient and time-consuming, especially for small entrepreneurs dealing in gardening tools, fertilizers, and handloom products.

Common challenges include:

* Manual order handling
* Poor inventory tracking
* Disorganized customer data
* Limited business scalability

These issues negatively affect productivity, growth potential, and customer satisfaction.

---

💡 Proposed Solution

NatureFiesta provides a **web-based centralized platform** that enables shop owners to:

* Digitally manage orders
* Track inventory in real time
* Reduce manual errors
* Operate the business seamlessly online

The solution enhances efficiency, accuracy, and overall business performance.

---

## 🛠️ Tech Stack

### Frontend

* **Pug (HTML Templates)**
  Simplified and readable HTML templating for dynamic content.

* **Tailwind CSS**
  Utility-first CSS framework for rapid UI development and responsive design.

* **JavaScript**
  Adds interactivity and dynamic behavior on the client side.

---

### Backend

* **Node.js**
  Server-side JavaScript runtime with asynchronous, non-blocking architecture.

* **Express.js**
  Lightweight web framework for handling routing, middleware, and APIs.

* **MongoDB**
  NoSQL database for scalable and flexible data storage.

* **Mongoose**
  ODM library for schema definition, validation, and database operations.

---

## 📂 Project Structure

```
NatureFiesta/
│
├── controllers/        # Business logic
├── routes/             # API routes
├── models/             # MongoDB schemas
├── middleware/         # Custom middleware
├── views/              # Pug templates
├── public/             # Static assets
├── utils/              # Utility functions
│
├── app.js              # App configuration
├── server.js           # Server entry point
├── package.json        # Dependencies
├── config.env          # Environment variables
└── README.md           # Project documentation
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vinit-proj06/NatureFiesta.git
cd NatureFiesta
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `config.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### 4. Start the Server

```bash
npm start
```

Server will run on:

```
http://localhost:5000
```

---

## 🎯 How It Works

**Data Flow**

```
User Actions → Web Interface (Pug + JS)
                     ↓
              Express.js Routes
                     ↓
              Controllers
                     ↓
               MongoDB (via Mongoose)
```

* Frontend sends requests via forms and APIs
* Backend processes business logic
* MongoDB stores and retrieves data
* Updated data is rendered back to the UI

---

## 📈 Expected Outcomes

* Reduced manual effort
* Improved order accuracy
* Better inventory control
* Enhanced customer satisfaction
* Scalable digital business operations

---

## 👥 Contributors

* **Adarsh** – Core Development & Backend Logic
* **Vinit Prajapati** – Project Contributor, GitHub Management, Documentation

---

## 🚀 Future Enhancements

* Online payment integration
* Role-based authentication (Admin / Staff)
* Sales analytics dashboard
* Email & WhatsApp notifications
* Product recommendation system


