<<<<<<< HEAD

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

'''text
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
=======
# Reactjs_Router_ECommence
'''
前端登录 ➔ 后端返回明文 Token ➔ 前端存入 LocalStorage ➔ 后续任意请求通过拦截器自动带上 Authorization Header ➔ 后端中间件从 Header 完美解析成功。

Instead, Redux Toolkit internally catches everything and returns a special promise object containing a meta property:
• fulfilled: The network request succeeded, your credentials matched, and the user successfully logged in.
• rejected: The network request failed (e.g., wrong password, wrong email, server down).
By checking result.meta.requestStatus === "fulfilled", you are guaranteeing that the user is only redirected to the home screen if the server actually confirmed their login details. If they enter a wrong password, it will stay on the login page and show the text error safely.


取而代之的是，dispatch 动作执行完毕后，会返回一个特殊的 Promise 结果对象，里面包含了 meta.requestStatus 状态属性：
• fulfilled（已兑现）：代表网络请求成功，账号密码完全匹配，登录成功。
• rejected（已拒绝）：代表请求失败（可能密码错了、邮箱不存在或服务器宕机）。
