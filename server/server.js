const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api", require("./routes/ProductsRoutes"));
app.use("/api/orders", require("./routes/OrderRoutes"));
app.use("/api/products", require("./routes/ProductsRoutes"));

const { verifyToken, verifyCustomer } = require("./middleware/Auth");
const { checkout } = require("./controllers/OrderController");
app.post("/api/buy/checkout", verifyToken, verifyCustomer, checkout);

app.use((req, res) => res.status(404).json({ success: false, message: "To endpoint δεν βρέθηκε." }));

app.use((error, req, res, next) => {
    if (error.name === "ValidationError" || error.name === "CastError" || error.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: error.message });
    }

    if (error.type === "entity.too.large"){
        return res.status(413).json({ success: false, message: "Πολύ μεγάλο αίτημα." });
    }

    console.error("Server error:", error);

    return res.status(500).json({ success: false, message: "Εσωτερικό σφάλμα του server." });
});

async function start() {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("Συμπλήρωσε MONGO_URI και ισχυρό JWT_SECRET στο server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Επιτυχής σύνδεση στη MongoDB!");

    const port = Number(process.env.PORT) || 5000;

    app.listen(port, () => console.log(`AUEB API: http://localhost:${port}`));
}
if (require.main === module) {

    start().catch(error => {

        console.error("Αδυναμία εκκίνησης:", error.message);
        process.exit(1);
    });
}
module.exports = {
    app,
    start
};
