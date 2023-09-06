const express = require('express');
const { registerUser, loginUser, findUser, getUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/find/:UserId', findUser);
router.post('/Users', getUsers);

module.exports = router;