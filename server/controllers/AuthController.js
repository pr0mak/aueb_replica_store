const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ success: false, message: 'Όλα τα πεδία είναι υποχρεωτικά.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'To email χρησιμοποιείται ήδη.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'H εγγραφή ολοκληρώθηκε με επιτυχία!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή κατά την εγγραφή.', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Συμπληρώστε email και password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Λανθασμένο email ή κωδικός πρόσβασης.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Λανθασμένο email ή κωδικός πρόσβασης.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Επιτυχής σύνδεση!',
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή κατά τη σύνδεση.', error: error.message });
    }
};