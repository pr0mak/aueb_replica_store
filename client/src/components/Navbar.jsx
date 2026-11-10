
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const {
        user,
        logout,
        isAuthenticated,
        isAdmin
    } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header>
            <h1>AUEB Official Store</h1>

            <nav>
                <Link to="/">Home</Link>{" "}
                <Link to="/store">Store</Link>{" "}
                <Link to="/cart">Cart</Link>{" "}
                <Link to="/contact">Contact</Link>{" "}

                {isAuthenticated ? (
                    <>
                        <Link to="/orders">My Orders</Link>{" "}

                        {isAdmin && (
                            <>
                                <Link to="/admin">Admin</Link>{" "}
                            </>
                        )}

                        <span>
                            {user?.firstname}
                        </span>{" "}

                        <button
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>{" "}
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
