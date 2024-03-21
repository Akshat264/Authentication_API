const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    // Extract token from request cookies
    const token = req.cookies.jwt; 
    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    // Verify token
    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            // Token is valid, set req.user with decoded user information
            req.user = decoded;
            next();
        }
    });
}
module.exports=verifyToken;