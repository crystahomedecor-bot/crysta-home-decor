var WEBSITE_KEY = 'crystaWebsite';
var websiteTab = 'homepage';
var websiteHomeTab = 'hero';

// Default website settings
var websiteDefaults = {
    // Hero
    heroTitle: 'Discover Your Style',
    heroSubtitle: 'Premium home decor for every space',
    heroImage: 'assets/images/hero-bg.jpg',
    heroBtn1Text: 'Shop Now',
    heroBtn1Link: 'shop.html',
    heroBtn2Text: 'Explore',
    heroBtn2Link: 'new-arrivals.html',
    // Why Us
    whyusLabel: 'Why Choose Us',
    whyusTitle: 'Why Choose CRYSTA?',
    whyusSubtitle: 'Premium Home Decor That Brings Luxury To Every Home',
    whyusF1Title: 'Premium Quality',
    whyusF1Desc: 'Handpicked products with the finest craftsmanship.',
    whyusF2Title: 'Free Shipping',
    whyusF2Desc: 'Free delivery on orders above \u20b9999.',
    whyusF3Title: '24/7 Support',
    whyusF3Desc: 'We are here to help anytime you need us.',
    whyusF4Title: 'Secure Payments',
    whyusF4Desc: '100% safe & trusted payment experience.',
    // Testimonials
    testimonial1: 'Amazing quality and fast delivery! Highly recommend CRYSTA HOME DECOR.',
    testimonial1Author: 'Priya S.',
    testimonial2: 'Beautiful products at great prices. Will shop again!',
    testimonial2Author: 'Rahul K.',
    // Instagram
    instagramTitle: 'Follow Us @crystahomedecor',
    instagramEmbed: 'https://www.instagram.com/',
    // CTA
    ctaTitle: 'Get in Touch',
    ctaText: 'Have a question? We would love to hear from you.',
    ctaBtnText: 'Contact Us',
    ctaBtnLink: 'contact-us.html',
    // Header
    logo: '',
    phone: '9690152441',
    storeLocation: '#',
    trackOrder: 'track-order.html',
    loginLink: 'login.html',
    helpLink: 'support.html',
    searchPlaceholder: 'Search for wall clocks, mirrors, gifts...',
    wishlistLink: '#',
    cartLink: '#',
    stickyHeader: true,
    // Footer
    companyName: 'CRYSTA HOME DECOR',
    aboutText: 'Your premier destination for elegant home decor and lifestyle products.',
    address: 'Your trusted destination for home decor',
    footerPhone: '9690152441',
    footerEmail: 'hello@crystahomedecor.com',
    googleMaps: '',
    copyright: '\u00a9 2026 CRYSTA HOME DECOR. All rights reserved.',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    socialWhatsapp: '919690152441',
    socialTelegram: '',
    socialLinkedin: '',
    socialPinterest: '',
    // Newsletter
    newsletterTitle: 'Join Our Newsletter',
    newsletterText: 'Stay updated with our latest collections and exclusive offers.',
    newsletterBtn: 'Subscribe',
    newsletterEnabled: true,
    // Announcement
    announcementText: 'Free delivery on orders above \u20b9999 | Use code CRYSTA10 for 10% off',
    announcementLink: '',
    announcementEnabled: true,
    // Featured categories (slugs)
    featuredCategories: []
};

function loadWebsiteSettings() {
    var data = lsGet(WEBSITE_KEY, {});
    // Merge with defaults
    for (var key in websiteDefaults) {
        if (data[key] === undefined) {
            data[key] = websiteDefaults[key];
        }
    }
    return data;
}

function saveWebsiteSettings(data) {
    lsSet(WEBSITE_KEY, data);
}

function switchWebsiteTab(tab) {
    websiteTab = tab;
    document.querySelectorAll('.website-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.websiteTab === tab); });
    document.querySelectorAll('.website-tab-content').forEach(function(c) { c.classList.toggle('active', c.id === 'website-' + tab); });

    if (tab === 'homepage') {
        // Build featured category checkboxes
        buildHpCategoryCheckboxes();
    }
}

function switchWebsiteHomeTab(tab) {
    websiteHomeTab = tab;
    document.querySelectorAll('[data-homepage-tab]').forEach(function(t) { t.classList.toggle('active', t.dataset.homepageTab === tab); });
    ['hp-hero','hp-categories','hp-whyus','hp-testimonials','hp-instagram','hp-cta'].forEach(function(id) {
        document.getElementById(id).classList.toggle('active', id === 'hp-' + tab);
    });
}

function buildHpCategoryCheckboxes() {
    var container = document.getElementById('hpCategoryCheckboxes');
    if (!container || typeof CATEGORIES === 'undefined') return;
    var data = loadWebsiteSettings();
    var selected = data.featuredCategories || [];
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">';
    for (var i = 0; i < CATEGORIES.length; i++) {
        var c = CATEGORIES[i];
        var checked = selected.indexOf(c.slug) >= 0 ? 'checked' : '';
        html += '<label class="toggle-label" style="font-size:.82rem;padding:6px 0"><input type="checkbox" class="hp-cat-cb" value="' + c.slug + '" ' + checked + '><span class="toggle-switch"></span> ' + esc(c.name) + '</label>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function initWebsite() {
    // Initialize pages data first
    if (typeof initPages === 'function') initPages();
    var data = loadWebsiteSettings();
    // Populate all website fields
    document.querySelectorAll('.website-field').forEach(function(el) {
        var key = el.dataset.ws;
        if (data[key] !== undefined) {
            if (el.type === 'checkbox') {
                el.checked = !!data[key];
            } else {
                el.value = data[key] || '';
            }
        }
    });
    // Default to homepage tab
    switchWebsiteTab('homepage');
    switchWebsiteHomeTab('hero');
}

function saveWebsite() {
    var data = {};
    var saveBtn = document.getElementById('websiteSaveBtn');
    saveButtonState(saveBtn, 'saving');

    document.querySelectorAll('.website-field').forEach(function(el) {
        var key = el.dataset.ws;
        if (el.type === 'checkbox') {
            data[key] = el.checked;
        } else {
            data[key] = el.value;
        }
    });
    // Gather featured category checkboxes
    var catCbs = document.querySelectorAll('.hp-cat-cb');
    var featured = [];
    catCbs.forEach(function(cb) { if (cb.checked) featured.push(cb.value); });
    data.featuredCategories = featured;

    saveWebsiteSettings(data);
    saveButtonState(saveBtn, 'success', 'Website Saved Successfully');
}

function showWebsiteStatus(msg, type) {
    var el = document.getElementById('pagesStatus');
    if (!el) {
        // Try website status
        var els = document.querySelectorAll('.np-status');
        if (els.length > 0) el = els[els.length - 1];
    }
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'error' ? '#e74c3c' : '#27ae60';
    if (msg) setTimeout(function() { el.textContent = ''; }, 3000);
}

// Bind events
document.addEventListener('DOMContentLoaded', function() {
    // Website tab clicks
    document.querySelectorAll('.website-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchWebsiteTab(this.dataset.websiteTab);
        });
    });

    // Homepage subtab clicks
    document.querySelectorAll('[data-homepage-tab]').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchWebsiteHomeTab(this.dataset.homepageTab);
        });
    });

    // Save button
    var saveBtn = document.getElementById('websiteSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveWebsite);
});
