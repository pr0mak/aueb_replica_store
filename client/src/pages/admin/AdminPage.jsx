import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi, productsApi } from "../../api";
import { CATEGORIES, money } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import "./admin.css";

const emptyForm = { name: "", category: "clothes", price: "", availability: "", image: "", description: "", notes: "" };
const statuses = ["Σε επεξεργασία", "Απεστάλη", "Ολοκληρώθηκε", "Ακυρώθηκε"];

export default function AdminPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([productsApi.all(), ordersApi.adminAll(token)])
            .then(([productData, orderData]) => { if (active) { setProducts(productData); setOrders(orderData); } })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [token]);

    function change(event) {
        const { name, value } = event.target;
        setForm(old => ({ ...old, [name]: value }));
    }

    function reset() {
        setForm(emptyForm);
        setEditingId(null);
    }

    function edit(product) {
        setEditingId(String(product._id));
        setForm({
            name: product.name, category: product.category, price: String(product.price),
            availability: String(product.availability), image: product.image || "",
            description: product.description || "", notes: product.notes || ""
        });
        setMessage("");
        document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function save(event) {
        event.preventDefault();
        setError(""); setMessage("");
        const price = Number(form.price);
        const availability = Number(form.availability);
        if (!form.name.trim() || form.price === "" || !Number.isFinite(price) || price < 0 ||
            form.availability === "" || !Number.isSafeInteger(availability) || availability < 0) {
            setError("Συμπλήρωσε σωστά όνομα, τιμή και διαθεσιμότητα.");
            return;
        }
        const payload = { ...form, name: form.name.trim(), price, availability };
        setSaving(true);
        try {
            const product = editingId ? await productsApi.update(editingId, payload, token) :
                await productsApi.create(payload, token);
            setProducts(old => editingId ? old.map(p => String(p._id) === editingId ? product : p) : [...old, product]);
            setMessage(editingId ? "Το προϊόν ενημερώθηκε." : "Το προϊόν δημιουργήθηκε.");
            reset();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function remove(product) {
        if (!window.confirm(`Θέλεις να διαγράψεις το προϊόν «${product.name}»;`)) return;
        setError(""); setMessage("");
        try {
            await productsApi.remove(product._id, token);
            setProducts(old => old.filter(p => p._id !== product._id));
            if (editingId === product._id) reset();
            setMessage("Το προϊόν διαγράφηκε.");
        } catch (err) {
            setError(err.message);
        }
    }

    async function changeStatus(orderId, status) {
        setError(""); setMessage("");
        try {
            const updated = await ordersApi.setStatus(orderId, status, token);
            setOrders(old => old.map(order => order._id === orderId ? updated : order));
            setMessage("Η κατάσταση παραγγελίας ενημερώθηκε.");
        } catch (err) {
            setError(err.message);
        }
    }

    return <section className="section-block admin-page">
        <span className="eyebrow">ΔΙΑΧΕΙΡΙΣΗ</span><h1>Admin Panel</h1>
        <p className="muted">Προσθήκη, επεξεργασία και διαγραφή προϊόντων, διαχείριση παραγγελιών.</p>
        {error && <p className="alert error" role="alert">{error}</p>}
        {message && <p className="alert success" role="status">{message}</p>}
        {loading ? <p role="status">Φόρτωση δεδομένων...</p> : <>
            <div className="panel" id="product-editor">
                <h2>{editingId ? "Επεξεργασία προϊόντος" : "Προσθήκη προϊόντος"}</h2>
                <form className="form-fields" onSubmit={save}>
                    <div className="form-two-col">
                        <label>Όνομα προϊόντος *<input name="name" required maxLength="160" value={form.name} onChange={change} /></label>
                        <label>Κατηγορία *<select name="category" value={form.category} onChange={change}>
                            {Object.entries(CATEGORIES).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
                        </select></label>
                        <label>Τιμή (€) *<input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={change} /></label>
                        <label>Διαθεσιμότητα *<input name="availability" type="number" min="0" step="1" required value={form.availability} onChange={change} /></label>
                    </div>
                    <label>Διαδρομή εικόνας (π.χ. /assets/clothing/t-shirt.jpg)
                        <input name="image" value={form.image} onChange={change} placeholder="/assets/..." />
                    </label>
                    {form.image && <img className="image-preview" src={form.image} alt="Προεπισκόπηση προϊόντος" />}
                    <label>Περιγραφή<textarea name="description" rows="3" maxLength="3000" value={form.description} onChange={change} /></label>
                    <label>Σημειώσεις<textarea name="notes" rows="2" maxLength="3000" value={form.notes} onChange={change} /></label>
                    <div className="form-actions">
                        <button className="btn" type="submit" disabled={saving}>{saving ? "Αποθήκευση..." : editingId ? "Αποθήκευση αλλαγών" : "Προσθήκη προϊόντος"}</button>
                        {editingId && <button className="btn btn-outline" type="button" onClick={reset}>Ακύρωση επεξεργασίας</button>}
                    </div>
                </form>
            </div>
            <div className="panel">
                <h2>Προϊόντα ({products.length})</h2>
                <div className="table-scroll"><table className="admin-table">
                    <thead><tr><th>Προϊόν</th><th>Κατηγορία</th><th>Τιμή</th><th>Απόθεμα</th><th>Ενέργειες</th></tr></thead>
                    <tbody>{products.map(product => <tr key={product._id}>
                        <td><Link to={`/product/${product._id}`}>{product.name}</Link></td>
                        <td>{CATEGORIES[product.category]}</td><td>{money(product.price)}</td><td>{product.availability}</td>
                        <td><div className="admin-actions">
                            <button type="button" className="btn btn-outline" onClick={() => edit(product)}>Επεξεργασία</button>
                            <button type="button" className="btn btn-danger" onClick={() => remove(product)}>Διαγραφή</button>
                        </div></td>
                    </tr>)}</tbody>
                </table></div>
            </div>
            <div className="panel">
                <h2>Παραγγελίες ({orders.length})</h2>
                {orders.length === 0 ? <p className="muted">Δεν υπάρχουν παραγγελίες.</p> :
                    <div className="table-scroll"><table className="admin-table">
                        <thead><tr><th>Αριθμός</th><th>Χρήστης</th><th>Ημερομηνία</th><th>Σύνολο</th><th>Κατάσταση</th></tr></thead>
                        <tbody>{orders.map(order => <tr key={order._id}>
                            <td>#{String(order._id).slice(-8).toUpperCase()}</td>
                            <td>{order.user?.email || "—"}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString("el-GR")}</td>
                            <td>{money(order.totalAmount)}</td>
                            <td><label className="sr-only" htmlFor={`status-${order._id}`}>Κατάσταση παραγγελίας</label>
                                <select id={`status-${order._id}`} value={order.status} onChange={e => changeStatus(order._id, e.target.value)}>
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select></td>
                        </tr>)}</tbody>
                    </table></div>}
            </div>
        </>}
    </section>;
}
