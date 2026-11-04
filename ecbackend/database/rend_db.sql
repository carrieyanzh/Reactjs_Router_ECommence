-- ==========================================
-- 0. Drop Old Tables safely (with CASCADE)
-- ==========================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- 1. Users Table
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (id, name, email, password) 
VALUES (2, 'Test User', 'test@example.com', '$2b$12$yUuvoWtuygJwBWMDpVItY.RC4RJItxSoEnvoURvWZl0/TkrXrcfxS');

-- ==========================================
-- 2. Categories Table
-- ==========================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    emoji VARCHAR(50)
);

INSERT INTO categories (id, name, description, emoji) VALUES
(1, 'Electronics', 'Discover electronic products.', '💻'),
(2, 'Accessories', 'Bags and everyday accessories.', '🎒'),
(3, 'Home & Living', 'Products for your home.', '🏡');

-- ==========================================
-- 3. Products Table (With Stock)
-- ==========================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    emoji VARCHAR(50),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO products (id, name, price, description, category_id, emoji, stock) VALUES
(1, 'Wireless Headphones', 89.0, 'High-quality wireless headphones.', 1, '🎧', 100),
(2, 'Smart Watch', 129.0, 'Smart watch for everyday activities.', 1, '⌚', 100),
(3, 'Bluetooth Speaker', 69.0, 'Portable Bluetooth speaker.', 1, '🔊', 100),
(4, 'Wireless Mouse', 35.0, 'Comfortable wireless mouse.', 1, '🖱️', 100),
(5, 'Backpack', 59.0, 'Lightweight backpack for travel.', 2, '🎒', 100),
(6, 'Travel Bag', 79.0, 'Spacious travel bag.', 2, '🧳', 100),
(7, 'Wallet', 29.0, 'Compact everyday wallet.', 2, '👛', 100),
(8, 'Sunglasses', 45.0, 'Classic sunglasses.', 2, '🕶️', 100),
(9, 'Table Lamp', 49.0, 'Modern table lamp.', 3, '💡', 100),
(10, 'Coffee Mug', 15.0, 'Ceramic coffee mug.', 3, '☕', 100),
(11, 'Wall Clock', 39.0, 'Simple modern wall clock.', 3, '🕰️', 100),
(12, 'Cushion', 25.0, 'Comfortable decorative cushion.', 3, '🛋️', 100);

-- ==========================================
-- 4. Addresses Table
-- ==========================================
CREATE TABLE addresses (    
    id SERIAL PRIMARY KEY,    
    user_id INTEGER NOT NULL,    
    phone VARCHAR(50) NOT NULL,    
    address_line1 TEXT NOT NULL,    
    address_line2 TEXT,    
    postal_code VARCHAR(20) NOT NULL,    
    city VARCHAR(100) NOT NULL,    
    country VARCHAR(100) NOT NULL,    
    address_type VARCHAR(50) NOT NULL,    
    is_default BOOLEAN DEFAULT FALSE,    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO addresses (id, user_id, phone, address_line1, address_line2, postal_code, city, country, address_type, is_default) VALUES
(1, 2, '91234567', '123 Orchard Road', '', '238884', 'Singapore', 'Singapore', 'Home', FALSE),
(2, 2, '98765432', '456 Geylang Road', '#04-12', '389445', 'Singapore', 'Singapore', 'Office', FALSE);

-- ==========================================
-- 5. Wishlist Table
-- ==========================================
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==========================================
-- 6. Orders & Order Items Tables
-- ==========================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==========================================
-- 7. Fix Sequence counters for SERIAL IDs
-- ==========================================
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(MAX(id), 1)) FROM categories;
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;
SELECT setval(pg_get_serial_sequence('addresses', 'id'), COALESCE(MAX(id), 1)) FROM addresses;
