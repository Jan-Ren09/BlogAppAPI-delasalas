const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {createAccessToken} = require('../auth')


module.exports.registerUser = async (req, res) => {
    const { email, password, username } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        // Check if email and username are already registered
        const [existingUser, existingUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ username })
        ]);

        if (existingUser) {
            return res.status(409).json({ message: 'User email already registered' });
        }

        if (existingUsername) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            username
        });

        // Save the user to the database
        await newUser.save();

        return res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Login a user
module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check the password
            return bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(401).json({ message: 'Invalid password' });
                    }

                    const accessToken = createAccessToken(user); 
                    res.status(200).json({ accessToken });
                });
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
};

// Get user details (protected route)
module.exports.getUserDetails = (req, res) => {
    const userId = req.user.id; 

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
};



