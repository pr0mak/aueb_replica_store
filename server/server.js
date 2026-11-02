const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

//Middleware gia na diavasei o server json dedomena
app.use(express.json());

//sundesh me  MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Επιτυχής σύνδεση στη MongoDB'))
  .catch((err) => console.error('Σφάλμα σύνδεσης στη MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Ο Server τρέχει στη θύρα ${PORT}`);
});