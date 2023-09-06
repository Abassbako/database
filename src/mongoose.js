const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieparser());
app.use({
    secret: "AAWRYOIAWOIHWEHOHWWEHWEOIHWEPOQHEWOEP",
    resave: false,
    saveUninitialized: false
});
app.use((req, res, next) => {
    console.log(`${ req.path } ${ req.method }`);
    next();
});

const PORT = process.env.PORT || 8000;
const uri = "mongodb://127.0.0.1:27017/usersdb"

app.listen(PORT, () => {
    console.info(`app listening on port ${ PORT }`);
});

mongoose.connect(uri, {
    useNewUrlParser: true
})
.then(() => {
    console.log('MongoDB connection successful');
})
.catch((e) => {
    console.error(new Error(`MongoDB connection error: ${ e.message }`));
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,  
        required: true,
        lowercase: true
    }
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
    const createToken = (_id) => {
        const jwtKey = process.env.JWT_SECRET_KEY;
        return jwt.sign({ _id }, jwtKey, { expiresIn: "31d" });
    };

    try { 

        const { name, email, password } = req.body;

        let User = await userModel.findOne({ email })

        if (User) {
            res.status(400).json('A user with this email address already exist');
            return
        }

        if (!name || !email || !password) {
            res.status(401).json('All fields are required');
        }

        if (!validator.isEmail(email)) {
            res.status(400).json('Not a valid email address');
            return
        }

        if (!validator.isStrongPassword(password)) return res.status(401).json('Password must be a strong one');

        User = new userModel({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        User.password = await bcrypt.hashSync(User.password, salt);

        const saveUser = await User.save();

        const token = createToken(User._id);
        res.status(200).json({ _id: User._id, name, email, token });

    } catch (e) {
        console.error(new Error(e));
        res.status(500).json(e);
    };
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let User = await userModel.findOne({ email });

        if (!User) {
            res.status(400).json('Invalid email address or password');
            return;
        }

        const isvalidPassword = bcrypt.compareSync(password, User.password);
        if (!isvalidPassword) return res.status(400).json('Invalid email address or password');

        res.status(200).json(User);

    } catch (e) {
        console.error(new Error(e));
        res.status(500).json(e)
    };
}); 
app.get('/find/:UserId', async (req, res) => {
    try {
        var ObjectId = req.params.UserId

       if (ObjectId) {
        const UserId = req.params.UserId;

        let User = await userModel.findById(UserId);

        res.status(200).json(User);
       } else res.status(404).json('Invalid Id');
    } catch (e) {
        console.error(new Error (e));
        res.status(500).json(e);
    };
});

app.get('/', async (req, res) => {
    try {

        let Users = await userModel.find();
        
        res.cookie('welcome to this website', true, { 
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: true
        });

        res.status(200).json(Users);

        } catch (e) {
        console.error(new Error(e));
        res.status(500).json(e);
    };
});