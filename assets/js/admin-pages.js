var STORAGE_KEY = 'crystaPages';
var currentPage = 'about-us';

var PAGES = [
    { slug: 'about-us', title: 'About Us' },
    { slug: 'contact-us', title: 'Contact Us' },
    { slug: 'shipping-policy', title: 'Shipping Policy' },
    { slug: 'return-policy', title: 'Return Policy' },
    { slug: 'refund-policy', title: 'Refund Policy' },
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'terms-conditions', title: 'Terms & Conditions' },
    { slug: 'help-center', title: 'Help Center' },
    { slug: 'track-order', title: 'Track Order' },
    { slug: 'faq', title: 'FAQ' }
];

var DEFAULTS = {};
DEFAULTS['shipping-policy'] = { title:'Shipping Policy', seoTitle:'', metaDesc:'', slug:'shipping-policy', content:'<h2>Shipping Policy</h2><p>Thank you for visiting and shopping at CRYSTA HOME DECOR. The following terms and conditions constitute our Shipping Policy.</p><h3>Shipment Processing Time</h3><p>All orders are processed within 1\u20132 business days. Orders are not shipped or delivered on weekends or holidays.</p><h3>Shipping Rates &amp; Delivery Estimates</h3><p>Shipping charges for your order will be calculated and displayed at checkout.</p><h3>Damages</h3><p>CRYSTA HOME DECOR is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.</p>' };
DEFAULTS['return-policy'] = { title:'Return Policy', seoTitle:'', metaDesc:'', slug:'return-policy', content:'<h2>Return Policy</h2><p>We want you to be completely satisfied with your purchase. If for any reason you are not satisfied, we accept returns within 7 days of delivery.</p><h3>Eligibility</h3><p>Items must be unused, in the same condition that you received them, and in the original packaging.</p><h3>Refunds</h3><p>Once your return is received and inspected, your refund will be processed and credited to your original method of payment within 5\u20137 business days.</p>' };
DEFAULTS['refund-policy'] = { title:'Refund Policy', seoTitle:'', metaDesc:'', slug:'refund-policy', content:'<h2>Refund Policy</h2><p>At CRYSTA HOME DECOR, we strive to ensure your complete satisfaction with every purchase.</p><h3>Refund Eligibility</h3><p>Refunds are processed for items that are defective, damaged during shipping, or if the wrong item was sent. Refund requests must be made within 7 days of delivery.</p><h3>Refund Process</h3><p>Once your return is received and inspected, we will notify you of the approval status. Approved refunds will be processed to the original payment method within 5\u201310 business days.</p>' };
DEFAULTS['privacy-policy'] = { title:'Privacy Policy', seoTitle:'', metaDesc:'', slug:'privacy-policy', content:'<h2>Privacy Policy</h2><p>This Privacy Policy describes how CRYSTA HOME DECOR collects, uses, and discloses your information when you visit our website.</p><h3>Information We Collect</h3><p>When you visit the Site, we collect information about your device, your interaction with the Site, and information necessary to process your purchases.</p><h3>How We Use Your Information</h3><p>We use the information we collect to fulfill orders, communicate with you, screen orders for potential risk, and provide you with information about our products.</p>' };
DEFAULTS['terms-conditions'] = { title:'Terms & Conditions', seoTitle:'', metaDesc:'', slug:'terms-conditions', content:'<h2>Terms &amp; Conditions</h2><p>By using the CRYSTA HOME DECOR website, you agree to be bound by these terms and conditions.</p><h3>General</h3><p>We reserve the right to refuse service to anyone for any reason at any time.</p><h3>Accuracy of Information</h3><p>We are not responsible if information made available on this site is not accurate, complete, or current.</p>' };
DEFAULTS['help-center'] = { title:'Help Center', seoTitle:'', metaDesc:'', slug:'help-center', content:'<h2>Help Center</h2><p>Welcome to the CRYSTA HOME DECOR Help Center. Find answers to commonly asked questions.</p><h3>How do I place an order?</h3><p>Browse our catalog, add items to your cart, and proceed to checkout.</p><h3>How can I track my order?</h3><p>Once your order is shipped, you will receive a tracking number via email.</p><h3>What payment methods do you accept?</h3><p>We accept credit/debit cards, UPI, net banking, and Cash on Delivery (COD).</p>' };
DEFAULTS['about-us'] = { title:'About Us', seoTitle:'', metaDesc:'', slug:'about-us', content:'<h2>About CRYSTA HOME DECOR</h2><p>Welcome to CRYSTA HOME DECOR, your premier destination for elegant home decor and lifestyle products.</p><h3>Our Story</h3><p>Founded with a passion for interior design and quality craftsmanship, CRYSTA HOME DECOR brings you an exquisite range of home decor items.</p><h3>Our Mission</h3><p>Our mission is to make beautiful home decor accessible to everyone with high-quality products at affordable prices.</p>' };
DEFAULTS['contact-us'] = { title:'Contact Us', seoTitle:'', metaDesc:'', slug:'contact-us', content:'<h2>Contact Us</h2><p>We would love to hear from you!</p><h3>Get in Touch</h3><p><strong>Email:</strong> hello@crystahomedecor.com<br><strong>Phone:</strong> 9690152441<br><strong>WhatsApp:</strong> 919690152441</p><h3>Business Hours</h3><p>Mon \u2013 Sat \u00b7 10 AM \u2013 8 PM</p>' };
DEFAULTS['track-order'] = { title:'Track Order', seoTitle:'', metaDesc:'', slug:'track-order', content:'<h2>Track Your Order</h2><p>Enter your order ID and email to track the status of your order.</p><p>If you have received a shipping confirmation email, you can use the tracking number provided to check your delivery status on the courier partner website.</p><p>For assistance, contact our support team with your order details.</p>' };
DEFAULTS['faq'] = { title:'FAQ', seoTitle:'', metaDesc:'', slug:'faq', content:'<h2>Frequently Asked Questions</h2><h3>How long does shipping take?</h3><p>Orders are processed within 1\u20132 business days. Delivery typically takes 3\u20137 business days depending on your location.</p><h3>Can I change or cancel my order?</h3><p>Orders can be modified or cancelled within 2 hours of placement. Contact us immediately for assistance.</p><h3>Do you offer international shipping?</h3><p>Currently, we ship within India only.</p><h3>What is your return policy?</h3><p>We accept returns within 7 days of delivery. Items must be unused and in original packaging.</p>' };

function loadAllPages() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
    }
    var data = {};
    for (var i = 0; i < PAGES.length; i++) {
        var slug = PAGES[i].slug;
        data[slug] = { title: DEFAULTS[slug].title, seoTitle: DEFAULTS[slug].seoTitle, metaDesc: DEFAULTS[slug].metaDesc, slug: slug, content: DEFAULTS[slug].content };
    }
    return data;
}

function saveAllPages(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function switchPage(slug) {
    currentPage = slug;
    var data = loadAllPages();
    var page = data[slug] || { title: '', seoTitle: '', metaDesc: '', slug: slug, content: '' };
    document.getElementById('pagesTitle').value = page.title || '';
    var seoEl = document.getElementById('pagesSeoTitle');
    if (seoEl) seoEl.value = page.seoTitle || '';
    var slugEl = document.getElementById('pagesSlug');
    if (slugEl) slugEl.value = page.slug || slug;
    var metaEl = document.getElementById('pagesMetaDesc');
    if (metaEl) metaEl.value = page.metaDesc || '';
    document.getElementById('pagesContent').innerHTML = page.content || '';
    document.querySelectorAll('.pages-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.page === slug);
    });
    var statusEl = document.getElementById('pagesStatus');
    if (statusEl) statusEl.textContent = '';
}

function saveCurrentPage() {
    var title = document.getElementById('pagesTitle').value.trim();
    var content = document.getElementById('pagesContent').innerHTML;
    var saveBtn = document.getElementById('pagesSaveBtn');
    if (!title) { showToast('Please enter a page title.', 'error'); return; }
    if (!content || content === '<br>') { showToast('Please enter page content.', 'error'); return; }
    saveButtonState(saveBtn, 'saving');
    var data = loadAllPages();
    var seoTitle = document.getElementById('pagesSeoTitle') ? document.getElementById('pagesSeoTitle').value.trim() : '';
    var slug = document.getElementById('pagesSlug') ? document.getElementById('pagesSlug').value.trim() : currentPage;
    var metaDesc = document.getElementById('pagesMetaDesc') ? document.getElementById('pagesMetaDesc').value.trim() : '';
    data[currentPage] = { title: title, seoTitle: seoTitle, metaDesc: metaDesc, slug: slug, content: content };
    saveAllPages(data);
    saveButtonState(saveBtn, 'success', 'Page Saved Successfully');
    // Also save the slug for frontend page rendering
    if (slug !== currentPage) {
        // If slug changed, the old key still has data. We store a redirect map.
        var redirects = lsGet('crystaPageRedirects', {});
        redirects[currentPage] = slug;
        lsSet('crystaPageRedirects', redirects);
    }
}

function setStatus(msg, type) {
    var el = document.getElementById('pagesStatus');
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'error' ? '#e74c3c' : '#27ae60';
    if (msg) setTimeout(function() { el.textContent = ''; }, 3000);
}

function initPages() {
    var data = loadAllPages();
    var changed = false;
    for (var i = 0; i < PAGES.length; i++) {
        if (!data[PAGES[i].slug]) {
            data[PAGES[i].slug] = { title: DEFAULTS[PAGES[i].slug].title, seoTitle: DEFAULTS[PAGES[i].slug].seoTitle, metaDesc: DEFAULTS[PAGES[i].slug].metaDesc, slug: PAGES[i].slug, content: DEFAULTS[PAGES[i].slug].content };
            changed = true;
        }
    }
    if (changed) saveAllPages(data);
    switchPage(currentPage);
}

function execCmd(cmd, arg) {
    if (cmd === 'createLink') {
        var url = prompt('Enter the URL:');
        if (url) document.execCommand(cmd, false, url);
        return;
    }
    document.execCommand(cmd, false, arg || null);
    document.getElementById('pagesContent').focus();
}

// ── Bind events ──
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pages-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchPage(this.dataset.page);
        });
    });

    var saveBtn = document.getElementById('pagesSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentPage);

    document.querySelectorAll('.editor-toolbar button').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            execCmd(this.dataset.cmd, this.dataset.arg);
        });
    });

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            var pagesSection = document.getElementById('section-pages') || document.getElementById('section-website');
            if (pagesSection && pagesSection.style.display !== 'none') {
                e.preventDefault();
                saveCurrentPage();
            }
        }
    });
});
