import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

import { ordersApi } from "../../api";
import { money } from "../../constants";
import { useAuth } from "../../context/AuthContext";

import "./order.css";

export default function OrdersPage() {

    const { token } = useAuth();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        ordersApi.all(token).then(data => { if (active) setOrders(data); })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [token]);

    return <section className="section-block">
        <span className="eyebrow">ΠΡΟΦΙΛ ΧΡΗΣΤΗ</span><h1>Οι παραγγελίες μου</h1>
        
        {location.state?.message && <p className="alert success" role="status">{location.state.message}</p>}
        
        {error && <p role="alert" className="alert error">{error}</p>}
        
        {loading ? <p>Φόρτωση παραγγελιών...</p> : !error && (!orders.length ? <div className="empty-state"><h2>Δεν έχεις ακόμη παραγγελίες.</h2><Link className="btn" to="/store">Αγόρασε τώρα</Link></div> :
        
        <div className="orders-list">{orders.map(order => <article className="panel order-card" key={order._id}>
        
                <div className="order-top"><div><span className="eyebrow">ΠΑΡΑΓΓΕΛΙΑ</span>
        
                    <h2>#{String(order._id).slice(-8).toUpperCase()}</h2></div>
        
                    <div><span>{new Date(order.createdAt).toLocaleDateString("el-GR")}</span>
                        <span className="order-status">{order.status}</span></div></div>
        
                {order.products.map((p, i) => <div className="order-product" key={i}>
                    <span>{p.name} <span className="muted">× {p.quantity}</span></span><strong>{money(p.price*p.quantity)}</strong>
        
                </div>)}
        
                <div className="order-total"><strong>Σύνολο</strong><strong>{money(order.totalAmount)}</strong></div>
            </article>)}</div>)}
    </section>;
}
