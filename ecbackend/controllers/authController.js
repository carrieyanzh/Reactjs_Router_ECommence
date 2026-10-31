import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js"; // Loads the working root db instance

// 1. LOGIN CONTROLLER
export const login = (req, res) => {
  console.log("1. LOGIN API CALLED");
  const { email, password } = req.body;
  
  console.log("2. Searching for email:", email);

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      console.log("3. Database query callback finished execution.");

      if (err) {
        console.error("-> SQLITE ERROR DETAILS:", err.message);
        return res.status(500).json({ message: "Database error" });
      }

      if (!user) {
        console.log("-> USER NOT FOUND IN DATABASE:", email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      console.log("-> USER FOUND successfully. Comparing passwords...");

      try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log("-> Password matching calculation result:", passwordMatch);

        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 86400000,
          path: "/"
        });

        console.log("-> JWT Cookie issued. Sending success payload.");
        return res.json({
          message: "Login successful",
          user: { id: user.id, name: user.name, email: user.email }
        });
      } catch (error) {
        console.error("-> Bcrypt comparison error layout:", error);
        return res.status(500).json({ message: "Login failed" });
      }
    }
  );
};

// 2. GET CURRENT USER CONTROLLER (Restored this missing function)
export const getCurrentUser = (req, res) => {
  db.get(
    "SELECT id, name, email FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ user });
    }
  );
};

// 3. LOGOUT CONTROLLER
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res.json({ message: "Logout successful" });
};
