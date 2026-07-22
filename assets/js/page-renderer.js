(function() {
    var slug = document.body.getAttribute('data-page');
    if (!slug) return;
    var STORAGE_KEY = 'crystaPages';
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        var data = JSON.parse(raw);
        var page = data[slug];
        if (!page) return;
        var titleEl = document.getElementById('pageTitle');
        var contentEl = document.getElementById('pageContent');
        if (titleEl) titleEl.textContent = page.title;
        if (contentEl) contentEl.innerHTML = page.content;
        document.title = page.title + ' \u2014 CRYSTA HOME DECOR';
    } catch(e) {}
})();
