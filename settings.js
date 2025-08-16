import { db, auth, onAuthStateChanged } from './firebase-init.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const volumeControl = document.getElementById('volume-control');
    const restaurantNameInput = document.getElementById('restaurant-name-input');
    const restaurantLogoUpload = document.getElementById('restaurant-logo-upload');
    const currencySymbolInput = document.getElementById('currency-symbol-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    let currentUser = null;

    const setGlobalVolume = async (volume) => {
        console.log(`Global volume set to: ${volume}`);
        if (currentUser) {
            try {
                if (currentUser.role === 'restaurant' && currentUser.id) {
                    const restaurantRef = doc(db, 'restaurants', currentUser.id);
                    await updateDoc(restaurantRef, { 'settings.appVolume': volume });
                } else {
                    const userRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userRef, { 'settings.appVolume': volume });
                }
            } catch (error) {
                console.error('Error saving volume:', error);
            }
        }
        if (window.parent) {
            window.parent.postMessage({ type: 'volumeChanged', volume: volume }, window.location.origin);
        }
    };

    const loadAndApplySettings = async () => {
        if (!currentUser) {
            volumeControl.value = 1;
            restaurantNameInput.value = '';
            currencySymbolInput.value = '';
            return;
        }

        try {
            let docRef;
            if (currentUser.role === 'restaurant' && currentUser.id) {
                docRef = doc(db, 'restaurants', currentUser.id);
            } else {
                docRef = doc(db, 'users', currentUser.uid);
            }
            const docSnap = await getDoc(docRef);
            const appSettings = docSnap.exists() ? (docSnap.data().settings || {}) : {};
            volumeControl.value = appSettings.appVolume !== undefined ? parseFloat(appSettings.appVolume) : 1;
            restaurantNameInput.value = appSettings.restaurantName || '';
            currencySymbolInput.value = appSettings.currencySymbol || '';
        } catch (error) {
            console.error('Error loading settings:', error);
            volumeControl.value = 1;
        }
    };

    volumeControl.addEventListener('input', async (event) => {
        await setGlobalVolume(event.target.value);
    });

    saveSettingsBtn.addEventListener('click', async () => {
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

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                currentUser = userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null;
            } catch (error) {
                console.error('Error fetching user data:', error);
                currentUser = null;
            }
        } else {
            currentUser = null;
        }
        await loadAndApplySettings();
    });
});

