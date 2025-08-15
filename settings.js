import { db } from './firebase-init.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
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

    const loadAndApplySettings = async () => {
        currentUser = getCurrentUser();
        const savedVolume = localStorage.getItem(getSettingsKey().replace('_appSettings', '_appVolume'));
        volumeControl.value = savedVolume !== null ? parseFloat(savedVolume) : 1;

        if (!currentUser || !currentUser.id) {
            restaurantNameInput.value = '';
            currencySymbolInput.value = '';
            return;
        }

        try {
            const restaurantRef = doc(db, 'restaurants', currentUser.id);
            const docSnap = await getDoc(restaurantRef);
            const appSettings = docSnap.exists() ? (docSnap.data().settings || {}) : {};
            restaurantNameInput.value = appSettings.restaurantName || '';
            currencySymbolInput.value = appSettings.currencySymbol || '';
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    volumeControl.addEventListener('input', (event) => {
        setGlobalVolume(event.target.value);
    });

    saveSettingsBtn.addEventListener('click', async () => {
        currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            alert('No se pudo identificar el restaurante.');
            return;
        }

        const settingsToSave = {
            restaurantName: restaurantNameInput.value.trim(),
            restaurantLogoUrl: '',
            currencySymbol: currencySymbolInput.value.trim()
        };

        const restaurantRef = doc(db, 'restaurants', currentUser.id);

        const saveToFirestore = async () => {
            try {
                await updateDoc(restaurantRef, {
                    'settings.restaurantName': settingsToSave.restaurantName,
                    'settings.restaurantLogoUrl': settingsToSave.restaurantLogoUrl,
                    'settings.currencySymbol': settingsToSave.currencySymbol
                });
                displaySaveFeedback();
                notifyParentAboutSettingsUpdate();
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('No se pudieron guardar los ajustes.');
            }
        };

        const file = restaurantLogoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                settingsToSave.restaurantLogoUrl = e.target.result;
                await saveToFirestore();
            };
            reader.onerror = async () => {
                console.error('Error reading file.');
                alert('No se pudo leer el archivo del logo.');
                await saveToFirestore();
            };
            reader.readAsDataURL(file);
        } else {
            try {
                const docSnap = await getDoc(restaurantRef);
                const existingSettings = docSnap.exists() ? (docSnap.data().settings || {}) : {};
                settingsToSave.restaurantLogoUrl = existingSettings.restaurantLogoUrl || '';
            } catch (error) {
                console.error('Error fetching existing settings:', error);
            }
            await saveToFirestore();
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

