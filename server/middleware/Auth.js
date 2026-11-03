const jwt = require('jsonwebtoken');

//epalitheush JWT Token (401)
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Δεν παρέχεται token πρόσβασης (401).' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Μη έγκυρο ή ληγμένο token (401).' });
    }
};

//epalitheush Admin role(403)
exports.verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Δεν έχετε δικαιώματα διαχειριστή (403).' });
    }
    next();
};