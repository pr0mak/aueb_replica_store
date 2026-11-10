
document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("productsTbody");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const pagination = document.getElementById("pagination");


    //h kathgoria ths sugekrimenhs selidas
    const category = document.body.dataset.category;

    //settings of paging
    const PRODUCTS_PER_PAGE = 1; //KANONIKA PREPEI NA EINAI 10
    let currentPage = 1;

    //diavazoume ta proionta apo to localstorage
    function loadProducts() {
        try {
            return JSON.parse(localStorage.getItem("products")) || [];
        } catch (error) {
            console.error("Σφάλμα ανάγνωσης προϊόντων:", error);
            return [];
        }
    }

    //filtrarisma kai tajinomhsh olwn twn proiontwn
    function getFilteredAndSortedProducts() {
        const searchText = searchInput.value
            .trim()
            .toLocaleLowerCase("el");

        let products = loadProducts().filter(product =>
            product.category === category
        );

        //anazhthsh se ola ta proionta ths kathgorias
        products = products.filter(product =>
            String(product.name || product.title || "")
                .toLocaleLowerCase("el")
                .includes(searchText)
        );

        //tajinomhsh olwn twn apotelesmatwn
        switch (sortSelect.value) {
            case "name-asc":
                products.sort((a, b) =>
                    String(a.name || a.title || "")
                        .localeCompare(
                            String(b.name || b.title || ""),
                            "el"
                        )
                );
                break;

            case "name-desc":
                products.sort((a, b) =>
                    String(b.name || b.title || "")
                        .localeCompare(
                            String(a.name || a.title || ""),
                            "el"
                        )
                );
                break;

            case "price-asc":
                products.sort((a, b) =>
                    Number(a.price) - Number(b.price)
                );
                break;

            case "price-desc":
                products.sort((a, b) =>
                    Number(b.price) - Number(a.price)
                );
                break;
        }

        return products;
    }

    //emfanish koumpiwn paging
    function renderPagination(totalPages) {
        pagination.replaceChildren();

        if (totalPages <= 1) {
            return;
        }

        function createPageButton(label, page, options = {}) {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.disabled = options.disabled || false;

            if (options.active) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", () => {
                currentPage = page;
                renderProducts();
            });

            pagination.appendChild(button);
        }

        //prohgoumenh selida
        createPageButton("‹ Προηγούμενη", currentPage - 1, { disabled: currentPage === 1 });

        //arithmoi selidwn
        for (let page = 1; page <= totalPages; page++) {
            createPageButton(
                String(page),
                page,
                { active: page === currentPage }
            );
        }

        //next page
        createPageButton("Επόμενη ›", currentPage + 1, { disabled: currentPage === totalPages });
    }

    
    function renderProducts() {
        //pairnoume ta products meta thn anazhthsh kai thn tajinomhsh
        const products = getFilteredAndSortedProducts();

        //ypologizoume poses selides xreiazontai
        const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE); //cel strogilopoiei

        //ejasfalizoume oti h trexousa selida einai egurh
        if (totalPages === 0) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        //epilgeoume mono ta proionta ths trexousas selidas
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const pageProducts = products.slice(
            startIndex,
            startIndex + PRODUCTS_PER_PAGE
        );

        tbody.replaceChildren();

        if (products.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.textContent = "Δεν βρέθηκαν προϊόντα.";

            row.appendChild(cell);
            tbody.appendChild(row);

            pagination.replaceChildren();
            return;
        }

        pageProducts.forEach(product => {
            const row = document.createElement("tr");
            const productName = product.name || product.title || "";

            const productUrl =
                `product.html?id=${encodeURIComponent(product.id)}`;

            //eikona kai link
            const imageCell = document.createElement("td");
            const imageLink = document.createElement("a");
            imageLink.href = productUrl;

            const img = document.createElement("img");
            img.src = product.image || "";
            img.alt = productName;

            const imageName = document.createElement("span");
            imageName.textContent = productName;

            imageLink.append(img, imageName);
            imageCell.appendChild(imageLink);

            //onoma proiontos
            const nameCell = document.createElement("td");
            nameCell.className = "product-name";

            const nameLink = document.createElement("a");
            nameLink.href = productUrl;
            nameLink.textContent = productName;

            nameCell.appendChild(nameLink);

            //timh
            const priceCell = document.createElement("td");
            priceCell.className = "product-price";
            priceCell.textContent =
                `${Number(product.price).toLocaleString("el-GR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} €`;

            row.append(imageCell, nameCell, priceCell);
            tbody.appendChild(row);
        });

        renderPagination(totalPages);
    }

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderProducts();
    });

    sortSelect.addEventListener("change", () => {
        currentPage = 1;
        renderProducts();
    });

    //arikh fortwsh proiontwn otan fortwthei h selida
    renderProducts();
});
