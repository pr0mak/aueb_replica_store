import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import "./register.css";

const initial = { firstname: "", lastname: "", phone: "", email: "", password: "", confirmPassword: "" };
const namePattern = /^[Α-Ω]+(?:[ -][Α-Ω]+)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rules = [
    { label: "Τουλάχιστον 8 χαρακτήρες", test: value => value.length >= 8 },
    { label: "Τουλάχιστον ένα γράμμα", test: value => /[a-zA-Zα-ωΑ-Ω]/.test(value) },
    { label: "Τουλάχιστον έναν αριθμό", test: value => /\d/.test(value) },
    { label: "Ένα σύμβολο (!@#$%^&*)", test: value => /[!@#$%^&*]/.test(value) }
];

function validateField(name, value, form) {
    if (!value.trim()) return "Το πεδίο είναι υποχρεωτικό.";
    if ((name === "firstname" || name === "lastname") && !namePattern.test(value.trim()))
        return "Χρησιμοποίησε μόνο κεφαλαία ελληνικά χωρίς τόνους.";
    if (name === "phone" && !/^69\d{8}$/.test(value.trim()))
        return "Το κινητό πρέπει να έχει 10 ψηφία και να αρχίζει από 69.";
    if (name === "email" && (value.length > 254 || !emailPattern.test(value.trim())))
        return "Συμπλήρωσε έγκυρο email.";
    if (name === "password" && (value.length > 128 || !rules.every(rule => rule.test(value))))
        return "Ο κωδικός δεν καλύπτει όλους τους κανόνες.";
    if (name === "confirmPassword" && value !== form.password)
        return "Οι κωδικοί δεν ταιριάζουν.";
    return "";
}

export default function RegisterPage() {
    const [form, setForm] = useState(initial);
    const [touched, setTouched] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function change(event) {
        const { name, value } = event.target;
        const next = { ...form, [name]: value };
        setForm(next);
        setTouched(old => ({ ...old, [name]: true }));
        event.target.setCustomValidity(validateField(name, value, next));
        if (name === "password") {
            const confirmInput = event.currentTarget.form?.elements.namedItem("confirmPassword");
            if (confirmInput) confirmInput.setCustomValidity(next.confirmPassword ? validateField("confirmPassword", next.confirmPassword, next) : "");
        }
    }

    function hint(name) {
        if (!touched[name] && !form[name]) return null;
        const message = validateField(name, form[name], form);
        return <small className={message ? "rule-invalid" : "rule-valid"} role="status">{message || "✓ Έγκυρο"}</small>;
    }

    async function submit(event) {
        event.preventDefault();
        setError("");
        setTouched(Object.fromEntries(Object.keys(initial).map(key => [key, true])));
        for (const name of Object.keys(initial)) {
            const input = event.currentTarget.elements.namedItem(name);
            if (input) input.setCustomValidity(validateField(name, form[name], form));
        }
        if (!event.currentTarget.checkValidity()) {
            setError("Διόρθωσε τα πεδία που εμφανίζουν σφάλμα.");
            return;
        }
        setLoading(true);
        try {
            await authApi.register(form);
            navigate("/login", { state: { registered: true }, replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return <section className="auth-wrap"><div className="auth-card register-card">
        <span className="eyebrow">ΓΙΝΕ ΜΕΛΟΣ</span><h1>Εγγραφή χρήστη</h1>
        <p className="muted">Δημιούργησε λογαριασμό στο AUEB Official Store.</p>
        {error && <p className="alert error" role="alert">{error}</p>}
        <form className="form-fields" onSubmit={submit} noValidate>
            <div className="form-two-col">
                <label>Όνομα *<input name="firstname" required pattern="[Α-Ω]+([ -][Α-Ω]+)*" title="Κεφαλαία ελληνικά χωρίς τόνους" value={form.firstname} onChange={change} placeholder="πχ. ΓΙΩΡΓΟΣ"/>{hint("firstname")}</label>
                <label>Επώνυμο *<input name="lastname" required pattern="[Α-Ω]+([ -][Α-Ω]+)*" title="Κεφαλαία ελληνικά χωρίς τόνους" value={form.lastname} onChange={change} placeholder="πχ. ΠΑΠΑΔΟΠΟΥΛΟΣ"/>{hint("lastname")}</label>
            </div>
            <label>Κινητό *<input name="phone" type="tel" required pattern="69[0-9]{8}" value={form.phone} onChange={change} placeholder="6912345678" />{hint("phone")}</label>
            <label>Email *<input name="email" type="email" required maxLength="254" value={form.email} onChange={change} placeholder="example@aueb.gr" autoComplete="email" />{hint("email")}</label>
            <label>Κωδικός πρόσβασης *<input name="password" type="password" required minLength="8" maxLength="128" value={form.password} onChange={change} autoComplete="new-password" />{hint("password")}</label>
            <div className="password-rules" aria-label="Κανόνες κωδικού">
                {rules.map(rule => <span key={rule.label} className={rule.test(form.password) ? "rule-valid" : "rule-invalid"}>
                    {rule.test(form.password) ? "✓" : "✕"} {rule.label}
                </span>)}
            </div>
            <label>Επιβεβαίωση κωδικού *<input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={change} autoComplete="new-password" />{hint("confirmPassword")}</label>
            <button className="btn btn-full" type="submit" disabled={loading}>{loading ? "Εγγραφή..." : "Δημιουργία λογαριασμού"}</button>
        </form>
        <p className="auth-bottom">Έχεις ήδη λογαριασμό; <Link to="/login">Σύνδεση</Link></p>
    </div></section>;
}
