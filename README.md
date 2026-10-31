
git init
git add .
git commit -m "Initial commit: YanTech Lab E-Commence full-stack project"
git branch -M main
git remote add origin https://github.com/carrieyanzh/xxxx.git
git push -u origin main


# E-commerce Platform

Full-stack E-commerce application.

## Technologies

### Frontend
- React.js
- Vite
- React Router
- Redux Toolkit
- Axios

### Backend
- Node.js
- Express.js
- SQLite3

## Project Structure

e-commence_backend_frontend/
├── frontend/
├── backend/
├── README.md
└── .gitignore

## Features
- User authentication
- Product management
- Shopping cart
- Checkout
- Order history
- SQLite database


e-commence_backend_frontend/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Profile.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── products/
│   │   │   └── orders/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── database/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── db.js
│   ├── server.js
│   └── package.json
│
└── README.md