import { createContext, useContext, useEffect, useMemo, useState } from "react";
const CartContext = createContext(null);
const KEY = "aueb_cart";
function readCart() {
    try {
        const data = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(data) ? data.filter(i => typeof i.productId === "string" &&
            Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 10) : [];
    } catch { return []; }
}
export function CartProvider({ children }) {
    const [items, setItems] = useState(readCart);
    useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
    function addItem(productId, quantity = 1) {
        setItems(old => {
            const current = old.find(i => i.productId === productId);
            return current
                ? old.map(i => i.productId === productId ? { ...i, quantity: Math.min(10, i.quantity + quantity) } : i)
                : [...old, { productId, quantity: Math.min(10, quantity) }];
        });
    }
    function changeQuantity(productId, quantity) {
        if (!Number.isInteger(quantity)) return;
        setItems(old => quantity <= 0 ? old.filter(i => i.productId !== productId) :
            old.map(i => i.productId === productId ? { ...i, quantity: Math.min(10, quantity) } : i));
    }
    function removeItem(productId) {
        setItems(old => old.filter(i => i.productId !== productId));
    }

    function clearCart() {
        setItems([]);
    }
    
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const value = useMemo(() => ({ items, count, addItem, changeQuantity, removeItem, clearCart }), [items]);
    
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const value = useContext(CartContext);
    if (!value) throw new Error("CartProvider is missing");
    return value;
}
