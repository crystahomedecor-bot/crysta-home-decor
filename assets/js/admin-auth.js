/* ═══════════════════════════════════════════════════════════════
   CRYSTA HOME DECOR — Admin Authentication Module
   ═══════════════════════════════════════════════════════════════ */

/* ── CONFIGURATION ── */
/* Change credentials here only */
const ADMIN_CREDENTIALS = {
    username: 'crystadmin',
    password: 'Crysta@9927'
};

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const STORAGE_KEYS = {
    session: 'crysta_admin_session',
    loginTime: 'crysta_admin_login_time',
    lastActivity: 'crysta_admin_last_activity',
    failedAttempts: 'crysta_admin_failed_attempts',
    lockoutUntil: 'crysta_admin_lockout_until'
};

/* ── SESSION MANAGEMENT ── */

function adminAuthGet(key, def) {
    try { var v = sessionStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch(e) { return def; }
}

function adminAuthSet(key, val) {
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

function adminAuthRemove(key) {
    try { sessionStorage.removeItem(key); } catch(e) {}
}

function adminLsGet(key, def) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch(e) { return def; }
}

function adminLsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

function adminLsRemove(key) {
    try { localStorage.removeItem(key); } catch(e) {}
}

/* Check if user is authenticated */
function isAdminAuthenticated() {
    var auth = adminAuthGet(STORAGE_KEYS.session, false);
    if (!auth) return false;

    var lastActivity = adminAuthGet(STORAGE_KEYS.lastActivity, 0);
    var now = Date.now();

    if (now - lastActivity > SESSION_DURATION_MS) {
        adminLogout();
        return false;
    }

    // Update last activity silently
    adminAuthSet(STORAGE_KEYS.lastActivity, now);
    return true;
}

/* Perform login */
function adminLogin(username, password) {
    // Check lockout
    if (isAdminLockedOut()) {
        return { success: false, locked: true };
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        var now = Date.now();
        adminAuthSet(STORAGE_KEYS.session, true);
        adminAuthSet(STORAGE_KEYS.loginTime, now);
        adminAuthSet(STORAGE_KEYS.lastActivity, now);
        adminLsRemove(STORAGE_KEYS.failedAttempts);
        adminLsRemove(STORAGE_KEYS.lockoutUntil);
        return { success: true };
    }

    // Failed attempt
    var attempts = adminLsGet(STORAGE_KEYS.failedAttempts, 0) + 1;
    adminLsSet(STORAGE_KEYS.failedAttempts, attempts);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        var lockUntil = Date.now() + LOCKOUT_DURATION_MS;
        adminLsSet(STORAGE_KEYS.lockoutUntil, lockUntil);
        return { success: false, locked: true, attempts: attempts, lockoutUntil: lockUntil };
    }

    return { success: false, attempts: attempts, remaining: MAX_LOGIN_ATTEMPTS - attempts };
}

/* Check if locked out */
function isAdminLockedOut() {
    var lockUntil = adminLsGet(STORAGE_KEYS.lockoutUntil, 0);
    if (lockUntil === 0) return false;
    if (Date.now() < lockUntil) return true;
    adminLsRemove(STORAGE_KEYS.lockoutUntil);
    adminLsRemove(STORAGE_KEYS.failedAttempts);
    return false;
}

/* Get remaining lockout time in seconds */
function getAdminLockoutRemaining() {
    var lockUntil = adminLsGet(STORAGE_KEYS.lockoutUntil, 0);
    if (lockUntil === 0) return 0;
    var remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
    if (remaining === 0) {
        adminLsRemove(STORAGE_KEYS.lockoutUntil);
        adminLsRemove(STORAGE_KEYS.failedAttempts);
    }
    return remaining;
}

/* Get failed attempts count */
function getAdminFailedAttempts() {
    return adminLsGet(STORAGE_KEYS.failedAttempts, 0);
}

/* Logout */
function adminLogout() {
    adminAuthRemove(STORAGE_KEYS.session);
    adminAuthRemove(STORAGE_KEYS.loginTime);
    adminAuthRemove(STORAGE_KEYS.lastActivity);
}

/* ── IDLE TIMER ── */

function adminInitIdleTimer() {
    var resetActivity = function() {
        if (adminAuthGet(STORAGE_KEYS.session, false)) {
            adminAuthSet(STORAGE_KEYS.lastActivity, Date.now());
        }
    };

    document.addEventListener('click', resetActivity);
    document.addEventListener('keydown', resetActivity);
    document.addEventListener('mousemove', resetActivity);
    document.addEventListener('touchstart', resetActivity);
}

/* ── AUTO-LOGOUT CHECK (runs on crysta-dashboard-2026.html) ── */

function adminCheckSession() {
    if (!isAdminAuthenticated()) {
        adminLogout();
        window.location.replace('staff-access-2026.html');
        return false;
    }
    adminInitIdleTimer();
    return true;
}

/* ── EXPOSE GLOBALLY ── */
window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
window.isAdminAuthenticated = isAdminAuthenticated;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.isAdminLockedOut = isAdminLockedOut;
window.getAdminLockoutRemaining = getAdminLockoutRemaining;
window.getAdminFailedAttempts = getAdminFailedAttempts;
window.adminCheckSession = adminCheckSession;
window.adminInitIdleTimer = adminInitIdleTimer;
