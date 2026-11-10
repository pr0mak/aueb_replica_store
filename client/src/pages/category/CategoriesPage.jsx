import { Link } from "react-router-dom";
import "./category.css";

const categories = [
    {
        id: "clothes",
        title: "Ένδυση",
        image: "/assets/endisi.png",
        description: "Μπλουζάκια και είδη ένδυσης"
    },
    {
        id: "accessories",
        title: "Αξεσουάρ",
        image: "/assets/general_acc.png",
        description: "Αξεσουάρ για κάθε ημέρα"
    },
    {
        id: "office_supplies",
        title: "Είδη γραφείου",
        image: "/assets/general_supplies.png",
        description: "Χρήσιμα είδη για το γραφείο και τις σπουδές"
    }
];

export default function CategoriesPage() {
    return (
        <section className="section-block categories-article">

            <span className="eyebrow">ΕΞΕΡΕΥΝΗΣΕ</span>

            <h1>Κατηγορίες προϊόντων</h1>

            <p className="muted">
                Επίλεξε κατηγορία για να δεις τα διαθέσιμα προϊόντα.
            </p>

            <div className="categories-grid">
                {categories.map((c) => (
                    <Link
                        to={`/store/${c.id}`}
                        className="category-card"
                        key={c.id}
                    >
                        <img
                            src={c.image}
                            alt={c.title}
                            loading="lazy"
                        />

                        <div className="category-card-body">
                            <h2>{c.title}</h2>

                            <p>{c.description}</p>

                            <span className="category-card-cta">
                                Προβολή προϊόντων
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

        </section>
    );
}