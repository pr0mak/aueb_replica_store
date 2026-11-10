import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/home/HomePage";
import Store from "./pages/store/StorePage";
import Categories from "./pages/category/CategoriesPage";
import Product from "./pages/product/ProductPage";
import Cart from "./pages/cart/CartPage";
import Checkout from "./pages/checkout/CheckoutPage";
import Login from "./pages/login/LoginPage";
import Register from "./pages/register/RegisterPage";
import Orders from "./pages/orders/OrdersPage";
import Admin from "./pages/admin/AdminPage";
import Contact from "./pages/contact/ContactPage";

export default function App() {
    return (
        <BrowserRouter>
            <div className="app-shell">
                <Navbar />
                <main className="page-content container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/store/:category" element={<Store />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/product/:id" element={<Product />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<ProtectedRoute role="user"><Checkout /></ProtectedRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/orders" element={<ProtectedRoute role="user"><Orders /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="*" element={<section className="empty-state"><h1>404 - Η σελίδα δεν βρέθηκε</h1></section>} />
                    </Routes>
                </main>
                <footer className="site-footer">
                    <div className="container footer-content">
                        <div className="first-column">
                            <h3>&copy; 2026 AUEB Official Store</h3>
                            <p><a href="https://www.shop.aueb.gr/" target="_blank" rel="noopener noreferrer">Επίσημη ιστοσελίδα AUEB</a></p>
                        </div>
                        <div className="third-column">
                            <h3>Οικονομικό Πανεπιστήμιο Αθηνών</h3>
                            <p>Πατησίων 76, Αθήνα</p>
                        </div>
                        <div className="design"><p>Σχεδίαση: pro - nik.</p></div>
                    </div>
                </footer>
            </div>
        </BrowserRouter>
    );
}
