const USERS_KEY = "aueb_users";

function initializeAdmin() {
    let users = JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
    );

    users = users.filter(user => user.role !== "admin");

    const adminUser = {
        firstname: "Admin",
        lastname: "AUEB",
        phone: "6900000000",
        email: "admin@aueb.gr",
        password: "Admin123!",
        role: "admin"
    };

    users.unshift(adminUser);

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

initializeAdmin();