import { Link } from "react-router-dom";

function Navbar() {
    return (
        <header>
            <h1>AUEB Official Store</h1>

            <nav>
                <Link to="/">Home</Link>{" "}
                <Link to="/store">Store</Link>{" "}
                <Link to="/cart">Cart</Link>{" "}
                <Link to="/orders">My Orders</Link>{" "}
                <Link to="/login">Login</Link>{" "}
                <Link to="/register">Register</Link>{" "}
                <Link to="/admin">Admin Panel</Link>{" "}
                {/* {user?.role === "admin" && (
                    <Link to="/admin">Admin</Link>
                )} */}
            </nav>
        </header>
    );
}

export default Navbar;