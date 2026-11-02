const USERS_KEY = "aueb_users";

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

// Hashing password for security
async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    // Elements
    const firstnameInput = document.getElementById("firstname");
    const lastnameInput = document.getElementById("lastname");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const epalpasswordInput = document.getElementById("epalpassword");

    // Password indicators
    const ruleLength = document.getElementById("ruleLength");
    const ruleLetter = document.getElementById("ruleLetter");
    const ruleNumber = document.getElementById("ruleNumber");
    const ruleSymbol = document.getElementById("ruleSymbol");

    function updateRule(element, isValid) {
        if (!element) return;
        const icon = element.querySelector(".rule-icon") || element;
        if (isValid) {
            element.classList.remove("invalid");
            element.classList.add("valid");
            icon.textContent = "✔";
            icon.style.color = "green";
            icon.style.fontWeight = "bold";
            icon.style.fontSize = "20px";

        } else {
            element.classList.remove("valid");
            element.classList.add("invalid");
            icon.textContent = "✘";
        }
    }

    firstnameInput.addEventListener("input", () => {
        if (firstnameInput.validity.valueMissing) {
            firstnameInput.setCustomValidity("Το όνομα είναι υποχρεωτικό!");
        } else if (firstnameInput.validity.patternMismatch) {
            firstnameInput.setCustomValidity("Μόνο κεφαλαία ελληνικά χωρίς τόνους (π.χ. ΓΕΩΡΓΙΟΣ)!");
        } else {
            firstnameInput.setCustomValidity("");
        }
        firstnameInput.reportValidity();
    });

    lastnameInput.addEventListener("input", () => {
        if (lastnameInput.validity.valueMissing) {
            lastnameInput.setCustomValidity("Το επώνυμο είναι υποχρεωτικό!");
        } else if (lastnameInput.validity.patternMismatch) {
            lastnameInput.setCustomValidity("Μόνο κεφαλαία ελληνικά χωρίς τόνους (π.χ. ΠΑΠΑΔΟΠΟΥΛΟΣ)!");
        } else {
            lastnameInput.setCustomValidity("");
        }
        lastnameInput.reportValidity();
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
            const users = getUsers();
            const normalizedEmail = emailInput.value.trim().toLowerCase();
            if (users.some(u => (u.email || "").toLowerCase() === normalizedEmail)) {
                emailInput.setCustomValidity("Υπάρχει ήδη λογαριασμός με αυτό το email!");
            } else {
                emailInput.setCustomValidity("");
            }
        }
        emailInput.reportValidity();
    });

    passwordInput.addEventListener("input", () => {
        const val = passwordInput.value;

        // Ενημέρωση των ticks
        const hasLen = val.length >= 8;
        const hasLet = /[a-zA-Zα-ωΑ-Ω]/.test(val);
        const hasNum = /\d/.test(val);
        const hasSym = /[!@#$%^&*]/.test(val);

        updateRule(ruleLength, hasLen);
        updateRule(ruleLetter, hasLet);
        updateRule(ruleNumber, hasNum);
        updateRule(ruleSymbol, hasSym);

        if (passwordInput.validity.valueMissing) {
            passwordInput.setCustomValidity("Το password είναι υποχρεωτικό!");
        } else if (!hasLen || !hasLet || !hasNum || !hasSym) {
            passwordInput.setCustomValidity("Τουλάχιστον 8 χαρακτήρες με 1 γράμμα, 1 αριθμό και 1 σύμβολο (!@#$%^&*).");
        } else {
            passwordInput.setCustomValidity("");
        }

        if (epalpasswordInput.value) {
            if (epalpasswordInput.value !== passwordInput.value) {
                epalpasswordInput.setCustomValidity("Οι κωδικοί δεν ταιριάζουν!");
            } else {
                epalpasswordInput.setCustomValidity("");
            }
        }
        passwordInput.reportValidity();
    });

    epalpasswordInput.addEventListener("input", () => {
        if (epalpasswordInput.validity.valueMissing) {
            epalpasswordInput.setCustomValidity("Η επιβεβαίωση password είναι υποχρεωτική!");
        } else if (epalpasswordInput.value !== passwordInput.value) {
            epalpasswordInput.setCustomValidity("Οι κωδικοί δεν ταιριάζουν!");
        } else {
            epalpasswordInput.setCustomValidity("");
        }
        epalpasswordInput.reportValidity();
    });


    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!registerForm.checkValidity()) {
            registerForm.reportValidity();
            return;
        }

        const users = getUsers();
        const normalizedEmail = emailInput.value.trim().toLowerCase();

        if (users.some(u => (u.email || "").toLowerCase() === normalizedEmail)) {
            emailInput.setCustomValidity("Υπάρχει ήδη λογαριασμός με αυτό το email.");
            if (typeof showAlert === "function") {
                showAlert("Υπάρχει ήδη λογαριασμός με αυτό το email.");
            } else {
                alert("Υπάρχει ήδη λογαριασμός με αυτό το email.");
            }
            emailInput.focus();
            return;
        }

        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1,
            firstname: firstnameInput.value.trim(),
            lastname: lastnameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: normalizedEmail,
            passwordHash: await hashPassword(passwordInput.value),
            role: "user",
            registrationDate: new Date().toISOString().split("T")[0]
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        if (typeof showAlert === "function") {
            showAlert("Η εγγραφή ολοκληρώθηκε επιτυχώς!");
            const alertOkBtn = document.getElementById("alertOkBtn");
            if (alertOkBtn) {
                alertOkBtn.addEventListener("click", function() {
                    window.location.href = "login.html";
                }, { once: true });
            }
        } else {
            alert("Η εγγραφή ολοκληρώθηκε επιτυχώς!");
            window.location.href = "login.html";
        }

        registerForm.reset();
    });

    registerForm.addEventListener("reset", () => {
        setTimeout(() => {
            [firstnameInput, lastnameInput, phoneInput, emailInput, passwordInput, epalpasswordInput].forEach(inp => {
                if (inp) inp.setCustomValidity("");
            });
            updateRule(ruleLength, false);
            updateRule(ruleLetter, false);
            updateRule(ruleNumber, false);
            updateRule(ruleSymbol, false);
        }, 0);
    });
});