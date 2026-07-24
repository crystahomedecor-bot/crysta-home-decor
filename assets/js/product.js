(function () {
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');

    if (!productId) {
        document.getElementById('pdEmpty').style.display = 'block';
        return;
    }

    var product = PRODUCTS.find(function (p) { return p.id === productId; });

    if (!product) {
        document.getElementById('pdEmpty').style.display = 'block';
        return;
    }

    var discount = Math.round((1 - product.price / product.oldPrice) * 100);
    var buyLink = 'https://wa.me/919690152441?text=Hi%20I%20want%20to%20order%20' + encodeURIComponent(product.name) + '%20(Product%20ID:%20' + product.id + ')';
    var waLink = 'https://wa.me/919690152441?text=Hi%20I%20want%20to%20order%20' + encodeURIComponent(product.name);

    document.getElementById('pdWrapper').style.display = 'flex';

    document.title = product.name + ' — CRYSTA HOME DECOR';

    var catName = product.category.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    document.getElementById('pdBreadcrumbCat').textContent = catName;
    document.getElementById('pdBreadcrumbCat').href = 'shop.html?category=' + product.category;
    document.getElementById('pdBreadcrumbName').textContent = product.name;

    document.getElementById('pdName').textContent = product.name;
    document.getElementById('pdPrice').textContent = '₹' + product.price.toLocaleString('en-IN');
    document.getElementById('pdOldPrice').textContent = '₹' + product.oldPrice.toLocaleString('en-IN');
    document.getElementById('pdSave').textContent = 'Save ₹' + (product.oldPrice - product.price).toLocaleString('en-IN');
    document.getElementById('pdDesc').textContent = product.description || 'Premium quality product from CRYSTA HOME DECOR.';

    if (product.stock > 0) {
        document.getElementById('pdStock').textContent = 'In Stock';
        document.getElementById('pdStock').className = 'pd-stock in-stock';
    } else {
        document.getElementById('pdStock').textContent = 'Out of Stock';
        document.getElementById('pdStock').className = 'pd-stock out-of-stock';
    }

    document.getElementById('pdBuyNow').href = buyLink;
    document.getElementById('pdWaOrder').href = waLink;

    if (discount > 0) {
        document.getElementById('pdBadge').textContent = '-' + discount + '%';
    }

    document.querySelector('meta[name="description"]').content = product.name + ' — ' + (product.description || 'Premium home decor from CRYSTA HOME DECOR.');

    var galleryPrev = document.getElementById('pdGalleryPrev');
    var galleryNext = document.getElementById('pdGalleryNext');
    var mainImg = document.getElementById('pdMainImage');
    var thumbs = document.getElementById('pdThumbs');
    var current = 0;

    function showImage(index) {
        current = index;
        mainImg.src = imgUrl(product.images[index]);
        mainImg.alt = product.name;
        var thumbImgs = thumbs.querySelectorAll('.pd-thumb-img');
        thumbImgs.forEach(function (t, i) {
            t.classList.toggle('active', i === index);
        });
    }

    product.images.forEach(function (img, idx) {
        var thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'pd-thumb-img' + (idx === 0 ? ' active' : '');
        thumb.style.backgroundImage = "url('" + imgUrl(img) + "')";
        thumb.setAttribute('aria-label', 'View image ' + (idx + 1));
        thumb.addEventListener('click', function () { showImage(idx); });
        thumbs.appendChild(thumb);
    });

    showImage(0);

    if (product.images.length <= 1) {
        galleryPrev.style.display = 'none';
        galleryNext.style.display = 'none';
    }

    galleryPrev.addEventListener('click', function () {
        var prev = (current - 1 + product.images.length) % product.images.length;
        showImage(prev);
    });

    galleryNext.addEventListener('click', function () {
        var next = (current + 1) % product.images.length;
        showImage(next);
    });

    var specsTable = document.getElementById('pdSpecsTable');
    var specs = product.specifications;
    if (specs) {
        var specKeys = Object.keys(specs);
        if (specKeys.length > 0) {
            specKeys.forEach(function (key) {
                var row = specsTable.insertRow();
                var cellLabel = row.insertCell();
                cellLabel.className = 'pd-spec-label';
                cellLabel.textContent = key;
                var cellValue = row.insertCell();
                cellValue.className = 'pd-spec-value';
                cellValue.textContent = specs[key];
            });
        } else {
            document.getElementById('pdSpecs').style.display = 'none';
        }
    } else {
        document.getElementById('pdSpecs').style.display = 'none';
    }

    var related = PRODUCTS.filter(function (p) { return p.category === product.category && p.id !== product.id; });
    var relatedGrid = document.getElementById('pdRelatedGrid');

    if (related.length === 0) {
        document.getElementById('pdRelated').style.display = 'none';
    } else {
        var relatedHtml = '';
        related.forEach(function (rp) {
            var rpDiscount = Math.round((1 - rp.price / rp.oldPrice) * 100);
            relatedHtml += '<a href="product.html?id=' + rp.id + '" class="pd-related-card">' +
                '<div class="pd-related-media">' +
                    '<img src="' + imgUrl(rp.images[0]) + '" alt="' + rp.name + '" loading="lazy">' +
                    (rpDiscount > 0 ? '<span class="pd-related-badge">-' + rpDiscount + '%</span>' : '') +
                '</div>' +
                '<div class="pd-related-body">' +
                    '<h4>' + rp.name + '</h4>' +
                    '<div class="pd-related-pricing">' +
                        '<span class="pd-related-price">₹' + rp.price.toLocaleString('en-IN') + '</span>' +
                        '<span class="pd-related-old">₹' + rp.oldPrice.toLocaleString('en-IN') + '</span>' +
                    '</div>' +
                '</div>' +
            '</a>';
        });
        relatedGrid.innerHTML = relatedHtml;
    }

    document.getElementById('pdAddCart').addEventListener('click', function () {
        if (typeof Cart !== 'undefined') {
            Cart.add({
                id: product.id,
                name: product.name,
                price: product.price,
                image: imgUrl(product.images[0])
            });
            this.textContent = 'Added ✓';
            this.classList.add('added');
            setTimeout(function () {
                this.textContent = 'Add to Cart';
                this.classList.remove('added');
            }.bind(this), 2000);
        }
    });

    document.getElementById('pdWishBtn').addEventListener('click', function () {
        var icon = this.querySelector('i');
        if (Wishlist.has(product.id)) {
            Wishlist.remove(product.id);
            icon.className = 'far fa-heart';
            if (typeof Toast !== 'undefined') Toast.success('Removed from Wishlist', 'Wishlist');
        } else {
            Wishlist.add({ id: product.id, name: product.name, price: product.price, image: imgUrl(product.images[0]) });
            icon.className = 'fas fa-heart';
            if (typeof Toast !== 'undefined') Toast.success('Added to Wishlist', 'Wishlist');
        }
    });

    // Initial heart state
    if (Wishlist.has(product.id)) {
        document.getElementById('pdWishBtn').querySelector('i').className = 'fas fa-heart';
    }
})();