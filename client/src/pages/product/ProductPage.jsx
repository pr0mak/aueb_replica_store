// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { productsApi } from "../../api";

// const ORDER_KEY = "aueb_order";

// function ProductPage() {
//     const { id } = useParams();

//     const [product, setProduct] = useState(null);
//     const [quantity, setQuantity] = useState(1);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [notification, setNotification] = useState("");

//     // load from MongoDB
//     useEffect(() => {
//         let cancelled = false;

//         async function loadProduct() {
//             setLoading(true);
//             setError("");
//             setProduct(null);
//             setNotification("");
//             setQuantity(1);

//             try {
//                 const data = await productsApi.one(id);

//                 if (!cancelled) {
//                     setProduct(data);
//                 }
//             } catch (err) {
//                 if (!cancelled) {
//                     setError(err.message);
//                 }
//             } finally {
//                 if (!cancelled) {
//                     setLoading(false);
//                 }
//             }
//         }

//         loadProduct();

//         return () => {
//             cancelled = true;
//         };
//     }, [id]);

//     useEffect(() => {
//         if (!product) return;

//         try {
//             const order = JSON.parse(
//                 localStorage.getItem(ORDER_KEY)
//             ) || {};

//             const itemId = "item" + product._id;

//             if (Number(order[itemId]) > 0) {
//                 setQuantity(order[itemId]);
//             }
//         } catch (err) {
//             console.error("Σφάλμα ανάγνωσης παραγγελίας:", err);
//         }
//     }, [product]);

//     useEffect(() => {
//         document.title = product
//             ? `AUEB Official Store - ${product.name}`
//             : "AUEB Official Store - Λεπτομέρειες προϊόντος";
//     }, [product]);

//     // add product
//     const handleSubmit = (event) => {
//         event.preventDefault();
//         setNotification("");

//         const qty = Number(quantity);

//         if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
//             setNotification(
//                 "Παρακαλώ επίλεξε ποσότητα από 1 έως 10."
//             );
//             return;
//         }

//         if (qty > product.availability) {
//             setNotification(
//                 "Η ζητούμενη ποσότητα δεν είναι διαθέσιμη."
//             );
//             return;
//         }

//         let order = {};

//         try {
//             order = JSON.parse(
//                 localStorage.getItem(ORDER_KEY)
//             ) || {};
//         } catch (err) {
//             console.error("Σφάλμα ανάγνωσης παραγγελίας:", err);
//         }

//         const itemId = "item" + product._id;

//         order[itemId] = qty;

//         localStorage.setItem(
//             ORDER_KEY,
//             JSON.stringify(order)
//         );

//         setNotification(
//             "Το προϊόν προστέθηκε στην παραγγελία σου!"
//         );
//     };

//     const handleReset = () => {
//         setQuantity(1);
//         setNotification("");

//         try {
//             const order = JSON.parse(
//                 localStorage.getItem(ORDER_KEY)
//             ) || {};

//             const itemId = "item" + product._id;

//             delete order[itemId];

//             localStorage.setItem(
//                 ORDER_KEY,
//                 JSON.stringify(order)
//             );
//         } catch (err) {
//             console.error("Σφάλμα επαναφοράς:", err);
//         }
//     };

//     if (loading) {
//         return (
//             <main>
//                 <h1>Φόρτωση προϊόντος...</h1>
//             </main>
//         );
//     }

//     if (error || !product) {
//         return (
//             <main>
//                 <h1>Το προϊόν δεν βρέθηκε</h1>

//                 <article className="product-details">
//                     <p>
//                         {error || "Δεν υπάρχει προϊόν με αυτόν τον κωδικό."}
//                     </p>

//                     <Link to="/store">
//                         Επιστροφή στον κατάλογο προϊόντων
//                     </Link>
//                 </article>
//             </main>
//         );
//     }

//     const notes = Array.isArray(product.notes)
//         ? product.notes
//         : product.notes
//             ? [product.notes]
//             : [];

//     const formattedPrice = Number(product.price)
//         .toLocaleString("el-GR", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });

//     return (
//         <main>
//             <h1>{product.name}</h1>

//             <article className="product-details">
//                 <img
//                     id="productImage"
//                     src={product.image}
//                     alt={product.name}
//                 />

//                 <h2>Χαρακτηριστικά προϊόντος</h2>

//                 <p id="productDescription">
//                     {product.description}
//                 </p>

//                 <h3>Σημειώσεις</h3>

//                 <ul id="productNotes">
//                     {notes.map((note, index) => (
//                         <li key={index}>{note}</li>
//                     ))}
//                 </ul>

//                 <p>
//                     Τιμή:{" "}
//                     <strong>
//                         <span id="productPrice">
//                             {formattedPrice}
//                         </span>{" "}
//                         €
//                     </strong>
//                 </p>

//                 <p>
//                     Διαθεσιμότητα:{" "}
//                     <strong>
//                         {product.availability > 0
//                             ? `${product.availability} τεμάχια`
//                             : "Εξαντλήθηκε"}
//                     </strong>
//                 </p>

//                 <form
//                     className="form buy"
//                     onSubmit={handleSubmit}
//                 >
//                     <label htmlFor="num">
//                         Ποσότητα:
//                     </label>

//                     <input
//                         type="number"
//                         id="num"
//                         name="quantity"
//                         min="1"
//                         max={Math.min(10, product.availability)}
//                         step="1"
//                         value={quantity}
//                         onChange={(event) =>
//                             setQuantity(event.target.value)
//                         }
//                         required
//                         disabled={product.availability === 0}
//                     />

//                     <div className="buttons">
//                         <button
//                             type="submit"
//                             disabled={product.availability === 0}
//                         >
//                             Προσθήκη στην παραγγελία
//                         </button>

//                         <button
//                             type="button"
//                             onClick={handleReset}
//                         >
//                             Επαναφορά
//                         </button>
//                     </div>
//                 </form>

//                 {notification && (
//                     <p role="status">
//                         {notification}
//                     </p>
//                 )}

//                 <p>
//                     <Link to="/store">
//                         Επιστροφή στον κατάλογο προϊόντων
//                     </Link>
//                 </p>
//             </article>

//             <aside>
//                 <div className="flipping-card">
//                     <div className="offer">
//                         <div className="image">
//                             <img
//                                 src="/assets/CAMPUS_LOOK_BUNDLE.png"
//                                 alt="Πακέτο φοιτητικών προϊόντων CAMPUS LOOK"
//                             />
//                         </div>

//                         <div className="price">
//                             <span className="old_price">
//                                 15 €
//                             </span>{" "}
//                             10 €
//                         </div>

//                         <h3>CAMPUS LOOK BUNDLE</h3>

//                         <p>
//                             Μοναδική προσφορά για φοιτητές
//                         </p>

//                         <Link to="/store">
//                             Δείτε τα προϊόντα
//                         </Link>
//                     </div>

//                     <div className="front">
//                         <div className="item">
//                             <span>Προσφορά ημέρας</span>
//                         </div>
//                     </div>
//                 </div>
//             </aside>
//         </main>
//     );
// }

// export default ProductPage;