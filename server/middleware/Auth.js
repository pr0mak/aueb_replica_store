const jwt = require("jsonwebtoken");
const User = require("../models/User");

//verify token and fetch the current role from the database.
async function verifyToken(req, res, next) {
    const header = req.get("authorization") || "";
    const match = /^Bearer\s+(\S+)$/i.exec(header);
    if (!match){
        return res.status(401).json({ success: false, message: "Απαιτείται Bearer token." });
    }
    try {

        const decoded = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
        const user = await User.findById(decoded.id).select("_id role email").lean();
        
        if (!user){
            return res.status(401).json({ success: false, message: "Ο λογαριασμός δεν υπάρχει." });
        }

        req.user = { id: String(user._id), role: user.role, email: user.email };
        next();

    }
    catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" || error.name === "NotBeforeError") {
            return res.status(401).json({ success: false, message: "Μη έγκυρο ή ληγμένο token." });
        }
        next(error);
    }
}

function verifyAdmin(req, res, next) {
    if (req.user?.role !== "admin"){
        return res.status(403).json({ success: false, message: "Μόνο ο διαχειριστής έχει πρόσβαση." });
    }
    next();
}

function verifyCustomer(req, res, next) {
    if (req.user?.role !== "user"){
        return res.status(403).json({ success: false, message: "Μόνο χρήστης με ρόλο User μπορεί να υποβάλει παραγγελία." });
    }
    next();
}
module.exports = {
    verifyToken,
    verifyAdmin,
    verifyCustomer
};
