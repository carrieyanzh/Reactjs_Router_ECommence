PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- ==========================================
-- 0. Drop Old Tables safely
-- ==========================================
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ==========================================
-- 1. Users Table
-- ==========================================
CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
INSERT INTO users VALUES(2,'Test User','test@example.com','$2b$12$yUuvoWtuygJwBWMDpVItY.RC4RJItxSoEnvoURvWZl0/TkrXrcfxS');

-- ==========================================
-- 2. Categories Table
-- ==========================================
CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      emoji TEXT
    );
INSERT INTO categories VALUES(1,'Electronics','Discover electronic products.','💻');
INSERT INTO categories VALUES(2,'Accessories','Bags and everyday accessories.','🎒');
INSERT INTO categories VALUES(3,'Home & Living','Products for your home.','🏡');

-- ==========================================
-- 3. Products Table (With Stock)
-- ==========================================
CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      emoji TEXT,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

INSERT INTO products VALUES(1,'Wireless Headphones',89.0,'High-quality wireless headphones.',1,'🎧', 100);
INSERT INTO products VALUES(2,'Smart Watch',129.0,'Smart watch for everyday activities.',1,'⌚', 100);
INSERT INTO products VALUES(3,'Bluetooth Speaker',69.0,'Portable Bluetooth speaker.',1,'🔊', 100);
INSERT INTO products VALUES(4,'Wireless Mouse',35.0,'Comfortable wireless mouse.',1,'🖱️', 100);
INSERT INTO products VALUES(5,'Backpack',59.0,'Lightweight backpack for travel.',2,'🎒', 100);
INSERT INTO products VALUES(6,'Travel Bag',79.0,'Spacious travel bag.',2,'🧳', 100);
INSERT INTO products VALUES(7,'Wallet',29.0,'Compact everyday wallet.',2,'👛', 100);
INSERT INTO products VALUES(8,'Sunglasses',45.0,'Classic sunglasses.',2,'🕶️', 100);
INSERT INTO products VALUES(9,'Table Lamp',49.0,'Modern table lamp.',3,'💡', 100);
INSERT INTO products VALUES(10,'Coffee Mug',15.0,'Ceramic coffee mug.',3,'☕', 100);
INSERT INTO products VALUES(11,'Wall Clock',39.0,'Simple modern wall clock.',3,'🕰️', 100);
INSERT INTO products VALUES(12,'Cushion',25.0,'Comfortable decorative cushion.',3,'🛋️', 100);

-- ==========================================
-- 4. Addresses Table
-- ==========================================
CREATE TABLE addresses (    
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
    FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO addresses VALUES(1,2,'91234567','123 Orchard Road','','238884','Singapore','Singapore','Home',0);
INSERT INTO addresses VALUES(2,2,'98765432','456 Geylang Road','#04-12','389445','Singapore','Singapore','Office',0);

-- ==========================================
-- 5. Wishlist Table
-- ==========================================
CREATE TABLE wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

-- ==========================================
-- 6. Orders & Order Items Tables
-- ==========================================
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

-- ==========================================
-- 7. Sync Sequence Values (Table creation line removed)
-- ==========================================
PRAGMA writable_schema=ON;
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',2);
INSERT INTO sqlite_sequence VALUES('categories',3);
INSERT INTO sqlite_sequence VALUES('products',12);
INSERT INTO sqlite_sequence VALUES('addresses',2);
PRAGMA writable_schema=OFF;

COMMIT;
PRAGMA foreign_keys=ON;
