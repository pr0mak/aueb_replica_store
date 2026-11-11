import { useEffect } from "react";
import "./CustomConfirm.css";

export default function CustomConfirm({
    open,
    message,
    onConfirm,
    onCancel,
    loading = false
}) {
    useEffect(() => {
        if (!open || loading) return;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onCancel();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div
            className="confirm-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onCancel();
                }
            }}
        >
            <div
                className="confirm-box"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirmTitle"
                aria-describedby="confirmMessage"
            >
                <h2 id="confirmTitle">
                    Επιβεβαίωση διαγραφής
                </h2>

                <p id="confirmMessage">
                    {message}
                </p>

                <p className="confirm-warning">
                    Η ενέργεια δεν μπορεί να αναιρεθεί.
                </p>

                <div className="confirm-buttons">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Ακύρωση
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Διαγραφή..." : "Διαγραφή"}
                    </button>
                </div>
            </div>
        </div>
    );
}
