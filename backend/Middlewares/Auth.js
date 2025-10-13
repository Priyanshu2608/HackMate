import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized, token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email }; // explicit
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token invalid or expired' });
  }
};

export default isAuthenticated;
