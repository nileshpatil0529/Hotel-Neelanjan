const express = require('express');
const { registerUser, loginUser, getAllUsers, deleteUser, updatePassword, checkEmailExists } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.get('/:user_name', checkEmailExists);
router.delete('/:id', deleteUser);
router.put('/password', updatePassword);

module.exports = router;
