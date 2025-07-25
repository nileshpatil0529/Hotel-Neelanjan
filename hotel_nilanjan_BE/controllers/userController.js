const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const dotenv = require('dotenv');

dotenv.config();

const User = db.User;

// Register User
exports.registerUser = async (req, res) => {
    const { user_name } = req.body;
    try {
        const user = await User.create({ user_name });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { user_name, password } = req.body;
    try {
        const user = await User.findOne({ where: { user_name } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: token, userData:  user});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.destroy({ where: { id } });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update user password
exports.updatePassword = async (req, res) => {
    const {id, oldPassword, newPassword } = req.body;

    try {
        // Fetch the user by ID
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compare oldPassword with the hashed password in the database
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// check email existence
exports.checkEmailExists = async (req, res) => {
    try {
        const { user_name } = req.params;
        if (!user_name) {
            return res.status(400).json({
                message: 'User name is required'
            });
        }
        const user = await User.findOne({
            where: {
                user_name: user_name
            }
        });
        if (user) {
            return res.status(200).json(true);
        } else {
            return res.status(200).json(false);
        }
    } catch (error) {
        console.error('Error checking user exist:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}