import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target brightcart.db inside the database folder
const databasePath = path.resolve(__dirname, "database", "brightcart.db"); 
console.log("-> SERVER IS LOADING DATABASE FROM:", databasePath);

const db = new sqlite3.Database(databasePath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  console.log("-> Verifying and creating schemas...");

  // 1. CREATE USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // 2. CREATE ADDRESSES TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    address_type TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`);

  // 2. CREATE CATEGORIES TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      emoji TEXT
    )
  `);

  // 3. CREATE PRODUCTS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      emoji TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Create Wishlist table
db.run(`
  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, product_id),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL,

    FOREIGN KEY (order_id)
      REFERENCES orders(id)
      ON DELETE CASCADE,

    FOREIGN KEY (product_id)
      REFERENCES products(id)
  )
`);


  // Seed Categories
  const categories = [
    [1, "Electronics", "Discover electronic products.", "💻"],
    [2, "Accessories", "Bags and everyday accessories.", "🎒"],
    [3, "Home & Living", "Products for your home.", "🏠"],
  ];
  const insertCategory = `INSERT OR IGNORE INTO categories (id, name, description, emoji) VALUES (?, ?, ?, ?)`;
  categories.forEach((cat) => db.run(insertCategory, cat));

  // Seed Products
  const products = [
    [1, "Wireless Headphones", 89, "High-quality wireless headphones.", 1, "🎧"],
    [2, "Smart Watch", 129, "Smart watch for everyday activities.", 1, "⌚"],
    [3, "Bluetooth Speaker", 69, "Portable Bluetooth speaker.", 1, "🔊"],
    [4, "Wireless Mouse", 35, "Comfortable wireless mouse.", 1, "🖱️"],
    [5, "Backpack", 59, "Lightweight backpack for travel.", 2, "🎒"],
    [6, "Travel Bag", 79, "Spacious travel bag.", 2, "🧳"],
    [7, "Wallet", 29, "Compact everyday wallet.", 2, "👛"],
    [8, "Sunglasses", 45, "Classic sunglasses.", 2, "🕶️"],
    [9, "Table Lamp", 49, "Modern table lamp.", 3, "💡"],
    [10, "Coffee Mug", 15, "Ceramic coffee mug.", 3, "☕"],
    [11, "Wall Clock", 39, "Simple modern wall clock.", 3, "🕒"],
    [12, "Cushion", 25, "Comfortable decorative cushion.", 3, "🛋️"]
  ];
  const insertProduct = `INSERT OR IGNORE INTO products (id, name, price, description, category_id, emoji) VALUES (?, ?, ?, ?, ?, ?)`;
  products.forEach((prod) => db.run(insertProduct, prod));

  // Seed the Test User Account safely
  const testEmail = "test@example.com";
  db.get("SELECT id FROM users WHERE email = ?", [testEmail], async (err, row) => {
    if (err) {
      console.error("Error looking up test user:", err.message);
      return;
    }
    if (!row) {
      try {
        const hashedPassword = await bcrypt.hash("test123456", 12);
        db.run(
          `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
          ["Test User", testEmail, hashedPassword],
          (insertErr) => {
            if (insertErr) console.error("Error seeding user:", insertErr.message);
            else console.log("SUCCESS: Default test user account seeded successfully!");
          }
        );
      } catch (hashError) {
        console.error("Bcrypt hashing failed:", hashError);
      }
    } else {
      console.log("INFO: test@example.com account is verified and ready.");
    }
  });
});

export default db;
