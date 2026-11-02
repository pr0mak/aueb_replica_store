const USERS_KEY = "aueb_users";
const CURRENT_USER_KEY = "currentUser";

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");


loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (email === "") {
        showAlert("Παρακαλώ συμπλήρωσε το email σου.");
        emailInput.focus();
        return;
    }

    //elegxos email me vash to type=email apo html
    //opou apaitei na exei @
    //kai na exei domain .com, .gr, ktlp
    if (!emailInput.validity.valid) {
        showAlert("Παρακαλώ πληκτρολόγησε ένα έγκυρο email.");
        emailInput.focus();
        return;
    }

    if (password.trim() === "") {
        showAlert("Παρακαλώ συμπλήρωσε τον κωδικό πρόσβασης.");
        passwordInput.focus();
        return;
    }

    if (password.length < 3 || password.length > 20) {
        showAlert("Ο κωδικός πρέπει να είναι μεγαλύτερος πάνω από 5 και μικρότερος από 15 χαρακτήρες.");
        passwordInput.focus();
        return;
    }

    const users = getUsers();
    const normalizedEmail = email.toLowerCase();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
        showAlert("Δεν υπάρχει λογαριασμός με αυτό το email. Παρακαλώ κάνε πρώτα εγγραφή.");
        emailInput.focus();
        return;
    }

    
    const passwordHash = await hashPassword(password);

    const isPasswordValid = user.passwordHash
        ? user.passwordHash === passwordHash
        : user.role === "admin" && user.password === password;

    if (!isPasswordValid) {
        showAlert("Λάθος κωδικός πρόσβασης.");
        passwordInput.focus();
        return;
    }


    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
    }));

    window.dispatchEvent(new Event("userLoggedIn"));

    showAlert("Καλώς ήρθες, " + user.firstname + "!");

    document.getElementById("alertOkBtn").addEventListener("click", function() {
        window.location.href = "index.html";
    }, { once: true });
});

loginForm.addEventListener("reset", function() {});