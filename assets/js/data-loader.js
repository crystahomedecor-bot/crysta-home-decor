(function() {
    var baseUrl = typeof API_BASE_URL !== 'undefined' && API_BASE_URL ? API_BASE_URL : '';
    var ts = Date.now();
    var files = ['data/settings.js', 'data/categories.js', 'data/products.js'];
    for (var i = 0; i < files.length; i++) {
        document.write('<script src="' + baseUrl + '/' + files[i] + '?_t=' + ts + '"><\/script>');
    }

    // Pre-fix all image paths in data so they're absolute from the start.
    // This runs synchronously after the data files have loaded via document.write.
    var imgBase = typeof IMAGE_BASE_URL !== 'undefined' && IMAGE_BASE_URL ? IMAGE_BASE_URL : (typeof API_BASE_URL !== 'undefined' && API_BASE_URL ? API_BASE_URL : '');
    if (!imgBase) return;

    function fix(str) {
        if (!str || str.startsWith('http') || str.startsWith('data:') || str.startsWith('blob:')) return str;
        return imgBase.replace(/\/+$/, '') + '/' + str.replace(/^\/+/, '');
    }

    // Try immediately (works when document.write is synchronous)
    function fixData() {
        if (typeof PRODUCTS !== 'undefined') {
            for (var i = 0; i < PRODUCTS.length; i++) {
                var imgs = PRODUCTS[i].images;
                if (imgs) {
                    for (var j = 0; j < imgs.length; j++) {
                        imgs[j] = fix(imgs[j]);
                    }
                }
            }
        }
        if (typeof CATEGORIES !== 'undefined') {
            for (var i = 0; i < CATEGORIES.length; i++) {
                CATEGORIES[i].image = fix(CATEGORIES[i].image);
            }
        }
        if (typeof BANNERS !== 'undefined') {
            for (var i = 0; i < BANNERS.length; i++) {
                BANNERS[i].imageDesktop = fix(BANNERS[i].imageDesktop);
                BANNERS[i].imageMobile = fix(BANNERS[i].imageMobile);
            }
        }
    }

    fixData();

    // Also try on DOMContentLoaded as fallback (covers async edge cases)
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fixData);
    }
})();
