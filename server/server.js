const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productsRoutes = require("./routes/ProductsRoutes");

const app = express();

app.use(cors());
app.use(express.json()); //gia anagnwsh jSON body

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Επιτυχής σύνδεση στη MongoDB!'))
  .catch((err) => console.error('Σφάλμα στη MongoDB:', err));

//sundesh me routes
app.use('/api/auth', require('./routes/AuthRoutes'));
//app.use('/api/products', require('./routes/ProductsRoutes'));
//app.use('/api/orders', require('./routes/OrderRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`O Server τρέχει στη θύρα ${PORT}`);
});
