(function() {
    var baseUrl = typeof API_BASE_URL !== 'undefined' && API_BASE_URL ? API_BASE_URL : '';
    var ts = Date.now();
    var files = ['data/settings.js', 'data/categories.js', 'data/products.js'];

    function loadViaXHR(url) {
        try {
            var x = new XMLHttpRequest();
            x.open('GET', url, false);
            x.send();
            if (x.status >= 200 && x.status < 300) {
                eval(x.responseText);
                return true;
            }
        } catch(e) {}
        return false;
    }

    var ok = true;
    for (var i = 0; i < files.length; i++) {
        if (!loadViaXHR(baseUrl + '/' + files[i] + '?_t=' + ts)) {
            ok = false;
            break;
        }
    }

    if (!ok) {
        // Fallback: document.write (slower, blocked by Chrome on slow responses)
        for (var i = 0; i < files.length; i++) {
            document.write('<script src="' + baseUrl + '/' + files[i] + '?_t=' + ts + '"><\/script>');
        }
        document.write('<' + 'script>var _api="undefined"!==typeof API_BASE_URL&&API_BASE_URL?API_BASE_URL:"";var _img="undefined"!==typeof IMAGE_BASE_URL&&IMAGE_BASE_URL?IMAGE_BASE_URL:_api;if(_img&&"undefined"!==typeof PRODUCTS&&PRODUCTS){for(var _i=0;_i<PRODUCTS.length;_i++){var _p=PRODUCTS[_i];if(_p.images){for(var _j=0;_j<_p.images.length;_j++){var _im=_p.images[_j];if(_im&&0!==_im.indexOf("http")&&0!==_im.indexOf("data:")){_p.images[_j]=_img.replace(/\/+$/,"")+"/"+_im.replace(/^\/+/,"")}}}}}}<' + '/script>');
    } else {
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
    }
})();
