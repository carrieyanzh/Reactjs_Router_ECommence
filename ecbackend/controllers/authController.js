import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === 'production';

const getRowObject = (result) => {
    if (!result || !result.rows || result.rows.length === 0) return null;
    return result.rows[0]; // 👈 FIX: Must target the first index to get the actual user record
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingCheck = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [email]
        });

        if (existingCheck.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await db.execute({
            sql: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            args: [name, email, hashedPassword]
        });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const result = await db.execute({
            sql: "SELECT id, name, email, password FROM users WHERE email = ?",
            args: [email]
        });

        const user = getRowObject(result);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Support both object properties and raw index fallbacks
        const dbPassword = user.password !== undefined ? user.password : user[3];
        const dbId = user.id !== undefined ? user.id : user[0];
        const dbName = user.name !== undefined ? user.name : user[1];
        const dbEmail = user.email !== undefined ? user.email : user[2];

        if (!dbPassword) {
            return res.status(500).json({ message: "Database schema error: password field column missing" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, dbPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        const token = jwt.sign(
            { id: dbId, email: dbEmail },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

      
        // Send confirmation data pack safely back to your React app instance
        return res.json({
            message: "Logged in successfully",
            token: token, // 👈 important
            user: { id: dbId, name: dbName, email: dbEmail }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error during login" });
    }
};


export const getCurrentUser = async (req, res) => {
    try {
        const result = await db.execute({
            sql: "SELECT id, name, email FROM users WHERE id = ?",
            args: [req.user.id]
        });

        const user = getRowObject(result);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const dbId = user.id !== undefined ? user.id : user[0];
        const dbName = user.name !== undefined ? user.name : user[1];
        const dbEmail = user.email !== undefined ? user.email : user[2];
        
        return res.json({ 
            user: { id: dbId, name: dbName, email: dbEmail } 
        });

    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ message: "Internal server error retrieving user" });
    }
};

export const logout = async (req, res) => {
    // Completely wipe the token cookie out of storage upon requesting an exit route action
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    });
    return res.json({ message: "Logged out successfully" });
};


export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 2. Check whether email already exists using modern .execute()
    const existingCheck = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [cleanEmail]
    });

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Insert new user using modern .execute()
    const result = await db.execute({
      sql: `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      args: [cleanName, cleanEmail, hashedPassword]
    });

    // Extract the new ID safely depending on how your db client formats metadata
    
    let lastID = result.lastInsertRowid !== undefined ? result.lastInsertRowid : null;
    if (typeof lastID === 'bigint') {
        lastID = Number(lastID); // 👈 Convert BigInt to standard JavaScript number safely
    }
    
    // 5. Return successful response
    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: lastID,
        name: cleanName,
        email: cleanEmail
      }
    });






  } catch (error) {
    console.error("❌ REGISTRATION SERVER ERROR:", error);
    return res.status(500).json({
      message: "Internal server error during registration"
    });
  }
};
