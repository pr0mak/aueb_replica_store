const ORDER_KEY = "aueb_order";


document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    let products = [];

    try {
        products = JSON.parse(localStorage.getItem("products")) || [];
    } catch (error) {
        console.error("Σφάλμα ανάγνωσης προϊόντων:", error);
    }

const product = products.find(p => String(p.id) === String(id));

    const article = document.querySelector(".product-details");
    const titleEl = document.getElementById("productTitle");

    if (!product) {
        titleEl.textContent = "Το προϊόν δεν βρέθηκε";
        article.innerHTML = "";

        const msg = document.createElement("p");
        msg.textContent = "Δεν υπάρχει προϊόν με αυτόν τον κωδικό.";

        const back = document.createElement("a");
        back.href = "store.html";
        back.textContent = "Επιστροφή στον κατάλογο προϊόντων";

        article.appendChild(msg);
        article.appendChild(back);
        return;
    }

    document.title = "AUEB Official Store - " + product.name;
    titleEl.textContent = product.name;

    const img = document.getElementById("productImage");
    img.src = product.image;
    img.alt = product.name;

    document.getElementById("productDescription").textContent = product.description;

    const notesList = document.getElementById("productNotes");
    notesList.innerHTML = "";
    notesList.replaceChildren();

    const notes = Array.isArray(product.notes)
        ? product.notes
        : (product.notes ? [product.notes] : []);

    notes.forEach(note => {
        const li = document.createElement("li");
        li.textContent = note;
        notesList.appendChild(li);
    });

    document.getElementById("productPrice").textContent =
        product.price.toFixed(2).replace(".", ",");

    document.getElementById("productId").value = id;

    const buyForm = document.querySelector("form.buy");
    const qtyInput = document.getElementById("num");
    const itemId = "item" + id;


    const saved = JSON.parse(localStorage.getItem(ORDER_KEY)) || {};
    if (saved[itemId] > 0) {
        qtyInput.value = saved[itemId];
    }

    buyForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const quantity = Number(qtyInput.value);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
            showAlert("Παρακαλώ επίλεξε ποσότητα από 1 έως 10.");
            return;
        }

        let order = {};

        try {
            order = JSON.parse(localStorage.getItem(ORDER_KEY)) || {};
        } catch {
            order = {};
        }

        order[itemId] = quantity;
        localStorage.setItem(ORDER_KEY, JSON.stringify(order));

        showAlert("Το προϊόν προστέθηκε στην παραγγελία σου!");
    });

    buyForm.addEventListener("reset", function() {
        const order = JSON.parse(localStorage.getItem(ORDER_KEY)) || {};
        delete order[itemId];
        localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    });
});