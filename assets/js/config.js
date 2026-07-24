var API_BASE_URL = 'http://localhost:3456';
var IMAGE_BASE_URL = API_BASE_URL;

function imgUrl(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    var base = typeof IMAGE_BASE_URL !== 'undefined' && IMAGE_BASE_URL ? IMAGE_BASE_URL : (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '');
    if (!base) return path;
    return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}
