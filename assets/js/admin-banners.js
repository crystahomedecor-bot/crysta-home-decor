function esc(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

function imgUrl(path) {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('blob:')) return path;
    var base = typeof IMAGE_BASE_URL !== 'undefined' ? IMAGE_BASE_URL : (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '');
    if (!base) return path;
    return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

var banners = [];

function initBanners() {
    if (typeof BANNERS === 'undefined') return;
    banners = JSON.parse(JSON.stringify(BANNERS));
    renderBanners();
}

function renderBanners() {
    var body = document.getElementById('bannerBody');
    if (!banners || banners.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-images"></i><br>No banners yet. Click "Add Banner" to create one.</td></tr>';
        document.getElementById('bannerResultCount').textContent = '';
        return;
    }
    document.getElementById('bannerResultCount').textContent = banners.length + ' banner' + (banners.length === 1 ? '' : 's');

    var html = '';
    for (var i = 0; i < banners.length; i++) {
        var b = banners[i];
        var imgSrc = b.imageDesktop || '';
        html += '<tr draggable="true" data-id="' + esc(b.id) + '">';
        html += '<td>' + (imgSrc
            ? '<img src="' + esc(imgUrl(imgSrc)) + '" class="cat-thumb" alt="" onerror="this.outerHTML=\'<div class=cat-thumb-placeholder><i class=&quot;fas fa-image&quot;></i></div>\'">'
            : '<div class="cat-thumb-placeholder"><i class="fas fa-image"></i></div>') + '</td>';
        html += '<td><strong>' + esc(b.title) + '</strong></td>';
        html += '<td>' + esc(b.buttonText || '-') + '</td>';
        html += '<td><code>' + esc(b.buttonUrl || '-') + '</code></td>';
        html += '<td style="text-align:center">' + (b.active !== false
            ? '<span class="sbadge sbadge-active">Active</span>'
            : '<span class="sbadge sbadge-draft">Draft</span>') + '</td>';
        html += '<td style="text-align:center">' + (b.order || 0) + '</td>';
        html += '<td>';
        html += '<div class="row-actions">';
        html += '<button type="button" class="btn btn-xs btn-ghost ban-edit" data-id="' + esc(b.id) + '" title="Edit"><i class="fas fa-edit"></i></button>';
        html += '<button type="button" class="btn btn-xs btn-ghost ban-preview" data-id="' + esc(b.id) + '" title="Preview"><i class="fas fa-eye"></i></button>';
        html += '<button type="button" class="btn btn-xs btn-ghost ban-duplicate" data-id="' + esc(b.id) + '" title="Duplicate"><i class="fas fa-copy"></i></button>';
        html += '<button type="button" class="btn btn-xs btn-ghost ban-delete" data-id="' + esc(b.id) + '" title="Delete" style="color:#e74c3c"><i class="fas fa-trash"></i></button>';
        html += '</div></td>';
        html += '</tr>';
    }
    body.innerHTML = html;
}

function openBannerEditor(id) {
    document.getElementById('beStatus').textContent = '';
    document.getElementById('beFileDesktop').value = '';
    document.getElementById('beFileMobile').value = '';
    document.getElementById('beEditorTitle').textContent = id ? 'Edit Banner' : 'Add Banner';

    if (id) {
        var b = null;
        for (var i = 0; i < banners.length; i++) {
            if (banners[i].id === id) { b = banners[i]; break; }
        }
        if (!b) return;
        document.getElementById('beTitle').value = b.title;
        document.getElementById('beSubtitle').value = b.subtitle || '';
        document.getElementById('beButtonText').value = b.buttonText || '';
        document.getElementById('beButtonUrl').value = b.buttonUrl || '';
        document.getElementById('beOrder').value = b.order || 0;
        document.getElementById('beOverlay').value = b.overlayOpacity || 0.3;
        document.getElementById('beTextPosition').value = b.textPosition || 'center';
        document.getElementById('beActive').checked = b.active !== false;
        renderBannerPreview('desktop', b.imageDesktop || '');
        renderBannerPreview('mobile', b.imageMobile || '');
        document.getElementById('beEditId').value = id;
    } else {
        document.getElementById('beTitle').value = '';
        document.getElementById('beSubtitle').value = '';
        document.getElementById('beButtonText').value = '';
        document.getElementById('beButtonUrl').value = '';
        document.getElementById('beOrder').value = banners.length;
        document.getElementById('beOverlay').value = 0.3;
        document.getElementById('beTextPosition').value = 'center';
        document.getElementById('beActive').checked = true;
        renderBannerPreview('desktop', '');
        renderBannerPreview('mobile', '');
        document.getElementById('beEditId').value = '';
    }

    document.getElementById('bannerEditorModal').classList.add('active');
}

function closeBannerEditor() {
    document.getElementById('bannerEditorModal').classList.remove('active');
}

function renderBannerPreview(type, path) {
    var container = document.getElementById('be' + type.charAt(0).toUpperCase() + type.slice(1) + 'Preview');
    if (path) {
        container.innerHTML = '<img src="' + esc(imgUrl(path)) + '" class="cat-thumb-preview" alt="" onerror="this.innerHTML=\'<i class=\\\\"fas fa-image-broken\\\\"></i>\'">';
    } else {
        container.innerHTML = '<div class="cat-thumb-placeholder-preview"><i class="fas fa-image"></i></div>';
    }
}

function saveBanner() {
    var title = document.getElementById('beTitle').value.trim();
    var statusEl = document.getElementById('beStatus');
    if (!title) { statusEl.textContent = 'Title is required'; return; }

    statusEl.textContent = 'Saving...';
    var saveBtn = document.getElementById('beSaveBtn');
    saveButtonState(saveBtn, 'saving');

    var formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', document.getElementById('beSubtitle').value.trim());
    formData.append('buttonText', document.getElementById('beButtonText').value.trim());
    formData.append('buttonUrl', document.getElementById('beButtonUrl').value.trim());
    formData.append('order', document.getElementById('beOrder').value);
    formData.append('overlayOpacity', document.getElementById('beOverlay').value);
    formData.append('textPosition', document.getElementById('beTextPosition').value);
    formData.append('active', document.getElementById('beActive').checked);

    var editId = document.getElementById('beEditId').value;
    if (editId) formData.append('editId', editId);

    var desktopFile = document.getElementById('beFileDesktop');
    if (desktopFile.files && desktopFile.files.length > 0) {
        formData.append('desktopImage', desktopFile.files[0]);
    }
    var mobileFile = document.getElementById('beFileMobile');
    if (mobileFile.files && mobileFile.files.length > 0) {
        formData.append('mobileImage', mobileFile.files[0]);
    }

    if (editId) {
        for (var i = 0; i < banners.length; i++) {
            if (banners[i].id === editId) {
                if (!(desktopFile.files && desktopFile.files.length > 0)) formData.append('existingDesktop', banners[i].imageDesktop || '');
                if (!(mobileFile.files && mobileFile.files.length > 0)) formData.append('existingMobile', banners[i].imageMobile || '');
                break;
            }
        }
    }

    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiBase + '/api/banners?action=save', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.success) {
                statusEl.textContent = '';
                closeBannerEditor();
                reloadBanners(function() {
                    initBanners();
                    saveButtonState(saveBtn, 'success', editId ? 'Banner Updated' : 'Banner Created');
                });
            } else {
                statusEl.textContent = resp.message || 'Failed to save';
                saveButtonState(saveBtn, 'error', resp.message || 'Failed to save');
            }
        } else {
            try { var resp = JSON.parse(xhr.responseText); statusEl.textContent = resp.message || 'Server error'; saveButtonState(saveBtn, 'error', resp.message || 'Server error'); }
            catch(e) { statusEl.textContent = 'Server error (' + xhr.status + ')'; saveButtonState(saveBtn, 'error', 'Server error (' + xhr.status + ')'); }
        }
    };
    xhr.onerror = function() {
        statusEl.textContent = 'Network error';
        saveButtonState(saveBtn, 'error', 'Network error');
    };
    xhr.send(formData);
}

function deleteBanner(id) {
    if (!confirm('Delete this banner?')) return;
    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiBase + '/api/banners?action=delete', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            reloadBanners(function() { initBanners(); showToast('Banner Deleted', 'success'); });
        } else {
            try { var resp = JSON.parse(xhr.responseText); showToast(resp.message || 'Delete failed', 'error'); }
            catch(e) { showToast('Delete failed', 'error'); }
        }
    };
    xhr.onerror = function() { showToast('Network error', 'error'); };
    xhr.send(JSON.stringify({ id: id }));
}

function reloadBanners(callback) {
    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var script = document.createElement('script');
    script.src = apiBase + '/data/banners.js?_t=' + Date.now();
    script.onload = function() { if (callback) callback(); };
    document.head.appendChild(script);
}

function openBannerPreview(id) {
    var b = null;
    for (var i = 0; i < banners.length; i++) {
        if (banners[i].id === id) { b = banners[i]; break; }
    }
    if (!b) return;
    var html = '<div style="position:relative;width:100%;max-width:800px;margin:0 auto;border-radius:10px;overflow:hidden;background:#f0f0f0;min-height:200px;background-size:cover;background-position:center"';
    if (b.imageDesktop) html += ' background-image:url(' + esc(imgUrl(b.imageDesktop)) + ')';
    html += '>';
    if (b.overlayOpacity !== undefined) {
        html += '<div style="position:absolute;inset:0;background:rgba(0,0,0,' + b.overlayOpacity + ')"></div>';
    }
    var align = 'center';
    if (b.textPosition === 'left') align = 'flex-start';
    else if (b.textPosition === 'right') align = 'flex-end';
    html += '<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:' + align + ';justify-content:center;min-height:200px;padding:40px;text-align:' + (b.textPosition || 'center') + '">';
    if (b.title) html += '<h2 style="color:#fff;margin:0 0 8px;font-size:1.5rem;text-shadow:0 2px 4px rgba(0,0,0,.3)">' + esc(b.title) + '</h2>';
    if (b.subtitle) html += '<p style="color:rgba(255,255,255,.85);margin:0 0 16px;font-size:1rem;max-width:400px">' + esc(b.subtitle) + '</p>';
    if (b.buttonText) html += '<span style="display:inline-block;padding:8px 24px;background:#C79A41;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:default">' + esc(b.buttonText) + '</span>';
    html += '</div></div>';

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;max-width:860px;width:90%;max-height:80vh;overflow-y:auto';
    box.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee"><h3 style="margin:0;font-size:1.1rem">Banner Preview</h3><button type="button" class="close-btn" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#999"><i class="fas fa-times"></i></button></div><div style="padding:20px">' + html + '</div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    box.querySelector('.close-btn').addEventListener('click', function() { overlay.remove(); });
}

function duplicateBanner(id) {
    var b = null;
    for (var i = 0; i < banners.length; i++) {
        if (banners[i].id === id) { b = banners[i]; break; }
    }
    if (!b) return;
    var copy = JSON.parse(JSON.stringify(b));
    copy.id = 'banner-' + Date.now();
    copy.title = copy.title + ' (Copy)';
    banners.push(copy);
    renderBanners();
    showToast('Banner duplicated. Edit to customise.', 'info');
}

function addBannerEventListeners() {
    document.getElementById('addBannerBtn').addEventListener('click', function() {
        openBannerEditor(null);
    });

    document.getElementById('beSaveBtn').addEventListener('click', saveBanner);
    document.getElementById('beCancelBtn').addEventListener('click', closeBannerEditor);
    document.getElementById('beEditorClose').addEventListener('click', closeBannerEditor);
    document.getElementById('bannerEditorModal').addEventListener('click', function(e) {
        if (e.target === this) closeBannerEditor();
    });

    document.getElementById('beUploadDesktop').addEventListener('click', function() {
        document.getElementById('beFileDesktop').click();
    });
    document.getElementById('beFileDesktop').addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            renderBannerPreview('desktop', URL.createObjectURL(e.target.files[0]));
        }
    });
    document.getElementById('beUploadMobile').addEventListener('click', function() {
        document.getElementById('beFileMobile').click();
    });
    document.getElementById('beFileMobile').addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            renderBannerPreview('mobile', URL.createObjectURL(e.target.files[0]));
        }
    });

    document.getElementById('bannerBody').addEventListener('click', function(e) {
        var editBtn = e.target.closest('.ban-edit');
        var deleteBtn = e.target.closest('.ban-delete');
        var previewBtn = e.target.closest('.ban-preview');
        var dupBtn = e.target.closest('.ban-duplicate');
        if (editBtn) { openBannerEditor(editBtn.dataset.id); return; }
        if (previewBtn) { openBannerPreview(previewBtn.dataset.id); return; }
        if (dupBtn) { duplicateBanner(dupBtn.dataset.id); return; }
        if (deleteBtn) deleteBanner(deleteBtn.dataset.id);
    });
}
