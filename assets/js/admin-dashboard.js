function initDashboard() {
    // Total products
    var totalProducts = document.getElementById('dashTotalProducts');
    if (totalProducts) {
        var pCount = typeof products !== 'undefined' ? products.length : 0;
        totalProducts.textContent = pCount;
    }
    // Categories
    var totalCategories = document.getElementById('dashTotalCategories');
    if (totalCategories) {
        var cCount = typeof CATEGORIES !== 'undefined' ? CATEGORIES.length : 0;
        totalCategories.textContent = cCount;
    }
    // Orders
    var totalOrders = document.getElementById('dashTotalOrders');
    if (totalOrders) {
        var ordersData = lsGet('crystaOrders', []);
        totalOrders.textContent = ordersData.length;
    }
    // Customers
    var totalCustomers = document.getElementById('dashTotalCustomers');
    if (totalCustomers) {
        var custData = lsGet('crystaCustomers', []);
        totalCustomers.textContent = custData.length;
    }
    // Coupons
    var totalCoupons = document.getElementById('dashTotalCoupons');
    if (totalCoupons) {
        var coupData = lsGet('crystaCoupons', []);
        totalCoupons.textContent = coupData.length;
    }
    // Banners
    var totalBanners = document.getElementById('dashTotalBanners');
    if (totalBanners) {
        var bCount = typeof banners !== 'undefined' ? banners.length : 0;
        totalBanners.textContent = bCount;
    }
    // Alerts: low stock products
    var alertsEl = document.getElementById('dashAlerts');
    if (alertsEl && typeof products !== 'undefined') {
        var lowStock = [];
        for (var i = 0; i < products.length; i++) {
            if (products[i].stock > 0 && products[i].stock <= 5) {
                lowStock.push(products[i].name);
            }
        }
        if (lowStock.length > 0) {
            alertsEl.innerHTML = '<div class="dash-alert-item"><i class="fas fa-exclamation-circle" style="color:#e74c3c"></i> <strong>' + lowStock.length + '</strong> product(s) low in stock: ' + lowStock.join(', ') + '</div>';
        } else {
            alertsEl.innerHTML = '<p class="dash-empty">No alerts. All stock levels are healthy.</p>';
        }
    }
    // Activity
    var activityEl = document.getElementById('dashActivity');
    if (activityEl) {
        var items = [];
        if (pCount > 0) items.push('<div class="dash-activity-item"><i class="fas fa-box"></i> ' + pCount + ' products loaded</div>');
        if (cCount > 0) items.push('<div class="dash-activity-item"><i class="fas fa-tags"></i> ' + cCount + ' categories configured</div>');
        if (items.length > 0) {
            activityEl.innerHTML = items.join('');
        }
    }
}
