const PRODUCTS_KEY = "products";

class Product {
    constructor(id, name, category, price, image, description, notes, availability = 10) {
        this.id = Number(id);
        this.name = name;
        this.category = category; // "clothes" | "accessories" | "office_supplies"
        this.price = Number(price);
        this.image = image;
        this.description = description || "";
        this.notes = notes || "";
        this.availability = Math.max(0, Number(availability) || 0);
    }
}


class ProductStore {
    constructor() {
        this.storageKey = PRODUCTS_KEY;
        this.products = this.load();

        
        if (this.products.length === 0) {
            this.seed();
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return parsed.map(item => new Product(
                item.id,
                item.name,
                item.category,
                item.price,
                item.image,
                item.description,
                item.notes,
                item.availability ?? 10
            ));
        } catch {
            return [];
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    }

    getAll() {
        return this.products;
    }

    // getById(id) {
    //     return this.products.find(p => p.id === Number(id));
    // }

    getByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    add(productData) {
        const ids = this.products.map(p => p.id);
        const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

        const newProduct = new Product(
            nextId,
            productData.name,
            productData.category,
            productData.price,
            productData.image,
            productData.description,
            productData.notes,
            productData.availability ?? 10
        );

        this.products.push(newProduct);
        this.save();
        return newProduct;
    }

    update(id, updatedFields) {
        const index = this.products.findIndex(p => p.id === Number(id));
        if (index === -1) return null;

        const current = this.products[index];
        this.products[index] = new Product(
            current.id,
            updatedFields.name ?? current.name,
            updatedFields.category ?? current.category,
            updatedFields.price ?? current.price,
            updatedFields.image ?? current.image,
            updatedFields.description ?? current.description,
            updatedFields.notes ?? current.notes,
            updatedFields.availability ?? current.availability
        );

        this.save();
        return this.products[index];
    }

    delete(id) {
        this.products = this.products.filter(p => p.id !== Number(id));
        this.save();
    }

    seed() {
        const initialProducts = [
            new Product(
                1,
                "Μπλουζάκι A.S.O.E.E. 1920",
                "clothes",
                17.00,
                "/assets/clothing/t-shirt.jpg",
                "Βαμβακερό μπλουζάκι από 100% βαμβάκι με επετειακό λογότυπο ΑΣΟΕΕ 1920.",
                "Δημοφιλές προϊόν της περιόδου 2025-2026. Διαθέσιμα μεγέθη: S, M, L, XL.",
                "10"
            ),
            new Product(
                2,
                "Σακίδιο πλάτης για φορητό υπολογιστή 20L",
                "accessories",
                29.00,
                "/assets/accessories/laptop_backpack.jpg",
                "Σακίδιο πλάτης χωρητικότητας 20 λίτρων, κατάλληλο για φορητό υπολογιστή.",
                "Ιδανικό για καθημερινή χρήση στη σχολή. Χωρητικότητα: 20 λίτρα.",
                "10"
            ),
            new Product(
                3,
                "Powerbank από μπαμπού 4000 mAh",
                "office_supplies",
                19.00,
                "/assets/office_supplies/powerbank.jpg",
                "Φορητός φορτιστής από μπαμπού χωρητικότητας 4000 mAh.",
                "Φιλικό προς το περιβάλλον υλικό (μπαμπού). Χωρητικότητα: 4000 mAh.",
                "10"
            ),
            new Product(
                4,
                "Μπορντό γραβάτα AUEB",
                "accessories",
                49.00,
                "/assets/accessories/gravata.jpg",
                "Μπορντό γραβάτα με την ταυτότητα του Οικονομικού Πανεπιστημίου Αθηνών.",
                "Κατάλληλη για επίσημες εκδηλώσεις και τελετές. Σε χρώμα μπορντό AUEB.",
                "10"
            ),
            new Product(
                5,
                "Κορνίζα τοίχου για πτυχίο",
                "office_supplies",
                29.00,
                "/assets/office_supplies/korniza.jpg",
                "Κορνίζα τοίχου κατάλληλη για την παρουσίαση του πτυχίου σου.",
                "Ιδανική ως δώρο αποφοίτησης. Για τοποθέτηση σε τοίχο.",
                "10"
            ),
            new Product(
                6,
                "Pop-art κάλτσες AUEB",
                "clothes",
                15.00,
                "/assets/clothing/Pop_art_socks_new1200-1100x1100.png",
                "Κάλτσες με pop-art σχέδιο και την ταυτότητα του AUEB.",
                "Ένα διασκεδαστικό αξεσουάρ για την καθημερινότητα. Σχέδιο pop-art.",
                "10"
            )
        ];

        this.products = initialProducts;
        this.save();
    }
}

const productStore = new ProductStore();