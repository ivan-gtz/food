document.addEventListener('DOMContentLoaded', () => {
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const volumeControl = document.getElementById('volume-control');
    const restaurantNameInput = document.getElementById('restaurant-name-input');
    const restaurantLogoUpload = document.getElementById('restaurant-logo-upload');
    const currencySymbolInput = document.getElementById('currency-symbol-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    let currentUser = null;

    const getCurrentUser = () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };

    const getSettingsKey = () => {
        if (currentUser && currentUser.role === 'restaurant' && currentUser.id) {
            return `restaurant_${currentUser.id}_appSettings`;
        } else if (currentUser && currentUser.role === 'admin') {
            return `admin_appSettings`;
        }
        return 'appSettings';
    };

    const setGlobalVolume = (volume) => {
        console.log(`Global volume set to: ${volume}`);
        localStorage.setItem(getSettingsKey().replace('_appSettings', '_appVolume'), volume);
        if (window.parent) {
            window.parent.postMessage({ type: 'volumeChanged', volume: volume }, window.location.origin);
        }
    };

    const loadAndApplySettings = () => {
        currentUser = getCurrentUser();
        const savedVolume = localStorage.getItem(getSettingsKey().replace('_appSettings', '_appVolume'));
        if (savedVolume !== null) {
            volumeControl.value = parseFloat(savedVolume);
        } else {
            volumeControl.value = 1;
        }

        const appSettings = JSON.parse(localStorage.getItem(getSettingsKey()) || '{}');
        restaurantNameInput.value = appSettings.restaurantName || '';
        currencySymbolInput.value = appSettings.currencySymbol || '';
    };

    volumeControl.addEventListener('input', (event) => {
        setGlobalVolume(event.target.value);
    });

    saveSettingsBtn.addEventListener('click', () => {
        currentUser = getCurrentUser();
        
        const settingsToSave = {
            restaurantName: restaurantNameInput.value.trim(),
            restaurantLogoUrl: '',
            currencySymbol: currencySymbolInput.value.trim()
        };

        const file = restaurantLogoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                settingsToSave.restaurantLogoUrl = e.target.result;
                localStorage.setItem(getSettingsKey(), JSON.stringify(settingsToSave));
                displaySaveFeedback();
                notifyParentAboutSettingsUpdate();
            };
            reader.onerror = () => {
                console.error("Error reading file.");
                alert("No se pudo leer el archivo del logo.");
                localStorage.setItem(getSettingsKey(), JSON.stringify(settingsToSave));
                displaySaveFeedback();
                notifyParentAboutSettingsUpdate();
            };
            reader.readAsDataURL(file);
        } else {
            const existingSettings = JSON.parse(localStorage.getItem(getSettingsKey()) || '{}');
            settingsToSave.restaurantLogoUrl = existingSettings.restaurantLogoUrl || '';
            localStorage.setItem(getSettingsKey(), JSON.stringify(settingsToSave));
            displaySaveFeedback();
            notifyParentAboutSettingsUpdate();
        }
    });

    const displaySaveFeedback = () => {
        const saveFeedback = document.createElement('p');
        saveFeedback.textContent = 'Ajustes guardados!';
        saveFeedback.style.color = 'green';
        saveFeedback.style.marginTop = '15px';
        saveFeedback.style.fontWeight = 'bold';
        saveFeedback.style.animation = 'fadeOut 3s forwards';
        
        const existingFeedback = saveSettingsBtn.parentNode.querySelector('p.feedback-message');
        if (existingFeedback) existingFeedback.remove();
        saveFeedback.classList.add('feedback-message');
        saveSettingsBtn.parentNode.insertBefore(saveFeedback, saveSettingsBtn.nextSibling);

        setTimeout(() => {
            saveFeedback.remove();
        }, 3000);
    };

    const notifyParentAboutSettingsUpdate = () => {
        if (window.parent) {
            window.parent.postMessage({ type: 'settingsUpdated' }, window.location.origin);
        }
    };

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    closeSettingsBtn.addEventListener('click', () => {
        if (window.parent) {
            window.parent.postMessage({ type: 'closeSettingsModal' }, window.location.origin);
        }
    });

    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        settingsModal.classList.add('active');
    }

    loadAndApplySettings();
});

