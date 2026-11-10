import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//elegxos prosvashs kai sto frontend  alla ta pragmatika dikaiomata elegxondai ston server
export default function ProtectedRoute({ children, role }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    if (role && user.role !== role) {
        return <section className="empty-state" role="alert">
            <h1>Δεν έχεις πρόσβαση</h1>
            <p>Ο λογαριασμός σου δεν διαθέτει τα απαραίτητα δικαιώματα.</p>
        </section>;
    }

    return children;
}
