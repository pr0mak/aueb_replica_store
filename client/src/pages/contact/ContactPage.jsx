import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialForm = {
    fullname: "",
    email: "",
    phone: "",
    message: ""
};

function ContactPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState("");

    const validateField = (name, value) => {
        const trimmed = value.trim();

        switch (name) {
            case "fullname":
                if (!trimmed) {
                    return "Το ονοματεπώνυμο είναι υποχρεωτικό!";
                }
                if (!/^[Α-Ω]+([ -][Α-Ω]+)*$/.test(trimmed)) {
                    return "Μόνο κεφαλαία ελληνικά χωρίς τόνους!";
                }
                return "";

            case "email":
                if (!trimmed) {
                    return "Το email είναι υποχρεωτικό!";
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                    return "Μη έγκυρη μορφή email!";
                }
                return "";

            case "phone":
                if (!trimmed) {
                    return "Το τηλέφωνο είναι υποχρεωτικό!";
                }
                if (!/^69\d{8}$/.test(trimmed)) {
                    return "Το τηλέφωνο πρέπει να έχει 10 ψηφία και να ξεκινά από 69!";
                }
                return "";

            case "message":
                if (!trimmed) {
                    return "Παρακαλώ συμπλήρωσε το μήνυμά σου.";
                }
                return "";

            default:
                return "";
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        Object.keys(form).forEach((field) => {
            const error = validateField(field, form[field]);

            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setNotification("");

        try {
            const response = await fetch(
                "https://api.emailjs.com/api/v1.0/email/send",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        service_id: "service_rmcwjvk",
                        template_id: "template_9hc2kc2",
                        user_id: "HBwPc25IxtjnWDAMW",
                        template_params: {
                            fullname: form.fullname.trim(),
                            email: form.email.trim(),
                            phone: form.phone.trim(),
                            message: form.message.trim()
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Email sending failed");
            }

            setNotification(
                "Λάβαμε το μήνυμά σας! Θα επικοινωνήσουμε μαζί σας σύντομα."
            );

            setForm(initialForm);
            setErrors({});

        } catch (error) {
            console.error("EmailJS error:", error);

            setNotification(
                "Δεν ήταν δυνατή η αποστολή. Παρακαλώ δοκιμάστε ξανά."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialForm);
        setErrors({});
        setNotification("");
    };

    const handleBundleClick = () => {
        navigate("/store");
    };

    return (
        <main>
            <h1>Επικοινωνία με το AUEB Official Store</h1>

            <article>
                <h2>Στείλτε μας το μήνυμά σας</h2>

                <p>
                    Για οποιαδήποτε απορία σχετικά με τα προϊόντα
                    ή τις παραγγελίες σας, συμπληρώστε την
                    παρακάτω φόρμα επικοινωνίας.
                </p>

                <form
                    className="form contact"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <label htmlFor="txtName">
                        Ονοματεπώνυμο (*):
                    </label>

                    <input
                        type="text"
                        id="txtName"
                        name="fullname"
                        value={form.fullname}
                        onChange={handleChange}
                        placeholder="Πληκτρολόγησε το όνομά σου"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.fullname)}
                    />

                    {errors.fullname && (
                        <p className="error">{errors.fullname}</p>
                    )}

                    <label htmlFor="txtEmail">
                        Email (*):
                    </label>

                    <input
                        type="email"
                        id="txtEmail"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                    />

                    {errors.email && (
                        <p className="error">{errors.email}</p>
                    )}

                    <label htmlFor="txtTel">
                        Τηλέφωνο (*):
                    </label>

                    <input
                        type="tel"
                        id="txtTel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="π.χ. 6969696969"
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                    />

                    {errors.phone && (
                        <p className="error">{errors.phone}</p>
                    )}

                    <label htmlFor="txtMessage">
                        Μήνυμα / Ερώτηση (*):
                    </label>

                    <textarea
                        id="txtMessage"
                        name="message"
                        rows="6"
                        cols="40"
                        value={form.message}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.message)}
                    />

                    {errors.message && (
                        <p className="error">{errors.message}</p>
                    )}

                    <p>
                        (*) Τα πεδία με αστερίσκο είναι υποχρεωτικά.
                    </p>

                    <div className="buttons">
                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Αποστολή..."
                                : "Αποστολή μηνύματος"}
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Καθαρισμός
                        </button>
                    </div>

                    {notification && (
                        <p role="status">{notification}</p>
                    )}
                </form>
            </article>

            <aside>
                <div className="flipping-card">
                    <div className="offer">
                        <div className="image">
                            <img
                                src="/assets/CAMPUS_LOOK_BUNDLE.png"
                                alt="Πακέτο φοιτητικών προϊόντων CAMPUS LOOK"
                            />
                        </div>

                        <div className="price">
                            <span className="old_price">
                                15 €
                            </span>{" "}
                            10 €
                        </div>

                        <h3>CAMPUS LOOK BUNDLE</h3>

                        <p>
                            Μοναδική προσφορά για φοιτητές
                        </p>

                        <button
                            type="button"
                            onClick={handleBundleClick}
                        >
                            Δες τα προϊόντα
                        </button>
                    </div>

                    <div className="front">
                        <div className="item">
                            <span>Προσφορά ημέρας</span>
                        </div>
                    </div>
                </div>
            </aside>
        </main>
    );

}

export default ContactPage;