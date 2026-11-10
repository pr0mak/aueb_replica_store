import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function submit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const user = await login({ email, password });

            navigate(location.state?.from || (user.role === "admin" ? "/admin" : "/store"),{ replace: true });
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    }
    return <section className="auth-wrap"><div className="auth-card">

        <span className="eyebrow">ΚΑΛΩΣ ΗΡΘΕΣ ΞΑΝΑ</span><h1>Σύνδεση χρήστη</h1>
        
        <p className="muted">Συνδέσου για να ολοκληρώσεις τις αγορές σου.</p>
        
        {location.state?.registered && <p className="alert success" role="status">Η εγγραφή ολοκληρώθηκε. Μπορείς να συνδεθείς.</p>}

        {error && <p className="alert error" role="alert">{error}</p>}

        <form onSubmit={submit} className="form-fields">

            <label>Email<input type="email" required autoComplete="email" value={email} placeholder="example@aueb.gr" onChange={e=>setEmail(e.target.value)} /></label>
            
            <label>Κωδικός πρόσβασης<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
            
            <button className="btn btn-full" disabled={loading}>{loading ? "Σύνδεση..." : "Σύνδεση"}</button>

        </form>

        <p className="auth-bottom">Δεν έχεις λογαριασμό; <Link to="/register">Εγγραφή</Link></p>

    </div></section>;
}
