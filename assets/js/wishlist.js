(function () {
    var container = document.getElementById('wishlistItems');
    var empty = document.getElementById('wishlistEmpty');
    var label = document.getElementById('wishlistCountLabel');

    function render() {
        var items = Wishlist.getItems();
        var ids = Object.keys(items);

        if (ids.length === 0) {
            container.innerHTML = '';
            empty.style.display = 'flex';
            label.textContent = '';
            return;
        }

        empty.style.display = 'none';
        label.textContent = ids.length + ' item' + (ids.length > 1 ? 's' : '');

        container.innerHTML = ids.map(function (id) {
            var item = items[id];
            var name = item.name.replace(/'/g, '\\\'');
            var price = '₹' + item.price.toLocaleString('en-IN');

            return '<div class="wishlist-item" data-id="' + id + '">' +
                '<div class="wishlist-item-image">' +
                    '<a href="product.html?id=' + id + '"><img src="' + item.image + '" alt="' + name + '" loading="lazy"></a>' +
                '</div>' +
                '<div class="wishlist-item-info">' +
                    '<a href="product.html?id=' + id + '" class="wishlist-item-name">' + item.name + '</a>' +
                    '<div class="wishlist-item-price">' + price + '</div>' +
                    '<div class="wishlist-item-actions">' +
                        '<button type="button" class="wishlist-cart-btn" data-action="addcart">Add to Cart</button>' +
                    '</div>' +
                '</div>' +
                '<button type="button" class="wishlist-item-remove" data-action="remove" aria-label="Remove from wishlist"><i class="fas fa-times"></i></button>' +
            '</div>';
        }).join('');

        container.querySelectorAll('[data-action="addcart"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = this.closest('.wishlist-item').dataset.id;
                var item = Wishlist.getItems()[id];
                if (item && typeof Cart !== 'undefined') {
                    Cart.add({ id: item.id, name: item.name, price: item.price, image: item.image });
                    this.textContent = 'Added ✓';
                    this.classList.add('added');
                    setTimeout(function () {
                        this.textContent = 'Add to Cart';
                        this.classList.remove('added');
                    }.bind(this), 2000);
                }
            });
        });

        container.querySelectorAll('[data-action="remove"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = this.closest('.wishlist-item').dataset.id;
                Wishlist.remove(id);
                render();
                Wishlist.updateBadge();
                if (typeof Toast !== 'undefined') Toast.success('Removed from Wishlist', 'Wishlist');
            });
        });
    }

    render();
})();
