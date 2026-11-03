const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productsRoutes = require("./routes/ProductsRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/OrderRoutes");

const app = express();

app.use(cors());
app.use(express.json()); //gia anagnwsh jSON body

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Επιτυχής σύνδεση στη MongoDB!'))
  .catch((err) => console.error('Σφάλμα στη MongoDB:', err));

//sundesh me routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", (req, res) => {
    return res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`O Server τρέχει στη θύρα ${PORT}`);
});


