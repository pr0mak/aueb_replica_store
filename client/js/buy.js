const buyForm = document.getElementById("buyForm");

const nameInput = document.getElementById("txtName");
const addressInput = document.getElementById("txtAddress");
const regionInput = document.getElementById("slRegion");
const emailInput = document.getElementById("txtEmail");
const phoneInput = document.getElementById("txtTel");
const offerCheckbox = document.getElementById("chkOffer1");
const bundleBtn = document.getElementById("bundleBtn");
const subtotalEl = document.getElementById("subtotalPrice");
const bundleRow = document.getElementById("bundleRow");
const bundleAmountEl = document.getElementById("bundleAmount");
const totalEl = document.getElementById("totalPrice");
emailjs.init({
    publicKey: "HBwPc25IxtjnWDAMW"
});

const ORDER_KEY = "aueb_order";
const OFFER_KEY = "aueb_offer";
const itemIds = ["item1", "item2", "item3", "item4", "item5", "item6"];
const BUNDLE_PRICE = 10;

const itemInputs = itemIds
    .map(id => document.getElementById(id))
    .filter(input => input !== null);

function formatPrice(value) {
    return value.toFixed(2).replace(".", ",");
}

function getQuantity(input) {
    const qty = Number(input.value);
    if (!Number.isInteger(qty) || qty < 0) return 0;
    return qty;
}

function updateTotal() {
    let total = 0;

    itemInputs.forEach(input => {
        const price = Number(input.dataset.price) || 0;
        total += getQuantity(input) * price;
    });

    const subtotal = total;

    const bundleSelected = offerCheckbox && offerCheckbox.checked;
    if (bundleSelected) {
        total += BUNDLE_PRICE;
    }

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (bundleAmountEl) bundleAmountEl.textContent = formatPrice(BUNDLE_PRICE);
    if (bundleRow) bundleRow.hidden = !bundleSelected;
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function setOffer(selected) {
    if (offerCheckbox) offerCheckbox.checked = selected;

    if (selected) {
        localStorage.setItem(OFFER_KEY, "1");
    } else {
        localStorage.removeItem(OFFER_KEY);
    }
    updateTotal();
}

function getProductById(id) {
    return productStore.getAll().find(
        product => Number(product.id) === Number(id)
    );
}

function validateAvailability() {
    for (const input of itemInputs) {
        const quantity = getQuantity(input);

        // Το item1 αντιστοιχεί στο product id 1 κ.ο.κ.
        const productId = Number(input.id.replace("item", ""));
        const product = getProductById(productId);

        if (!product) {
            showAlert(
                `Δεν βρέθηκε το προϊόν με κωδικό ${productId}.`
            );
            input.focus();
            return false;
        }

        const available = Number(product.availability ?? 10);

        if (quantity > available) {
            showAlert(
                `Για το "${product.name}" υπάρχουν διαθέσιμα ` +
                `μόνο ${available} τεμάχια.`
            );

            input.value = available;
            input.focus();
            updateTotal();
            return false;
        }
    }

    return true;
}

function reduceAvailability() {
    for (const input of itemInputs) {
        const quantity = getQuantity(input);

        if (quantity === 0) continue;

        const productId = Number(input.id.replace("item", ""));
        const product = getProductById(productId);

        if (!product) {
            throw new Error(`Δεν βρέθηκε το προϊόν ${productId}.`);
        }

        const available = Number(product.availability ?? 10);

        if (quantity > available) {
            throw new Error(
                `Δεν υπάρχει επαρκές απόθεμα για το ${product.name}.`
            );
        }
    }

    //πρώτα ελέγχονται όλα τα προϊόντα και μετά μειώνεται το απόθεμα.
    for (const input of itemInputs) {
        const quantity = getQuantity(input);

        if (quantity === 0) continue;

        const productId = Number(input.id.replace("item", ""));
        const product = getProductById(productId);

        productStore.update(productId, {
            availability: Number(product.availability ?? 10) - quantity
        });
    }
}

nameInput.addEventListener("input", () => {
    if (nameInput.validity.valueMissing) {
        nameInput.setCustomValidity("Το όνομα είναι υποχρεωτικό!");
    } else if (nameInput.validity.patternMismatch) {
        nameInput.setCustomValidity("Μόνο κεφαλαία ελληνικά χωρίς τόνους (π.χ. ΓΕΩΡΓΙΟΣ ΠΑΠΑΔΟΠΟΥΛΟΣ)!");
    } else {
        nameInput.setCustomValidity("");
    }
    nameInput.reportValidity();
});

addressInput.addEventListener("input", () => {
    if (addressInput.validity.valueMissing) {
        addressInput.setCustomValidity("Η διεύθυνση είναι υποχρεωτική!");
    } else {
        addressInput.setCustomValidity("");
    }
    addressInput.reportValidity();
});

regionInput.addEventListener("change", () => {
    if (regionInput.validity.valueMissing) {
        regionInput.setCustomValidity("Επίλεξε περιοχή!");
    } else {
        regionInput.setCustomValidity("");
    }
    regionInput.reportValidity();
});

emailInput.addEventListener("input", () => {
    if (emailInput.validity.valueMissing) {
        emailInput.setCustomValidity("Το email είναι υποχρεωτικό!");
    } else if (emailInput.validity.typeMismatch || emailInput.validity.patternMismatch) {
        emailInput.setCustomValidity("Το email πρέπει να έχει σωστή μορφή (π.χ. user@aueb.gr)!");
    } else {
        emailInput.setCustomValidity("");
    }
    emailInput.reportValidity();
});

phoneInput.addEventListener("input", () => {
    if (phoneInput.validity.valueMissing) {
        phoneInput.setCustomValidity("Το τηλέφωνο είναι υποχρεωτικό!");
    } else if (phoneInput.validity.patternMismatch) {
        phoneInput.setCustomValidity("Το τηλέφωνο πρέπει να έχει 10 ψηφία και να ξεκινάει από 69!");
    } else {
        phoneInput.setCustomValidity("");
    }
    phoneInput.reportValidity();
});

const savedOrder = JSON.parse(localStorage.getItem(ORDER_KEY)) || {};

const params = new URLSearchParams(window.location.search);
const urlProduct = params.get("productId");
const urlQuantity = Number(params.get("quantity"));

if (urlProduct && Number.isInteger(urlQuantity) && urlQuantity >= 1 && urlQuantity <= 10) {
    savedOrder["item" + urlProduct] = urlQuantity;
    localStorage.setItem(ORDER_KEY, JSON.stringify(savedOrder));
}

if (params.get("offer") === "1") {
    localStorage.setItem(OFFER_KEY, "1");
}

if (params.toString() !== "") {
    history.replaceState(null, "", "buy.html");
}

itemInputs.forEach(input => {
    input.value = savedOrder[input.id] || 0;

    input.addEventListener("input", () => {
        const current = JSON.parse(localStorage.getItem(ORDER_KEY)) || {};
        current[input.id] = getQuantity(input);
        localStorage.setItem(ORDER_KEY, JSON.stringify(current));
        updateTotal();
    });
});

if (offerCheckbox) {
    offerCheckbox.checked = localStorage.getItem(OFFER_KEY) === "1";

    offerCheckbox.addEventListener("change", function() {
        setOffer(offerCheckbox.checked);
    });
}

if (bundleBtn) {
    bundleBtn.addEventListener("click", function () {
        //localStorage.setItem(OFFER_KEY, "1");
        //window.location.href = "buy.html";
        setOffer(true);
    });
}

updateTotal();

buyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const fullname = nameInput.value.trim();
    const address = addressInput.value.trim();
    const region = regionInput.value;
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();


    if (region === "") {
        showAlert("Παρακαλώ επίλεξε περιοχή.");
        regionInput.focus();
        return;
    }


    if (!buyForm.checkValidity()) {
        buyForm.reportValidity();
        return;
    }

    
    const products = [
        document.getElementById("item1"),
        document.getElementById("item2"),
        document.getElementById("item3"),
        document.getElementById("item4"),
        document.getElementById("item5"),
        document.getElementById("item6")
    ];

    let totalItems = 0;

    for (let i = 0; i < products.length; i++) {
        const quantity = products[i].value;

        if (quantity === "" || !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0 || Number(quantity) > 10) {
            showAlert("Η ποσότητα κάθε προϊόντος πρέπει να είναι ακέραιος αριθμός από 0 έως 10.");
            products[i].focus();
            return;
        }

        totalItems += Number(quantity);
    }

    //elegxos diathesimou apothematos
    if (!validateAvailability()) {
        return;
    }

    const bundleSelected = offerCheckbox && offerCheckbox.checked;

    if (totalItems === 0 && !bundleSelected) {
        showAlert("Παρακαλώ επίλεξε τουλάχιστον ένα προϊόν.");
        products[0].focus();
        return;
    }

    const paymentInputs = document.querySelectorAll(
        'input[name="payment"]'
    );

    let paymentSelected = false;

    for (let i = 0; i < paymentInputs.length; i++) {
        if (paymentInputs[i].checked) {
            paymentSelected = true;
            break;
        }
    }

    if (!paymentSelected) {
        showAlert("Παρακαλώ επίλεξε τρόπο πληρωμής.");
        paymentInputs[0].focus();
        return;
    }


    const finalTotal = totalEl ? totalEl.textContent : "";

    const productNames = [
        "Μπλουζάκι A.S.O.E.E. 1920",
        "Σακίδιο πλάτης για φορητό υπολογιστή 20L",
        "Powerbank από μπαμπού 4000 mAh",
        "Μπορντό γραβάτα AUEB",
        "Κορνίζα τοίχου για πτυχίο",
        "Pop-art κάλτσες AUEB"
    ];

    const orderedProducts = products
        .map((input, index) => {
            const quantity = Number(input.value);

            if (quantity === 0) return null;

            return `${productNames[index]} x ${quantity}`;
        })
        .filter(Boolean);

    if (bundleSelected) {
        orderedProducts.push("CAMPUS LOOK BUNDLE x 1");
    }

    const paymentInput = document.querySelector(
        'input[name="payment"]:checked'
    );

    const paymentNames = {
        visa: "Κάρτα (VISA / Mastercard)",
        cash: "Αντικαταβολή",
        bank: "Τραπεζική κατάθεση"
    };

    const templateParams = {
        fullname: fullname,
        email: email,
        address: address,
        area: regionInput.options[regionInput.selectedIndex].text,
        phone: phone,
        products: orderedProducts.join(", "),
        total: finalTotal,
        payment: paymentNames[paymentInput.value],
        comments: document.getElementById("txtMessage").value.trim() ||
            "Δεν υπάρχουν σχόλια"
    };

    if (email !== "") {
        const submitButton = buyForm.querySelector(
            'input[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.value = "Αποστολή...";

        try {
            await emailjs.send(
                "service_rmcwjvk",
                "template_u56zjbx",
                templateParams
            );

            reduceAvailability();

            showAlert(
                "Παραλάβαμε την παραγγελία σου! " +
                "Θα λάβεις email επιβεβαίωσης σύντομα."
            );

            localStorage.removeItem(ORDER_KEY);
            localStorage.removeItem(OFFER_KEY);
            buyForm.reset();
            
            
        } catch (error) {
            console.error("EmailJS error:", error);

            showAlert(
                "Δεν ήταν δυνατή η αποστολή του email επιβεβαίωσης. " +
                "Η παραγγελία δεν επιβεβαιώθηκε. Παρακαλώ δοκίμασε ξανά."
            );

        } finally {
            submitButton.disabled = false;
            submitButton.value = "Αποστολή παραγγελίας";
        }

    } else {
        showAlert(
            "Παρακαλώ συμπλήρωσε το email σου για να λάβεις " +
            "την επιβεβαίωση της παραγγελίας."
        );

        emailInput.focus();
    }

});

buyForm.addEventListener("reset", function() {
    localStorage.removeItem(ORDER_KEY);
    localStorage.removeItem(OFFER_KEY);

    setTimeout(() => {
        [nameInput, addressInput, regionInput, emailInput, phoneInput, ...itemInputs]
            .forEach(inp => inp && inp.setCustomValidity(""));
        updateTotal();
    }, 0);
});