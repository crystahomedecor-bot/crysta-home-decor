(function() {

    function esc(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    var WAIT_INTERVAL = 100;
    var MAX_WAIT = 50;

    function waitForData(retries, callback) {
        if (typeof SETTINGS !== 'undefined' && typeof CATEGORIES !== 'undefined') {
            callback();
        } else if (retries < MAX_WAIT) {
            setTimeout(function() { waitForData(retries + 1, callback); }, WAIT_INTERVAL);
        }
    }

    function init() {
        if (typeof SETTINGS === 'undefined' || typeof CATEGORIES === 'undefined') {
            waitForData(0, init);
            return;
        }
        applyStoreLocator();
        applyPhoneNumber();
        applySocialLinks();
        applyWhatsApp();
        applyFooterContact();
        applyCartCheckout();
        applyLogo();
        fixHeaderLinks();
        generateMegaMenu();
        setupNavScroll();
        generateMobileMenu();
        applyAnnouncement();
        applyWhyUs();
    }

    function getNested(obj) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < args.length; i++) {
            if (!obj || typeof obj !== 'object') return '';
            obj = obj[args[i]];
        }
        return obj || '';
    }

    function fixHeaderLinks() {
        var links = document.querySelectorAll('.top-header-left a, .top-header-right a, .top-header a');
        links.forEach(function(a) {
            var t = a.textContent.trim();
            if (t.indexOf('Store Locator') !== -1) {
                var mapsUrl = getNested(SETTINGS, 'contact', 'googleMaps');
                if (mapsUrl) { a.href = mapsUrl; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            } else if (t.indexOf('Track Order') !== -1) {
                a.href = 'track-order.html';
            } else if (t.indexOf('Login') !== -1 || t.indexOf('Register') !== -1) {
                a.href = 'staff-access-2026.html';
            } else if (t.indexOf('Help') !== -1 || t.indexOf('Support') !== -1) {
                a.href = 'support.html';
            }
        });

        var mobLinks = document.querySelectorAll('.mobile-menu-footer a');
        mobLinks.forEach(function(a) {
            var t = a.textContent.trim();
            if (t.indexOf('Login') !== -1 || t.indexOf('Register') !== -1) {
                a.href = 'staff-access-2026.html';
            }
        });
    }

    function applyLogo() {
        var logoText = getNested(SETTINGS, 'general', 'storeName') || 'CRYSTA HOME DECOR';
        var parts = logoText.split(' ');
        var first = parts[0] || 'CRYSTA';
        var rest = parts.slice(1).join(' ') || 'HOME DECOR';
        var logos = document.querySelectorAll('.logo');
        logos.forEach(function(logo) {
            var h2 = logo.querySelector('h2');
            var span = logo.querySelector('span');
            if (h2) h2.textContent = first;
            if (span) span.textContent = rest;
        });
    }

    function applyStoreLocator() {
        var mapsUrl = getNested(SETTINGS, 'contact', 'googleMaps');
        if (!mapsUrl) return;
        var links = document.querySelectorAll('.top-header-left a, .top-header a');
        for (var i = 0; i < links.length; i++) {
            if (links[i].textContent.indexOf('Store Locator') !== -1) {
                links[i].href = mapsUrl;
                links[i].target = '_blank';
                links[i].rel = 'noopener noreferrer';
            }
        }
    }

    function applyPhoneNumber() {
        var phone = getNested(SETTINGS, 'contact', 'phone');
        if (!phone) return;
        phone = phone.replace(/[^0-9]/g, '');
        var links = document.querySelectorAll('a[href*="tel:"]');
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href');
            if (href && href.indexOf('tel:') !== -1) {
                links[i].href = 'tel:+91' + phone;
            }
        }
        var phones = document.querySelectorAll('.top-header-left');
        for (var i = 0; i < phones.length; i++) {
            var phoneLink = phones[i].querySelector('a[href*="tel:"]');
            if (phoneLink) {
                phoneLink.innerHTML = '<i class="fas fa-phone-alt"></i> ' + phone;
            }
        }
        var mobPhones = document.querySelectorAll('.mobile-menu-footer a[href*="tel:"]');
        for (var i = 0; i < mobPhones.length; i++) {
            mobPhones[i].innerHTML = '<i class="fas fa-phone-alt"></i> ' + phone;
        }
    }

    function applySocialLinks() {
        var social = SETTINGS.social || {};
        var s = SETTINGS.contact || {};
        var waNumber = (s.whatsapp || '').replace(/[^0-9]/g, '');
        var waUrl = waNumber ? 'https://wa.me/' + waNumber : '';

        var map = {
            Instagram: social.instagram || '',
            Facebook: social.facebook || '',
            YouTube: social.youtube || '',
            WhatsApp: waUrl,
            Telegram: social.telegram || '',
            Pinterest: ''
        };

        var icons = document.querySelectorAll('.footer-social-icon');
        for (var i = 0; i < icons.length; i++) {
            var label = icons[i].getAttribute('aria-label') || '';
            var url = map[label];
            if (url) {
                icons[i].href = url;
                icons[i].target = '_blank';
                icons[i].rel = 'noopener noreferrer';
            } else {
                icons[i].style.display = 'none';
            }
        }

        var instaBtn = document.querySelector('.insta-follow-btn');
        if (instaBtn && social.instagram) {
            instaBtn.href = social.instagram;
        }
    }

    function applyWhatsApp() {
        var wa = getNested(SETTINGS, 'contact', 'whatsapp');
        if (!wa) return;
        var clean = wa.replace(/[^0-9]/g, '');
        if (!clean) return;
        var waUrl = 'https://wa.me/' + clean;

        var floats = document.querySelectorAll('.whatsapp-float');
        for (var i = 0; i < floats.length; i++) {
            floats[i].href = waUrl;
        }

        var allLinks = document.querySelectorAll('a[href*="wa.me"]');
        for (var i = 0; i < allLinks.length; i++) {
            var h = allLinks[i].getAttribute('href');
            if (h && h.indexOf('wa.me') !== -1) {
                allLinks[i].href = h.replace(/wa\.me\/\d+/, 'wa.me/' + clean);
            }
        }
    }

    function applyFooterContact() {
        var contact = SETTINGS.contact || {};
        var phone = (contact.phone || '').replace(/[^0-9]/g, '');
        var email = contact.email || '';

        var telLinks = document.querySelectorAll('.footer-contact a[href*="tel:"]');
        if (telLinks.length > 0 && phone) {
            for (var i = 0; i < telLinks.length; i++) {
                telLinks[i].href = 'tel:+91' + phone;
                if (i === 0) telLinks[i].textContent = '+91 ' + phone;
            }
        }
        var emailLinks = document.querySelectorAll('.footer-contact a[href*="mailto:"]');
        if (emailLinks.length > 0 && email) {
            emailLinks[0].href = 'mailto:' + email;
            emailLinks[0].textContent = email;
        }
    }

    function applyCartCheckout() {
        var wa = getNested(SETTINGS, 'contact', 'whatsapp');
        if (!wa) return;
        var clean = wa.replace(/[^0-9]/g, '');
        if (!clean) return;
        var links = document.querySelectorAll('.cart-footer a[href*="wa.me"], [id="cartFooter"] a[href*="wa.me"]');
        for (var i = 0; i < links.length; i++) {
            links[i].href = 'https://wa.me/' + clean + '?text=Hi%20I%20want%20to%20order';
        }
    }

    function generateMegaMenu() {
        var navList = document.querySelector('.mega-nav .nav-list');
        if (!navList) return;

        var HREF_MAP = { Home: 'index.html', 'New Arrivals': 'new-arrivals.html', Sale: 'sale.html' };
        var keepLabels = { Home: 1, 'New Arrivals': 1, Sale: 1 };
        var items = navList.querySelectorAll(':scope > li');
        var refNode = null;

        for (var i = 0; i < items.length; i++) {
            var link = items[i].querySelector('a');
            var text = link ? link.textContent.trim() : '';
            if (keepLabels[text]) {
                if (link && HREF_MAP[text]) link.href = HREF_MAP[text];
                if ((text === 'New Arrivals' || text === 'Sale') && !refNode) refNode = items[i];
            } else {
                items[i].parentNode.removeChild(items[i]);
                i--;
            }
        }

        var fragment = document.createDocumentFragment();
        for (var ci = 0; ci < CATEGORIES.length; ci++) {
            var c = CATEGORIES[ci];
            var subcats = c.subcategories || [];

            var li = document.createElement('li');
            li.className = 'nav-item';
            if (subcats.length > 0) li.className += ' has-mega';

            if (subcats.length > 0) {
                var catLink = document.createElement('a');
                catLink.href = 'shop.html?category=' + c.slug;
                catLink.innerHTML = c.name + ' <i class="fas fa-chevron-down"></i>';
                li.appendChild(catLink);

                var mega = document.createElement('div');
                mega.className = 'mega-menu';
                var grid = document.createElement('div');
                grid.className = 'mega-menu-grid';

                var col = document.createElement('div');
                col.className = 'mega-col';
                col.innerHTML = '<h4>' + c.name + '</h4>';
                for (var si = 0; si < subcats.length; si++) {
                    var sl = document.createElement('a');
                    sl.href = 'shop.html?category=' + c.slug + '&subcategory=' + subcats[si].slug;
                    sl.textContent = subcats[si].name;
                    col.appendChild(sl);
                }
                grid.appendChild(col);
                mega.appendChild(grid);
                li.appendChild(mega);
            } else {
                var catLink2 = document.createElement('a');
                catLink2.href = 'shop.html?category=' + c.slug;
                catLink2.textContent = c.name;
                li.appendChild(catLink2);
            }
            fragment.appendChild(li);
        }

        if (refNode) {
            navList.insertBefore(fragment, refNode);
        } else {
            navList.appendChild(fragment);
        }
    }

    function setupNavScroll() {
        var nav = document.querySelector('.mega-nav');
        if (!nav) return;
        // Reposition dropdowns with position:fixed to escape overflow clipping
        var items = nav.querySelectorAll('.nav-item.has-mega');
        for (var i = 0; i < items.length; i++) {
            (function(item) {
                var menu = item.querySelector('.mega-menu');
                if (!menu) return;
                item.addEventListener('mouseenter', function() {
                    var rect = item.getBoundingClientRect();
                    var vw = window.innerWidth;
                    var mw = menu.offsetWidth || 420;
                    var left = rect.left + rect.width / 2;
                    left = Math.max(mw / 2, Math.min(vw - mw / 2, left));
                    menu.style.position = 'fixed';
                    menu.style.top = (rect.bottom + 12) + 'px';
                    menu.style.left = left + 'px';
                    menu.style.transform = 'translateX(-50%)';
                });
            })(items[i]);
        }
    }

    function generateMobileMenu() {
        var mobileList = document.querySelector('.mobile-nav-list');
        if (!mobileList) return;

        var HREF_MAP = { Home: 'index.html', 'New Arrivals': 'new-arrivals.html', Sale: 'sale.html' };
        var keepLabels = { Home: 1, 'New Arrivals': 1, Sale: 1 };
        var items = mobileList.querySelectorAll(':scope > li');
        var refNode = null;

        for (var i = 0; i < items.length; i++) {
            var link = items[i].querySelector('a');
            var toggle = items[i].querySelector('.mobile-sub-toggle');
            var text = link ? link.textContent.trim() : (toggle ? toggle.textContent.trim() : '');
            if (keepLabels[text]) {
                if (link && HREF_MAP[text]) link.href = HREF_MAP[text];
                if ((text === 'New Arrivals' || text === 'Sale') && !refNode) refNode = items[i];
            } else {
                items[i].parentNode.removeChild(items[i]);
                i--;
            }
        }

        var fragment = document.createDocumentFragment();
        for (var ci = 0; ci < CATEGORIES.length; ci++) {
            var c = CATEGORIES[ci];
            var subcats = c.subcategories || [];

            var li = document.createElement('li');
            if (subcats.length > 0) {
                li.className = 'mobile-has-sub';
                var catLink = document.createElement('a');
                catLink.href = '#';
                catLink.innerHTML = c.name + ' <i class="fas fa-chevron-down"></i>';
                li.appendChild(catLink);

                var subUl = document.createElement('ul');
                subUl.className = 'mobile-sub-menu';
                for (var si = 0; si < subcats.length; si++) {
                    var subLi = document.createElement('li');
                    var subLink = document.createElement('a');
                    subLink.href = 'shop.html?category=' + c.slug + '&subcategory=' + subcats[si].slug;
                    subLink.textContent = subcats[si].name;
                    subLi.appendChild(subLink);
                    subUl.appendChild(subLi);
                }
                li.appendChild(subUl);
            } else {
                var catLink2 = document.createElement('a');
                catLink2.href = 'shop.html?category=' + c.slug;
                catLink2.textContent = c.name;
                li.appendChild(catLink2);
            }
            fragment.appendChild(li);
        }

        if (refNode) {
            mobileList.insertBefore(fragment, refNode);
        } else {
            mobileList.appendChild(fragment);
        }
    }

    function fixFeatureCard() {
        var card = document.querySelector('[data-feature="support"]');
        if (!card) return;
        var clone = card.cloneNode(true);
        card.parentNode.replaceChild(clone, card);
        clone.addEventListener('click', function(e) {
            var wa = getNested(SETTINGS, 'contact', 'whatsapp');
            var url = wa ? 'https://wa.me/' + wa.replace(/[^0-9]/g, '') : 'https://wa.me/919690152441';
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    }

    function applyAnnouncement() {
        try {
            var bar = document.getElementById('announcementBar');
            if (!bar) { console.warn('[Announcement] #announcementBar not found'); return; }
            var rawStr = localStorage.getItem('crystaWebsite');
            var raw;
            try { raw = JSON.parse(rawStr); } catch(e) { console.warn('[Announcement] JSON parse failed', e); }
            var enabled = raw && raw.announcementEnabled !== undefined ? raw.announcementEnabled : true;
            var text = 'Free delivery on orders above \u20b9999 | Use code CRYSTA10 for 10% off';
            if (raw && raw.announcementText) text = raw.announcementText;
            var link = raw && raw.announcementLink ? raw.announcementLink : '';
            if (enabled === false) {
                bar.classList.add('hidden');
                return;
            }
            bar.classList.remove('hidden');
            var textEl = bar.querySelector('p');
            if (!textEl) { console.warn('[Announcement] <p> not found inside bar'); return; }
            if (link) {
                textEl.innerHTML = '<a href="' + link.replace(/"/g, '&quot;') + '" style="color:inherit;text-decoration:underline">' + text + '</a>';
            } else {
                textEl.textContent = text;
            }
        } catch(e) {
            console.error('[Announcement] Error:', e);
        }
    }

    function applyWhyUs() {
        var section = document.getElementById('featuresSection');
        if (!section) return;
        var rawStr = localStorage.getItem('crystaWebsite');
        var raw;
        try { raw = JSON.parse(rawStr); } catch(e) { raw = {}; }

        // Defaults
        var label = (raw && raw.whyusLabel) || 'Why Choose Us';
        var title = (raw && raw.whyusTitle) || 'Why Choose CRYSTA HOME DECOR';
        var subtitle = (raw && raw.whyusSubtitle) || 'Premium Home Decor That Brings Luxury To Every Home';
        var f1t = (raw && raw.whyusF1Title) || 'Premium Quality';
        var f1d = (raw && raw.whyusF1Desc) || 'Handpicked products with the finest craftsmanship.';
        var f2t = (raw && raw.whyusF2Title) || 'Free Shipping';
        var f2d = (raw && raw.whyusF2Desc) || 'Free delivery on orders above \u20b9999.';
        var f3t = (raw && raw.whyusF3Title) || '24/7 Support';
        var f3d = (raw && raw.whyusF3Desc) || 'We are here to help anytime you need us.';
        var f4t = (raw && raw.whyusF4Title) || 'Secure Payments';
        var f4d = (raw && raw.whyusF4Desc) || '100% safe & trusted payment experience.';

        var labelEl = document.getElementById('whyusLabel');
        var titleEl = document.getElementById('whyusTitle');
        var subEl = document.getElementById('whyusSubtitle');
        var grid = document.getElementById('whyusGrid');
        if (!grid) return;

        if (labelEl) labelEl.textContent = label;
        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = subtitle;

        var icons = ['fa-shield-alt', 'fa-truck', 'fa-headset', 'fa-lock'];
        var features = [
            { title: f1t, desc: f1d },
            { title: f2t, desc: f2d },
            { title: f3t, desc: f3d },
            { title: f4t, desc: f4d }
        ];

        grid.innerHTML = features.map(function(f, i) {
            var icon = icons[i] || 'fa-gem';
            return '<div class="features-card" data-feature="' + (i === 2 ? 'support' : '') + '">' +
                '<div class="features-icon-wrap"><i class="fas ' + icon + '"></i></div>' +
                '<h3 class="features-card-title">' + esc(f.title) + '</h3>' +
                '<p class="features-card-text">' + esc(f.desc) + '</p>' +
            '</div>';
        }).join('');

        // Re-bind support card click for WhatsApp
        fixFeatureCard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();