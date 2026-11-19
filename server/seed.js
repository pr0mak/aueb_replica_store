
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

/* ---------- Models ---------- */
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

/* ---------- Initial Products ---------- */
const initialProducts = [
    {
        name: "Μπλουζάκι A.S.O.E.E. 1920",
        category: "clothes",
        price: 17,
        image: "/assets/clothing/t-shirt.jpg",
        description: "Βαμβακερό μπλουζάκι από 100% βαμβάκι με επετειακό λογότυπο ΑΣΟΕΕ 1920.",
        notes: "Δημοφιλές προϊόν της περιόδου 2025-2026. Διαθέσιμα μεγέθη: S, M, L, XL.",
        availability: 10
    },
    {
        name: "Σακίδιο πλάτης για φορητό υπολογιστή 20L",
        category: "accessories",
        price: 29,
        image: "/assets/accessories/laptop_backpack.jpg",
        description: "Σακίδιο πλάτης χωρητικότητας 20 λίτρων, κατάλληλο για φορητό υπολογιστή.",
        notes: "Ιδανικό για καθημερινή χρήση στη σχολή. Χωρητικότητα: 20 λίτρα.",
        availability: 10
    },
    {
        name: "Powerbank από μπαμπού 4000 mAh",
        category: "office_supplies",
        price: 19,
        image: "/assets/office_supplies/powerbank.jpg",
        description: "Φορητός φορτιστής από μπαμπού χωρητικότητας 4000 mAh.",
        notes: "Φιλικό προς το περιβάλλον υλικό (μπαμπού). Χωρητικότητα: 4000 mAh.",
        availability: 10
    },
    {
        name: "Μπορντό γραβάτα AUEB",
        category: "accessories",
        price: 49,
        image: "/assets/accessories/gravata.jpg",
        description: "Μπορντό γραβάτα με την ταυτότητα του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Κατάλληλη για επίσημες εκδηλώσεις και τελετές. Σε χρώμα μπορντό AUEB.",
        availability: 10
    },
    {
        name: "Κορνίζα τοίχου για πτυχίο",
        category: "office_supplies",
        price: 29,
        image: "/assets/office_supplies/korniza.jpg",
        description: "Κορνίζα τοίχου κατάλληλη για την παρουσίαση του πτυχίου σου.",
        notes: "Ιδανική ως δώρο αποφοίτησης. Για τοποθέτηση σε τοίχο.",
        availability: 10
    },
    {
        name: "Pop-art κάλτσες AUEB",
        category: "clothes",
        price: 15,
        image: "/assets/clothing/Pop_art_socks_new1200-1100x1100.png",
        description: "Κάλτσες με pop-art σχέδιο και την ταυτότητα του AUEB.",
        notes: "Ένα διασκεδαστικό αξεσουάρ για την καθημερινότητα. Σχέδιο pop-art.",
        availability: 10
    },
    {
        name: "Flow-ζακέτα AUEB",
        category: "clothes",
        price: 29,
        image: "/assets/clothing/flow_zaketa.jpg",
        description: "Μαύρη ζακέτα με λογότυπο AUEB.",
        notes: "Μοντέρνα ζακέτα για καθημερινή χρήση.",
        availability: 10
    },
    {
        name: "T- Shirt ΟΠΑ Μαύρο",
        category: "clothes",
        price: 10,
        image: "/assets/clothing/t-shirt_opa_black.jpg",
        description: "Μαύρη κοντομάνικη με λογότυπο AUEB.",
        notes: "Απλή κοντομάνικη για καθημερινή χρήση.",
        availability: 10
    },
    {
        name: "Θερμικό μπλουζάκι ΑΣΟΕΕ 1920 Κίτρινο",
        category: "clothes",
        price: 35,
        image: "/assets/clothing/thermiko_mplouzaki_kitrino.jpg",
        description: "Θερμικό μπλουζάκι κίτρινο.",
        notes: "Σχεδιασμός που αγκαλιάζει το σώμα.",
        availability: 10
    },
    {
        name: "T-shirt ΟΠΑ-AUEB Φυστικί",
        category: "clothes",
        price: 15,
        image: "/assets/clothing/t-shirt_opa_fistiki.jpg",
        description: "Κοντομάνικο μπλουζάκι σε φυστικί απόχρωση.",
        notes: "Μπλουζάκι με δίχρωμη εκτύπωση σήματος ΟΠΑ-AUEB.",
        availability: 10
    },
    {
        name: "Ζακέτα Fleece AUEB",
        category: "clothes",
        price: 29,
        image: "/assets/clothing/zaketa_freece.jpg",
        description: "Ζακέτα fleece με ψηλό λαιμό και κεντημένο το λογότυπο Α.Σ.Ο.Ε.Ε. 1920.",
        notes: "Μια ζακέτα που συνδυάζει εργονομία, προστασία από το κρύο και διακριτικό στυλ.",
        availability: 10
    },
    {
        name: "Μπλε γραβάτα AUEB",
        category: "accessories",
        price: 49,
        image: "/assets/accessories/gravata_blue.jpg",
        description: "Μπλε γραβάτα με την ταυτότητα του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Κατάλληλη για επίσημες εκδηλώσεις και τελετές. Σε χρώμα μπλε AUEB.",
        availability: 10
    },
    {
        name: "Κασκόλ AUEB",
        category: "accessories",
        price: 19,
        image: "/assets/accessories/kaskol_fleece.jpg",
        description: "Μόλις αρχίσεις να χρησιμοποιείς αυτό το μαλακό κασκόλ, θα αναρωτηθείς πώς πέρασες τους προηγούμενους χειμώνες χωρίς αυτό.",
        notes: "Μια οικολογική προσέγγιση στα χειμερινά αξεσουάρ αφού το κασκόλ είναι κατασκευασμένο από 100% ανακυκλωμένο πολυεστέρα.",
        availability: 10
    },
    {
        name: "Καπέλο μπεζ",
        category: "accessories",
        price: 9,
        image: "/assets/accessories/kapelo_mpez.jpg",
        description: "Καπέλο Jockey σε μπέζ χρώμα, με το λογότυπο του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Διαθέτει μεταλλικό μηχανισμό ρύθμισης μεγέθους.",
        availability: 10
    },
    {
        name: "Καπέλο μαύρο",
        category: "accessories",
        price: 9,
        image: "/assets/accessories/kapelo_black.jpg",
        description: "Καπέλο Jockey σε μαύρο χρώμα, με το λογότυπο του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Διαθέτει μεταλλικό μηχανισμό ρύθμισης μεγέθους.",
        availability: 10
    },
    {
        name: "Καπέλο μπορντό",
        category: "accessories",
        price: 9,
        image: "/assets/accessories/kapelo_mpordo.jpg",
        description: "Καπέλο Jockey σε μπορντό χρώμα, με το λογότυπο του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Διαθέτει μεταλλικό μηχανισμό ρύθμισης μεγέθους.",
        availability: 10
    },
    {
        name: "Αρωματικό κερί",
        category: "accessories",
        price: 5,
        image: "/assets/office_supplies/arwmatiko_keri.jpg",
        description: "Αρωματικό φυτικό κερί, σε τετράγωνη γυάλινη θήκη με καπάκι από μπαμπού και εκτύπωση το λογότυπο ΟΠΑ.",
        notes: "Μυρωδιά βανίλλιας",
        availability: 10
    },
    {
        name: "USB stick",
        category: "office_supplies",
        price: 5,
        image: "/assets/office_supplies/usb_stick.jpg",
        description: "Περιστρεφόμενο USB stick με ξύλινο κορμό σε ανοιχτό φυσικό χρώμα & μεταλλικό κάλυμμα.",
        notes: "Χωρητικότητα: 8GB",
        availability: 10
    },
    {
        name: "Anti-stress cube",
        category: "office_supplies",
        price: 3,
        image: "/assets/office_supplies/anti_stress_cube.jpg",
        description: "Αντι-στρες κύβος με το σήμα του ΟΠΑ σε λευκό και κίτρινο χρώμα.",
        notes: "Διαστάσεις: 4,5 x 4,5 x 4,5cm",
        availability: 10
    },
    {
        name: "Θήκη για Tablet ΟΠΑ",
        category: "office_supplies",
        price: 38,
        image: "/assets/office_supplies/thiki_tablet.jpg",
        description: "Θήκη για Tablet από πυρογραφικό υλικό εξαιρετικής ποιότητας με ιδιαίτερη υφή.",
        notes: "Διαθέτει μεγάλη τσέπη αριστερά, θέση για μπλοκ σημειώσεων δεξιά, μία ειδικά σχεδιασμένη τσέπη για Tablet.",
        availability: 10
    },
    {
        name: "Κορδόνι Λαιμού με γάντζο",
        category: "office_supplies",
        price: 4,
        image: "/assets/office_supplies/kordoni_laimou.jpg",
        description: "Υφασμάτινο κορδόνι λαιμού με γάντζο και το λογότυπο του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Dimensions:50.00cm x 2.50cm x 0.00cm",
        availability: 10
    }
];

/* ---------- Seed Database ---------- */
const seedDatabase = async () => {
    try {
        /* ---------- Database Connection ---------- */
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Σύνδεση στη MongoDB για Seed...');

        /* ---------- Clear Existing Data ---------- */
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('Διαγράφηκαν τα παλιά δεδομένα.');

        /* ---------- Password Hashing ---------- */
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash('Admin123!', saltRounds);
        const userPasswordHash = await bcrypt.hash('User123!', saltRounds);

        /* ---------- Initial Users ---------- */
        await User.insertMany([
            {
                firstname: "ADMIN",
                lastname: "AUEB",
                email: "admin@aueb.gr",
                phone: "6900000000",
                password: adminPasswordHash,
                role: "admin"
            },
            {
                firstname: "ΓΕΩΡΓΙΟΣ",
                lastname: "ΠΑΠΑΔΟΠΟΥΛΟΣ",
                email: "user@aueb.gr",
                phone: "6900000001",
                password: userPasswordHash,
                role: "user"
            }
        ]);

        console.log('Δημιουργήθηκαν 2 χρήστες.');

        /* ---------- Insert Initial Products ---------- */
        await Product.insertMany(initialProducts);
        console.log(`Δημιουργήθηκαν ${initialProducts.length} αρχικά προϊόντα.`);

        /* ---------- Seed Completed ---------- */
        console.log('Η αρχικοποίηση (Seed) ολοκληρώθηκε με επιτυχία!');
        process.exit(0);

    } catch (error) {
        console.error('Σφάλμα κατά τη διάρκεια του Seed:', error);
        process.exit(1);
    }
};

seedDatabase();
