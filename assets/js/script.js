/* ============================
   STICKY HEADER
============================ */

const siteHeader = document.getElementById("siteHeader");

const throttledHeader = throttle(function() {
    if (window.scrollY > 60) {
        siteHeader.classList.add("scrolled");
    } else {
        siteHeader.classList.remove("scrolled");
    }
}, 100);

window.addEventListener("scroll", throttledHeader);

/* ============================
   ANNOUNCEMENT BAR
============================ */

const announcementBar = document.getElementById("announcementBar");
const announcementClose = document.getElementById("announcementClose");

if (announcementClose && announcementBar) {
    announcementClose.addEventListener("click", () => {
        announcementBar.classList.add("hidden");
    });
}

/* ============================
   MOBILE MENU
============================ */

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

function openMobileMenu() {
    mobileMenu.classList.add("active");
    mobileMenuOverlay.classList.add("active");
    mobileMenuBtn.classList.add("active");
    mobileMenuBtn.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
}

function closeMobileMenu() {
    mobileMenu.classList.remove("active");
    mobileMenuOverlay.classList.remove("active");
    mobileMenuBtn.classList.remove("active");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
        if (mobileMenu.classList.contains("active")) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu);
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", closeMobileMenu);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        closeMobileMenu();
    }
});

/* Mobile submenu accordions */

document.querySelectorAll(".mobile-sub-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const parent = toggle.closest(".mobile-has-sub");
        const isOpen = parent.classList.contains("open");

        document.querySelectorAll(".mobile-has-sub.open").forEach((item) => {
            item.classList.remove("open");
        });

        if (!isOpen) {
            parent.classList.add("open");
        }
    });
});

/* ============================
   SCROLL REVEAL
============================ */

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute('data-delay'), 10);
            if (delay) {
                setTimeout(() => { el.classList.add("show"); }, delay);
            } else {
                el.classList.add("show");
            }
            observer.unobserve(el);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".fade-up").forEach((el) => {
    observer.observe(el);
});

/* ============================
   HERO SLIDER
============================ */

(function initHeroSlider() {
    const heroSlider = document.getElementById("heroSlider");
    if (!heroSlider) return;

    const slides = heroSlider.querySelectorAll(".hero-slide");
    const dots = heroSlider.querySelectorAll(".hero-dot");
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");

    let currentSlide = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 5000;

    function goToSlide(index) {
        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");
        dots[currentSlide].setAttribute("aria-selected", "false");

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");
        dots[currentSlide].setAttribute("aria-selected", "true");
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function resetAutoplay() {
        startAutoplay();
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevSlide();
            resetAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            resetAutoplay();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const slideIndex = parseInt(dot.getAttribute("data-slide"), 10);
            if (slideIndex !== currentSlide) {
                goToSlide(slideIndex);
                resetAutoplay();
            }
        });
    });

    heroSlider.addEventListener("mouseenter", stopAutoplay);
    heroSlider.addEventListener("mouseleave", startAutoplay);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    startAutoplay();
})();






/* ============================
   TESTIMONIALS CAROUSEL
============================ */

(function initTestCarousel() {
    const track = document.getElementById('testTrack');
    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');
    const dotsContainer = document.getElementById('testDots');
    if (!track) return;

    const slides = track.querySelectorAll('.test-slide');
    const total = slides.length;
    if (total < 2) return;

    let current = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 5000;
    const carousel = document.getElementById('testCarousel');

    function renderDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'test-dot' + (i === current ? ' active' : '');
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            dot.addEventListener('click', function() {
                goToSlide(i);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index) {
        current = (index + total) % total;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        dotsContainer.querySelectorAll('.test-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function nextSlide() { goToSlide(current + 1); }
    function prevSlide() { goToSlide(current - 1); }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function resetAutoplay() { startAutoplay(); }

    if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAutoplay(); });

    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
    }

    renderDots();
    startAutoplay();
})();

/* ============================
   BACK TO TOP
============================ */

(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* ============================
   SHOPPING CART
============================ */

const Cart = {
    STORAGE_KEY: 'crysta_cart',

    getItems() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch { return {}; }
    },

    saveItems(items) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    },

    add(product) {
        const items = this.getItems();
        if (items[product.id]) {
            items[product.id].quantity += 1;
        } else {
            items[product.id] = { ...product, quantity: 1 };
        }
        this.saveItems(items);
        this.updateBadge();
        this.renderPanel();
    },

    remove(id) {
        const items = this.getItems();
        delete items[id];
        this.saveItems(items);
        this.updateBadge();
        this.renderPanel();
    },

    changeQty(id, delta) {
        const items = this.getItems();
        if (!items[id]) return;
        items[id].quantity = Math.max(1, items[id].quantity + delta);
        this.saveItems(items);
        this.renderPanel();
    },

    getCount() {
        return Object.values(this.getItems()).reduce((sum, item) => sum + item.quantity, 0);
    },

    getSubtotal() {
        return Object.values(this.getItems()).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateBadge() {
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = this.getCount();
    },

    renderPanel() {
        const items = this.getItems();
        const container = document.getElementById('cartItems');
        const empty = document.getElementById('cartEmpty');
        const footer = document.getElementById('cartFooter');
        const subtotalEl = document.getElementById('cartSubtotal');
        if (!container) return;

        const entries = Object.values(items);
        if (entries.length === 0) {
            if (empty) empty.style.display = 'flex';
            container.innerHTML = '';
            if (footer) footer.style.display = 'none';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (footer) footer.style.display = 'block';
        if (subtotalEl) subtotalEl.textContent = '₹' + this.getSubtotal().toLocaleString('en-IN');

        container.innerHTML = entries.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image"><img src="${typeof imgUrl !== 'undefined' ? imgUrl(item.image) : item.image}" alt="${item.name}" loading="lazy"></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                    <div class="cart-item-actions">
                        <button type="button" class="cart-qty-btn" data-action="dec">−</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button type="button" class="cart-qty-btn" data-action="inc">+</button>
                    </div>
                </div>
                <button type="button" class="cart-item-remove" data-action="remove" aria-label="Remove item"><i class="fas fa-times"></i></button>
            </div>
        `).join('');

        container.querySelectorAll('[data-action="inc"]').forEach(btn => {
            btn.addEventListener('click', function() {
                Cart.changeQty(this.closest('.cart-item').dataset.id, 1);
                Cart.updateBadge();
            });
        });
        container.querySelectorAll('[data-action="dec"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.cart-item').dataset.id;
                const items = Cart.getItems();
                if (items[id] && items[id].quantity <= 1) {
                    Cart.remove(id);
                } else {
                    Cart.changeQty(id, -1);
                    Cart.updateBadge();
                }
            });
        });
        container.querySelectorAll('[data-action="remove"]').forEach(btn => {
            btn.addEventListener('click', function() {
                Cart.remove(this.closest('.cart-item').dataset.id);
            });
        });
    },

    open() {
        this.renderPanel();
        document.getElementById('cartPanel').classList.add('active');
        document.getElementById('cartOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        document.getElementById('cartPanel').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }
};

/* ============================
   WISHLIST
============================ */

const Wishlist = {
    STORAGE_KEY: 'crysta_wishlist',

    getItems() {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
        catch { return {}; }
    },

    saveItems(items) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    },

    add(product) {
        var items = this.getItems();
        if (items[product.id]) return false;
        items[product.id] = { id: product.id, name: product.name, price: product.price, image: imgUrl(product.image) };
        this.saveItems(items);
        this.updateBadge();
        return true;
    },

    remove(id) {
        var items = this.getItems();
        if (!items[id]) return false;
        delete items[id];
        this.saveItems(items);
        this.updateBadge();
        return true;
    },

    toggle(product) {
        var items = this.getItems();
        if (items[product.id]) {
            delete items[product.id];
            this.saveItems(items);
            this.updateBadge();
            return false;
        }
        items[product.id] = { id: product.id, name: product.name, price: product.price, image: imgUrl(product.image) };
        this.saveItems(items);
        this.updateBadge();
        return true;
    },

    has(id) {
        var items = this.getItems();
        return !!items[id];
    },

    getCount() {
        return Object.keys(this.getItems()).length;
    },

    updateBadge() {
        var badge = document.getElementById('wishlistCount');
        if (badge) badge.textContent = this.getCount();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Cart.updateBadge();
    Wishlist.updateBadge();

    document.getElementById('cartOpenBtn').addEventListener('click', function(e) {
        e.preventDefault();
        Cart.open();
    });

    document.getElementById('cartCloseBtn').addEventListener('click', Cart.close);
    document.getElementById('cartOverlay').addEventListener('click', Cart.close);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('cartPanel').classList.contains('active')) {
            Cart.close();
        }
    });

    document.querySelectorAll('.search-form, .mobile-search-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var input = this.querySelector('input[type="search"]');
            var q = input ? input.value.trim() : '';
            if (q) {
                window.location.href = 'search.html?q=' + encodeURIComponent(q);
            }
        });
    });

    // WhatsApp Checkout
    function numEmoji(n) {
        var e = ['0\uFE0F\u20E3','1\uFE0F\u20E3','2\uFE0F\u20E3','3\uFE0F\u20E3','4\uFE0F\u20E3','5\uFE0F\u20E3','6\uFE0F\u20E3','7\uFE0F\u20E3','8\uFE0F\u20E3','9\uFE0F\u20E3'];
        return String(n).split('').map(function(d) { return e[parseInt(d)]; }).join('');
    }
    var checkoutBtn = document.querySelector('#cartFooter .cart-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var items = Cart.getItems();
            var entries = Object.values(items);
            if (entries.length === 0) {
                Toast.error('Your cart is empty.', 'Cart Empty');
                return;
            }
            var sep = '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501';
            var lines = [];
            lines.push('Hello CRYSTA HOME DECOR,');
            lines.push('');
            lines.push('\uD83D\uDED2 NEW ORDER REQUEST');
            lines.push('');
            entries.forEach(function(item, idx) {
                lines.push(sep);
                lines.push('');
                lines.push(numEmoji(idx + 1) + ' Product ID : ' + item.id);
                lines.push('\uD83D\uDCE6 Product : ' + item.name);
                lines.push('');
                lines.push('\u2022 Quantity : ' + item.quantity);
                lines.push('\u2022 Unit Price : \u20b9' + item.price.toLocaleString('en-IN'));
                lines.push('\u2022 Subtotal : \u20b9' + (item.price * item.quantity).toLocaleString('en-IN'));
                lines.push('');
            });
            lines.push(sep);
            lines.push('');
            lines.push('\uD83D\uDCE6 Total Products : ' + entries.length);
            lines.push('\uD83E\uDDFE Total Quantity : ' + Cart.getCount());
            lines.push('\uD83D\uDCB0 Grand Total : \u20b9' + Cart.getSubtotal().toLocaleString('en-IN'));
            lines.push('');
            lines.push(sep);
            lines.push('');
            lines.push('\uD83D\uDC64 CUSTOMER DETAILS');
            lines.push('');
            lines.push('Name :');
            lines.push('Phone :');
            lines.push('Address :');
            lines.push('');
            lines.push(sep);
            lines.push('');
            lines.push('Please confirm product availability and expected delivery time.');
            lines.push('');
            lines.push('Thank you!');
            var message = lines.join('\n');
            var wa = typeof SETTINGS !== 'undefined' && SETTINGS.contact ? SETTINGS.contact.whatsapp : '';
            var waNumber = wa ? wa.replace(/[^0-9]/g, '') : '919690152441';
            window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message), '_blank');
        });
    }
});

/* ============================
   TOAST NOTIFICATION SYSTEM
============================ */

const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(message, title, type, duration) {
        if (!this.container) this.init();
        if (!this.container) return;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        const el = document.createElement('div');
        el.className = 'toast toast-' + type;
        el.innerHTML =
            '<div class="toast-icon"><i class="' + (icons[type] || icons.info) + '"></i></div>' +
            '<div class="toast-body">' +
                (title ? '<div class="toast-title">' + title + '</div>' : '') +
                '<div class="toast-message">' + message + '</div>' +
            '</div>' +
            '<button type="button" class="toast-close-btn" aria-label="Close notification"><i class="fas fa-times"></i></button>';

        this.container.appendChild(el);

        requestAnimationFrame(() => {
            el.classList.add('show');
        });

        el.querySelector('.toast-close-btn').addEventListener('click', function() {
            Toast.hide(el);
        });

        if (duration !== 0) {
            setTimeout(() => { this.hide(el); }, duration || 3500);
        }
    },

    hide(el) {
        if (!el || el.classList.contains('hiding')) return;
        el.classList.remove('show');
        el.classList.add('hiding');
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 500);
    },

    success(message, title, duration) { this.show(message, title, 'success', duration); },
    error(message, title, duration) { this.show(message, title, 'error', duration); },
    info(message, title, duration) { this.show(message, title, 'info', duration); }
};

/* ============================
   PAGE LOADER
============================ */

(function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    window.addEventListener('load', function() {
        setTimeout(function() {
            loader.classList.add('hidden');
        }, 600);
    });

    if (document.readyState === 'complete') {
        loader.classList.add('hidden');
    }
})();

/* ============================
   ENHANCED SCROLL REVEAL
============================ */

(function initScrollReveal() {
    const elms = document.querySelectorAll('.fade-left, .fade-right');

    const scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.getAttribute('data-delay'), 10);
                if (delay) {
                    setTimeout(function() {
                        el.classList.add('show');
                    }, delay);
                } else {
                    el.classList.add('show');
                }
                scrollObserver.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elms.forEach(function(el) {
        scrollObserver.observe(el);
    });
})();

/* ============================
   NEWSLETTER VALIDATION
============================ */

(function initNewsletter() {
    const form = document.querySelector('.footer-nl-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input.value.trim();

        if (!email) {
            Toast.error('Please enter your email address.', 'Empty Field');
            input.focus();
            return;
        }

        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            Toast.error('Please enter a valid email address.', 'Invalid Email');
            input.focus();
            return;
        }

        Toast.success('You have been subscribed successfully!', 'Welcome!');
        input.value = '';
    });
})();

/* ============================
   BACK TO TOP - PROGRESS RING
============================ */

(function initBackToTopProgress() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const circle = btn.querySelector('svg circle');
    if (!circle) return;

    const circumference = 2 * Math.PI * 21;

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        const offset = circumference * (1 - progress);
        btn.style.setProperty('--progress-offset', offset + 'px');
    }

    const throttledUpdate = throttle(updateProgress, 100);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
        throttledUpdate();
    });

    updateProgress();
})();

/* ============================
   PERFORMANCE UTILITIES
============================ */

function debounce(fn, delay) {
    let timer;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    };
}

function throttle(fn, limit) {
    var inThrottle = false;
    return function() {
        var context = this;
        var args = arguments;
        if (!inThrottle) {
            fn.apply(context, args);
            inThrottle = true;
            setTimeout(function() { inThrottle = false; }, limit);
        }
    };
}

/* ============================
   PERFORMANCE: DEBOUNCE RESIZE
============================ */

(function initResizeOptimizer() {
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
    });
})();



/* ============================
   ACCESSIBILITY: TRAP FOCUS IN CART PANEL
============================ */

(function initCartTrap() {
    var panel = document.getElementById('cartPanel');
    if (!panel) return;

    var handler = function(e) {
        if (!panel.classList.contains('active')) return;
        var focusable = panel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    document.addEventListener('keydown', handler);
})();

/* ============================
   FEATURES MODAL
============================ */

(function initFeaturesModal() {
    var grid = document.querySelector('.features-grid') || document.getElementById('whyusGrid');
    var overlay = document.getElementById('featuresModalOverlay');
    var modal = document.getElementById('featuresModal');
    var closeBtn = document.getElementById('featuresModalClose');
    var modalIcon = document.getElementById('featuresModalIcon');
    var modalTitle = document.getElementById('featuresModalTitle');
    var modalList = document.getElementById('featuresModalList');

    if (!grid || !overlay || !modal) return;

    var modalData = {
        'fa-truck': {
            icon: '<i class="fas fa-truck"></i>',
            title: 'Free Delivery',
            items: ['Free delivery across India', 'Safe packaging', 'Fast dispatch', 'Order tracking available']
        },
        'fa-shield-alt': {
            icon: '<i class="fas fa-shield-alt"></i>',
            title: 'Premium Quality',
            items: ['Premium selected products', 'Quality inspection', 'Durable materials', 'Luxury finish']
        },
        'fa-lock': {
            icon: '<i class="fas fa-lock"></i>',
            title: 'Secure Payments',
            items: ['Secure checkout', 'UPI', 'Credit/Debit Cards', 'Net Banking', 'Safe encrypted payment']
        },
        'fa-headset': {
            icon: '<i class="fas fa-headset"></i>',
            title: '24/7 Support',
            items: ['Instant WhatsApp support', 'Quick response', 'Dedicated assistance', 'Customer-first approach']
        }
    };

    function openModal(key) {
        var d = modalData[key];
        if (!d) return;
        modalIcon.innerHTML = d.icon;
        modalTitle.textContent = d.title;
        modalList.innerHTML = d.items.map(function(item) {
            return '<li>' + item + '</li>';
        }).join('');
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    grid.addEventListener('click', function(e) {
        var card = e.target.closest('.features-card');
        if (!card) return;
        var key = card.getAttribute('data-feature');
        if (key === 'support') {
            var wa = (typeof SETTINGS !== 'undefined') ? (SETTINGS.contact && SETTINGS.contact.whatsapp) : '';
            var url = wa ? 'https://wa.me/' + String(wa).replace(/[^0-9]/g, '') : 'https://wa.me/919690152441';
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }
        var iconEl = card.querySelector('.features-icon-wrap i');
        if (!iconEl) return;
        var cls = '';
        for (var ci = 0; ci < iconEl.classList.length; ci++) {
            var cn = iconEl.classList[ci];
            if (cn.indexOf('fa-') === 0 && cn !== 'fas' && cn !== 'fab') { cls = cn; break; }
        }
        if (cls) openModal(cls);
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
})();


