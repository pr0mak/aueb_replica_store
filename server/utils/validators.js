const greekNamePattern = /^[Α-Ω]+(?:[ -][Α-Ω]+)*$/;
const passwordLetter = /[a-zA-Zα-ωΑ-Ω]/;
const passwordNumber = /\d/;
const passwordSymbol = /[!@#$%^&*]/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^69\d{8}$/;
const CATEGORIES = ["clothes", "office_supplies", "accessories"];
const PRODUCT_FIELDS = ["name", "category", "price", "availability", "image", "description", "notes"];

function validateRegistration(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return "Μη έγκυρα δεδομένα εγγραφής.";
    const { firstname, lastname, phone, email, password } = data;
    if (typeof firstname !== "string" || !greekNamePattern.test(firstname.trim())) {
        return "Το όνομα πρέπει να είναι με κεφαλαία ελληνικά χωρίς τόνους.";
    }
    if (typeof lastname !== "string" || !greekNamePattern.test(lastname.trim())) {
        return "Το επώνυμο πρέπει να είναι με κεφαλαία ελληνικά χωρίς τόνους.";
    }
    if (typeof phone !== "string" || !phonePattern.test(phone.trim())) {
        return "Το κινητό πρέπει να έχει 10 ψηφία και να αρχίζει από 69.";
    }
    if (typeof email !== "string" || email.length > 254 || !emailPattern.test(email.trim())) {
        return "Το email δεν είναι έγκυρο.";
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128 ||
        !passwordLetter.test(password) || !passwordNumber.test(password) || !passwordSymbol.test(password)) {
        return "Ο κωδικός απαιτεί 8+ χαρακτήρες, γράμμα, αριθμό και σύμβολο !@#$%^&*.";
    }
    if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
        return "Η επιβεβαίωση κωδικού δεν ταιριάζει.";
    }
    return null;
}

function validateProductInput(data, partial = false) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return "Μη έγκυρα δεδομένα προϊόντος.";
    const keys = Object.keys(data);
    if (!keys.length || keys.some(key => !PRODUCT_FIELDS.includes(key))) return "Άγνωστα ή κενά πεδία προϊόντος.";
    if (!partial && (typeof data.name !== "string" || typeof data.category !== "string" ||
        typeof data.price !== "number")) return "Λείπουν υποχρεωτικά πεδία προϊόντος.";
    if ("name" in data && (typeof data.name !== "string" || !data.name.trim() || data.name.length > 160)) {
        return "To όνομα του προϊόντος είναι υποχρεωτικό (μέχρι 160 χαρακτήρες).";
    }
    if ("category" in data && !CATEGORIES.includes(data.category)) return "Μη έγκυρη κατηγορία προϊόντος.";
    if ("price" in data && (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0)) {
        return "H τιμή πρέπει να είναι μη αρνητικός αριθμός.";
    }
    if ("availability" in data && (!Number.isSafeInteger(data.availability) || data.availability < 0)) {
        return "H διαθεσιμότητα πρέπει να είναι μη αρνητικός ακέραιος.";
    }
    for (const field of ["description", "notes"]) {
        if (field in data && (typeof data[field] !== "string" || data[field].length > 3000)) {
            return `Μη έγκυρο πεδίο ${field}.`;
        }
    }
    if ("image" in data) {
        const value = data.image;
        if (typeof value !== "string" || value.length > 2_800_000 ||
            (value && !/^\/assets\/[a-zA-Z0-9/_().-]+$/.test(value) &&
             !/^https:\/\/[\w.-]+(?:[:/][^\s]*)?$/.test(value) &&
             !/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value))) {
            return "H εικόνα πρέπει να είναι έγκυρη διαδρομή ή εικόνα PNG/JPEG/WEBP έως 2 MB.";
        }
    }
    return null;
}

function validateOrderItems(items, isValidId) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) return "Το καλάθι είναι άδειο ή μη έγκυρο.";
    const quantities = new Map();
    for (const item of items) {
        if (!item || typeof item !== "object" || Array.isArray(item) ||
            !isValidId(item.productId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
            return "Κάθε προϊόν πρέπει να έχει έγκυρο ID και ποσότητα από 1 έως 10.";
        }
        const id = String(item.productId);
        const quantity = (quantities.get(id) || 0) + item.quantity;
        if (quantity > 10) return "Μέγιστο 10 τεμάχια ανά προϊόν.";
        quantities.set(id, quantity);
    }
    return quantities;
}

module.exports = { validateRegistration, validateProductInput, validateOrderItems, CATEGORIES, emailPattern };
