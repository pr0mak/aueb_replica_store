const contactForm = document.getElementById("contactForm");

const nameInput = document.getElementById("txtName");
const emailInput = document.getElementById("txtEmail");
const phoneInput = document.getElementById("txtTel");
const messageInput = document.getElementById("txtMessage");

emailjs.init({
    publicKey: "HBwPc25IxtjnWDAMW"
});

nameInput.addEventListener("input", () => {
    if (nameInput.validity.valueMissing) {
        nameInput.setCustomValidity("Το όνομα είναι υποχρεωτικό!");
    } else if (nameInput.validity.patternMismatch) {
        nameInput.setCustomValidity("Μόνο κεφαλαία ελληνικά χωρίς τόνους (π.χ. ΓΕΩΡΓΙΟΣ)!");
    } else {
        nameInput.setCustomValidity("");
    }
    nameInput.reportValidity();
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


contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const fullname = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    if (message === "") {
        showAlert("Παρακαλώ συμπλήρωσε το μήνυμά σου.");
        messageInput.focus();
        return;
    }

    try {
        await emailjs.send("service_rmcwjvk", "template_9hc2kc2", {
            fullname, email, phone, message
        });

        showAlert("Λάβαμε το μήνυμά σας! Θα επικοινωνήσουμε μαζί σας σύντομα.");
        contactForm.reset();

    } catch (error) {
        console.error("EmailJS error:", error);
        showAlert("Δεν ήταν δυνατή η αποστολή. Παρακαλώ δοκιμάστε ξανά.");
    }
});

contactForm.addEventListener("reset", function () {
    setTimeout(() => {
        [nameInput, emailInput, phoneInput].forEach(inp => inp.setCustomValidity(""));
    }, 0);
});