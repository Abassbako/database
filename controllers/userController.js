const userModel = require('../models/userModel');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const createToken = (_id) => {
        const jwtKey = process.env.JWT_SECRET_KEY;
        return jwt.sign({ _id }, jwtKey, { expiresIn: "31d" });
    }
    try {
        const { name, email, password } = req.body;

        let User = await userModel.findOne({ email });

        if (User) return res.status(401).json('A user with this email address already exist');

        if (!name || !email || !password) return res.status(400).json('All fields are required');

        if (!validator.isEmail(email)) return res.status(401).json('Not a valid email address');

        if (!validator.isStrongPassword(password)) return res.status(401).json('Password must be a strong one');

        User = new userModel({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        User.password = await bcrypt.hash(User.password, salt);

        const saveUser = await User.save();

        const token = createToken(User._id);
        res.status(200).json({ _id: User._id, name: User.name, email: User.email, token });

    } catch (e) {
        console.error(new Error(e));
        res.status(500).json(e);
    };
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let User = await userModel.findOne({ email });

        if (!User) res.status(401).json('Invalid email address or password');

        const isValidPassword = await bcrypt.compare(password, User.password);

        if (!isValidPassword) return res.status(401).json('Invalid email address or password');

        const token = createToken(User._id);
        res.status(200).json({ _id:User._id, name: User.name, email, token });
    } catch (e) {
        console.error(new Error(e));
        res.status(500).json(e);
    };
};

const findUser = async (req, res) => {
    try {
        const UserId = req.params.UserId;

        let User = await userModel.findById(UserId);

        res.status(200).json(User);
    } catch (e) {
        console.error(new Error(e));
        res.status(500).json(e);
    };
};

const getUsers = async (req, res) => {
    try {
        let Users = await userModel.find();

        res.status(200).json(Users);
    } catch (e) {
        console.error(new Errro)
    };
};

module.exports = { 
    registerUser,
    loginUser,
    findUser,
    getUsers
};