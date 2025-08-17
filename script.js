import { db, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase-init.js';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, deleteDoc, addDoc, runTransaction, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const orderResultDiv = document.getElementById('order-result');
    const customerNameInput = document.getElementById('customer-name');
    const mainMenuUlPlatos = document.getElementById('main-menu-list-platos');
    const mainMenuUlBebidas = document.getElementById('main-menu-list-bebidas');
    const orderNotesInput = document.getElementById('order-notes-input');
    const printInvoiceBtn = document.getElementById('print-invoice-btn');
    const totalPriceSpan = document.getElementById('total-price');
    const currencyDisplaySpan = document.getElementById('currency-display');
    
    // New: Floating total elements
    const floatingTotalDiv = document.getElementById('floating-total');
    const floatingTotalAmount = document.getElementById('floating-total-amount');
    const floatingCurrencyDisplay = document.getElementById('floating-currency-display');
    
    const orderHistoryDiv = document.getElementById('order-history');
    const historyListUl = document.getElementById('history-list');
    const resetHistoryBtn = document.getElementById('reset-history-btn');
    const downloadHistoryBtn = document.getElementById('download-history-btn'); // New: Download History button

    const menuManagementDiv = document.getElementById('menu-management');
    const itemNameInput = document.getElementById('item-name-input');
    const itemPriceInput = document.getElementById('item-price-input');
    const itemTypeInput = document.getElementById('item-type-input'); 
    const addUpdateItemBtn = document.getElementById('add-update-item-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const managementMenuListDiv = document.getElementById('management-menu-list');
    const resetMenuBtn = document.getElementById('reset-menu-btn');

    const historyPaginationControlsDiv = document.getElementById('history-pagination-controls');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const settingsIframe = document.getElementById('settings-iframe');

    const dineInRadio = document.getElementById('dine-in');
    const takeawayRadio = document.getElementById('takeaway');

    const dailySummaryDiv = document.getElementById('daily-summary');
    const summaryTotalOrdersSpan = document.getElementById('summary-total-orders');
    const summaryTotalRevenueSpan = document.getElementById('summary-total-revenue');
    const summaryCurrencyDisplaySpan = document.getElementById('summary-currency-display');
    const resetDailySummaryBtn = document.getElementById('reset-daily-summary-btn');
    const summaryExtraRevenueSpan = document.getElementById('summary-extra-revenue');
    const downloadSummaryBtn = document.getElementById('download-summary-btn');

    const topItemsDiv = document.getElementById('top-items');
    const topItemsChartCanvas = document.getElementById('topItemsChart');
    const noTopItemsMessage = document.getElementById('no-top-items-message');
    const resetTopItemsBtn = document.getElementById('reset-top-items-btn');
    let topItemsChartInstance = null;
    const downloadTopItemsBtn = document.getElementById('download-top-items-btn');

    const editOrderModalOverlay = document.getElementById('edit-order-modal-overlay');
    const closeEditOrderModalBtn = document.getElementById('close-edit-order-modal-btn');
    const editOrderIdSpan = document.getElementById('edit-order-id');
    const editCustomerNameInput = document.getElementById('edit-customer-name');
    const editDineInRadio = document.getElementById('edit-dine-in');
    const editTakeawayRadio = document.getElementById('edit-takeaway');
    const editOrderItemsListPlatos = document.getElementById('edit-order-items-list-platos'); 
    const editOrderItemsListBebidas = document.getElementById('edit-order-items-list-bebidas'); 
    const editOrderItemsListPostres = document.getElementById('edit-order-items-list-postres'); 
    const editOrderNotesInput = document.getElementById('edit-order-notes');
    const editOrderStatusSelect = document.getElementById('edit-order-status');
    const editOrderTotalPriceSpan = document.getElementById('edit-order-total-price');
    const editCurrencyDisplaySpan = document.getElementById('edit-currency-display');
    const saveEditedOrderBtn = document.getElementById('save-edited-order-btn');
    const editOrderMessage = document.getElementById('edit-order-message');

    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeLoginModalBtn = document.getElementById('close-login-modal-btn');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const loginMessage = document.getElementById('login-message');
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    const toggleLoginPassword = document.getElementById('toggle-login-password'); // New
    const toggleRestaurantPassword = document.getElementById('toggle-restaurant-password'); // New
    const loginAttemptsMessage = document.getElementById('login-attempts-message'); // New

    const restaurantManagementSection = document.getElementById('restaurant-management-section');
    const navRestaurantManagement = document.getElementById('nav-restaurant-management');
    const restaurantIdInput = document.getElementById('restaurant-id-input');
    const restaurantNameManagementInput = document.getElementById('restaurant-name-management-input');
    const addUpdateRestaurantBtn = document.getElementById('add-update-restaurant-btn');
    const cancelEditRestaurantBtn = document.getElementById('cancel-edit-restaurant-btn');
    const restaurantListManagementDiv = document.getElementById('restaurant-list-management');
    const startDateInput = document.getElementById('start-date-input'); // New
    const endDateInput = document.getElementById('end-date-input');     // New

    const currentYearSpan = document.getElementById('current-year');

    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sidebarNavLinks = document.querySelectorAll('.sidebar-nav a');
    const containerWrapper = document.querySelector('.container-wrapper');

    const homeSection = document.getElementById('home-section');
    const contentSections = document.querySelectorAll('.content-section');
    const navHistory = document.getElementById('nav-history');
    const navDailySummary = document.getElementById('nav-daily-summary');
    const navTopItems = document.getElementById('nav-top-items');
    const navMenuManagement = document.getElementById('nav-menu-management');
    const navMonitor = document.getElementById('nav-monitor');
    const navDetailMonitor = document.getElementById('nav-detail-monitor');

    // New: Elements for Order Type Distribution Chart
    const orderTypeChartCanvas = document.getElementById('orderTypeChart');
    const noOrderTypeStatsMessage = document.getElementById('no-order-type-stats-message');
    let orderTypeChartInstance = null;

    // New order buttons
    const calculateBtn = document.getElementById('calculate-btn');

    let editingItemId = null;
    let editingOrderId = null; 
    let editingRestaurantId = null; 

    let currentPage = 1;
    const itemsPerPage = 10;

    let lastPlacedOrder = null;

    let appSettings = {};
    let currentUser = null; 

    let currentOrderTotal = 0;

    let audioContext;
    let gainNode;

    // New: Splash screen elements
    const splashScreen = document.getElementById('splash-screen');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // New: Login attempts counter
    let loginAttempts = 0;
    const MAX_LOGIN_ATTEMPTS = 5;

    const hideSplashScreen = () => {
        splashScreen.classList.add('hidden');
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.style.display = 'none';
            containerWrapper.classList.remove('hidden');
        }, { once: true });
    };

    // Initialize and hide splash screen based on device
    if (isMobile) {
        setTimeout(hideSplashScreen, 3000);
    } else {
        splashScreen.style.display = 'none';
        containerWrapper.classList.remove('hidden');
    }

    const getStorageKey = (key) => {
        if (currentUser && currentUser.role === 'restaurant' && currentUser.id) {
            return `${currentUser.id}_${key}`;
        } else if (currentUser && currentUser.role === 'admin') {
            return `admin_default_${key}`; // Admin uses a default set of data
        }
        return key; 
    };

    const getSettingsKey = () => {
        if (currentUser && currentUser.role === 'restaurant' && currentUser.id) {
            return `restaurant_${currentUser.id}_appSettings`;
        } else if (currentUser && currentUser.role === 'admin') {
            return `admin_appSettings`;
        }
        return 'appSettings'; // Default fallback, though should be covered by user login
    };

    const getAudioContext = async () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            let savedVolume = 1;
            if (currentUser && currentUser.id) {
                try {
                    const restaurantRef = doc(db, 'restaurants', currentUser.id);
                    const docSnap = await getDoc(restaurantRef);
                    savedVolume = parseFloat(docSnap.exists() ? (docSnap.data().settings?.appVolume ?? 1) : 1);
                } catch (error) {
                    console.error('Error loading volume:', error);
                }
            }
            gainNode.gain.value = savedVolume;
        }
        return audioContext;
    };

    const playSound = async (soundPath) => {
        const context = await getAudioContext();
        try {
            const response = await fetch(soundPath);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);

            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode);
            source.start(0);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data && event.data.type === 'volumeChanged') {
            const newVolume = parseFloat(event.data.volume);
            if (gainNode) {
                gainNode.gain.value = newVolume;
                console.log('Volume updated in index.js:', newVolume);
            } else {
                await getAudioContext();
                gainNode.gain.value = newVolume;
                console.log('AudioContext initialized and volume set:', newVolume);
            }
        } else if (event.data && event.data.type === 'closeSettingsModal') {
            settingsModalOverlay.classList.remove('active');
            settingsModalOverlay.addEventListener('transitionend', function handler() {
                settingsModalOverlay.classList.add('hidden');
                settingsIframe.src = 'about:blank';
                settingsModalOverlay.removeEventListener('transitionend', handler);
            }, { once: true });
        } else if (event.data && event.data.type === 'settingsUpdated') {
            console.log('Settings updated from iframe. Monitor(s) will refresh via storage event.');
            await loadAppSettings(); // Reload settings in the main app
            if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) {
                renderMainMenu(await loadMenu());
                updateTotalPrice();
                await updateDailySummary();
                renderTopItemsChart();
                renderOrderTypeChart(); // Re-render order type chart on settings update
            }
        }
    });

    const loadAppSettings = async () => {
        appSettings = {};
        if (currentUser && currentUser.id) {
            try {
                const restaurantRef = doc(db, 'restaurants', currentUser.id);
                const docSnap = await getDoc(restaurantRef);
                appSettings = docSnap.exists() ? (docSnap.data().settings || {}) : {};
            } catch (error) {
                console.error('Error loading app settings:', error);
            }
        }
        currencyDisplaySpan.textContent = appSettings.currencySymbol || '$';
        floatingCurrencyDisplay.textContent = appSettings.currencySymbol || '$';
        if (gainNode) {
            gainNode.gain.value = parseFloat(appSettings.appVolume !== undefined ? appSettings.appVolume : 1);
        }
    };

    const defaultMenuItems = [
        { id: 'item1', name: 'Hamburguesa Sencilla', price: 8.50, type: 'dish' },
        { id: 'item2', name: 'Pizza Pepperoni', price: 12.00, type: 'dish' },
        { id: 'item3', name: 'Ensalada César', price: 7.00, type: 'dish' },
        { id: 'item4', name: 'Papas Fritas', price: 3.50, type: 'dish' },
        { id: 'item5', name: 'Refresco', price: 2.00, type: 'drink' },
        { id: 'item6', name: 'Agua Embotellada', price: 1.50, type: 'drink' },
        { id: 'item8', name: 'Café Americano', price: 2.50, type: 'drink' },
        { id: 'item9', name: 'Tarta de Chocolate', price: 4.50, type: 'dessert' },
        { id: 'item10', name: 'Helado de Vainilla', price: 3.00, type: 'dessert' },
        { id: 'item11', name: 'Flan de Caramelo', price: 3.50, type: 'dessert' }
    ];

    const loadMenu = async () => {
        if (!currentUser || !currentUser.id) return defaultMenuItems;

        try {
            const restaurantRef = doc(db, "restaurants", currentUser.id);
            const docSnap = await getDoc(restaurantRef);

            if (docSnap.exists() && docSnap.data().menuItems) {
                // Si el menú existe en Firestore, lo retorna
                return docSnap.data().menuItems;
            } else {
                // Si no existe, retorna el menú por defecto y lo guarda en Firestore para futuros usos
                await saveMenu(defaultMenuItems);
                return defaultMenuItems;
            }
        } catch (error) {
            console.error("Error al cargar el menú: ", error);
            return defaultMenuItems; // Retorna el menú por defecto en caso de error
        }
    };

    const saveMenu = async (menu) => {
        if (!currentUser || !currentUser.id) return;
        const restaurantRef = doc(db, "restaurants", currentUser.id);
        try {
            await updateDoc(restaurantRef, { menuItems: menu });
        } catch (error) {
            console.error("Error al guardar el menú: ", error);
        }
    };

    const getNextMenuItemId = () => {
        return `item_${Date.now()}`;
    };

    const getMainMenuCheckboxes = () => Array.from(document.querySelectorAll('#home-section .menu-categories input[type="checkbox"]'));

    const renderMainMenu = (menu) => {
        mainMenuUlPlatos.innerHTML = '';
        mainMenuUlBebidas.innerHTML = '';
        const mainMenuUlPostres = document.getElementById('main-menu-list-postres');
        if (mainMenuUlPostres) mainMenuUlPostres.innerHTML = '';

        const currencySymbol = appSettings.currencySymbol || '$';

        const dishes = menu.filter(item => item.type === 'dish');
        const drinks = menu.filter(item => item.type === 'drink');
        const desserts = menu.filter(item => item.type === 'dessert');

        const renderCategory = (items, ulElement) => {
            if (items.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No hay platos disponibles.';
                ulElement.appendChild(li);
            } else {
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="item-container">
                            <div class="item-info">
                                <input type="checkbox" id="${item.id}" value="${item.name}" data-price="${item.price}" data-id="${item.id}" data-type="${item.type}">
                                <label for="${item.id}">${item.name} (${item.price.toFixed(2)} ${currencySymbol})</label>
                            </div>
                            <div class="quantity-controls">
                                <button type="button" class="qty-btn qty-decrease" data-id="${item.id}">-</button>
                                <input type="number" class="item-quantity" id="qty-${item.id}" value="1" min="1" max="99" data-id="${item.id}">
                                <button type="button" class="qty-btn qty-increase" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    `;
                    ulElement.appendChild(li);
                });
            }
        };

        renderCategory(dishes, mainMenuUlPlatos);
        renderCategory(drinks, mainMenuUlBebidas);
        if (mainMenuUlPostres) renderCategory(desserts, mainMenuUlPostres);

        // Add event listeners for quantity changes and checkbox toggles
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', updateTotalPrice);
            input.addEventListener('input', updateTotalPrice);
        });
        
        document.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const input = document.getElementById(`qty-${id}`);
                if (input.value > 1) {
                    input.value = parseInt(input.value) - 1;
                    updateTotalPrice();
                }
            });
        });
        
        document.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const input = document.getElementById(`qty-${id}`);
                if (input.value < 99) {
                    input.value = parseInt(input.value) + 1;
                    updateTotalPrice();
                }
            });
        });
        
        // Add checkbox change listeners
        getMainMenuCheckboxes().forEach(checkbox => {
            checkbox.addEventListener('change', updateTotalPrice);
        });

        updateTotalPrice();
    };

    const updateTotalPrice = () => {
        const menuItemsCheckboxes = getMainMenuCheckboxes();
        let total = 0;
        
        menuItemsCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const quantity = parseInt(document.getElementById(`qty-${checkbox.dataset.id}`)?.value || 1);
                const basePrice = parseFloat(checkbox.dataset.price);
                total += basePrice * quantity;
            }
        });
        
        currentOrderTotal = total;
        totalPriceSpan.textContent = currentOrderTotal.toFixed(2);
        
        // Update floating total
        updateFloatingTotal();
    };

    const updateFloatingTotal = () => {
        floatingTotalAmount.textContent = currentOrderTotal.toFixed(2);
        floatingCurrencyDisplay.textContent = appSettings.currencySymbol || '$';
        
        if (currentOrderTotal > 0) {
            floatingTotalDiv.classList.remove('hidden');
        } else {
            floatingTotalDiv.classList.add('hidden');
        }
    };

    const renderManagementMenu = (menu) => {
        managementMenuListDiv.innerHTML = '';

        if (!menu || menu.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No hay platos en el menú para gestionar.';
            managementMenuListDiv.appendChild(p);
            return;
        }

        const currencySymbol = appSettings.currencySymbol || '$';

        menu.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('menu-item-entry');

            // New: handle dessert type
            const itemTypeName = item.type === 'dish' ? 'Plato' : item.type === 'drink' ? 'Bebida' : 'Postre';

            div.innerHTML = `
                <span class="menu-item-name">${item.name} (${item.price.toFixed(2)} ${currencySymbol}) - ${itemTypeName}</span>
                <div class="menu-item-actions">
                    <button class="edit-item-btn" data-id="${item.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-item-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            `;
            managementMenuListDiv.appendChild(div);
        });
    };

    const addItem = async (name, price, type) => {
        if (!name || name.trim() === '') {
            orderResultDiv.textContent = 'El nombre del plato/bebida no puede estar vacío.';
            orderResultDiv.style.color = 'orange';
            return;
        }
        if (isNaN(price) || price < 0) {
            orderResultDiv.textContent = 'El precio debe ser un número válido mayor o igual a cero.';
            orderResultDiv.style.color = 'orange';
            return;
        }

        const menu = await loadMenu();
        const normalizedName = name.trim().toLowerCase();
        if (menu.some(item => item.name.trim().toLowerCase() === normalizedName)) {
            orderResultDiv.textContent = `El plato/bebida "${name.trim()}" ya existe.`;
            orderResultDiv.style.color = 'orange';
            return;
        }

        const newItem = { id: getNextMenuItemId(), name: name.trim(), price: parseFloat(price), type: type };
        menu.push(newItem);
        await saveMenu(menu);

        renderMainMenu(menu);
        renderManagementMenu(menu);
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemTypeInput.value = 'dish';
        orderResultDiv.textContent = `Plato "${newItem.name}" agregado.`;
        orderResultDiv.style.color = 'green';
    };

    const deleteItem = async (id) => {
        let menu = await loadMenu();
        const itemName = menu.find(item => item.id === id)?.name || 'el plato';

        if (confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`)) {
            const newMenu = menu.filter(item => item.id !== id);
            await saveMenu(newMenu);

            renderMainMenu(newMenu);
            renderManagementMenu(newMenu);
            if (editingItemId === id) cancelEditing();
            orderResultDiv.textContent = `Plato "${itemName}" eliminado.`;
            orderResultDiv.style.color = 'green';
        }
    };

    const startEditItem = async (id) => {
        const menu = await loadMenu();
        const itemToEdit = menu.find(item => item.id === id);

        if (itemToEdit) {
            editingItemId = id;
            itemNameInput.value = itemToEdit.name;
            itemPriceInput.value = itemToEdit.price;
            itemTypeInput.value = itemToEdit.type || 'dish';
            addUpdateItemBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Plato';
            cancelEditBtn.classList.remove('hidden');
            orderResultDiv.textContent = `Editando: "${itemToEdit.name}"`;
            orderResultDiv.style.color = '#333';
        }
    };

    const updateItem = async (id, newName, newPrice, newType) => {
        if (!newName || newName.trim() === '') {
            orderResultDiv.textContent = 'El nombre no puede estar vacío.';
            orderResultDiv.style.color = 'orange';
            return;
        }
        if (isNaN(newPrice) || newPrice < 0) {
            orderResultDiv.textContent = 'El precio debe ser un número válido.';
            orderResultDiv.style.color = 'orange';
            return;
        }

        let menu = await loadMenu();
        const itemIndex = menu.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            menu[itemIndex] = { ...menu[itemIndex], name: newName.trim(), price: parseFloat(newPrice), type: newType };
            await saveMenu(menu);

            renderMainMenu(menu);
            renderManagementMenu(menu);
            orderResultDiv.textContent = `Plato "${newName.trim()}" actualizado.`;
            orderResultDiv.style.color = 'green';
            cancelEditing();
        }
    };

    const cancelEditing = () => {
        editingItemId = null;
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemTypeInput.value = 'dish'; 
        addUpdateItemBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Añadir Plato';
        cancelEditBtn.classList.add('hidden');
    };

    const getNextOrderNumber = async () => {
        const counterRef = doc(db, 'counters', 'orderNumber');
        const nextNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let currentNumber = 0;
            if (counterDoc.exists()) {
                currentNumber = counterDoc.data().value || 0;
            }
            currentNumber = (currentNumber % 9999) + 1;
            transaction.set(counterRef, { value: currentNumber });
            return currentNumber;
        });
        return nextNumber;
    };

    const loadOrderHistory = async () => {
        let ordersRef = collection(db, 'orders');
        if (currentUser && currentUser.role === 'restaurant') {
            ordersRef = query(ordersRef, where('restaurantId', '==', currentUser.id));
        }
        const snapshot = await getDocs(ordersRef);
        const history = [];
        snapshot.forEach(docSnap => {
            history.push(docSnap.data());
        });
        return history;
    };

    const addOrderToHistory = async (order) => {
        await addDoc(collection(db, 'orders'), order);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        const idNum = parseInt(orderId, 10);
        let ordersRef = collection(db, 'orders');
        let q;
        if (currentUser && currentUser.role === 'restaurant') {
            q = query(ordersRef, where('id', '==', idNum), where('restaurantId', '==', currentUser.id));
        } else {
            q = query(ordersRef, where('id', '==', idNum));
        }
        const snapshot = await getDocs(q);
        const targetDoc = snapshot.docs[0];

        if (targetDoc) {
            const oldOrder = targetDoc.data();
            const oldStatus = oldOrder.status;
            await updateDoc(doc(db, 'orders', targetDoc.id), { status: newStatus });
            if (oldStatus !== 'Listo' && newStatus === 'Listo') {
                playSound('/ready_sound.mpeg');
            }

            if (newStatus === 'Recibido' && oldStatus !== 'Recibido') {
                await trackSoldItems({ ...oldOrder, status: newStatus });
                await updateDailySummary();
            } else if (oldStatus === 'Recibido' && newStatus !== 'Recibido') {
                await untrackSoldItems(oldOrder);
                await updateDailySummary();
            }
            await renderOrderHistory();
        } else {
            console.warn('Attempted to update status for non-existent order with ID:', orderId);
        }
    };

    const renderOrderHistory = async () => {
        const history = await loadOrderHistory();
        historyListUl.innerHTML = '';
        historyPaginationControlsDiv.innerHTML = '';

        if (history.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No hay pedidos registrados aún.';
            historyListUl.appendChild(li);
            return;
        }

        history.sort((a, b) => b.timestamp - a.timestamp);

        const totalOrders = history.length;
        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const ordersToDisplay = history.slice(startIndex, endIndex).map(order => {
            return { ...order };
        });

        const currencySymbol = appSettings.currencySymbol || '$';

        ordersToDisplay.forEach(order => {
            const li = document.createElement('li');

            const statusSelect = document.createElement('select');
            statusSelect.dataset.orderId = order.id;
            statusSelect.classList.add('order-status');

            const statuses = ['Preparando', 'Listo', 'Recibido'];
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (order.status === status) {
                    option.selected = true;
                }
                statusSelect.appendChild(option);
            });

            statusSelect.addEventListener('change', async (event) => {
                const id = event.target.dataset.orderId;
                const newStatus = event.target.value;
                await updateOrderStatus(id, newStatus);
            });

            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-pen"></i> Editar';
            editButton.classList.add('edit-order-btn');
            editButton.dataset.orderId = order.id;
            editButton.addEventListener('click', () => openEditOrderModal(order.id));

            // Include quantity in items list
            const itemsList = order.items.map(item => {
                const itemName = typeof item === 'object' ? item.name : item;
                const quantity = typeof item === 'object' && item.quantity !== undefined ? item.quantity : 1;
                return `${itemName} (x${quantity})`;
            }).join(', ');

            const totalDisplayPrice = (order.totalPrice + (order.extraPayment ? order.extraPayment.amount : 0)).toFixed(2);

            const orderDetailsDiv = document.createElement('div');
            orderDetailsDiv.innerHTML = `
                <strong>Pedido #${order.id}</strong> para <strong>${order.name}</strong><br>
                Tipo: <strong>${order.orderType || 'No especificado'}</strong><br>
                Items: ${itemsList}<br>
                ${order.extraPayment && order.extraPayment.amount > 0 ? `Pago Extra: ${order.extraPayment.amount.toFixed(2)} ${currencySymbol} (${order.extraPayment.description || 'Sin descripción'})<br>` : ''}
                Total: <strong>${totalDisplayPrice} ${currencySymbol}</strong>
            `;
            if (order.notes && order.notes.trim() !== '') {
                const notesP = document.createElement('p');
                notesP.classList.add('order-notes-display');
                notesP.textContent = `Notas: ${order.notes}`;
                orderDetailsDiv.appendChild(notesP);
            }

            li.appendChild(orderDetailsDiv);
            li.appendChild(statusSelect);
            li.appendChild(editButton);

            historyListUl.appendChild(li);
        });

        if (totalPages > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', async () => {
                currentPage--;
                await renderOrderHistory();
            });

            const pageInfoSpan = document.createElement('span');
            pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Siguiente';
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener('click', async () => {
                currentPage++;
                await renderOrderHistory();
            });

            historyPaginationControlsDiv.appendChild(prevButton);
            historyPaginationControlsDiv.appendChild(pageInfoSpan);
            historyPaginationControlsDiv.appendChild(nextButton);
        }

        window.addEventListener('storage', async (event) => {
            const relevantAppSettingsKey = getSettingsKey();

            if (event.key === relevantAppSettingsKey) {
                console.log('Settings updated from iframe. Monitor(s) will refresh via storage event.');
                await loadAppSettings();
                if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) {
                    renderMainMenu(await loadMenu());
                    updateTotalPrice();
                    await updateDailySummary();
                }
            } else if (event.key === 'currentUser' && currentUser) {
                const newCurrentUser = JSON.parse(event.newValue);
                if (!newCurrentUser || newCurrentUser.id !== currentUser.id) {
                    location.reload();
                }
            }
        });
    };

    const openEditOrderModal = async (orderId) => {
        editingOrderId = parseInt(orderId, 10);
        const history = await loadOrderHistory();
        const orderToEdit = history.find(order => order.id === editingOrderId);

        if (!orderToEdit) {
            console.error('Order not found for editing:', orderId);
            return;
        }

        editOrderIdSpan.textContent = `#${orderToEdit.id}`;
        editCustomerNameInput.value = orderToEdit.name;
        editOrderNotesInput.value = orderToEdit.notes || '';
        editOrderStatusSelect.value = orderToEdit.status;

        if (orderToEdit.orderType === 'Comer en Restaurante') {
            editDineInRadio.checked = true;
        } else {
            editTakeawayRadio.checked = true;
        }

        editOrderItemsListPlatos.innerHTML = '';
        editOrderItemsListBebidas.innerHTML = '';
        editOrderItemsListPostres.innerHTML = '';
        const menuItems = await loadMenu();
        const currencySymbol = appSettings.currencySymbol || '$';

        menuItems.forEach(menuItem => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `edit-item-${menuItem.id}`;
            checkbox.value = menuItem.name;
            checkbox.dataset.price = menuItem.price;
            checkbox.dataset.id = menuItem.id;
            checkbox.dataset.type = menuItem.type; 

            const isSelected = orderToEdit.items.some(item => 
                typeof item === 'object' ? item.id === menuItem.id : item === menuItem.name
            );
            if (isSelected) {
                checkbox.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `edit-item-${menuItem.id}`;
            label.textContent = `${menuItem.name} (${menuItem.price.toFixed(2)} ${currencySymbol})`;

            // Create quantity input for edit mode
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.classList.add('edit-item-quantity');
            quantityInput.min = '1';
            quantityInput.max = '99';
            quantityInput.value = '1'; // Default, will be updated below

            // Find the original quantity from the order
            const originalItem = orderToEdit.items.find(item => 
                typeof item === 'object' ? item.id === menuItem.id : item === menuItem.name
            );
            if (originalItem && typeof originalItem === 'object' && originalItem.quantity !== undefined) {
                quantityInput.value = originalItem.quantity;
            } else if (originalItem && originalItem !== undefined) {
                quantityInput.value = 1;
            }

            li.appendChild(checkbox);
            li.appendChild(label);
            li.appendChild(quantityInput);

            if (menuItem.type === 'dish') {
                editOrderItemsListPlatos.appendChild(li);
            } else if (menuItem.type === 'drink') {
                editOrderItemsListBebidas.appendChild(li);
            } else if (menuItem.type === 'dessert') {
                editOrderItemsListPostres.appendChild(li);
            }

            checkbox.addEventListener('change', updateEditOrderTotalPrice);
            quantityInput.addEventListener('change', updateEditOrderTotalPrice);
            quantityInput.addEventListener('input', updateEditOrderTotalPrice);
        });

        updateEditOrderTotalPrice();

        editOrderMessage.classList.add('hidden');
        editOrderModalOverlay.classList.remove('hidden');
        void editOrderModalOverlay.offsetWidth;
        editOrderModalOverlay.classList.add('active');
    };

    const updateEditOrderTotalPrice = () => {
        const checkboxes = editOrderModalOverlay.querySelectorAll('.edit-items-list input[type="checkbox"]');
        let total = 0;
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const quantityInput = checkbox.parentElement.querySelector('.edit-item-quantity');
                const quantity = parseInt(quantityInput?.value || 1);
                const basePrice = parseFloat(checkbox.dataset.price);
                total += basePrice * quantity;
            }
        });
        editOrderTotalPriceSpan.textContent = total.toFixed(2);
    };

    saveEditedOrderBtn.addEventListener('click', async () => {
        const history = await loadOrderHistory();
        const orderIndex = history.findIndex(order => order.id === editingOrderId);

        if (orderIndex === -1) {
            editOrderMessage.textContent = 'Error: Pedido no encontrado.';
            editOrderMessage.classList.remove('hidden');
            editOrderMessage.classList.add('error');
            return;
        }

        const oldOrder = history[orderIndex];

        const newCustomerName = editCustomerNameInput.value.trim();
        const newOrderNotes = editOrderNotesInput.value.trim();
        const newOrderStatus = editOrderStatusSelect.value;
        const newOrderType = document.querySelector('input[name="edit-order-type"]:checked').value;

        if (newCustomerName === '') {
            editOrderMessage.textContent = 'Por favor, ingresa el nombre del cliente.';
            editOrderMessage.classList.remove('hidden');
            editOrderMessage.classList.add('error');
            return;
        }

        const selectedItems = Array.from(editOrderModalOverlay.querySelectorAll('.edit-items-list input[type="checkbox"]:checked'))
            .map(checkbox => ({
                id: checkbox.dataset.id,
                name: checkbox.value,
                price: parseFloat(checkbox.dataset.price),
                type: checkbox.dataset.type,
                quantity: parseInt(checkbox.parentElement.querySelector('.edit-item-quantity')?.value || 1)
            }));

        if (selectedItems.length === 0) {
            editOrderMessage.textContent = 'Por favor, selecciona al menos un plato.';
            editOrderMessage.classList.remove('hidden');
            editOrderMessage.classList.add('error');
            return;
        }

        const newOrderTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const updatedOrder = {
            ...oldOrder,
            name: newCustomerName,
            items: selectedItems,
            notes: newOrderNotes,
            totalPrice: newOrderTotalPrice,
            extraPayment: null,
            status: newOrderStatus,
            orderType: newOrderType
        };

        if (oldOrder.status === 'Recibido' && updatedOrder.status !== 'Recibido') {
            await untrackSoldItems(oldOrder);
            await updateDailySummary();
        } else if (oldOrder.status !== 'Recibido' && updatedOrder.status === 'Recibido') {
            await trackSoldItems(updatedOrder);
            await updateDailySummary();
        } else if (oldOrder.status === 'Recibido' && updatedOrder.status === 'Recibido') {
            const oldItemNames = new Set(oldOrder.items.map(item => typeof item === 'object' ? item.name : item));
            const newItemNames = new Set(updatedOrder.items.map(item => item.name));

            for (const name of oldItemNames) {
                if (!newItemNames.has(name)) {
                    await untrackSoldItems({ items: [{ name }] });
                }
            }
            for (const name of newItemNames) {
                if (!oldItemNames.has(name)) {
                    await trackSoldItems({ items: [{ name }] });
                }
            }
            await updateDailySummary();
        }

        let ordersRef = collection(db, 'orders');
        let q;
        if (currentUser && currentUser.role === 'restaurant') {
            q = query(ordersRef, where('id', '==', editingOrderId), where('restaurantId', '==', currentUser.id));
        } else {
            q = query(ordersRef, where('id', '==', editingOrderId));
        }
        const snapshot = await getDocs(q);
        const targetDoc = snapshot.docs[0];

        if (targetDoc) {
            await updateDoc(doc(db, 'orders', targetDoc.id), updatedOrder);
        }

        await renderOrderHistory();

        await renderTopItemsChart();
        await renderOrderTypeChart();

        editOrderMessage.textContent = 'Pedido actualizado con éxito!';
        editOrderMessage.classList.remove('hidden');
        editOrderMessage.classList.remove('error');
        editOrderMessage.classList.add('success');

        if (oldOrder.status !== 'Listo' && updatedOrder.status === 'Listo') {
            playSound('/ready_sound.mpeg');
        }

        setTimeout(() => {
            closeEditOrderModalBtn.click();
        }, 1500);
    });

    closeEditOrderModalBtn.addEventListener('click', () => {
        if (!currentUser) {
            loginMessage.textContent = 'Debes iniciar sesión para usar la aplicación.';
            loginMessage.classList.remove('hidden', 'success');
            loginMessage.classList.add('error');
            return;
        }

        editOrderModalOverlay.classList.remove('active');
        editOrderModalOverlay.addEventListener('transitionend', function handler() {
            editOrderModalOverlay.classList.add('hidden');
            editOrderModalOverlay.removeEventListener('transitionend', handler);
        }, { once: true });
    });

    const generateInvoice = (order) => {
        const restaurantName = appSettings.restaurantName || 'Mi Restaurante';
        const restaurantLogoUrl = appSettings.restaurantLogoUrl || '';
        const currencySymbol = appSettings.currencySymbol || '$';

        const date = new Date(order.timestamp).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: '2-digit'
        });

        // Build items list with quantities
        const itemsListHtml = order.items.map(item => {
            const itemName = typeof item === 'object' ? item.name : item;
            const quantity = typeof item === 'object' && item.quantity !== undefined ? item.quantity : 1;
            const subtotal = (parseFloat(item.price) * quantity).toFixed(2);
            return `<tr><td>${itemName} (x${quantity})</td><td>${subtotal}</td></tr>`;
        }).join('');

        const invoiceHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Ticket #${order.id}</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        margin: 0;
                        padding: 0;
                        background: #fff;
                        color: #000;
                        width: 58mm;
                        font-size: 11px;
                        line-height: 1.2;
                    }
                    .ticket {
                        padding: 4mm 2mm;
                        box-sizing: border-box;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 3mm;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 2mm;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 13px;
                        font-weight: bold;
                        letter-spacing: 0.5px;
                    }
                    .ticket-number {
                        font-size: 16px;
                        font-weight: bold;
                        text-align: center;
                        margin: 2mm 0;
                        padding: 1mm;
                        border: 1px solid #000;
                        border-radius: 2px;
                    }
                    .details {
                        font-size: 10px;
                        margin-bottom: 2mm;
                        text-align: center;
                    }
                    .items {
                        margin-bottom: 2mm;
                    }
                    .items table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .items th, .items td {
                        padding: 1mm 0;
                        text-align: left;
                        font-size: 10px;
                        border-bottom: 1px dotted #ccc;
                    }
                    .items th:last-child, .items td:last-child {
                        text-align: right;
                    }
                    .total {
                        font-size: 12px;
                        font-weight: bold;
                        text-align: center;
                        margin: 2mm 0;
                        border-top: 1px dashed #000;
                        border-bottom: 1px dashed #000;
                        padding: 1mm 0;
                    }
                    .notes {
                        font-size: 9px;
                        margin-top: 2mm;
                        padding-top: 1mm;
                        border-top: 1px dashed #000;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                    .footer {
                        font-size: 8px;
                        text-align: center;
                        margin-top: 3mm;
                        padding-top: 1mm;
                        border-top: 1px dashed #000;
                    }
                    @media print {
                        body { margin: 0; width: 58mm; }
                        .ticket { padding: 2mm 1mm; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <h1>${restaurantName}</h1>
                        <div class="details">${date} | ${order.orderType}</div>
                    </div>

                    <div class="ticket-number">TICKET #${order.id}</div>

                    <div class="items">
                        <table>
                            <thead>
                                <tr><th>Artículo</th><th>Total</th></tr>
                            </thead>
                            <tbody>
                                ${itemsListHtml}
                                ${order.extraPayment && order.extraPayment.amount > 0 ? 
                                    `<tr><td>Pago Extra (${order.extraPayment.description || 'Sin descripción'})</td><td>${order.extraPayment.amount.toFixed(2)}</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>

                    <div class="total">
                        TOTAL: ${(order.totalPrice + (order.extraPayment ? order.extraPayment.amount : 0)).toFixed(2)} ${currencySymbol}
                    </div>

                    ${order.notes && order.notes.trim() ? `<div class="notes"><strong>Notas:</strong> ${order.notes}</div>` : ''}

                    <div class="footer">¡Gracias!</div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Por favor, permite ventanas emergentes para imprimir la factura.");
            return;
        }
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    const loadDailySummary = async () => {
        const today = new Date().toDateString();
        if (currentUser && currentUser.id) {
            try {
                const summaryRef = doc(db, 'restaurants', currentUser.id, 'analytics', 'dailySummary');
                const docSnap = await getDoc(summaryRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.date === today) {
                        return data;
                    }
                }
            } catch (error) {
                console.error('Error loading daily summary:', error);
            }
        }
        return { date: today, totalOrders: 0, totalRevenue: 0, extraRevenue: 0 };
    };

    const saveDailySummary = async (summary) => {
        if (!currentUser || !currentUser.id) return;
        const summaryRef = doc(db, 'restaurants', currentUser.id, 'analytics', 'dailySummary');
        try {
            await setDoc(summaryRef, summary);
        } catch (error) {
            console.error('Error saving daily summary:', error);
        }
    };

    const updateDailySummary = async () => {
        let summary = await loadDailySummary();
        const history = await loadOrderHistory();
        const today = new Date().toDateString();

        const receivedOrdersToday = history.filter(o => o.status === 'Recibido' && new Date(o.timestamp).toDateString() === today);

        summary.totalOrders = receivedOrdersToday.length;
        summary.totalRevenue = receivedOrdersToday.reduce((sum, o) => {
            return sum + o.totalPrice;
        }, 0);

        summary.extraRevenue = 0;

        await saveDailySummary(summary);
        summaryTotalOrdersSpan.textContent = summary.totalOrders;
        summaryTotalRevenueSpan.textContent = summary.totalRevenue.toFixed(2);
        summaryExtraRevenueSpan.textContent = summary.extraRevenue.toFixed(2);
        summaryCurrencyDisplaySpan.textContent = appSettings.currencySymbol || '$';
    };

    const resetDailySummary = async () => {
        const confirmed = confirm('¿Estás seguro de que quieres reiniciar el resumen del día? Esto borrará los datos de hoy.');
        if (confirmed) {
            if (currentUser && currentUser.id) {
                try {
                    await deleteDoc(doc(db, 'restaurants', currentUser.id, 'analytics', 'dailySummary'));
                } catch (error) {
                    console.error('Error resetting daily summary:', error);
                }
            }
            await updateDailySummary();
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Resumen del día reiniciado.';
        } else {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = 'Reinicio de resumen del día cancelado.';
        }
    };

    const { jsPDF } = window.jspdf;

    const generatePdfReport = (title, contentHtml, fileName) => {
        const doc = new jsPDF();
        const currencySymbol = appSettings.currencySymbol || '$';

        doc.setFontSize(18);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString('es-ES')}`, 10, 30);
        doc.text(`Moneda: ${currencySymbol}`, 10, 37);

        const margin = 10;
        const startY = 50;

        const parser = new DOMParser();
        const docHtml = parser.parseFromString(contentHtml, 'text/html');
        const textContent = docHtml.body.textContent;

        const lines = doc.splitTextToSize(textContent, doc.internal.pageSize.getWidth() - 2 * margin);
        let currentY = startY;

        lines.forEach(line => {
            if (currentY > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                currentY = margin;
            }
            doc.text(line, margin, currentY);
            currentY += 7;
        });

        doc.save(`${fileName}.pdf`);
    };

    downloadSummaryBtn.addEventListener('click', async () => {
        const summary = await loadDailySummary();
        const currencySymbol = appSettings.currencySymbol || '$';
        const contentHtml = `
            <p><strong>Resumen de Pedidos del Día: ${summary.date}</strong></p>
            <p>Total de pedidos recibidos hoy: ${summary.totalOrders}</p>
            <p>Ingresos totales por pedidos: ${summary.totalRevenue.toFixed(2)} ${currencySymbol}</p>
        `;
        generatePdfReport('Resumen del Día', contentHtml, `Resumen_Diario_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`);
    });

    const loadTopItems = async () => {
        if (!currentUser || !currentUser.id) return {};
        try {
            const topItemsRef = doc(db, 'restaurants', currentUser.id, 'analytics', 'topItems');
            const docSnap = await getDoc(topItemsRef);
            return docSnap.exists() ? docSnap.data() : {};
        } catch (error) {
            console.error('Error loading top items:', error);
            return {};
        }
    };

    const saveTopItems = async (topItems) => {
        if (!currentUser || !currentUser.id) return;
        const topItemsRef = doc(db, 'restaurants', currentUser.id, 'analytics', 'topItems');
        try {
            await setDoc(topItemsRef, topItems);
        } catch (error) {
            console.error('Error saving top items:', error);
        }
    };

    const trackSoldItems = async (order) => {
        let topItems = await loadTopItems();
        order.items.forEach(item => {
            const itemName = typeof item === 'object' ? item.name : item;
            topItems[itemName] = (topItems[itemName] || 0) + 1;
        });
        await saveTopItems(topItems);
        if (!topItemsDiv.classList.contains('hidden')) {
            await renderTopItemsChart();
        }
    };

    const untrackSoldItems = async (order) => {
        let topItems = await loadTopItems();
        order.items.forEach(item => {
            const itemName = typeof item === 'object' ? item.name : item;
            if (topItems[itemName] && topItems[itemName] > 0) {
                topItems[itemName]--;
                if (topItems[itemName] === 0) {
                    delete topItems[itemName];
                }
            }
        });
        await saveTopItems(topItems);
        if (!topItemsDiv.classList.contains('hidden')) {
            await renderTopItemsChart();
        }
    };

    const renderTopItemsChart = async () => {
        const history = await loadOrderHistory();
        const currentMenu = await loadMenu(); // Load menu asynchronously
        const currencySymbol = appSettings.currencySymbol || '$';

        // Calculate aggregated quantities for each item based on today's "Recibido" orders
        const itemQuantities = {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        history.forEach(order => {
            const orderDate = new Date(order.timestamp);
            if (order.status === 'Recibido' && orderDate.toDateString() === today.toDateString()) {
                order.items.forEach(item => {
                    const itemName = typeof item === 'object' ? item.name : item;
                    const quantity = typeof item === 'object' && item.quantity !== undefined ? item.quantity : 1;
                    itemQuantities[itemName] = (itemQuantities[itemName] || 0) + quantity;
                });
            }
        });

        // Prepare data for Chart.js
        const chartLabels = currentMenu.map(item => item.name);
        const chartData = chartLabels.map(name => itemQuantities[name] || 0);

        if (topItemsChartInstance) {
            topItemsChartInstance.destroy();
        }

        if (chartLabels.length === 0 || chartData.every(val => val === 0)) {
            topItemsChartCanvas.classList.add('hidden');
            noTopItemsMessage.classList.remove('hidden');
            return;
        } else {
            topItemsChartCanvas.classList.remove('hidden');
            noTopItemsMessage.classList.add('hidden');
        }

        const ctx = topItemsChartCanvas.getContext('2d');
        topItemsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Cantidad Vendida (Total)',
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(200, 200, 200, 0.7)',
                        'rgba(100, 100, 100, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(200, 200, 200, 1)',
                        'rgba(100, 100, 100, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad Total'
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Artículo del Menú'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Artículos del Menú Más Populares (Hoy)'
                    }
                }
            }
        });
    };

    const resetTopItems = async () => {
        const confirmed = confirm('¿Estás seguro de que quieres reiniciar los datos de los artículos vendidos? Esto borrará el historial de popularidad de los artículos.');
        if (confirmed) {
            if (currentUser && currentUser.id) {
                try {
                    await deleteDoc(doc(db, 'restaurants', currentUser.id, 'analytics', 'topItems'));
                } catch (error) {
                    console.error('Error resetting top items:', error);
                }
            }
            await renderTopItemsChart(); // Re-render to show updated (or lack of) data
            renderOrderTypeChart(); // Re-render order type chart as well
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Datos de artículos vendidos (para hoy) recalculados.';
        } else {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = 'Reinicio de datos de artículos vendidos cancelado.';
        }
    };

    placeOrderBtn.addEventListener('click', async () => {
        const menuItemsCheckboxes = getMainMenuCheckboxes();
        const selectedItems = [];
        
        menuItemsCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const quantity = parseInt(document.getElementById(`qty-${checkbox.dataset.id}`)?.value || 1);
                const basePrice = parseFloat(checkbox.dataset.price);
                selectedItems.push({
                    id: checkbox.dataset.id,
                    name: checkbox.value,
                    price: basePrice,
                    type: checkbox.dataset.type,
                    quantity: quantity,
                    subtotal: basePrice * quantity
                });
            }
        });

        const customerName = customerNameInput.value.trim();
        const orderNotes = orderNotesInput.value.trim();
        const orderType = document.querySelector('input[name="order-type"]:checked').value;

        orderResultDiv.classList.remove('error');
        orderResultDiv.style.color = '';
        orderResultDiv.textContent = '';
        printInvoiceBtn.classList.add('hidden');

        if (customerName === '') {
            orderResultDiv.textContent = 'Por favor, ingresa tu nombre.';
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'orange';
            return;
        }

        if (selectedItems.length === 0) {
            orderResultDiv.textContent = 'Por favor, selecciona al menos un plato.';
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'orange';
            return;
        }

        const newOrderTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            id: await getNextOrderNumber(),
            name: customerName,
            items: selectedItems,
            notes: orderNotes,
            totalPrice: newOrderTotalPrice,
            extraPayment: null,
            timestamp: Date.now(),
            status: "Preparando",
            orderType: orderType,
            restaurantId: currentUser ? currentUser.id : null
        };

        await addOrderToHistory(newOrder);
        lastPlacedOrder = newOrder;

        orderResultDiv.textContent = `Pedido Realizado para ${customerName}. Número de seguimiento: #${newOrder.id}`;
        orderResultDiv.style.color = 'green';
        printInvoiceBtn.classList.remove('hidden');

        /* Reset quantities to 1 and uncheck all checkboxes */
        menuItemsCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const qtyInput = document.getElementById(`qty-${checkbox.dataset.id}`);
            if (qtyInput) {
                qtyInput.value = 1;
            }
        });
        
        customerNameInput.value = '';
        orderNotesInput.value = '';
        dineInRadio.checked = true;
        updateTotalPrice(); /* This will update the display to 0.00 */

        playSound('/order_sound.mp3');

        if (!orderHistoryDiv.classList.contains('hidden')) {
            currentPage = 1;
            await renderOrderHistory();
        }
    });

    printInvoiceBtn.addEventListener('click', () => {
        if (lastPlacedOrder) {
            generateInvoice(lastPlacedOrder);
        } else {
            alert('No hay un pedido reciente para imprimir una factura.');
        }
    });

    // Toast notification system for calculate button feedback
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Update calculate button click handler
    calculateBtn.addEventListener('click', () => {
        const menuItemsCheckboxes = getMainMenuCheckboxes();
        const selectedItems = [];
        
        menuItemsCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const quantity = parseInt(document.getElementById(`qty-${checkbox.dataset.id}`)?.value || 1);
                selectedItems.push({
                    name: checkbox.value,
                    quantity: quantity,
                    price: parseFloat(checkbox.dataset.price),
                    subtotal: parseFloat(checkbox.dataset.price) * quantity
                });
            }
        });

        if (selectedItems.length === 0) {
            showToast('No hay platos seleccionados para calcular', 'info');
            return;
        }

        const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
        
        // Create popup modal for calculation details
        const modal = document.createElement('div');
        modal.className = 'calculation-modal-overlay';
        modal.innerHTML = `
            <div class="calculation-modal-content">
                <div class="modal-header">
                    <h3>📊 Resumen de Pedido</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="calculation-summary">
                        <div class="summary-item">
                            <span>Platos seleccionados:</span>
                            <strong>${selectedItems.length}</strong>
                        </div>
                        <div class="calculation-items">
                            ${selectedItems.map(item => `
                                <div class="calc-item">
                                    <span>${item.name} (${item.quantity}x)</span>
                                    <span>${item.subtotal.toFixed(2)} ${appSettings.currencySymbol || '$'}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="calculation-total">
                            <span>Total:</span>
                            <strong>${total.toFixed(2)} ${appSettings.currencySymbol || '$'}</strong>
                        </div>
                        <div class="payment-section">
                            <div class="payment-row">
                                <label for="cash-received">Efectivo recibido:</label>
                                <input type="number" id="cash-received" class="cash-input" min="0" step="0.01">
                            </div>
                            <div class="payment-row change-row">
                                <span>Cambio a devolver:</span>
                                <strong id="change-amount">0.00 ${appSettings.currencySymbol || '$'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-place-order-btn">Realizar Pedido</button>
                    <button class="close-btn">Aceptar</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .calculation-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1003;
                animation: fadeIn 0.3s ease;
            }

            .calculation-modal-content {
                background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
                max-width: 450px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 3px solid #D32F2F;
                animation: slideUp 0.3s ease;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #FF8C00;
                padding-bottom: 10px;
            }

            .modal-header h3 {
                font-family: 'Fredoka One', cursive;
                color: #D32F2F;
                font-size: 1.5em;
                margin: 0;
            }

            .close-modal {
                background: none;
                border: none;
                font-size: 1.8em;
                color: #D32F2F;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .close-modal:hover {
                transform: rotate(90deg);
            }

            .calculation-summary {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                font-weight: 600;
                color: #333;
            }

            .calculation-items {
                max-height: 200px;
                overflow-y: auto;
                margin-bottom: 15px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 10px;
            }

            .calc-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
                font-size: 0.9em;
            }

            .calc-item:last-child {
                border-bottom: none;
            }

            .calculation-total {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
                color: white;
                border-radius: 10px;
                font-size: 1.2em;
                font-weight: 700;
                margin-top: 15px;
            }

            .payment-section {
                margin-top: 20px;
            }

            .payment-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-weight: 600;
                color: #333;
            }

            .cash-input {
                width: 120px;
                padding: 8px;
                border: 2px solid #FF8C00;
                border-radius: 8px;
                font-size: 1em;
                text-align: right;
            }

            .change-row {
                background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
                color: white;
                padding: 10px;
                border-radius: 8px;
            }

            .modal-place-order-btn {
                background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 10px;
            }

            .modal-place-order-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
            }

            .close-btn {
                background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: block;
                margin: 0 auto;
            }

            .close-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(211, 47, 47, 0.4);
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 50px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                font-size: 1.1em;
                font-weight: bold;
                z-index: 1000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast-info {
                background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            }

            .toast i {
                font-size: 1.2em;
            }

            @media (max-width: 768px) {
                .toast {
                    bottom: 15px;
                    right: 15px;
                    left: 15px;
                    text-align: center;
                    border-radius: 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Add event listeners
        const cashInput = modal.querySelector('#cash-received');
        const changeAmount = modal.querySelector('#change-amount');
        if (cashInput && changeAmount) {
            cashInput.addEventListener('input', () => {
                const cash = parseFloat(cashInput.value) || 0;
                const change = cash - total;
                changeAmount.textContent = `${change >= 0 ? change.toFixed(2) : '0.00'} ${appSettings.currencySymbol || '$'}`;
            });
        }

        modal.querySelector('.modal-place-order-btn').addEventListener('click', () => {
            modal.remove();
            placeOrderBtn.click();
        });

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    });

    const showSection = async (sectionId) => {
        if (!currentUser) {
            alert('Por favor, inicia sesión para acceder a esta función.');
            openLoginModal();
            return;
        }

        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        sidebarNavLinks.forEach(link => {
            if (link.dataset.sectionId === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }

        switch (sectionId) {
            case 'order-history':
                currentPage = 1;
                renderOrderHistory();
                break;
            case 'menu-management':
                const currentMenu = await loadMenu();
                renderManagementMenu(currentMenu);
                renderMainMenu(currentMenu);
                cancelEditing();
                break;
            case 'daily-summary':
                await updateDailySummary();
                break;
            case 'top-items':
                renderTopItemsChart();
                renderOrderTypeChart(); // Call to render order type chart here
                break;
            case 'restaurant-management-section':
                await renderRestaurantManagement();
                break;
            case 'home-section':
                orderResultDiv.classList.remove('error');
                orderResultDiv.style.color = '';
                orderResultDiv.textContent = '';
                break;
        }
    };

    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.sectionId;
            if (sectionId) {
                showSection(sectionId);
            } else if (link.id === 'nav-monitor') {
                if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) { 
                    window.open('monitor.html', '_blank');
                } else {
                    alert('Por favor, inicia sesión para acceder al monitor.');
                    openLoginModal();
                }
            } else if (link.id === 'nav-detail-monitor') {
                if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) { 
                    window.open('monitor_details.html', '_blank');
                } else {
                    alert('Por favor, inicia sesión para acceder al monitor de detalles.');
                    openLoginModal();
                }
            }
        });
    });

    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    document.querySelector('.container-wrapper').addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggleBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    addUpdateItemBtn.addEventListener('click', async () => {
        const itemName = itemNameInput.value.trim();
        const itemPrice = parseFloat(itemPriceInput.value);
        const itemType = itemTypeInput.value;

        if (editingItemId) {
            await updateItem(editingItemId, itemName, itemPrice, itemType);
        } else {
            await addItem(itemName, itemPrice, itemType);
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        cancelEditing();
        orderResultDiv.textContent = '';
    });

    managementMenuListDiv.addEventListener('click', async (event) => {
        const editBtn = event.target.closest('.edit-item-btn');
        if (editBtn) {
            await startEditItem(editBtn.dataset.id);
            return; // Stop further execution
        }

        const deleteBtn = event.target.closest('.delete-item-btn');
        if (deleteBtn) {
            await deleteItem(deleteBtn.dataset.id);
        }
    });

    resetMenuBtn.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que quieres restablecer el menú a su estado predeterminado? Todos los platos actuales se eliminarán.')) {
            await saveMenu(defaultMenuItems);
            const updatedMenu = await loadMenu();
            renderMainMenu(updatedMenu);
            renderManagementMenu(updatedMenu);
            cancelEditing();
            orderResultDiv.textContent = 'Menú restablecido a valores predeterminados.';
            orderResultDiv.style.color = 'orange';
        }
    });

    resetHistoryBtn.addEventListener('click', async () => {
        const confirmed = confirm('¿Estás seguro de que quieres restablecer todo el historial de pedidos? Esta acción no se puede deshacer.');

        if (confirmed) {
            let ordersRef = collection(db, 'orders');
            if (currentUser && currentUser.role === 'restaurant') {
                ordersRef = query(ordersRef, where('restaurantId', '==', currentUser.id));
            }
            const ordersSnapshot = await getDocs(ordersRef);
            const deletions = ordersSnapshot.docs.map(d => deleteDoc(doc(db, 'orders', d.id)));
            await Promise.all(deletions);
            await setDoc(doc(db, 'counters', 'orderNumber'), { value: 0 });
            if (currentUser && currentUser.id) {
                await deleteDoc(doc(db, 'restaurants', currentUser.id, 'analytics', 'dailySummary'));
                await deleteDoc(doc(db, 'restaurants', currentUser.id, 'analytics', 'topItems'));
            }

            if (!orderHistoryDiv.classList.contains('hidden')) {
                historyListUl.innerHTML = '<li>Historial de pedidos restablecido.</li>';
                historyPaginationControlsDiv.innerHTML = '';
                currentPage = 1;
            }

            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Historial de pedidos y contador restablecidos.';

            await updateDailySummary();
            await renderTopItemsChart();
            await loadAppSettings(); // Reload settings as they might have been cleared
        } else {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = 'Restablecimiento de historial cancelado.';
        }
    });

    resetDailySummaryBtn.addEventListener('click', resetDailySummary);

    resetTopItemsBtn.addEventListener('click', resetTopItems);

    settingsBtn.addEventListener('click', () => {
        settingsModalOverlay.classList.remove('hidden');
        void settingsModalOverlay.offsetWidth;
        settingsModalOverlay.classList.add('active');

        settingsIframe.src = 'settings.html';
    });

    // --- INICIO: LÓGICA DE AUTENTICACIÓN CON FIREBASE ---

    const setCurrentUser = async (user) => {
        currentUser = user;
        // Ya no se guarda en localStorage, onAuthStateChanged maneja el estado.
        updateLoginButton();
        updateSidebarVisibility();

        if (user) {
            containerWrapper.classList.remove('hidden');
            loginModalOverlay.classList.remove('active');
            loginModalOverlay.classList.add('hidden');

            // Cargar datos específicos del usuario/restaurante
            await loadAppSettings();
            renderMainMenu(await loadMenu());
            updateTotalPrice();
            await updateDailySummary();
            await renderTopItemsChart();

            if (user.role === 'admin') {
                await showSection('restaurant-management-section');
            } else {
                await showSection('home-section');
            }
        } else {
            // Si no hay usuario, limpiar y mostrar pantalla de login
            containerWrapper.classList.add('hidden');
            openLoginModal();
            // Limpiar datos en pantalla
            mainMenuUlPlatos.innerHTML = '';
            mainMenuUlBebidas.innerHTML = '';
            historyListUl.innerHTML = '<li>Debes iniciar sesión para ver el historial.</li>';
        }
    };

    // Listener principal que maneja el estado de la sesión
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Usuario ha iniciado sesión
            loginMessage.textContent = 'Verificando datos...';
            loginMessage.classList.remove('hidden', 'error');
            loginMessage.classList.add('success');

            // Obtener datos adicionales del usuario desde Firestore (rol, id de restaurante, etc.)
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Combinar datos de Auth y Firestore
                const userProfile = {
                    uid: user.uid,
                    email: user.email,
                    username: userData.username || user.email, // Usar username de firestore o el email
                    role: userData.role,
                    id: userData.id // ID del restaurante para usuarios de tipo 'restaurant'
                };
                await setCurrentUser(userProfile);
                 loginMessage.textContent = `¡Bienvenido, ${userProfile.username}!`;
                 setTimeout(() => {
                    loginMessage.classList.add('hidden');
                }, 1500);
            } else {
                // El usuario existe en Auth pero no en la base de datos de usuarios
                console.error("Error: No se encontraron datos para el usuario.");
                loginMessage.textContent = 'Error: Faltan datos de usuario. Contacta al administrador.';
                loginMessage.classList.remove('success');
                loginMessage.classList.add('error');
                await signOut(auth); // Cerrar sesión si el perfil no está completo
            }
        } else {
            // Usuario ha cerrado sesión
            await setCurrentUser(null);
        }
    });

    loginBtn.addEventListener('click', async () => {
        const email = usernameInput.value.trim(); // El campo de usuario ahora es el email
        const password = passwordInput.value.trim();

        if (!email || !password) {
            loginMessage.textContent = 'Por favor, ingresa tu email y contraseña.';
            loginMessage.classList.remove('hidden');
            loginMessage.classList.add('error');
            return;
        }

        loginMessage.textContent = 'Iniciando sesión...';
        loginMessage.classList.remove('hidden', 'error');
        loginMessage.classList.add('success');
        loginBtn.disabled = true;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // El resto de la lógica se maneja en onAuthStateChanged
        } catch (error) {
            console.error("Error de inicio de sesión:", error.code, error.message);
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    loginMessage.textContent = 'Email o contraseña incorrectos.';
                    break;
                case 'auth/invalid-email':
                    loginMessage.textContent = 'El formato del email no es válido.';
                    break;
                default:
                    loginMessage.textContent = 'Ocurrió un error al iniciar sesión.';
                    break;
            }
            loginMessage.classList.remove('success');
            loginMessage.classList.add('error');
        } finally {
            loginBtn.disabled = false;
        }
    });

    const logout = () => {
        const modal = document.createElement('div');
        modal.id = 'logout-modal';
        // Usar las clases definidas en style.css
        modal.className = 'logout-modal-overlay'; 
        modal.innerHTML = `
            <div class="logout-modal-content">
                <div class="logout-icon"><i class="fas fa-sign-out-alt"></i></div>
                <h3>¿Cerrar Sesión?</h3>
                <p>¿Estás seguro de que quieres cerrar tu sesión actual?</p>
                <div class="logout-buttons">
                    <button class="logout-cancel">Cancelar</button>
                    <button class="logout-confirm">Cerrar Sesión</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.logout-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.logout-confirm').addEventListener('click', async () => {
            await signOut(auth);
            modal.remove();
            // Se ha quitado el alert('Sesión cerrada correctamente.');
        });
        modal.querySelector('.logout-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) modal.remove();
        });
    };

    const updateLoginButton = () => {
        if (currentUser) {
            loginLogoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Cerrar Sesión (${currentUser.username})`;
            loginLogoutBtn.removeEventListener('click', openLoginModal);
            loginLogoutBtn.addEventListener('click', logout);
        } else {
            loginLogoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            loginLogoutBtn.removeEventListener('click', logout);
            loginLogoutBtn.addEventListener('click', openLoginModal);
        }
    };

    const updateSidebarVisibility = () => {
        const restaurantSections = [navHistory, navDailySummary, navTopItems, navMenuManagement, navMonitor, navDetailMonitor];
        if (currentUser && currentUser.role === 'admin') {
            navRestaurantManagement.classList.remove('hidden');
            restaurantSections.forEach(link => link.classList.remove('hidden'));
        } else if (currentUser && currentUser.role === 'restaurant') {
            navRestaurantManagement.classList.add('hidden');
            restaurantSections.forEach(link => link.classList.remove('hidden'));
        } else {
            navRestaurantManagement.classList.add('hidden');
            restaurantSections.forEach(link => link.classList.add('hidden'));
            contentSections.forEach(section => section.classList.add('hidden'));
        }
    };

    const openLoginModal = () => {
        usernameInput.value = '';
        passwordInput.value = '';
        loginMessage.classList.add('hidden');
        loginModalOverlay.classList.remove('hidden');
        void loginModalOverlay.offsetWidth;
        loginModalOverlay.classList.add('active');
    };

    closeLoginModalBtn.addEventListener('click', () => {
        // No cerrar el modal si el usuario no está autenticado
        if (!currentUser) {
            loginMessage.textContent = 'Debes iniciar sesión para usar la aplicación.';
            loginMessage.classList.remove('hidden');
            loginMessage.classList.add('error');
            return;
        }
        loginModalOverlay.classList.remove('active');
        loginModalOverlay.classList.add('hidden');
    });

    // --- FIN: LÓGICA DE AUTENTICACIÓN CON FIREBASE ---

    // New: Function to update login attempts message
    const updateLoginAttemptsMessage = () => {
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            loginAttemptsMessage.textContent = `Has agotado tus ${MAX_LOGIN_ATTEMPTS} intentos. Vuelve a intentarlo más tarde.`;
            loginAttemptsMessage.classList.remove('hidden', 'success');
            loginAttemptsMessage.classList.add('error');
        } else if (loginAttempts > 0) {
            const remainingAttempts = MAX_LOGIN_ATTEMPTS - loginAttempts;
            loginAttemptsMessage.textContent = `Intentos restantes: ${remainingAttempts}`;
            loginAttemptsMessage.classList.remove('hidden', 'error');
            loginAttemptsMessage.classList.add('success'); // Use success style for remaining attempts
        } else {
            loginAttemptsMessage.classList.add('hidden');
        }
    };

    const loadRestaurants = async () => {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        const restaurants = [];
        querySnapshot.forEach((doc) => {
            restaurants.push({ ...doc.data(), docId: doc.id });
        });
        return restaurants;
    };

    const renderRestaurantManagement = async () => {
        restaurantListManagementDiv.innerHTML = '<p>Cargando restaurantes...</p>';
        const restaurants = await loadRestaurants();
        restaurantListManagementDiv.innerHTML = '';

        if (restaurants.length === 0) {
            restaurantListManagementDiv.innerHTML = '<p>No hay restaurantes registrados.</p>';
            return;
        }

        restaurants.forEach(restaurant => {
            const div = document.createElement('div');
            div.classList.add('restaurant-entry');

            const statusToggle = document.createElement('label');
            statusToggle.classList.add('restaurant-status-toggle');
            statusToggle.innerHTML = `
                <input type="checkbox" data-id="${restaurant.docId}" ${restaurant.active ? 'checked' : ''}>
                <span class="slider round"></span>
            `;
            statusToggle.querySelector('input').addEventListener('change', (e) => toggleRestaurantStatus(e.target.dataset.id, e.target.checked));

            const startDateDisplay = restaurant.startDate ? new Date(restaurant.startDate.seconds * 1000).toLocaleDateString('es-ES') : 'N/A';
            const endDateDisplay = restaurant.endDate ? new Date(restaurant.endDate.seconds * 1000).toLocaleDateString('es-ES') : 'N/A';

            div.innerHTML = `
                <div class="restaurant-info">
                    <strong>ID:</strong> ${restaurant.id}<br>
                    <strong>Nombre:</strong> ${restaurant.name}<br>
                    <strong>Estado:</strong> ${restaurant.active ? 'Activo' : 'Inactivo'}<br>
                    <strong>Inicio Suscripción:</strong> ${startDateDisplay}<br>
                    <strong>Fin Suscripción:</strong> ${endDateDisplay}
                </div>
                <div class="restaurant-actions">
                    <button class="edit-restaurant-btn" data-id="${restaurant.docId}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-restaurant-btn" data-id="${restaurant.docId}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            `;
            div.querySelector('.restaurant-info').appendChild(statusToggle);

            restaurantListManagementDiv.appendChild(div);
        });

        restaurantListManagementDiv.querySelectorAll('.edit-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => startEditRestaurant(e.currentTarget.dataset.id));
        });
        restaurantListManagementDiv.querySelectorAll('.delete-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteRestaurant(e.currentTarget.dataset.id));
        });
    };

    const toggleRestaurantStatus = async (docId, isActive) => {
        const restaurantRef = doc(db, "restaurants", docId);
        try {
            await updateDoc(restaurantRef, { active: isActive });
            orderResultDiv.textContent = `Estado del restaurante actualizado.`;
            orderResultDiv.style.color = 'green';
            renderRestaurantManagement();
        } catch (error) {
            console.error("Error updating restaurant status: ", error);
            orderResultDiv.textContent = 'Error al actualizar el estado.';
            orderResultDiv.style.color = 'red';
        }
    };

    const addUpdateRestaurant = async () => {
        const restaurantId = editingRestaurantId || restaurantIdInput.value.trim();
        const restaurantName = restaurantNameManagementInput.value.trim();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!restaurantId || !restaurantName || !startDate || !endDate) {
            orderResultDiv.textContent = 'Todos los campos son obligatorios.';
            orderResultDiv.style.color = 'orange';
            return;
        }

        const restaurantRef = doc(db, "restaurants", restaurantId);

        try {
            const dataToSave = {
                id: restaurantId,
                name: restaurantName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            };

            if (editingRestaurantId) {
                // Modo Edición: Solo actualiza los campos, no sobreescribe todo el documento
                await updateDoc(restaurantRef, dataToSave);
                alert('Restaurante actualizado correctamente'); // <-- ALERTA AÑADIDA
            } else {
                // Modo Creación: Establece los datos iniciales
                dataToSave.active = true;
                dataToSave.menuItems = [];
                dataToSave.settings = {
                    restaurantName: restaurantName,
                    restaurantLogoUrl: "",
                    currencySymbol: "$",
                    volume: 1
                };
                await setDoc(restaurantRef, dataToSave);
                alert(`Recuerda crear el usuario para ${restaurantName} en Firebase Authentication y vincularlo en la colección 'users'.`);
            }

            orderResultDiv.textContent = `Restaurante "${restaurantName}" ${editingRestaurantId ? 'actualizado' : 'añadido'}.`;
            orderResultDiv.style.color = 'green';

            renderRestaurantManagement();
            cancelEditRestaurant();
        } catch (error) {
            console.error("Error saving restaurant: ", error);
            orderResultDiv.textContent = 'Error al guardar el restaurante.';
            orderResultDiv.style.color = 'red';
        }
    };

    const startEditRestaurant = async (docId) => {
        const restaurantRef = doc(db, "restaurants", docId);
        const docSnap = await getDoc(restaurantRef);

        if (docSnap.exists()) {
            const restaurant = docSnap.data();
            editingRestaurantId = docId;
            restaurantIdInput.value = restaurant.id;
            restaurantNameManagementInput.value = restaurant.name;
            startDateInput.value = new Date(restaurant.startDate.seconds * 1000).toISOString().split('T')[0];
            endDateInput.value = new Date(restaurant.endDate.seconds * 1000).toISOString().split('T')[0];
            
            addUpdateRestaurantBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Restaurante';
            cancelEditRestaurantBtn.classList.remove('hidden');
            restaurantIdInput.disabled = true;
            orderResultDiv.textContent = `Editando restaurante: "${restaurant.name}"`;
            orderResultDiv.style.color = '#333';
        } else {
            orderResultDiv.textContent = 'Error: No se pudo encontrar el restaurante para editar.';
            orderResultDiv.style.color = 'red';
        }
    };

    const deleteRestaurant = async (docId) => {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar este restaurante de la base de datos? Esta acción no se puede deshacer.');

        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "restaurants", docId));
            orderResultDiv.textContent = `Restaurante eliminado.`;
            orderResultDiv.style.color = 'green';
            renderRestaurantManagement();
        } catch (error) {
            console.error("Error deleting restaurant: ", error);
            orderResultDiv.textContent = 'Error al eliminar el restaurante.';
            orderResultDiv.style.color = 'red';
        }
    };

    const cancelEditRestaurant = () => {
        editingRestaurantId = null;
        restaurantIdInput.value = '';
        restaurantNameManagementInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        addUpdateRestaurantBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Añadir Restaurante';
        cancelEditRestaurantBtn.classList.add('hidden');
        restaurantIdInput.disabled = false;
        orderResultDiv.textContent = ''; // Limpiar mensajes de resultado
    };

    addUpdateRestaurantBtn.addEventListener('click', addUpdateRestaurant);
    cancelEditRestaurantBtn.addEventListener('click', cancelEditRestaurant);

    currentYearSpan.textContent = new Date().getFullYear();

    // Initialize floating total
    updateFloatingTotal();
    
    // Ensure menu is populated with default items if empty
    if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) {
        const currentMenu = await loadMenu();
        if (!currentMenu || currentMenu.length === 0) {
            saveMenu(defaultMenuItems);
        }
    }

    // Always load and render the menu regardless of user state
    await loadAppSettings(); // Load settings
    const initialMenu = await loadMenu();
    renderMainMenu(initialMenu);
    updateTotalPrice();

    updateLoginButton(); // Update button based on current user status
    updateSidebarVisibility(); // Update sidebar visibility based on current user role

    // Password visibility toggle for login modal
    (function() {
        const passwordInput = document.getElementById('password-input');
        const toggleLoginPassword = document.getElementById('toggle-login-password');

        if (passwordInput && toggleLoginPassword) {
            toggleLoginPassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                toggleLoginPassword.querySelector('i').classList.toggle('fa-eye');
                toggleLoginPassword.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    })();

    // Password visibility toggle for restaurant management
    (function() {
        const restaurantPasswordInput = document.getElementById('restaurant-password-input');
        const toggleRestaurantPassword = document.getElementById('toggle-restaurant-password');

        if (restaurantPasswordInput && toggleRestaurantPassword) {
            toggleRestaurantPassword.addEventListener('click', () => {
                const type = restaurantPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                restaurantPasswordInput.setAttribute('type', type);
                toggleRestaurantPassword.querySelector('i').classList.toggle('fa-eye');
                toggleRestaurantPassword.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    })();

    // New: Function to render Order Type Distribution Chart
    async function renderOrderTypeChart() {
        const history = await loadOrderHistory();
        let dineInCount = 0;
        let takeawayCount = 0;

        // Filter for "Recibido" orders today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const receivedOrdersToday = history.filter(o => 
            o.status === 'Recibido' && new Date(o.timestamp).toDateString() === today.toDateString()
        );

        receivedOrdersToday.forEach(order => {
            if (order.orderType === 'Comer en Restaurante') {
                dineInCount++;
            } else if (order.orderType === 'Para Llevar') {
                takeawayCount++;
            }
        });

        if (orderTypeChartInstance) {
            orderTypeChartInstance.destroy();
        }

        if (dineInCount === 0 && takeawayCount === 0) {
            orderTypeChartCanvas.classList.add('hidden');
            noOrderTypeStatsMessage.classList.remove('hidden');
            return;
        } else {
            orderTypeChartCanvas.classList.remove('hidden');
            noOrderTypeStatsMessage.classList.add('hidden');
        }

        const ctx = orderTypeChartCanvas.getContext('2d');
        orderTypeChartInstance = new Chart(ctx, {
            type: 'doughnut', // Doughnut chart for proportion
            data: {
                labels: ['Comer en Restaurante', 'Para Llevar'],
                datasets: [{
                    data: [dineInCount, takeawayCount],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)', // Teal for Dine-in
                        'rgba(255, 159, 64, 0.7)'  // Orange for Takeaway
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom', // Place legend at the bottom
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Distribución de Pedidos (Comer en Restaurante vs Para Llevar) Hoy', // Updated title
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    downloadTopItemsBtn.addEventListener('click', async () => {
        const topItemsData = {}; // Re-calculate based on today's orders
        const history = await loadOrderHistory();
        const currentMenu = await loadMenu();
        const currencySymbol = appSettings.currencySymbol || '$';

        // Re-calculate aggregated quantities for each item based on today's "Recibido" orders
        history.forEach(order => {
            const orderDate = new Date(order.timestamp);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (order.status === 'Recibido' && orderDate.toDateString() === today.toDateString()) {
                order.items.forEach(item => {
                    const itemName = typeof item === 'object' ? item.name : item;
                    const quantity = typeof item === 'object' && item.quantity !== undefined ? item.quantity : 1;
                    topItemsData[itemName] = (topItemsData[itemName] || 0) + quantity;
                });
            }
        });

        let tableHtml = `
            <style>
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
            <h2>Artículos Más Vendidos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Plato/Bebida</th>
                        <th>Cantidad Vendida (Total)</th>
                        <th>Precio Unitario (${currencySymbol})</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const sortedItems = Object.entries(topItemsData).sort(([, countA], [, countB]) => countB - countA);

        if (sortedItems.length === 0) {
            tableHtml += `
                <tr>
                    <td colspan="3">No hay datos suficientes para generar el informe de artículos más vendidos.</td>
                </tr>
            `;
        } else {
            sortedItems.forEach(([itemName, count]) => {
                const menuItem = currentMenu.find(item => item.name === itemName);
                const price = menuItem ? menuItem.price.toFixed(2) : 'N/A';
                tableHtml += `
                    <tr>
                        <td>${itemName}</td>
                        <td>${count}</td>
                        <td>${price}</td>
                    </tr>
                `;
            });
        }
        tableHtml += `
                </tbody>
            </table>
        `;

        const doc = new jsPDF();
        let yOffset = 20;

        doc.setFontSize(18);
        doc.text('Reporte de Artículos Más Vendidos (Hoy)', doc.internal.pageSize.getWidth() / 2, yOffset, { align: 'center' });
        yOffset += 10;

        doc.setFontSize(10);
        doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString('es-ES')}`, 10, yOffset);
        yOffset += 7;
        doc.text(`Moneda: ${currencySymbol}`, 10, yOffset);
        yOffset += 15;

        const parser = new DOMParser();
        const docHtml = parser.parseFromString(tableHtml, 'text/html');
        const tableElement = docHtml.querySelector('table');

        if (tableElement && typeof doc.autoTable === 'function') {
            const head = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent);
            const body = Array.from(tableElement.querySelectorAll('tbody tr')).map(row =>
                Array.from(row.querySelectorAll('td')).map(td => td.textContent)
            );

            doc.autoTable({
                startY: yOffset + 5,
                head: [head],
                body: body,
                theme: 'striped',
                headStyles: { fillColor: [255, 215, 0] }, // Gold header
                styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 70 },
                    1: { cellWidth: 40, halign: 'center' },
                    2: { cellWidth: 40, halign: 'right' }
                },
                didDrawPage: function (data) {
                    yOffset = data.cursor.y;
                }
            });
            yOffset = doc.autoTable.previous.finalY;
        } else {
            doc.setFontSize(12);
            doc.text('Artículos Más Vendidos', 10, yOffset);
            yOffset += 20;
            if (sortedItems.length === 0) {
                doc.text('No hay datos suficientes para generar el informe de artículos más vendidos.', 10, yOffset);
            } else {
                doc.text('Plato/Bebida | Cantidad Vendida | Precio Unitario', 10, yOffset);
                yOffset += 5;
                doc.text('------------------------------------------------', 10, yOffset);
                yOffset += 5;
                sortedItems.forEach(([itemName, count]) => {
                    const menuItem = currentMenu.find(item => item.name === itemName);
                    const price = menuItem ? menuItem.price.toFixed(2) : 'N/A';
                    doc.text(`${itemName} | ${count} | ${price}`, 10, yOffset);
                    yOffset += 7;
                });
            }
        }
        const fileName = `Articulos_Mas_Vendidos_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
    });

    // New: Download History Button Event Listener
    downloadHistoryBtn.addEventListener('click', async () => {
        const history = await loadOrderHistory();
        const currencySymbol = appSettings.currencySymbol || '$';
        const currentMenu = await loadMenu(); // Needed to get all item names for 'top items'

        const doc = new jsPDF();
        let yOffset = 20;

        // Title
        doc.setFontSize(18);
        doc.text('Reporte de Historial de Pedidos', doc.internal.pageSize.getWidth() / 2, yOffset, { align: 'center' });
        yOffset += 10;

        doc.setFontSize(10);
        doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString('es-ES')}`, 10, yOffset);
        yOffset += 7;
        doc.text(`Moneda: ${currencySymbol}`, 10, yOffset);
        yOffset += 15;

        // 1. All Orders (Table)
        doc.setFontSize(14);
        doc.text('Detalle de Pedidos', 10, yOffset);
        yOffset += 5;

        if (history.length === 0) {
            doc.setFontSize(10);
            doc.text('No hay pedidos registrados.', 10, yOffset + 5);
            yOffset += 15;
        } else {
            const tableColumn = ["Pedido #", "Cliente", "Tipo", "Items", "Total (" + currencySymbol + ")", "Estado", "Notas"];
            const tableRows = [];

            history.forEach(order => {
                const itemsFormatted = order.items.map(item => typeof item === 'object' ? item.name : item).join(', ');
                const totalDisplay = (order.totalPrice + (order.extraPayment ? order.extraPayment.amount : 0)).toFixed(2);
                tableRows.push([
                    order.id,
                    order.name,
                    order.orderType || 'N/A',
                    itemsFormatted,
                    totalDisplay,
                    order.status,
                    order.notes || ''
                ]);
            });

            doc.autoTable({
                startY: yOffset + 5,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [255, 140, 0] }, // Dark orange header
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 60 },
                    4: { cellWidth: 20, halign: 'right' },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 25 }
                },
                didDrawPage: function (data) {
                    yOffset = data.cursor.y;
                }
            });
            yOffset = doc.autoTable.previous.finalY;
        }

        yOffset += 20;

        // 2. Summary of total money (revenue)
        doc.setFontSize(14);
        doc.text('Resumen General', 10, yOffset);
        yOffset += 5;

        const summary = await loadDailySummary(); // Reuse daily summary logic for overall revenue
        const totalOverallRevenue = history.reduce((sum, order) => {
            return sum + (order.totalPrice + (order.extraPayment ? order.extraPayment.amount : 0));
        }, 0);

        doc.setFontSize(10);
        doc.text(`Total de pedidos procesados: ${history.length}`, 10, yOffset + 5);
        doc.text(`Ingresos totales (incl. extras): ${totalOverallRevenue.toFixed(2)} ${currencySymbol}`, 10, yOffset + 12);
        yOffset += 25;

        // 3. Most Sold Products (re-calculate for all history)
        doc.setFontSize(14);
        doc.text('Artículos Más Vendidos (Historial Completo)', 10, yOffset);
        yOffset += 5;

        let allTimeTopItems = {};
        history.filter(o => o.status === 'Recibido').forEach(order => {
            order.items.forEach(item => {
                const itemName = typeof item === 'object' ? item.name : item;
                allTimeTopItems[itemName] = (allTimeTopItems[itemName] || 0) + 1;
            });
        });

        const sortedAllTimeTopItems = Object.entries(allTimeTopItems).sort(([, countA], [, countB]) => countB - countA);

        if (sortedAllTimeTopItems.length === 0) {
            doc.setFontSize(10);
            doc.text('No hay datos de artículos vendidos en el historial.', 10, yOffset + 5);
            yOffset += 15;
        } else {
            const topItemsTableColumn = ["Artículo", "Cantidad Vendida"];
            const topItemsTableRows = [];
            sortedAllTimeTopItems.forEach(([itemName, count]) => {
                topItemsTableRows.push([itemName, count]);
            });

            doc.autoTable({
                startY: yOffset + 5,
                head: [topItemsTableColumn],
                body: topItemsTableRows,
                theme: 'striped',
                headStyles: { fillColor: [255, 215, 0] }, // Gold header
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 40, halign: 'center' }
                },
                didDrawPage: function (data) {
                    yOffset = data.cursor.y;
                }
            });
            yOffset = doc.autoTable.previous.finalY;
        }

        yOffset += 20;

        // 4. Order Types Distribution (for all history)
        doc.setFontSize(14);
        doc.text('Distribución de Pedidos por Tipo (Historial Completo)', 10, yOffset);
        yOffset += 5;

        let totalDineIn = 0;
        let totalTakeaway = 0;
        history.filter(o => o.status === 'Recibido').forEach(order => {
            if (order.orderType === 'Comer en Restaurante') {
                totalDineIn++;
            } else if (order.orderType === 'Para Llevar') {
                totalTakeaway++;
            }
        });

        const totalOrdersForType = totalDineIn + totalTakeaway;
        const dineInPercentage = totalOrdersForType > 0 ? ((totalDineIn / totalOrdersForType) * 100).toFixed(2) : 0;
        const takeawayPercentage = totalOrdersForType > 0 ? ((totalTakeaway / totalOrdersForType) * 100).toFixed(2) : 0;

        if (totalOrdersForType === 0) {
            doc.setFontSize(10);
            doc.text('No hay datos de distribución de pedidos en el historial.', 10, yOffset + 5);
        } else {
            doc.setFontSize(10);
            doc.text(`Comer en Restaurante: ${totalDineIn} pedidos (${dineInPercentage}%)`, 10, yOffset + 5);
            doc.text(`Para Llevar: ${totalTakeaway} pedidos (${takeawayPercentage}%)`, 10, yOffset + 12);
        }

        const fileName = `Historial_Pedidos_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
    });
});
