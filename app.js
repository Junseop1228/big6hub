const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const { initDb } = require('./db');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// TODO: mount routers
app.use('/api/teams', require('./routes/teams'));
// app.use('/api/players', require('./routes/players'));
// app.use('/api/seasons', require('./routes/seasons'));
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/favorites', require('./routes/favorites'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await initDb();
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;

