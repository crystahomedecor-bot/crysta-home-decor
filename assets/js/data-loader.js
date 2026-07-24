(function() {
    var baseUrl = typeof API_BASE_URL !== 'undefined' && API_BASE_URL ? API_BASE_URL : '';
    var ts = Date.now();
    var files = ['data/settings.js', 'data/categories.js', 'data/products.js'];
    for (var i = 0; i < files.length; i++) {
        document.write('<script src="' + baseUrl + '/' + files[i] + '?_t=' + ts + '"><\/script>');
    }
    var imgBase = typeof IMAGE_BASE_URL !== 'undefined' && IMAGE_BASE_URL ? IMAGE_BASE_URL : baseUrl;
    if (imgBase && typeof PRODUCTS !== 'undefined') {
        for (var i = 0; i < PRODUCTS.length; i++) {
            var p = PRODUCTS[i];
            if (p.images) {
                for (var j = 0; j < p.images.length; j++) {
                    var img = p.images[j];
                    if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                        p.images[j] = imgBase.replace(/\/+$/, '') + '/' + img.replace(/^\/+/, '');
                    }
                }
            }
        }
    }
})();
