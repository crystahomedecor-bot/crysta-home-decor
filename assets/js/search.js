(function () {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (!query || !query.trim()) {
        document.getElementById('searchEmpty').style.display = 'block';
        document.getElementById('searchTitle').textContent = 'Search';
        return;
    }

    var q = query.trim().toLowerCase();

    document.getElementById('searchTitle').textContent = 'Results for "' + query.trim() + '"';

    var matches = PRODUCTS.filter(function (p) {
        return p.name.toLowerCase().includes(q) ||
               p.category.replace(/-/g, ' ').toLowerCase().includes(q) ||
               (p.description && p.description.toLowerCase().includes(q));
    });

    if (matches.length === 0) {
        document.getElementById('searchEmpty').style.display = 'block';
        document.getElementById('searchCount').textContent = '0 results for "' + query.trim() + '"';
        return;
    }

    document.getElementById('searchCount').textContent = matches.length + ' result' + (matches.length > 1 ? 's' : '') + ' for "' + query.trim() + '"';

    var grid = document.getElementById('searchGrid');
    var html = '';

    matches.forEach(function (product) {
        var discount = Math.round((1 - product.price / product.oldPrice) * 100);
        var buyLink = 'https://wa.me/919690152441?text=Hi%20I%20want%20to%20order%20' + encodeURIComponent(product.name) + '%20(Product%20ID:%20' + product.id + ')';

        html += '<div class="sp-card" data-id="' + product.id + '">' +
            '<div class="sp-card-media">' +
                '<div class="sp-slider" id="spSlider-' + product.id + '">';

        product.images.forEach(function (img, idx) {
            html += '<img src="' + img + '" alt="' + product.name + '" class="sp-slide' + (idx === 0 ? ' active' : '') + '" loading="lazy">';
        });

        html += '</div>';

        if (product.images.length > 1) {
            html += '<button type="button" class="sp-slide-prev" data-id="' + product.id + '" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>' +
                '<button type="button" class="sp-slide-next" data-id="' + product.id + '" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>';
        }

        if (discount > 0) {
            html += '<span class="sp-badge">-' + discount + '%</span>';
        }

        html += '</div>' +
            '<div class="sp-card-body">' +
                '<h3 class="sp-name">' + product.name + '</h3>' +
                '<div class="sp-pricing">' +
                    '<span class="sp-price">₹' + product.price.toLocaleString('en-IN') + '</span>' +
                    '<span class="sp-old-price">₹' + product.oldPrice.toLocaleString('en-IN') + '</span>' +
                '</div>' +
                '<div class="sp-actions">' +
                    '<button type="button" class="sp-wish-btn" data-id="' + product.id + '" aria-label="Add to wishlist"><i class="far fa-heart"></i></button>' +
                    '<a href="' + buyLink + '" class="sp-buy-btn" target="_blank" rel="noopener noreferrer">Buy Now <i class="fas fa-arrow-right"></i></a>' +
                    '<a href="https://wa.me/919690152441?text=Hi%20I%20want%20to%20order%20' + encodeURIComponent(product.name) + '" class="sp-wa-btn" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Order</a>' +
                '</div>' +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;

    grid.addEventListener('click', function (e) {
        var wishBtn = e.target.closest('.sp-wish-btn');
        if (wishBtn) {
            e.preventDefault();
            e.stopPropagation();
            var id = wishBtn.dataset.id;
            var p = PRODUCTS.find(function (p) { return p.id === id; });
            if (!p) return;
            var icon = wishBtn.querySelector('i');
            if (Wishlist.has(id)) {
                Wishlist.remove(id);
                icon.className = 'far fa-heart';
                if (typeof Toast !== 'undefined') Toast.success('Removed from Wishlist', 'Wishlist');
            } else {
                Wishlist.add({ id: p.id, name: p.name, price: p.price, image: p.images[0] });
                icon.className = 'fas fa-heart';
                if (typeof Toast !== 'undefined') Toast.success('Added to Wishlist', 'Wishlist');
            }
            return;
        }

        var prevBtn = e.target.closest('.sp-slide-prev');
        var nextBtn = e.target.closest('.sp-slide-next');

        if (prevBtn || nextBtn) {
            var btn = prevBtn || nextBtn;
            var id = btn.dataset.id;
            var slider = document.getElementById('spSlider-' + id);
            if (!slider) return;
            var slides = slider.querySelectorAll('.sp-slide');
            var current = 0;
            slides.forEach(function (s, i) { if (s.classList.contains('active')) current = i; });
            slides[current].classList.remove('active');
            current = nextBtn ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length;
            slides[current].classList.add('active');
            e.stopPropagation();
            return;
        }

        var card = e.target.closest('.sp-card');
        if (card) {
            window.location.href = 'product.html?id=' + card.dataset.id;
        }
    });

    // Mark wishlist hearts for already-wishlisted items
    document.querySelectorAll('.sp-wish-btn').forEach(function(btn) {
        if (Wishlist.has(btn.dataset.id)) {
            var icon = btn.querySelector('i');
            if (icon) icon.className = 'fas fa-heart';
        }
    });
})();