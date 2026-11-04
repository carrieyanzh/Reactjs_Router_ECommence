import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
console.log(`[ENV CONFIG] Loaded variables from: ${envFile}`);

import "./db.js"; 

import authRoutes from "./routes/authRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); 

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/wishlist", wishlistRouter);


app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// 统一错误处理（必须保留 4 个参数）
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }
  res.status(500).json({ message: "Internal server error" });
});

// 兜底：异步代码里漏掉的错误只打日志，不让进程退出
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason?.message ?? reason);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
