import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export default function Navbar() {

    const { user, logout } = useAuth();

    const { count } = useCart();
    
    const navigate = useNavigate();
    
    function signOut() {
        logout();
        navigate("/");
    }
    
    return <header className="site-header">
        <div className="header-bar container">

            <Link
                to="/"
                className="brand"
                aria-label="Αρχική σελίδα"
            >
                <img
                    src="/assets/aueb_logo.jpg"
                    alt="Λογότυπο Οικονομικού Πανεπιστημίου Αθηνών"
                    className="brand-logo"
                />
            </Link>
            <div className="header-actions">
                
                {user ? <><span className="welcome-user">{user.firstname} {user.lastname}</span>
                    <button className="link-button" type="button" onClick={signOut}>Αποσύνδεση</button></> :
                    <><Link to="/register">Εγγραφή</Link><Link to="/login">Σύνδεση</Link></>}
                <Link className="cart-chip" to="/cart">Καλάθι <b>{count}</b></Link>
            </div>
        </div>
        
        <nav className="site-nav" aria-label="Κεντρική πλοήγηση">
            <div className="container nav-items">
                
                <NavLink to="/" end>Αρχική</NavLink>
                
                <NavLink to="/store">Κατάστημα</NavLink>
                
                <NavLink to="/cart">Καλάθι</NavLink>
                
                {user?.role === "user" && <NavLink to="/orders">Οι παραγγελίες μου</NavLink>}
                
                {user?.role === "admin" && <NavLink to="/admin">Admin Panel</NavLink>}
                
                <NavLink to="/contact">Επικοινωνία</NavLink>
            </div>
        </nav>
    </header>;
}
