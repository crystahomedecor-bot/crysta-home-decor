var COUPONS_KEY = 'crystaCoupons';
var coupons = [];
var editCouponIdx = -1;

function loadCoupons() {
    coupons = lsGet(COUPONS_KEY, []);
}

function saveCoupons() {
    lsSet(COUPONS_KEY, coupons);
}

function renderCoupons() {
    var tbody = document.getElementById('couponsBody');
    if (!tbody) return;
    if (coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999"><i class="fas fa-percent" style="font-size:1.5rem;display:block;margin-bottom:10px"></i>No coupons yet. Click "Add Coupon" to create one.</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < coupons.length; i++) {
        var c = coupons[i];
        var status = c.enabled ? '<span style="color:#27ae60;font-weight:600">Active</span>' : '<span style="color:#999">Disabled</span>';
        html += '<tr>' +
            '<td><strong>' + esc(c.code) + '</strong></td>' +
            '<td>' + c.discount + (c.type === 'percentage' ? '%' : '') + '</td>' +
            '<td>' + (c.type === 'percentage' ? 'Percentage' : 'Fixed') + '</td>' +
            '<td>₹' + (+c.minOrder || 0) + '</td>' +
            '<td>' + (c.expiry || '—') + '</td>' +
            '<td>' + status + '</td>' +
            '<td>' +
                '<button type="button" class="btn btn-xs btn-outline" onclick="editCoupon(' + i + ')"><i class="fas fa-pen"></i></button> ' +
                '<button type="button" class="btn btn-xs btn-danger" onclick="deleteCoupon(' + i + ')"><i class="fas fa-trash"></i></button>' +
            '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

function openCouponModal(idx) {
    editCouponIdx = idx;
    document.getElementById('couponModalTitle').textContent = idx >= 0 ? 'Edit Coupon' : 'Add Coupon';
    if (idx >= 0) {
        var c = coupons[idx];
        document.getElementById('couponCode').value = c.code;
        document.getElementById('couponDiscount').value = c.discount;
        document.getElementById('couponType').value = c.type;
        document.getElementById('couponMinOrder').value = c.minOrder;
        document.getElementById('couponExpiry').value = c.expiry;
        document.getElementById('couponEnabled').checked = c.enabled;
    } else {
        document.getElementById('couponCode').value = '';
        document.getElementById('couponDiscount').value = '';
        document.getElementById('couponType').value = 'percentage';
        document.getElementById('couponMinOrder').value = '';
        document.getElementById('couponExpiry').value = '';
        document.getElementById('couponEnabled').checked = true;
    }
    document.getElementById('couponModal').style.display = 'flex';
}

function closeCouponModal() {
    document.getElementById('couponModal').style.display = 'none';
}

function saveCouponFromModal() {
    var code = document.getElementById('couponCode').value.trim().toUpperCase();
    var discount = parseFloat(document.getElementById('couponDiscount').value) || 0;
    var type = document.getElementById('couponType').value;
    var minOrder = parseFloat(document.getElementById('couponMinOrder').value) || 0;
    var expiry = document.getElementById('couponExpiry').value;
    var enabled = document.getElementById('couponEnabled').checked;
    var saveBtn = document.getElementById('couponModalSave');

    if (!code) { showToast('Please enter a coupon code.', 'error'); return; }
    if (discount <= 0) { showToast('Please enter a valid discount value.', 'error'); return; }

    saveButtonState(saveBtn, 'saving');

    if (editCouponIdx >= 0) {
        coupons[editCouponIdx] = { code: code, discount: discount, type: type, minOrder: minOrder, expiry: expiry, enabled: enabled };
    } else {
        coupons.push({ code: code, discount: discount, type: type, minOrder: minOrder, expiry: expiry, enabled: enabled });
    }
    saveCoupons();
    renderCoupons();
    closeCouponModal();
    saveButtonState(saveBtn, 'success', editCouponIdx >= 0 ? 'Coupon Updated' : 'Coupon Created');
}

function editCoupon(idx) {
    openCouponModal(idx);
}

function deleteCoupon(idx) {
    if (!confirm('Delete coupon "' + coupons[idx].code + '"?')) return;
    coupons.splice(idx, 1);
    saveCoupons();
    renderCoupons();
    showToast('Coupon Deleted', 'success');
}

function setCouponStatus(msg, type) {
    var el = document.getElementById('couponStatus');
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'error' ? '#e74c3c' : '#27ae60';
    if (msg) setTimeout(function() { el.textContent = ''; }, 3000);
}

function initCoupons() {
    loadCoupons();
    renderCoupons();
}

// Bind events on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    var addBtn = document.getElementById('addCouponBtn');
    if (addBtn) addBtn.addEventListener('click', function() { openCouponModal(-1); });

    var modalClose = document.getElementById('couponModalClose');
    if (modalClose) modalClose.addEventListener('click', closeCouponModal);

    var modalCancel = document.getElementById('couponModalCancel');
    if (modalCancel) modalCancel.addEventListener('click', closeCouponModal);

    var modalSave = document.getElementById('couponModalSave');
    if (modalSave) modalSave.addEventListener('click', saveCouponFromModal);

    // Close on overlay click
    var modal = document.getElementById('couponModal');
    if (modal) modal.addEventListener('click', function(e) { if (e.target === this) closeCouponModal(); });
});
