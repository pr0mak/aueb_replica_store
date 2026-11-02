document.addEventListener("DOMContentLoaded", () => {
    // --- stoixeia pinaka kai filtrwm ---
    const tbody = document.getElementById("adminProductsTbody");
    const searchInput = document.getElementById("adminSearchInput");
    const categoryFilter = document.getElementById("adminCategoryFilter");
    const sortSelect = document.getElementById("adminSortSelect");

    // --- stoixeia formas proiontwn ---
    const productForm = document.getElementById("productForm");
    const formTitle = document.getElementById("formTitle");
    const submitBtn = document.getElementById("submitBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    const idInput = document.getElementById("productId");
    const titleInput = document.getElementById("productTitle");
    const categoryInput = document.getElementById("productCategory");
    const priceInput = document.getElementById("productPrice");
    const descInput = document.getElementById("productDescription");
    const notesInput = document.getElementById("productNotes");
    const availabilityInput = document.getElementById("productAvailability");

    // --- steoixeia diaxeirishs eikonas (Drag & Drop) ---
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("productFileInput");
    const dropPrompt = document.getElementById("dropPrompt");
    const previewWrapper = document.getElementById("previewWrapper");
    const imagePreview = document.getElementById("imagePreview");
    const removeImageBtn = document.getElementById("removeImageBtn");
    const imageInput = document.getElementById("productImage");

    const categoryLabels = {
        clothes: "Ένδυση",
        accessories: "Αξεσουάρ",
        office_supplies: "Είδη Γραφείου"
    };

    const pagination = document.getElementById("adminPagination");

    const PRODUCTS_PER_PAGE = 5; //KANONIKA PREPEI NA EINAI 10
    let currentPage = 1;

    //anakthsh proiontwn apo to localStorage 
    function getProducts() {
        try {
            return JSON.parse(localStorage.getItem("products")) || [];
        } catch {
            return [];
        }
    }

    //apothikeuh proiontwn sto  localStorage
    function saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }


    // ===== IMPORT / EXPORT PRODUCTS =====

    const exportJsonBtn = document.getElementById("exportJsonBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const importJsonInput = document.getElementById("importJsonInput");

    const VALID_CATEGORIES = [
        "clothes",
        "accessories",
        "office_supplies"
    ];

    // Κανονικοποίηση ονόματος για έλεγχο διπλοτύπων.
    function normalizeProductName(name) {
        return String(name || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLocaleLowerCase("el");
    }

    // Κατεβάζει δεδομένα ως αρχείο.
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob(
            [content], { type: `${mimeType};charset=utf-8;` }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ΕΞΑΓΩΓΗ JSON
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener("click", () => {
            const products = getProducts();

            downloadFile(
                JSON.stringify(products, null, 2),
                "products.json",
                "application/json"
            );
        });
    }

    // ΕΞΑΓΩΓΗ CSV
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            const products = getProducts();

            const columns = [
                "id",
                "name",
                "category",
                "price",
                "image",
                "description",
                "notes",
                "availability"
            ];

            function csvEscape(value) {
                const text = Array.isArray(value) ?
                    value.join("\n") :
                    String(value || "");

                return '"' + text.replace(/"/g, '""') + '"';
            }

            const rows = [
                columns.map(csvEscape).join(","),
                ...products.map(product =>
                    columns.map(column => csvEscape(product[column])).join(",")
                )
            ];

            //BOM gia kaluterh emfanish ellhnikwn sto excel
            downloadFile(
                "\uFEFF" + rows.join("\r\n"),
                "products.csv",
                "text/csv"
            );
        });
    }


    //elegxos kathe eggrafhs tou json
    function validateImportedProduct(product, existingNames, importedNames) {
        const errors = [];

        if (!product ||
            typeof product !== "object" ||
            Array.isArray(product)
        ) {
            return {
                valid: false,
                errors: ["Η εγγραφή δεν είναι αντικείμενο προϊόντος."]
            };
        }

        const name = String(product.name || "").trim();

        const category = product.category;
        const price = Number(product.price);

        const image = typeof product.image === "string" ?
            product.image.trim() :
            "";

        const availability = product.availability;

        if (!name) {
            errors.push("Λείπει ο τίτλος.");
        }

        if (!VALID_CATEGORIES.includes(category)) {
            errors.push("Μη έγκυρη κατηγορία.");
        }

        if (
            product.price === "" ||
            product.price === null ||
            product.price === undefined ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            errors.push("Η τιμή πρέπει να είναι θετικός αριθμός.");
        }

        if (!image) {
            errors.push("Λείπει η εικόνα.");
        }

        if (
            availability === "" ||
            availability === null ||
            availability === undefined ||
            !Number.isInteger(Number(availability)) ||
            Number(availability) < 0
        ) {
            errors.push(
                "Τα διαθέσιμα τεμάχια πρέπει να είναι ακέραιος αριθμός ≥ 0."
            );
        }

        const normalizedName = normalizeProductName(name);

        if (normalizedName) {
            if (existingNames.has(normalizedName)) {
                errors.push("Υπάρχει ήδη προϊόν με αυτό το όνομα.");
            } else if (importedNames.has(normalizedName)) {
                errors.push("Το όνομα επαναλαμβάνεται μέσα στο αρχείο.");
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            name: name,
            category: category,
            price: price,
            image: image,
            availability: Number(availability),
            description: String(product.description || ""),
            notes: Array.isArray(product.notes) ?
                product.notes.map(note => String(note)) : String(product.notes || "")
                .split("\n")
                .map(note => note.trim())
                .filter(Boolean)
        };
    }


    //eisagwgh json
    if (importJsonInput) {
        importJsonInput.addEventListener("change", async() => {
            const file = importJsonInput.files ?
                importJsonInput.files[0] :
                null;

            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!Array.isArray(data)) {
                    showAlert(
                        "Το JSON πρέπει να περιέχει έναν πίνακα προϊόντων."
                    );
                    return;
                }

                const products = getProducts();

                const existingNames = new Set(
                    products.map(product =>
                        normalizeProductName(product.name)
                    ).filter(Boolean)
                );

                const importedNames = new Set();
                const accepted = [];
                const rejected = [];

                data.forEach((product, index) => {
                    const result = validateImportedProduct(
                        product,
                        existingNames,
                        importedNames
                    );

                    if (!result.valid) {
                        rejected.push(
                            `Εγγραφή ${index + 1}: ${result.errors.join(" ")}`
                        );
                        return;
                    }

                    //to id tou arxeiou den empistevetai
                    //dhmiourgoume neo monadiko id
                    const maxId = Math.max(
                        0,
                        ...products.map(p => Number(p.id) || 0),
                        ...accepted.map(p => Number(p.id) || 0)
                    );

                    const newProduct = {
                        id: maxId + 1,
                        name: result.name,
                        category: result.category,
                        price: result.price,
                        image: result.image,
                        description: result.description,
                        notes: result.notes,
                        availability: result.availability
                    };

                    accepted.push(newProduct);
                    importedNames.add(normalizeProductName(result.name));
                });

                if (accepted.length > 0) {
                    saveProducts([...products, ...accepted]);
                    currentPage = 1;
                    renderProductsTable();
                }

                const summary =
                    `Εισαγωγή ολοκληρώθηκε.\n` +
                    `Επιτυχείς εγγραφές: ${accepted.length}\n` +
                    `Απορριφθείσες εγγραφές: ${rejected.length}`;

                const details = rejected.length ?
                    "\n\nΛεπτομέρειες:\n" +
                    rejected.slice(0, 10).join("\n") +
                    (rejected.length > 10 ?
                        `\n...και άλλες ${rejected.length - 10} εγγραφές.` :
                        "") :
                    "";

                showAlert(summary + details);
            } catch (error) {
                showAlert(
                    "Αδυναμία ανάγνωσης του αρχείου. " +
                    "Βεβαιώσου ότι είναι έγκυρο JSON."
                );
                console.error(error);
            } finally {
                //epitrepei thn epilogh tou idiou arxeiou jana
                importJsonInput.value = "";
            }
        });
    }


    function displayImage(base64OrUrl) {
        imageInput.value = base64OrUrl;
        imagePreview.src = base64OrUrl;

        if (dropPrompt) {
            dropPrompt.classList.add("hidden");
            dropPrompt.style.display = "none";
        }
        if (previewWrapper) {
            previewWrapper.classList.remove("hidden");
            previewWrapper.style.display = "flex";
        }
    }

    function clearImage() {
        imageInput.value = "";
        imagePreview.src = "";
        if (fileInput) fileInput.value = "";

        if (previewWrapper) {
            previewWrapper.classList.add("hidden");
            previewWrapper.style.display = "none";
        }
        if (dropPrompt) {
            dropPrompt.classList.remove("hidden");
            dropPrompt.style.display = "flex";
        }
    }

    // Ανάγνωση αρχείου και μετατροπή σε Base64 Data URL
    function handleSelectedFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            showAlert("Παρακαλώ επιλέξτε ένα έγκυρο αρχείο εικόνας (PNG, JPG, WEBP).");
            return;
        }

        // max 2MB
        if (file.size > 2 * 1024 * 1024) {
            showAlert("Το μέγεθος της εικόνας δεν πρέπει να ξεπερνά τα 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            displayImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Event Listeners για το Drop Zone
    if (dropZone && fileInput) {
        // Κλικ οπουδήποτε στο πλαίσιο -> άνοιγμα file dialog
        dropZone.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleSelectedFile(e.target.files[0]);
            }
        });

        // Drag & Drop Events
        ["dragenter", "dragover"].forEach((evtName) => {
            dropZone.addEventListener(evtName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add("dragover");
            });
        });

        ["dragleave", "drop"].forEach((evtName) => {
            dropZone.addEventListener(evtName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove("dragover");
            });
        });

        dropZone.addEventListener("drop", (e) => {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleSelectedFile(files[0]);
            }
        });
    }

    // Κουμπί Αφαίρεσης Εικόνας
    if (removeImageBtn) {
        removeImageBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Αποτρέπει το άνοιγμα του file dialog στο κλικ
            clearImage();
        });
    }



    function renderProductsTable() {
        if (!tbody) return;

        let products = getProducts();

        // Αναζήτηση
        const query = searchInput ?
            searchInput.value.toLowerCase().trim() :
            "";

        if (query) {
            products = products.filter(p => {
                const title = (p.title || p.name || "").toLowerCase();
                return title.includes(query);
            });
        }

        // Φίλτρο κατηγορίας
        const selectedCat = categoryFilter ?
            categoryFilter.value :
            "all";

        if (selectedCat !== "all") {
            products = products.filter(
                p => p.category === selectedCat
            );
        }

        // Ταξινόμηση
        const sortValue = sortSelect ? sortSelect.value : "default";

        products.sort((a, b) => {
            const titleA = a.title || a.name || "";
            const titleB = b.title || b.name || "";
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;

            if (sortValue === "name-asc") {
                return titleA.localeCompare(titleB, "el");
            }

            if (sortValue === "name-desc") {
                return titleB.localeCompare(titleA, "el");
            }

            if (sortValue === "price-asc") {
                return priceA - priceB;
            }

            if (sortValue === "price-desc") {
                return priceB - priceA;
            }

            return (Number(a.id) || 0) - (Number(b.id) || 0);
        });

        // Υπολογισμός σελίδων
        const totalPages = Math.ceil(
            products.length / PRODUCTS_PER_PAGE
        );

        if (totalPages === 0) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const pageProducts = products.slice(
            startIndex,
            startIndex + PRODUCTS_PER_PAGE
        );

        tbody.replaceChildren();

        // Κανένα αποτέλεσμα
        if (products.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");

            td.colSpan = 6;
            td.textContent =
                "Δεν βρέθηκαν προϊόντα με τα συγκεκριμένα κριτήρια.";
            td.style.textAlign = "center";
            td.style.padding = "20px";

            tr.appendChild(td);
            tbody.appendChild(tr);

            if (pagination) pagination.replaceChildren();
            return;
        }

        // Εμφάνιση προϊόντων τρέχουσας σελίδας
        pageProducts.forEach(product => {
            const tr = document.createElement("tr");

            const formattedPrice =
                (parseFloat(product.price) || 0)
                .toFixed(2)
                .replace(".", ",") + " €";

            const productTitle =
                product.title || product.name || "Χωρίς τίτλο";

            const imageSrc =
                product.image || "/assets/aueb_logo.jpg";

            const displayCat =
                categoryLabels[product.category] || product.category || "-";

            const availability = Number(
                product.availability !== null && product.availability !== undefined ?
                product.availability :
                10
            );

            const imageTd = document.createElement("td");
            const img = document.createElement("img");

            img.src = imageSrc;
            img.alt = productTitle;
            img.style.cssText =
                "width:50px;height:50px;object-fit:contain;border-radius:4px;background:#fff;";

            imageTd.appendChild(img);

            const titleTd = document.createElement("td");
            titleTd.className = "product-name";

            const strong = document.createElement("strong");
            strong.textContent = productTitle;
            titleTd.appendChild(strong);

            const categoryTd = document.createElement("td");
            categoryTd.textContent = displayCat;

            const priceTd = document.createElement("td");
            priceTd.className = "product-price";
            priceTd.textContent = formattedPrice;

            const availabilityTd = document.createElement("td");
            availabilityTd.textContent = availability;

            const actionsTd = document.createElement("td");

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn-edit";
            editBtn.dataset.id = product.id;
            editBtn.textContent = "Επεξεργασία";

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "btn-delete";
            deleteBtn.dataset.id = product.id;
            deleteBtn.textContent = "Διαγραφή";

            deleteBtn.style.cssText =
                "background-color:#c0392b;color:white;border:none;border-radius:6px;cursor:pointer;";

            actionsTd.append(editBtn, deleteBtn);
            tr.append(
                imageTd,
                titleTd,
                categoryTd,
                priceTd,
                availabilityTd,
                actionsTd
            );

            tbody.appendChild(tr);
        });

        attachActionListeners();
        renderAdminPagination(totalPages);
    }

    function renderAdminPagination(totalPages) {
        if (!pagination) return;

        pagination.replaceChildren();

        // Δεν χρειάζεται paging για μία σελίδα
        if (totalPages <= 1) return;

        function addButton(label, page, disabled = false, active = false) {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;

            if (active) {
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", () => {
                if (page === currentPage || page < 1 || page > totalPages) {
                    return;
                }

                currentPage = page;
                renderProductsTable();
            });

            pagination.appendChild(button);
        }

        addButton("« Προηγούμενη", currentPage - 1, currentPage === 1);

        for (let page = 1; page <= totalPages; page++) {
            addButton(
                String(page),
                page,
                false,
                page === currentPage
            );
        }

        addButton(
            "Επόμενη »",
            currentPage + 1,
            currentPage === totalPages
        );
    }


    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentPage = 1;
            renderProductsTable();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            currentPage = 1;
            renderProductsTable();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentPage = 1;
            renderProductsTable();
        });
    }

    function attachActionListeners() {
        document.querySelectorAll(".btn-edit").forEach((btn) => {
            btn.onclick = () => handleEdit(btn.dataset.id);
        });

        document.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.onclick = () => handleDelete(btn.dataset.id);
        });
    }


    function handleEdit(id) {
        const products = getProducts();
        const prod = products.find((p) => String(p.id) === String(id));
        if (!prod) return;

        idInput.value = prod.id;
        titleInput.value = prod.title || prod.name || "";
        categoryInput.value = prod.category || "";
        priceInput.value = prod.price || "";
        descInput.value = prod.description || "";
        notesInput.value = Array.isArray(prod.notes) ? prod.notes.join("\n") : prod.notes || "";

        // load image
        if (prod.image) {
            displayImage(prod.image);
        } else {
            clearImage();
        }
        availabilityInput.value =
            prod.availability !== null && prod.availability !== undefined ?
            prod.availability :
            10;

        formTitle.textContent = `Επεξεργασία Προϊόντος #${prod.id}`;
        submitBtn.value = "Ενημέρωση Προϊόντος";
        if (cancelEditBtn) cancelEditBtn.classList.remove("hidden");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }


    let pendingDeletion = null;
    const UNDO_TIMEOUT = 5000; ///5 sec

    function showUndoToast(product, originalIndex) {
        //afairehs prohgoumenou minimatos
        if (pendingDeletion) {
            clearTimeout(pendingDeletion.timer);
            pendingDeletion.toast.remove();
            pendingDeletion = null;
        }

        const toast = document.createElement("div");
        toast.className = "undo-toast";
        toast.setAttribute("role", "status");

        const message = document.createElement("span");
        message.textContent =
            `Διαγράφηκε το προϊόν «${product.title || product.name}».`;

        const undoBtn = document.createElement("button");
        undoBtn.type = "button";
        undoBtn.textContent = "Αναίρεση";

        toast.append(message, undoBtn);
        document.body.appendChild(toast);

        const deletion = {
            product,
            originalIndex,
            toast,
            timer: null
        };

        pendingDeletion = deletion;

        deletion.timer = setTimeout(() => {
            toast.remove();

            if (pendingDeletion === deletion) {
                pendingDeletion = null;
            }
        }, UNDO_TIMEOUT);

        undoBtn.addEventListener("click", () => {
            if (pendingDeletion !== deletion) return;

            clearTimeout(deletion.timer);

            let products = getProducts();

            const alreadyExists = products.some(
                p => String(p.id) === String(product.id)
            );

            if (!alreadyExists) {
                products.splice(
                    Math.min(originalIndex, products.length),
                    0,
                    product
                );

                saveProducts(products);
            }

            toast.remove();
            pendingDeletion = null;

            renderProductsTable();
            showAlert("Η διαγραφή αναιρέθηκε. Το προϊόν επανήλθε!");
        });
    }



    async function handleDelete(id) {
        const confirmed = typeof showConfirm === "function" ?
            await showConfirm(
                `Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν #${id};`
            ) :
            confirm(
                `Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν #${id};`
            );

        if (!confirmed) return;

        const products = getProducts();

        // Βρίσκουμε το προϊόν και την αρχική του θέση.
        const originalIndex = products.findIndex(
            p => String(p.id) === String(id)
        );

        if (originalIndex === -1) return;

        const deletedProduct = products[originalIndex];

        // Διαγράφουμε το προϊόν από το localStorage.
        const updatedProducts = products.filter(
            p => String(p.id) !== String(id)
        );

        saveProducts(updatedProducts);

        // Αν ήταν το προϊόν που επεξεργαζόμασταν, καθαρίζουμε τη φόρμα.
        if (idInput.value === String(id)) {
            resetForm();
        }

        // Ανανέωση πίνακα και εμφάνιση κουμπιού αναίρεσης.
        renderProductsTable();
        showUndoToast(deletedProduct, originalIndex);
    }


    function resetForm() {
        productForm.reset();
        idInput.value = "";
        clearImage();
        formTitle.textContent = "Προσθήκη Νέου Προϊόντος";
        submitBtn.value = "Προσθήκη Προϊόντος";
        if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", resetForm);
    }

    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const price = parseFloat(priceInput.value);
        const image = imageInput.value.trim();
        const description = descInput.value.trim();
        const notesRaw = notesInput.value.trim();
        const availability = Number(availabilityInput.value);


        if (!title) {
            showAlert("Παρακαλώ συμπληρώστε τον τίτλο του προϊόντος.");
            titleInput.focus();
            return;
        }

        if (!category) {
            showAlert("Παρακαλώ επιλέξτε κατηγορία.");
            categoryInput.focus();
            return;
        }

        if (isNaN(price) || price <= 0) {
            showAlert("Παρακαλώ εισάγετε μια έγκυρη θετική τιμή.");
            priceInput.focus();
            return;
        }

        if (!image) {
            showAlert("Παρακαλώ προσθέστε μια εικόνα για το προϊόν.");
            return;
        }

        const notesArray = notesRaw ?
            notesRaw.split("\n").map((n) => n.trim()).filter(Boolean) : [];
        let products = getProducts();
        const existingId = idInput.value;

        if (existingId) {
            // Update
            const index = products.findIndex((p) => String(p.id) === String(existingId));
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    title: title,
                    name: title,
                    category: category,
                    price: price,
                    image: image,
                    description: description,
                    notes: notesArray,
                    availability: availability
                };
                showAlert("Το προϊόν ενημερώθηκε επιτυχώς!");
            }
        } else {
            // Create
            const existingIds = products.map((p) => Number(p.id) || 0);
            const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

            const newProduct = {
                id: nextId,
                title: title,
                name: title,
                category: category,
                price: price,
                availability: availability,
                image: image,
                description: description,
                notes: notesArray
            };

            products.push(newProduct);
            showAlert("Το νέο προϊόν προστέθηκε επιτυχώς!");
        }

        saveProducts(products);
        resetForm();
        renderProductsTable();
    });

    // Αρχικό γέμισμα του πίνακα κατά τη φόρτωση
    renderProductsTable();
});