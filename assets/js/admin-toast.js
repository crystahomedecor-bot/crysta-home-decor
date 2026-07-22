(function() {
'use strict';

// ── Inject toast styles ──
var styleId = 'crysta-admin-toast-style';
if (!document.getElementById(styleId)) {
    var s = document.createElement('style');
    s.id = styleId;
    s.textContent = '#toastContainer{max-width:380px}#toastContainer .toast{display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:8px;font-size:.85rem;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.15);color:#fff;pointer-events:auto;opacity:0;transform:translateY(20px);transition:opacity .25s ease,transform .25s ease;font-family:var(--font-body)}#toastContainer .toast.toast-visible{opacity:1;transform:translateY(0)}#toastContainer .toast.toast-hiding{opacity:0;transform:translateY(-10px)}#toastContainer .toast-warning{background:#ff8c00}#toastContainer .toast .toast-icon{font-size:18px;flex-shrink:0;width:22px;text-align:center}#toastContainer .toast .toast-msg{flex:1;line-height:1.4}';
    document.head.appendChild(s);
}

// ── Toast container ──
function ensureContainer() {
    var c = document.getElementById('toastContainer');
    if (!c) {
        c = document.createElement('div');
        c.id = 'toastContainer';
        c.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:10003;display:flex;flex-direction:column;gap:8px;max-width:380px;pointer-events:none';
        document.body.appendChild(c);
    }
    return c;
}

// ── showToast ──
window.showToast = function(message, type) {
    type = type || 'info';
    var icons = { success:'✔', error:'✕', warning:'⚠', info:'ℹ' };
    var icon = icons[type] || 'ℹ';

    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-msg">' + message + '</span>';

    var c = ensureContainer();

    // Queue: max 3 visible
    while (c.children.length >= 3) {
        var old = c.children[c.children.length - 1];
        if (old.parentNode) old.parentNode.removeChild(old);
    }

    c.insertBefore(t, c.firstChild);

    // Animate in (next frame)
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            t.classList.add('toast-visible');
        });
    });

    // Auto-remove after 2500ms
    setTimeout(function() {
        t.classList.remove('toast-visible');
        t.classList.add('toast-hiding');
        setTimeout(function() {
            if (t.parentNode) t.parentNode.removeChild(t);
        }, 250);
    }, 2500);
};

// ── saveButtonState ──
window.saveButtonState = function(button, state, message) {
    if (!button) return;
    if (!button._origHtml) button._origHtml = button.innerHTML;

    button.classList.remove('btn-green', 'btn-red');

    if (state === 'saving') {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else if (state === 'success') {
        button.disabled = true;
        button.innerHTML = '✔ Saved';
        button.classList.add('btn-green');
        if (message) showToast(message, 'success');
        setTimeout(function() {
            button.disabled = false;
            button.innerHTML = button._origHtml;
            button.classList.remove('btn-green', 'btn-red');
        }, 1000);
    } else if (state === 'error') {
        button.disabled = false;
        button.innerHTML = '❌ Failed';
        button.classList.add('btn-red');
        showToast(message || 'Something went wrong. Try Again.', 'error');
        setTimeout(function() {
            button.innerHTML = button._origHtml;
            button.classList.remove('btn-green', 'btn-red');
        }, 2000);
    }
};
})();
