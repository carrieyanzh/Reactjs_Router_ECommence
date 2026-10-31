import sqlite3 from "sqlite3";

const db = new sqlite3.Database(
  "./database/brightcart.db",
  (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Connected to BrightCart SQLite database");
    }
  }
);

export default db;