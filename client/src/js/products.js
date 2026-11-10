document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const tbody = document.querySelector('#productsTable tbody');

    //an den uparxei to table stamatame
    if (!tbody || !searchInput || !sortSelect) return;

    const originalRows = Array.from(tbody.querySelectorAll('tr'));

    function updateProducts() {
        const query = searchInput.value.toLowerCase().trim();
        const sortValue = sortSelect.value;

        //filtrarisma me vash thn anazhthsh
        let filteredRows = originalRows.filter(row => {
            const name = row.getAttribute('data-name')?.toLowerCase() || '';
            return name.includes(query);
        });

        //tajinomhsh
        filteredRows.sort((a, b) => {
            const nameA = a.getAttribute('data-name') || '';
            const nameB = b.getAttribute('data-name') || '';
            const priceA = parseFloat(a.getAttribute('data-price')) || 0;
            const priceB = parseFloat(b.getAttribute('data-price')) || 0;

            if (sortValue === 'name-asc') {
                return nameA.localeCompare(nameB, 'el');
            } else if (sortValue === 'name-desc') {
                return nameB.localeCompare(nameA, 'el');
            } else if (sortValue === 'price-asc') {
                return priceA - priceB;
            } else if (sortValue === 'price-desc') {
                return priceB - priceA;
            }
            return 0;
        });

        //update table
        tbody.innerHTML = '';
        filteredRows.forEach(row => tbody.appendChild(row));
    }

    searchInput.addEventListener('input', updateProducts);
    sortSelect.addEventListener('change', updateProducts);
});