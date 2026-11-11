const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

//initialization of the 3 models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

//arxika dedomena proiontwn
const initialProducts = [
    {
        name: "Μπλουζάκι AUEB Burgundy Edition",
        category: "clothes",
        price: 19,
        image: "/assets/clothing/t-shirt.jpg",
        description: "Βαμβακερό μπλουζάκι σε μπορντό και λευκές λεπτομέρειες, εμπνευσμένο από την ταυτότητα του Οικονομικού Πανεπιστημίου Αθηνών.",
        notes: "Διαθέσιμο σε μεγέθη S, M, L και XL. Ιδανικό για φοιτητές και αποφοίτους.",
        availability: 15
    },
    {
        name: "Φοιτητικό σακίδιο Urban 22L",
        category: "accessories",
        price: 34,
        image: "/assets/accessories/laptop_backpack.jpg",
        description: "Πρακτικό σακίδιο 22 λίτρων με ευρύχωρη θήκη για laptop και επιπλέον χώρο για βιβλία και σημειώσεις.",
        notes: "Κατάλληλο για καθημερινή χρήση στο πανεπιστήμιο. Διαθέτει πολλαπλές θήκες αποθήκευσης.",
        availability: 8
    },
    {
        name: "Eco Powerbank Bamboo 5000 mAh",
        category: "office_supplies",
        price: 22,
        image: "/assets/office_supplies/powerbank.jpg",
        description: "Φορητός φορτιστής με εξωτερική επένδυση από μπαμπού και χωρητικότητα 5000 mAh για φόρτιση κινητών συσκευών.",
        notes: "Ελαφρύ και πρακτικό για μετακινήσεις και πολύωρη παραμονή στη σχολή.",
        availability: 12
    },
    {
        name: "Γραβάτα AUEB Classic Bordeaux",
        category: "accessories",
        price: 45,
        image: "/assets/accessories/gravata.jpg",
        description: "Κλασική γραβάτα σε βαθύ μπορντό χρώμα, κατάλληλη για επίσημες περιστάσεις και πανεπιστημιακές εκδηλώσεις.",
        notes: "Κομψή επιλογή για τελετές αποφοίτησης, παρουσιάσεις και επαγγελματικές συναντήσεις.",
        availability: 6
    },
    {
        name: "Κορνίζα Αποφοίτησης University Style",
        category: "office_supplies",
        price: 32,
        image: "/assets/office_supplies/korniza.jpg",
        description: "Κομψή κορνίζα για την προβολή πτυχίου ή αναμνηστικού πιστοποιητικού από τις σπουδές.",
        notes: "Κατάλληλη για γραφείο ή τοίχο. Μια όμορφη ιδέα δώρου για νέους αποφοίτους.",
        availability: 9
    },
    {
        name: "Κάλτσες AUEB Color Pop",
        category: "clothes",
        price: 12,
        image: "/assets/clothing/Pop_art_socks_new1200-1100x1100.png",
        description: "Χρωματιστές κάλτσες με μοντέρνο pop-art ύφος, σχεδιασμένες για άνεση και καθημερινή χρήση.",
        notes: "Ιδανικές για casual εμφανίσεις και ως πρωτότυπο δώρο για φοιτητές.",
        availability: 20
    },
    {
        name: "Κάλτσες AUEB Color Pop",
        category: "clothes",
        price: 12,
        image: "/assets/clothing/Pop_art_socks_new1200-1100x1100.png",
        description: "Χρωματιστές κάλτσες με μοντέρνο pop-art ύφος, σχεδιασμένες για άνεση και καθημερινή χρήση.",
        notes: "Ιδανικές για casual εμφανίσεις και ως πρωτότυπο δώρο για φοιτητές.",
        availability: 20
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Σύνδεση στη MongoDB για Seed...');

        //katharismos paliws dedomenwn
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('Διαγράφηκαν τα παλιά δεδομένα.');

        //dhmiorgoume hashed kwdikous gia tous xrhstes
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash('Admin123!', saltRounds);
        const userPasswordHash = await bcrypt.hash('User123!', saltRounds);

        //eisagwgh 2 xrhstwn (1 Admin & 1 User)
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

        //eisagwgh 10 products
        await Product.insertMany(initialProducts);
        console.log('Δημιουργήθηκαν τα αρχικά προϊόντα.');

        console.log('Η αρχικοποίηση (Seed) ολοκληρώθηκε με επιτυχία!');
        process.exit(0);
    } catch (error) {
        console.error('Σφάλμα κατά τη διάρκεια του Seed:', error);
        process.exit(1);
    }
};

seedDatabase();