
# AUEB Official Store

## Στοιχεία ομάδας

| Ονοματεπώνυμο | Αριθμός Μητρώου (ΑΜ) |
| :--- | :--- |
| **Πρόδρομος-Άρης Μακαρούνας** | 3230111 |
| **Νικόλαος Πουλόπουλος** | 3230170 |

## Οδηγίες εγκατάστασης

Απαιτούνται:
- Node.js και npm
- MongoDB

### 1. Εγκατάσταση Backend

Ανοίγουμε terminal στον φάκελο server:

```bash
cd server
npm install
```

### 2. Ρύθμιση .env

Δημιουργούμε αρχείο server/.env ακολουθόντας το template του .env.example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/istos?retryWrites=false
JWT_SECRET=your_jwt_secret_here
```

### 3. Αρχικοποίηση βάσης δεδομένων(προσθήκη των products και τον user-admin)

Με τη MongoDB ενεργή, εκτελούμε:

```bash
npm run seed
```

### 4. Εκκίνηση Backend

```bash
npm run dev
```

Ο backend server εκτελείται στη θύρα 5000.

### 5. Εγκατάσταση και εκκίνηση Frontend

Σε δεύτερο terminal:

```bash
cd client
npm install
npm run dev
```

Η εφαρμογή ανοίγει στη διεύθυνση:

http://localhost:5173

## Λογαριασμοί δοκιμής

### User
Email: user@aueb.gr
Password: User123!

### Administrator
Email: admin@aueb.gr
Password: Admin123!

##Προτείνεται να δημιουργήσετε δικό σας λογαριασμό με υπαρκτό e-mail ώστε να δείτε το feature της αποστολής e-mail μετά την επικοιννία με το AUEB official store (http://localhost:5173/contact).
