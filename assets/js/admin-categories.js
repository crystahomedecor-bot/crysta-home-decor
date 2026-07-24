function esc(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

function imgUrl(path) {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('blob:')) return path;
    var base = typeof IMAGE_BASE_URL !== 'undefined' ? IMAGE_BASE_URL : (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '');
    if (!base) return path;
    return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

var categories = [];
var catEditSlug = null;

function switchAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(function(el) { el.style.display = 'none'; });
    if (document.getElementById('section-' + section)) {
        document.getElementById('section-' + section).style.display = '';
    }
}

function initCategories() {
    if (typeof CATEGORIES === 'undefined') return;
    categories = JSON.parse(JSON.stringify(CATEGORIES));
    renderCatDashboard();
    renderCategories();
}

function renderCatDashboard() {
    var total = categories.length;
    var active = 0, featured = 0;
    var productCount = 0;
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].active !== false) active++;
        if (categories[i].featured) featured++;
    }
    if (typeof PRODUCTS !== 'undefined') productCount = PRODUCTS.length;
    document.getElementById('catStatTotal').textContent = total;
    document.getElementById('catStatActive').textContent = active;
    document.getElementById('catStatFeatured').textContent = featured;
    document.getElementById('catStatProducts').textContent = productCount;
}

function renderCategories() {
    var search = (document.getElementById('catSearch').value || '').toLowerCase();
    var filtered = categories.filter(function(c) {
        return !search || c.name.toLowerCase().indexOf(search) !== -1 || c.slug.toLowerCase().indexOf(search) !== -1;
    });
    filtered.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });

    var body = document.getElementById('catBody');
    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-tags"></i><br>No categories found</td></tr>';
        document.getElementById('catResultCount').textContent = '';
        return;
    }

    document.getElementById('catResultCount').textContent = filtered.length + ' categor' + (filtered.length === 1 ? 'y' : 'ies');

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var c = filtered[i];
        var hasImage = c.image && c.image !== '';
        var productCount = 0;
        if (typeof PRODUCTS !== 'undefined') {
            for (var j = 0; j < PRODUCTS.length; j++) {
                if (PRODUCTS[j].category === c.slug) productCount++;
            }
        }
        html += '<tr draggable="true" data-slug="' + esc(c.slug) + '">';
        html += '<td>' + (hasImage
            ? '<img src="' + esc(imgUrl(c.image)) + '" class="cat-thumb" alt="" onerror="this.outerHTML=\'<div class=cat-thumb-placeholder><i class=&quot;fas fa-image&quot;></i></div>\'">'
            : '<div class="cat-thumb-placeholder"><i class="fas fa-image"></i></div>') + '</td>';
        html += '<td><strong>' + esc(c.name) + '</strong></td>';
        html += '<td><code>' + esc(c.slug) + '</code></td>';
        html += '<td style="text-align:center">' + productCount + '</td>';
        html += '<td style="text-align:center">' + (c.active !== false
            ? '<span class="sbadge sbadge-active">Active</span>'
            : '<span class="sbadge sbadge-draft">Draft</span>') + '</td>';
        html += '<td style="text-align:center">' + (c.order !== undefined ? c.order : '-') + '</td>';
        html += '<td>';
        html += '<div class="row-actions">';
        html += '<button type="button" class="btn btn-xs btn-ghost cat-edit" data-slug="' + esc(c.slug) + '" title="Edit"><i class="fas fa-edit"></i></button>';
        html += '<button type="button" class="btn btn-xs btn-ghost cat-preview" data-slug="' + esc(c.slug) + '" title="Preview"><i class="fas fa-external-link-alt"></i></button>';
        html += '<button type="button" class="btn btn-xs btn-ghost cat-delete" data-slug="' + esc(c.slug) + '" title="Delete" style="color:#e74c3c"><i class="fas fa-trash"></i></button>';
        html += '<button type="button" class="btn btn-xs btn-ghost cat-expand' + (c.subcategories && c.subcategories.length ? '' : '') + '" data-slug="' + esc(c.slug) + '" title="Subcategories"><i class="fas fa-chevron-down"></i></button>';
        html += '</div></td>';
        html += '</tr>';
    }
    body.innerHTML = html;
}

function openCategoryEditor(slug) {
    catEditSlug = slug || null;
    document.getElementById('catEditorTitleText').textContent = slug ? 'Edit Category' : 'Add Category';
    document.getElementById('ceStatus').textContent = '';
    document.getElementById('ceFileInput').value = '';

    if (slug) {
        var c = null;
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].slug === slug) { c = categories[i]; break; }
        }
        if (!c) return;
        document.getElementById('ceName').value = c.name;
        document.getElementById('ceSlug').value = c.slug;
        document.getElementById('ceDescription').value = c.description || '';
        document.getElementById('ceOrder').value = c.order !== undefined ? c.order : '';
        document.getElementById('ceFeatured').checked = !!c.featured;
        document.getElementById('ceActive').checked = c.active !== false;
        renderCatThumbPreview(c.image || '');
        renderSubcategoryEditor(c.subcategories || []);
    } else {
        document.getElementById('ceName').value = '';
        document.getElementById('ceSlug').value = '';
        document.getElementById('ceDescription').value = '';
        document.getElementById('ceOrder').value = '';
        document.getElementById('ceFeatured').checked = false;
        document.getElementById('ceActive').checked = true;
        renderCatThumbPreview('');
        renderSubcategoryEditor([]);
    }

    document.getElementById('catEditorModal').classList.add('active');
}

function closeCategoryEditor() {
    document.getElementById('catEditorModal').classList.remove('active');
}

function renderCatThumbPreview(path) {
    var container = document.getElementById('ceThumbPreview');
    var removeBtn = document.getElementById('ceRemoveThumb');
    if (path && path !== '') {
        container.innerHTML = '<img src="' + esc(imgUrl(path)) + '" class="cat-thumb-preview" alt="" onerror="this.outerHTML=\'<div class=cat-thumb-placeholder-preview><i class=&quot;fas fa-image&quot;></i></div>\'">';
        removeBtn.style.display = '';
    } else {
        container.innerHTML = '<div class="cat-thumb-placeholder-preview"><i class="fas fa-image"></i></div>';
        removeBtn.style.display = 'none';
    }
}

var subcatCounter = 0;

function renderSubcategoryEditor(subcats) {
    var list = document.getElementById('ceSubcatList');
    list.innerHTML = '';
    if (!subcats || subcats.length === 0) {
        addSubcatRow('', '');
        return;
    }
    for (var i = 0; i < subcats.length; i++) {
        addSubcatRow(subcats[i].name, subcats[i].slug);
    }
}

function addSubcatRow(name, slug) {
    var list = document.getElementById('ceSubcatList');
    var idx = subcatCounter++;
    var row = document.createElement('div');
    row.className = 'subcat-row';
    row.dataset.idx = idx;
    row.innerHTML =
        '<input class="fc fc-sm subcat-name" placeholder="Subcategory name" value="' + esc(name) + '">' +
        '<input class="fc fc-sm subcat-slug" placeholder="auto-slug" value="' + esc(slug) + '">' +
        '<button type="button" class="subcat-del" title="Remove"><i class="fas fa-times"></i></button>';
    row.querySelector('.subcat-del').addEventListener('click', function() { row.remove(); });
    row.querySelector('.subcat-name').addEventListener('input', function() {
        var slugInput = row.querySelector('.subcat-slug');
        if (!slugInput.dataset.manual) {
            slugInput.value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
    });
    row.querySelector('.subcat-slug').addEventListener('input', function() {
        this.dataset.manual = '1';
    });
    list.appendChild(row);
}

function collectSubcategories() {
    var rows = document.querySelectorAll('#ceSubcatList .subcat-row');
    var subcats = [];
    var seen = {};
    for (var i = 0; i < rows.length; i++) {
        var name = rows[i].querySelector('.subcat-name').value.trim();
        var slug = rows[i].querySelector('.subcat-slug').value.trim();
        if (!name || !slug) continue;
        if (seen[slug]) continue;
        seen[slug] = true;
        subcats.push({ id: slug, name: name, slug: slug });
    }
    return subcats;
}

function saveCategory() {
    var name = document.getElementById('ceName').value.trim();
    var slug = document.getElementById('ceSlug').value.trim();
    var statusEl = document.getElementById('ceStatus');

    if (!name) { statusEl.textContent = 'Category name is required'; return; }
    if (!slug) { statusEl.textContent = 'Slug is required'; return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { statusEl.textContent = 'Slug: only lowercase letters, numbers, hyphens'; return; }

    statusEl.textContent = 'Saving...';
    var saveBtn = document.getElementById('ceSaveBtn');
    saveButtonState(saveBtn, 'saving');

    var formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', document.getElementById('ceDescription').value.trim());
    formData.append('order', document.getElementById('ceOrder').value);
    formData.append('featured', document.getElementById('ceFeatured').checked);
    formData.append('active', document.getElementById('ceActive').checked);
    formData.append('subcategories', JSON.stringify(collectSubcategories()));
    if (catEditSlug) formData.append('editSlug', catEditSlug);

    var fileInput = document.getElementById('ceFileInput');
    if (fileInput.files && fileInput.files.length > 0) {
        formData.append('thumbnail', fileInput.files[0]);
    }

    var existingImg = '';
    if (catEditSlug) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].slug === catEditSlug) { existingImg = categories[i].image || ''; break; }
        }
    }
    if (!(fileInput.files && fileInput.files.length > 0)) {
        formData.append('existingImage', existingImg);
    }

    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiBase + '/api/categories?action=save', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.success) {
                statusEl.textContent = '';
                closeCategoryEditor();
                reloadCategories(function() {
                    initCategories();
                    refreshCategoryDropdowns();
                    saveButtonState(saveBtn, 'success', 'Category Saved Successfully');
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

function openDeleteCategory(slug) {
    var productCount = 0;
    if (typeof PRODUCTS !== 'undefined') {
        for (var j = 0; j < PRODUCTS.length; j++) {
            if (PRODUCTS[j].category === slug) productCount++;
        }
    }
    var name = '';
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].slug === slug) { name = categories[i].name; break; }
    }

    document.getElementById('catDelName').textContent = name;
    document.getElementById('catDelProductCount').textContent = productCount;
    document.getElementById('catDelWarning').style.display = productCount > 0 ? '' : 'none';
    document.getElementById('catDelMsg').innerHTML = productCount > 0
        ? '<i class="fas fa-exclamation-circle" style="color:#e74c3c"></i> This category contains <strong>' + productCount + '</strong> product(s).<br><span style="font-size:.85rem;color:#888">Please move products to another category before deleting.</span>'
        : 'Remove <strong>' + esc(name) + '</strong>?';

    document.getElementById('catDelConfirmBtn').dataset.slug = slug;
    document.getElementById('catDeleteModal').classList.add('active');
}

function confirmDeleteCategory() {
    var slug = document.getElementById('catDelConfirmBtn').dataset.slug;
    if (!slug) return;
    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiBase + '/api/categories?action=delete', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            closeCatDeleteModal();
            reloadCategories(function() {
                initCategories();
                refreshCategoryDropdowns();
                showToast('Category Deleted', 'success');
            });
        } else {
            try { var resp = JSON.parse(xhr.responseText); showToast(resp.message || 'Delete failed', 'error'); }
            catch(e) { showToast('Delete failed', 'error'); }
        }
    };
    xhr.onerror = function() { showToast('Network error', 'error'); };
    xhr.send(JSON.stringify({ slug: slug }));
}

function closeCatDeleteModal() {
    document.getElementById('catDeleteModal').classList.remove('active');
}

function reloadCategories(callback) {
    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var script = document.createElement('script');
    script.src = apiBase + '/data/categories.js?_t=' + Date.now();
    script.onload = function() { if (callback) callback(); };
    document.head.appendChild(script);
}

function refreshCategoryDropdowns() {
    if (typeof populateCategoryDropdown === 'function') populateCategoryDropdown();
    if (typeof populateCatFilter === 'function') populateCatFilter();
    if (typeof populateEditorSubcategory === 'function') {
        var catSel = document.getElementById('eCategory');
        if (catSel) populateEditorSubcategory(catSel.value);
    }
}

function toggleCategoryExpand(slug) {
    var row = document.querySelector('#catBody tr[data-slug="' + slug + '"]');
    if (!row) return;
    var detailRow = row.nextElementSibling;
    if (detailRow && detailRow.classList.contains('cat-detail-row')) {
        detailRow.remove();
        var icon = row.querySelector('.cat-expand i');
        if (icon) { icon.className = 'fas fa-chevron-down'; }
        return;
    }
    var c = null;
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].slug === slug) { c = categories[i]; break; }
    }
    if (!c || !c.subcategories || c.subcategories.length === 0) {
        showToast('No subcategories', 'info');
        return;
    }
    var detail = document.createElement('tr');
    detail.className = 'cat-detail-row';
    var subHtml = '';
    for (var i = 0; i < c.subcategories.length; i++) {
        subHtml += '<span class="sub-badge" style="margin:2px 4px 2px 0;display:inline-block;padding:4px 10px;background:#eef5ff;color:#2c7be5;border-radius:4px;font-size:.78rem;font-weight:500">' + esc(c.subcategories[i].name) + '</span>';
    }
    detail.innerHTML = '<td colspan="7" style="padding:10px 16px;background:#faf8f5;border-bottom:1px solid #f0f0f0"><div style="display:flex;flex-wrap:wrap;gap:4px"><strong style="font-size:.78rem;color:#999;width:100%;margin-bottom:4px">SUBCATEGORIES</strong>' + subHtml + '</div></td>';
    row.parentNode.insertBefore(detail, row.nextSibling);
    var icon = row.querySelector('.cat-expand i');
    if (icon) { icon.className = 'fas fa-chevron-up'; }
}

function addCategoryEventListeners() {
    document.querySelectorAll('.section-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
            switchAdminSection(this.dataset.section);
            if (this.dataset.section === 'categories') initCategories();
            if (this.dataset.section === 'banners') initBanners();
            if (this.dataset.section === 'settings') initSettings();
        });
    });

    document.getElementById('catSearch').addEventListener('input', renderCategories);

    document.getElementById('addCategoryBtn').addEventListener('click', function() {
        openCategoryEditor(null);
    });

    document.getElementById('ceSaveBtn').addEventListener('click', saveCategory);
    document.getElementById('ceCancelBtn').addEventListener('click', closeCategoryEditor);
    document.getElementById('catEditorClose').addEventListener('click', closeCategoryEditor);
    document.getElementById('catEditorModal').addEventListener('click', function(e) {
        if (e.target === this) closeCategoryEditor();
    });

    document.getElementById('ceName').addEventListener('input', function() {
        if (!catEditSlug) {
            document.getElementById('ceSlug').value = this.value.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
    });

    document.getElementById('ceAddSubcatBtn').addEventListener('click', function() {
        addSubcatRow('', '');
    });

    document.getElementById('ceUploadBtn').addEventListener('click', function() {
        document.getElementById('ceFileInput').click();
    });

    document.getElementById('ceFileInput').addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            renderCatThumbPreviewTmp(URL.createObjectURL(e.target.files[0]));
        }
    });

    document.getElementById('ceRemoveThumb').addEventListener('click', function() {
        renderCatThumbPreview('');
        document.getElementById('ceFileInput').value = '';
    });

    document.getElementById('catBody').addEventListener('click', function(e) {
        var editBtn = e.target.closest('.cat-edit');
        var previewBtn = e.target.closest('.cat-preview');
        var deleteBtn = e.target.closest('.cat-delete');
        var expandBtn = e.target.closest('.cat-expand');
        var row = e.target.closest('tr[data-slug]');
        if (expandBtn) { toggleCategoryExpand(expandBtn.dataset.slug); return; }
        if (editBtn) { openCategoryEditor(editBtn.dataset.slug); return; }
        if (previewBtn) { window.open('shop.html?category=' + previewBtn.dataset.slug, '_blank'); return; }
        if (deleteBtn) { openDeleteCategory(deleteBtn.dataset.slug); return; }
        if (row && !row.classList.contains('cat-detail-row')) openCategoryEditor(row.dataset.slug);
    });

    document.getElementById('catDelConfirmBtn').addEventListener('click', confirmDeleteCategory);
    document.getElementById('catDelCancelBtn').addEventListener('click', closeCatDeleteModal);
    document.getElementById('catDelClose').addEventListener('click', closeCatDeleteModal);
    document.getElementById('catDeleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeCatDeleteModal();
    });

    var dragSrcSlug = null;
    document.getElementById('catBody').addEventListener('dragstart', function(e) {
        var row = e.target.closest('tr');
        if (row) { dragSrcSlug = row.dataset.slug; row.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; }
    });
    document.getElementById('catBody').addEventListener('dragend', function(e) {
        var row = e.target.closest('tr');
        if (row) row.style.opacity = '';
    });
    document.getElementById('catBody').addEventListener('dragover', function(e) {
        e.preventDefault();
        var row = e.target.closest('tr');
        if (row) row.style.borderTop = '2px solid var(--color-gold)';
    });
    document.getElementById('catBody').addEventListener('dragleave', function(e) {
        var row = e.target.closest('tr');
        if (row) row.style.borderTop = '';
    });
    document.getElementById('catBody').addEventListener('drop', function(e) {
        e.preventDefault();
        var targetRow = e.target.closest('tr');
        if (!targetRow || !dragSrcSlug || targetRow.dataset.slug === dragSrcSlug) return;
        targetRow.style.borderTop = '';
        var tbody = document.getElementById('catBody');
        var srcRow = tbody.querySelector('tr[data-slug="' + dragSrcSlug + '"]');
        if (srcRow) {
            if (targetRow.nextSibling) tbody.insertBefore(srcRow, targetRow.nextSibling);
            else tbody.appendChild(srcRow);
        }
        var slugs = [];
        tbody.querySelectorAll('tr[data-slug]').forEach(function(row) { slugs.push(row.dataset.slug); });
        var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', apiBase + '/api/categories?action=reorder', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) reloadCategories(function() { initCategories(); });
        };
        xhr.send(JSON.stringify({ slugs: slugs }));
    });
}

function renderCatThumbPreviewTmp(url) {
    document.getElementById('ceThumbPreview').innerHTML = '<img src="' + url + '" class="cat-thumb-preview" alt="">';
    document.getElementById('ceRemoveThumb').style.display = '';
}
