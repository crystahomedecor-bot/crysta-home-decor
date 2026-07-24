function esc(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

var settings = {};
var settingsTab = 'general';

function initSettings() {
    if (typeof SETTINGS === 'undefined') return;
    settings = JSON.parse(JSON.stringify(SETTINGS));
    showSettingsTab('general');
    loadSettingsForm();
}

function showSettingsTab(tab) {
    settingsTab = tab;
    document.querySelectorAll('.settings-tab').forEach(function(el) {
        el.classList.toggle('active', el.dataset.settingTab === tab);
    });
    document.querySelectorAll('.settings-tab-content').forEach(function(el) {
        el.classList.toggle('active', el.id === 'settings-' + tab);
    });
    loadSettingsForm();
}

function loadSettingsForm() {
    if (!settings) return;
    if (!settings[settingsTab]) settings[settingsTab] = {};
    var s = settings[settingsTab];
    var container = document.getElementById('settings-' + settingsTab);
    if (!container) return;
    var inputs = container.querySelectorAll('[data-setting]');
    for (var i = 0; i < inputs.length; i++) {
        var key = inputs[i].dataset.setting;
        if (s[key] !== undefined) {
            if (inputs[i].type === 'checkbox') {
                inputs[i].checked = !!s[key];
            } else {
                inputs[i].value = s[key];
            }
        }
    }
}

function collectSettingsForm() {
    if (!settings[settingsTab]) settings[settingsTab] = {};
    var container = document.getElementById('settings-' + settingsTab);
    if (!container) return settings[settingsTab];
    var inputs = container.querySelectorAll('[data-setting]');
    for (var i = 0; i < inputs.length; i++) {
        var key = inputs[i].dataset.setting;
        if (inputs[i].type === 'checkbox') {
            settings[settingsTab][key] = inputs[i].checked;
        } else if (inputs[i].type === 'number') {
            settings[settingsTab][key] = parseFloat(inputs[i].value) || 0;
        } else {
            settings[settingsTab][key] = inputs[i].value;
        }
    }
    return settings[settingsTab];
}

function saveSettings() {
    collectSettingsForm();
    var statusEl = document.getElementById('settingsStatus');
    var saveBtn = document.getElementById('settingsSaveBtn');
    saveButtonState(saveBtn, 'saving');

    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiBase + '/api/settings', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.success) {
                statusEl.textContent = '';
                reloadSettings(function() {
                    saveButtonState(saveBtn, 'success', 'Settings Saved Successfully');
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
    xhr.send(JSON.stringify({ settings: settings }));
}

function handleSettingsImageUpload(inputId, settingKey) {
    var fileInput = document.getElementById(inputId);
    if (!fileInput.files || fileInput.files.length === 0) return;

    var formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('key', settingKey);
    formData.append('section', settingsTab);

    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiBase + '/api/upload-setting-image', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.success) {
                settings[settingsTab][settingKey] = resp.path;
                var input = document.querySelector('[data-setting="' + settingKey + '"]');
                if (input) input.value = resp.path;
                showToast('Image uploaded', 'success');
            }
        }
    };
    xhr.send(formData);
}

function reloadSettings(callback) {
    var apiBase = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    var script = document.createElement('script');
    script.src = apiBase + '/data/settings.js?_t=' + Date.now();
    script.onload = function() {
        settings = JSON.parse(JSON.stringify(SETTINGS));
        if (callback) callback();
    };
    document.head.appendChild(script);
}

function addSettingsEventListeners() {
    document.querySelectorAll('.settings-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
            collectSettingsForm();
            showSettingsTab(this.dataset.settingTab);
        });
    });

    document.getElementById('settingsSaveBtn').addEventListener('click', saveSettings);
}
