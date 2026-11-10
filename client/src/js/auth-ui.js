const CURRENT_USER_KEY = "currentUser";

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
        return null;
    }
}

//Emfanish / Apokrypsh tou Admin Link sto Navigation Bar
function updateAdminLink() {
    const adminLink = document.getElementById("adminLink");
    if (!adminLink) return;

    const user = getCurrentUser();

    if (user && user.role === "admin") {
        adminLink.classList.remove("hidden");
    } else {
        adminLink.classList.add("hidden");
    }
}

function renderHeaderActions() {
    const headerActions = document.getElementById("headerActions");

    if (!headerActions) return;

    const user = getCurrentUser();

    //enhmerwnoume kai thn katastash tou Admin Link kathe fora pou allazei to UI
    updateAdminLink();

    //an den uparxei sindedemenos user
    if (!user) {
        headerActions.innerHTML = `
            <a href="register.html" class="login-link">Register</a>
            <a href="login.html" class="login-link">Login</a>
        `;
        return;
    }

    const displayName = [user.firstname, user.lastname]
        .filter(Boolean)
        .join(" ");

    headerActions.innerHTML = `
        <div class="user-menu">
            <button
                type="button"
                class="user-menu-button"
                id="userMenuButton"
                aria-expanded="false"
                aria-controls="userDropdown"
            >
                ${escapeHTML(displayName || user.email)} ▾
            </button>

            <div class="user-dropdown" id="userDropdown" hidden>
                <button type="button" id="logoutButton">
                    Logout
                </button>
            </div>
        </div>
    `;

    const menuButton = document.getElementById("userMenuButton");
    const dropdown = document.getElementById("userDropdown");
    const logoutButton = document.getElementById("logoutButton");

    menuButton.addEventListener("click", function () {
        const isOpen = !dropdown.hidden;
        dropdown.hidden = isOpen;
        menuButton.setAttribute("aria-expanded", String(!isOpen));
    });

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem(CURRENT_USER_KEY);
        renderHeaderActions(); // Θα ενημερώσει τα κουμπιά ΚΑΙ θα κρύψει το admin link
    });

    document.addEventListener("click", function closeMenu(event) {
        if (!headerActions.contains(event.target)) {
            dropdown.hidden = true;
            menuButton.setAttribute("aria-expanded", "false");
        }
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Αρχική εκτέλεση μόλις φορτώσει το DOM
document.addEventListener("DOMContentLoaded", function () {
    renderHeaderActions();
});

window.addEventListener("userLoggedIn", renderHeaderActions);
window.addEventListener("storage", renderHeaderActions);