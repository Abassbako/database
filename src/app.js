const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('../routes/userRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use((req, res, next) => {
    console.log(`${ req.path } ${ req.method }`);
    next();
});
app.use('/api/v1/Users', userRoutes);

const PORT = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.listen(PORT, () => {
    console.log(`app listening on port ${ PORT }`);
});

mongoose.connect(uri, {
    useNewUrlParser: true
})
.then(() => {
    console.log(`MongoDB connection successful`);
})
.catch((e) => {
    console.error(new Error(`MongoDB connection error: ${ e.message }`));
});