import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/home/HomePage";
import Store from "./pages/store/StorePage";
import Product from "./pages/product/ProductPage";
import Cart from "./pages/cart/CartPage";
import Checkout from "./pages/checkout/CheckoutPage";
import Login from "./pages/login/LoginPage";
import Register from "./pages/register/RegisterPage";
import Orders from "./pages/orders/OrdersPage";
import Admin from "./pages/admin/AdminPage";
import Contact from "./pages/contact/ContactPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/store" element={<Store />} />
                <Route path="/products/:id" element={<Product />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contact" element={<Contact />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                </Route>

                <Route element={<ProtectedRoute adminOnly />}>
                    <Route path="/admin" element={<Admin />} />
                </Route>

                <Route path="*" element={<h2>404 - Page not found</h2>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;