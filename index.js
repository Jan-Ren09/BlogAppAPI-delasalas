const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/blog');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: ['http://localhost:3000','https://blog-app-client-delasalas.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use('/users', userRoutes);
app.use('/blog', blogRoutes);

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${process.env.PORT || 3000}`);
    });
}

module.exports = { app, mongoose };
