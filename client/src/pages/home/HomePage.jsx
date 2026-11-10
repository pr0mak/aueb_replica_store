import { Link } from "react-router-dom";
import "./home.css";

export default function HomePage() {

    return (
        <section className="welcome">

            <div className="welcome-content">

                <h1>
                    Καλησπέρα και καλώς ήρθατε!
                </h1>

                <Link
                    className="logo2"
                    to="/"
                    aria-label="Αρχική σελίδα"
                >
                    <img
                        src="/assets/aueb_logo_2.jpg"
                        alt="Λογότυπο Οικονομικού Πανεπιστημίου Αθηνών"
                    />
                </Link>

                <p>
                    Ανακαλύψτε τα επίσημα προϊόντα του
                    Οικονομικού Πανεπιστημίου Αθηνών και
                    βρείτε τα αγαπημένα σας αξεσουάρ
                    και ρούχα AUEB.
                </p>

                <Link
                    to="/store"
                    className="btn welcome-button"
                >
                    Αγόρασε τώρα!
                </Link>

            </div>

        </section>
    );
}