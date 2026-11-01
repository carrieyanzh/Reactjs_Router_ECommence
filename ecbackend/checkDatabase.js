import db from "../db.js";

db.all(
  "SELECT name, sql FROM sqlite_master WHERE type = 'table'",
  [],
  (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(rows);
    }

    db.close();
  }
);