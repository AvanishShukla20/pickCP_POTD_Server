const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('Incoming request URL:', req.originalUrl);
  console.log('Auth headers:', req.headers);
  console.log('Method:', req.method);
  const token = req.header('Authorization')?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = { authMiddleware }