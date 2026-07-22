(function () {
    var grid = document.getElementById('categoryGrid');
    if (!grid) return;
    if (typeof CATEGORIES === 'undefined') return;

    var html = '';

    CATEGORIES.forEach(function (cat) {
        html += '<a href="shop.html?category=' + cat.slug + '" class="category-card">' +
            '<div class="category-image">' +
                '<img src="' + cat.image + '" alt="' + cat.name + '" loading="lazy" width="400" height="400" onerror="console.warn(\'Category image not found: ' + cat.image + '\')">' +
                '<div class="category-overlay">' +
                    '<span class="category-shop-btn">Shop Now</span>' +
                '</div>' +
            '</div>' +
            '<h3 class="category-name">' + cat.name + '</h3>' +
        '</a>';
    });

    grid.innerHTML = html;
})();