import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //'Bearer <token>'

  if (!token) {
    console.log("No token provided in Authorization header!");
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // req.user
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default authenticateToken;
