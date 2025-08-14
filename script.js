document.addEventListener('DOMContentLoaded', () => {
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
    const restaurantPasswordInput = document.getElementById('restaurant-password-input');
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

    const getAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            // Load volume specific to the current user
            // Corrected: Use the same logic for volume key as in settings.js
            const savedVolume = parseFloat(localStorage.getItem(getSettingsKey().replace('_appSettings', '_appVolume')) || '1'); 
            gainNode.gain.value = savedVolume;
        }
        return audioContext;
    };

    const playSound = async (soundPath) => {
        const context = getAudioContext();
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

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data && event.data.type === 'volumeChanged') {
            const newVolume = parseFloat(event.data.volume);
            if (gainNode) {
                gainNode.gain.value = newVolume;
                console.log('Volume updated in index.js:', newVolume);
            } else {
                getAudioContext();
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
            loadAppSettings(); // Reload settings in the main app
            if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) { 
                renderMainMenu(loadMenu());
                updateTotalPrice();
                updateDailySummary();
                renderTopItemsChart();
                renderOrderTypeChart(); // Re-render order type chart on settings update
            }
        }
    });

    const loadAppSettings = () => {
        appSettings = JSON.parse(localStorage.getItem(getSettingsKey()) || '{}');
        currencyDisplaySpan.textContent = appSettings.currencySymbol || '$';
        floatingCurrencyDisplay.textContent = appSettings.currencySymbol || '$';
    };

    const defaultMenuItems = [
        { id: 'item1', name: 'Hamburguesa Sencilla', price: 8.50, type: 'dish' },
        { id: 'item2', name: 'Pizza Pepperoni', price: 12.00, type: 'dish' },
        { id: 'item3', name: 'Ensalada César', price: 7.00, type: 'dish' },
        { id: 'item4', name: 'Papas Fritas', price: 3.50, type: 'dish' },
        { id: 'item5', name: 'Refresco', price: 2.00, type: 'drink' },
        { id: 'item6', name: 'Agua Embotellada', price: 1.50, type: 'drink' },
        { id: 'item7', name: 'Jugo de Naranja', price: 3.00, type: 'drink' },
        { id: 'item8', name: 'Café Americano', price: 2.50, type: 'drink' },
        { id: 'item9', name: 'Tarta de Chocolate', price: 4.50, type: 'dessert' },
        { id: 'item10', name: 'Helado de Vainilla', price: 3.00, type: 'dessert' },
        { id: 'item11', name: 'Flan de Caramelo', price: 3.50, type: 'dessert' }
    ];

    const loadMenu = () => {
        const menu = localStorage.getItem(getStorageKey('menuItems'));
        return menu ? JSON.parse(menu) : defaultMenuItems;
    };

    const saveMenu = (menu) => {
        localStorage.setItem(getStorageKey('menuItems'), JSON.stringify(menu));
    };

    const getNextMenuItemId = () => {
        return `item_${Date.now()}`;
    };

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
        document.querySelectorAll('.menu-categories input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateTotalPrice);
        });

        updateTotalPrice();
    };

    const updateTotalPrice = () => {
        const menuItemsCheckboxes = document.querySelectorAll('.menu-categories input[type="checkbox"]');
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

    const addItem = (name, price, type) => {
        if (!name || name.trim() === '') {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'El nombre del plato/bebida no puede estar vacío.';
            return;
        }
        if (isNaN(price) || price < 0) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'El precio debe ser un número válido mayor o igual a cero.';
            return;
        }
        if (!type) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Por favor, selecciona un tipo (plato, bebida o postre).';
            return;
        }

        const menu = loadMenu();
        const normalizedName = name.trim().toLowerCase();
        if (menu.some(item => item.name.trim().toLowerCase() === normalizedName)) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = `El plato/bebida/postre "${name.trim()}" ya existe en el menú.`;
            return;
        }

        const newItem = { id: getNextMenuItemId(), name: name.trim(), price: parseFloat(price), type: type };
        menu.push(newItem);
        saveMenu(menu);
        renderMainMenu(menu);
        renderManagementMenu(menu);
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemTypeInput.value = 'dish'; 
        orderResultDiv.classList.remove('error');
        orderResultDiv.style.color = 'green';
        orderResultDiv.textContent = `Plato/Bebida/Postre "${newItem.name}" agregado.`;

        renderTopItemsChart();
    };

    const deleteItem = (id) => {
        let menu = loadMenu();
        const initialLength = menu.length;
        const itemToDelete = menu.find(item => item.id === id);
        const itemName = itemToDelete ? itemToDelete.name : 'un plato/bebida/postre';

        const confirmed = confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`);

        if (!confirmed) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = `Eliminación de "${itemName}" cancelada.`;
            return;
        }

        menu = menu.filter(item => item.id !== id);
        if (menu.length < initialLength) {
            saveMenu(menu);
            renderMainMenu(menu);
            renderManagementMenu(menu);
            if (editingItemId === id) {
                cancelEditing();
            }
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'green';
            orderResultDiv.textContent = `Plato/Bebida/Postre "${itemName}" eliminado.`;

            let topItems = loadTopItems();
            if (topItems[itemName]) {
                delete topItems[itemName];
                saveTopItems(topItems);
                renderTopItemsChart();
            }
        } else {
            console.warn('Attempted to delete non-existent item with ID:', id);
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'red';
            orderResultDiv.textContent = 'Error: No se pudo encontrar el plato/bebida/postre para eliminar.';
        }
    };

    const startEditItem = (id) => {
        const menu = loadMenu();
        const itemToEdit = menu.find(item => item.id === id);

        if (itemToEdit) {
            editingItemId = id;
            itemNameInput.value = itemToEdit.name;
            itemPriceInput.value = itemToEdit.price;
            itemTypeInput.value = itemToEdit.type || 'dish'; 
            addUpdateItemBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Plato';
            cancelEditBtn.classList.remove('hidden');
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = `Editando: "${itemToEdit.name}"`;
        } else {
            console.warn('Attempted to edit non-existent item with ID:', id);
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'red';
            orderResultDiv.textContent = 'Error: No se pudo encontrar el plato/bebida/postre para editar.';
            cancelEditing();
        }
    };

    const updateItem = (id, newName, newPrice, newType) => {
        if (!newName || newName.trim() === '') {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'El nombre del plato/bebida/postre no puede estar vacío.';
            return;
        }
        if (isNaN(newPrice) || newPrice < 0) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'El precio debe ser un número válido mayor o igual a cero.';
            return;
        }
        if (!newType) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Por favor, selecciona un tipo (plato, bebida o postre).';
            return;
        }
        let menu = loadMenu();
        const itemIndex = menu.findIndex(item => item.id === id);

        const normalizedNewName = newName.trim().toLowerCase();
        if (menu.some(item => item.id !== id && item.name.trim().toLowerCase() === normalizedNewName)) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = `El nombre "${newName.trim()}" ya existe en otro plato/bebida/postre.`;
            return;
        }

        if (itemIndex > -1) {
            const oldName = menu[itemIndex].name;
            menu[itemIndex].name = newName.trim();
            menu[itemIndex].price = parseFloat(newPrice);
            menu[itemIndex].type = newType;
            saveMenu(menu);
            renderMainMenu(menu);
            renderManagementMenu(menu);
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'green';
            orderResultDiv.textContent = `Plato/Bebida/Postre actualizado de "${oldName}" a "${menu[itemIndex].name}".`;
            cancelEditing();

            if (oldName !== newName.trim()) {
                let topItems = loadTopItems();
                if (topItems[oldName]) {
                    topItems[newName.trim()] = topItems[oldName];
                    delete topItems[oldName];
                    saveTopItems(topItems);
                    renderTopItemsChart();
                }
            } else {
                renderTopItemsChart();
            }
        } else {
            console.warn('Attempted to update non-existent item with ID:', id);
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'red';
            orderResultDiv.textContent = 'Error: No se pudo encontrar el plato/bebida/postre para actualizar.';
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

    const getNextOrderNumber = () => {
        let lastOrderNumber = localStorage.getItem(getStorageKey('lastOrderNumber'));
        let currentNumber = parseInt(lastOrderNumber, 10);

        if (isNaN(currentNumber) || currentNumber < 1) {
            currentNumber = 0;
        }

        if (currentNumber >= 9999) {
            currentNumber = 0;
        }

        const nextNumber = currentNumber + 1;

        localStorage.setItem(getStorageKey('lastOrderNumber'), nextNumber);

        return nextNumber;
    };

    const loadOrderHistory = () => {
        const history = localStorage.getItem(getStorageKey('orderHistory'));
        return history ? JSON.parse(history) : [];
    };

    const saveOrderHistory = (history) => {
        localStorage.setItem(getStorageKey('orderHistory'), JSON.stringify(history));
    };

    const addOrderToHistory = (order) => {
        const history = loadOrderHistory();
        history.push(order);
        saveOrderHistory(history);
    };

    const updateOrderStatus = (orderId, newStatus) => {
        const history = loadOrderHistory();
        const orderIndex = history.findIndex(order => order.id === parseInt(orderId, 10));

        if (orderIndex > -1) {
            const oldOrder = history[orderIndex];
            const oldStatus = oldOrder.status;
            history[orderIndex].status = newStatus;
            saveOrderHistory(history);
            renderOrderHistory();
            if (oldStatus !== 'Listo' && newStatus === 'Listo') {
                playSound('/ready_sound.mpeg');
            }

            if (newStatus === 'Recibido' && oldStatus !== 'Recibido') {
                trackSoldItems(history[orderIndex]);
                updateDailySummary();
            } else if (oldStatus === 'Recibido' && newStatus !== 'Recibido') {
                untrackSoldItems(history[orderIndex]);
                updateDailySummary();
            }
            window.localStorage.setItem('orderHistoryUpdate', Date.now()); 
        } else {
            console.warn('Attempted to update status for non-existent order with ID:', orderId);
        }
    };

    const renderOrderHistory = () => {
        const history = loadOrderHistory();
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

            statusSelect.addEventListener('change', (event) => {
                const id = event.target.dataset.orderId;
                const newStatus = event.target.value;
                updateOrderStatus(id, newStatus);
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
            prevButton.addEventListener('click', () => {
                currentPage--;
                renderOrderHistory();
            });

            const pageInfoSpan = document.createElement('span');
            pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Siguiente';
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener('click', () => {
                currentPage++;
                renderOrderHistory();
            });

            historyPaginationControlsDiv.appendChild(prevButton);
            historyPaginationControlsDiv.appendChild(pageInfoSpan);
            historyPaginationControlsDiv.appendChild(nextButton);
        }

        window.addEventListener('storage', (event) => {
            const relevantOrderHistoryKey = getStorageKey('orderHistory');
            const relevantLastOrderNumberKey = getStorageKey('lastOrderNumber');
            const relevantAppSettingsKey = getSettingsKey();

            if (event.key === relevantOrderHistoryKey || event.key === relevantLastOrderNumberKey || event.key === 'orderHistoryUpdate') {
                console.log('Storage event detected for order history, re-rendering monitor.');
                if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) {
                    renderOrderHistory();
                }
            } else if (event.key === relevantAppSettingsKey) {
                console.log('Settings updated from iframe. Monitor(s) will refresh via storage event.');
                loadAppSettings();
                if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) { 
                    renderMainMenu(loadMenu());
                    updateTotalPrice();
                    updateDailySummary();
                }
            } else if (event.key === 'currentUser' && currentUser) {
                const newCurrentUser = JSON.parse(event.newValue);
                if (!newCurrentUser || newCurrentUser.id !== currentUser.id) {
                    location.reload(); 
                }
            }
        });
    };

    const openEditOrderModal = (orderId) => {
        editingOrderId = orderId;
        const history = loadOrderHistory();
        const orderToEdit = history.find(order => order.id === orderId);

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
        const menuItems = loadMenu();
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

    saveEditedOrderBtn.addEventListener('click', () => {
        const history = loadOrderHistory();
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
            untrackSoldItems(oldOrder);
            updateDailySummary();
        } else if (oldOrder.status !== 'Recibido' && updatedOrder.status === 'Recibido') {
            trackSoldItems(updatedOrder);
            updateDailySummary();
        } else if (oldOrder.status === 'Recibido' && updatedOrder.status === 'Recibido') {
            const oldItemNames = new Set(oldOrder.items.map(item => typeof item === 'object' ? item.name : item));
            const newItemNames = new Set(updatedOrder.items.map(item => item.name));

            oldItemNames.forEach(name => {
                if (!newItemNames.has(name)) {
                    untrackSoldItems({ items: [{ name: name }] });
                }
            });
            newItemNames.forEach(name => {
                if (!oldItemNames.has(name)) {
                    trackSoldItems({ items: [{ name: name }] });
                }
            });
            updateDailySummary();
        }

        history[orderIndex] = updatedOrder;
        saveOrderHistory(history);
        
        renderOrderHistory();
        
        renderTopItemsChart();
        renderOrderTypeChart();

        editOrderMessage.textContent = 'Pedido actualizado con éxito!';
        editOrderMessage.classList.remove('hidden');
        editOrderMessage.classList.remove('error');
        editOrderMessage.classList.add('success');

        if (oldOrder.status !== 'Listo' && updatedOrder.status === 'Listo') {
            playSound('/ready_sound.mp3');
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
        const appSettings = JSON.parse(localStorage.getItem(getSettingsKey()) || '{}');
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

    const loadDailySummary = () => {
        const summary = localStorage.getItem(getStorageKey('dailySummary'));
        const today = new Date().toDateString();
        if (summary) {
            const parsedSummary = JSON.parse(summary);
            if (parsedSummary.date === today) {
                return parsedSummary;
            }
        }
        return { date: today, totalOrders: 0, totalRevenue: 0, extraRevenue: 0 };
    };

    const saveDailySummary = (summary) => {
        localStorage.setItem(getStorageKey('dailySummary'), JSON.stringify(summary));
    };

    const updateDailySummary = () => {
        let summary = loadDailySummary();
        const history = loadOrderHistory();
        const today = new Date().toDateString();

        const receivedOrdersToday = history.filter(o => o.status === 'Recibido' && new Date(o.timestamp).toDateString() === today);

        summary.totalOrders = receivedOrdersToday.length;
        summary.totalRevenue = receivedOrdersToday.reduce((sum, o) => {
            return sum + o.totalPrice;
        }, 0);

        summary.extraRevenue = 0;

        saveDailySummary(summary);
        summaryTotalOrdersSpan.textContent = summary.totalOrders;
        summaryTotalRevenueSpan.textContent = summary.totalRevenue.toFixed(2);
        summaryExtraRevenueSpan.textContent = summary.extraRevenue.toFixed(2);
        summaryCurrencyDisplaySpan.textContent = appSettings.currencySymbol || '$';
    };

    const resetDailySummary = () => {
        const confirmed = confirm('¿Estás seguro de que quieres reiniciar el resumen del día? Esto borrará los datos de hoy.');
        if (confirmed) {
            localStorage.removeItem(getStorageKey('dailySummary'));
            updateDailySummary();
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

    downloadSummaryBtn.addEventListener('click', () => {
        const summary = loadDailySummary();
        const currencySymbol = appSettings.currencySymbol || '$';
        const contentHtml = `
            <p><strong>Resumen de Pedidos del Día: ${summary.date}</strong></p>
            <p>Total de pedidos recibidos hoy: ${summary.totalOrders}</p>
            <p>Ingresos totales por pedidos: ${summary.totalRevenue.toFixed(2)} ${currencySymbol}</p>
        `;
        generatePdfReport('Resumen del Día', contentHtml, `Resumen_Diario_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`);
    });

    const loadTopItems = () => {
        const topItems = localStorage.getItem(getStorageKey('topItemsSold'));
        return topItems ? JSON.parse(topItems) : {};
    };

    const saveTopItems = (topItems) => {
        localStorage.setItem(getStorageKey('topItemsSold'), JSON.stringify(topItems));
    };

    const trackSoldItems = (order) => {
        let topItems = loadTopItems();
        order.items.forEach(item => {
            const itemName = typeof item === 'object' ? item.name : item;
            topItems[itemName] = (topItems[itemName] || 0) + 1;
        });
        saveTopItems(topItems);
        if (!topItemsDiv.classList.contains('hidden')) {
            renderTopItemsChart();
        }
    };

    const untrackSoldItems = (order) => {
        let topItems = loadTopItems();
        order.items.forEach(item => {
            const itemName = typeof item === 'object' ? item.name : item;
            if (topItems[itemName] && topItems[itemName] > 0) {
                topItems[itemName]--;
                if (topItems[itemName] === 0) {
                    delete topItems[itemName];
                }
            }
        });
        saveTopItems(topItems);
        if (!topItemsDiv.classList.contains('hidden')) {
            renderTopItemsChart();
        }
    };

    const renderTopItemsChart = () => {
        const history = loadOrderHistory();
        const currentMenu = loadMenu();
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

    const resetTopItems = () => {
        const confirmed = confirm('¿Estás seguro de que quieres reiniciar los datos de los artículos vendidos? Esto borrará el historial de popularidad de los artículos.');
        if (confirmed) {
            // We no longer clear topItemsSold directly as it's computed dynamically
            // Instead, we might want to clear the 'Recibido' status for all relevant orders,
            // or simply acknowledge that the chart will reset as there are no 'Recibido' orders for today.
            // For now, removing the logic that clears topItemsSold, as it's now computed from order history
            // If the user truly wants to "reset" the displayed top items, they'd have to change order statuses.
            // Or, we could add a feature to clear *all* order history (which already exists and clears relevant data).
            renderTopItemsChart(); // Re-render to show updated (or lack of) data
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

    placeOrderBtn.addEventListener('click', () => {
        const menuItemsCheckboxes = document.querySelectorAll('.menu-categories input[type="checkbox"]');
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
            id: getNextOrderNumber(),
            name: customerName,
            items: selectedItems,
            notes: orderNotes,
            totalPrice: newOrderTotalPrice,
            extraPayment: null,
            timestamp: Date.now(),
            status: "Preparando",
            orderType: orderType
        };

        addOrderToHistory(newOrder);
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
            renderOrderHistory();
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
        const menuItemsCheckboxes = document.querySelectorAll('.menu-categories input[type="checkbox"]');
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
                    </div>
                </div>
                <div class="modal-footer">
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
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    });

    const showSection = (sectionId) => {
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
                const currentMenu = loadMenu();
                renderManagementMenu(currentMenu);
                renderMainMenu(currentMenu);
                cancelEditing();
                break;
            case 'daily-summary':
                updateDailySummary();
                break;
            case 'top-items':
                renderTopItemsChart();
                renderOrderTypeChart(); // Call to render order type chart here
                break;
            case 'restaurant-management-section':
                renderRestaurantManagement();
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

    addUpdateItemBtn.addEventListener('click', () => {
        const itemName = itemNameInput.value.trim();
        const itemPrice = parseFloat(itemPriceInput.value);
        const itemType = itemTypeInput.value; 

        if (editingItemId) {
            updateItem(editingItemId, itemName, itemPrice, itemType);
        } else {
            addItem(itemName, itemPrice, itemType);
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        cancelEditing();
        orderResultDiv.classList.remove('error');
        orderResultDiv.style.color = '';
        orderResultDiv.textContent = '';
    });

    managementMenuListDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-item-btn') || event.target.closest('.edit-item-btn')) {
            const btn = event.target.closest('.edit-item-btn');
            const itemId = btn.dataset.id;
            startEditItem(itemId);
        } else if (event.target.classList.contains('delete-item-btn') || event.target.closest('.delete-item-btn')) {
            const btn = event.target.closest('.delete-item-btn');
            const itemId = btn.dataset.id;
            deleteItem(itemId);
        }
    });

    resetMenuBtn.addEventListener('click', () => {
        const confirmed = confirm('¿Estás seguro de que quieres restablecer el menú a su estado predeterminado? Todos los platos actuales se eliminarán.');

        if (confirmed) {
            saveMenu(defaultMenuItems);

            const updatedMenu = loadMenu();
            renderMainMenu(updatedMenu);
            renderManagementMenu(updatedMenu);

            cancelEditing();

            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Menú restablecido a valores predeterminados.';

            localStorage.removeItem(getStorageKey('topItemsSold'));
            renderTopItemsChart();

        } else {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = 'Restablecimiento de menú cancelado.';
        }
    });

    resetHistoryBtn.addEventListener('click', () => {
        const confirmed = confirm('¿Estás seguro de que quieres restablecer todo el historial de pedidos? Esta acción no se puede deshacer.');

        if (confirmed) {
            localStorage.removeItem(getStorageKey('orderHistory'));
            localStorage.removeItem(getStorageKey('lastOrderNumber'));
            localStorage.removeItem(getStorageKey('dailySummary'));
            localStorage.removeItem(getStorageKey('topItemsSold'));
            localStorage.removeItem(getStorageKey('appSettings')); // Clear settings for the specific restaurant/admin

            if (!orderHistoryDiv.classList.contains('hidden')) {
                historyListUl.innerHTML = '<li>Historial de pedidos restablecido.</li>';
                historyPaginationControlsDiv.innerHTML = '';
                currentPage = 1;
            }

            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Historial de pedidos y contador restablecidos.';

            updateDailySummary();
            renderTopItemsChart();
            loadAppSettings(); // Reload settings as they might have been cleared
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

    const loadUsers = () => {
        const users = localStorage.getItem('users');
        if (users) {
            return JSON.parse(users);
        }
        return [{ id: 'admin', username: 'fastVis77', password: 'Fast/Vis/77', role: 'admin' }];
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const setCurrentUser = (user) => {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateLoginButton();
        updateSidebarVisibility();
        contentSections.forEach(section => section.classList.add('hidden'));
        document.getElementById('home-section').classList.remove('hidden'); 
        if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) {
            loadAppSettings(); // Load settings for the new user
            renderMainMenu(loadMenu());
            updateTotalPrice();
            updateDailySummary();
            renderTopItemsChart();
        } 
        if (currentUser && currentUser.role === 'admin') {
            showSection('restaurant-management-section');
        } else {
            showSection('home-section');
        }
    };

    const getCurrentUser = () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };

    const logout = () => {
        // Create a custom modal for logout confirmation
        const modal = document.createElement('div');
        modal.id = 'logout-modal';
        modal.innerHTML = `
            <div class="logout-modal-overlay">
                <div class="logout-modal-content">
                    <div class="logout-icon">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <h3>¿Cerrar Sesión?</h3>
                    <p>¿Estás seguro de que quieres cerrar tu sesión actual?</p>
                    <div class="logout-buttons">
                        <button class="logout-cancel">Cancelar</button>
                        <button class="logout-confirm">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .logout-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1002;
                animation: fadeIn 0.3s ease;
            }
            
            .logout-modal-content {
                background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                border: 3px solid #D32F2F;
                animation: slideUp 0.3s ease;
            }
            
            .logout-icon {
                font-size: 3rem;
                color: #D32F2F;
                margin-bottom: 20px;
            }
            
            .logout-modal-content h3 {
                font-family: 'Fredoka One', cursive;
                color: #D32F2F;
                font-size: 1.8rem;
                margin-bottom: 15px;
            }
            
            .logout-modal-content p {
                color: #333;
                font-size: 1.1rem;
                margin-bottom: 30px;
                line-height: 1.4;
            }
            
            .logout-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .logout-cancel, .logout-confirm {
                padding: 12px 30px;
                border: none;
                border-radius: 25px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .logout-cancel {
                background: #f0f0f0;
                color: #333;
                border: 2px solid #ccc;
            }
            
            .logout-cancel:hover {
                background: #e0e0e0;
                transform: translateY(-2px);
            }
            
            .logout-confirm {
                background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(211, 47, 47, 0.3);
            }
            
            .logout-confirm:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(211, 47, 47, 0.4);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.logout-cancel').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.logout-confirm').addEventListener('click', () => {
            setCurrentUser(null);
            modal.remove();
            alert('Sesión cerrada correctamente.');
            containerWrapper.classList.add('hidden');
            openLoginModal();
            updateLoginButton();
        });
        
        // Close on overlay click
        modal.querySelector('.logout-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
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
        loginAttemptsMessage.classList.add('hidden'); // Hide attempts message on opening
        loginModalOverlay.classList.remove('hidden');
        void loginModalOverlay.offsetWidth;
        loginModalOverlay.classList.add('active');
        containerWrapper.classList.add('hidden');
        
        // Load initial login attempts count from session storage
        const storedAttempts = sessionStorage.getItem('loginAttempts');
        loginAttempts = storedAttempts ? parseInt(storedAttempts, 10) : 0;
        updateLoginAttemptsMessage();
    };

    closeLoginModalBtn.addEventListener('click', () => {
        if (!currentUser) {
            loginMessage.textContent = 'Debes iniciar sesión para usar la aplicación.';
            loginMessage.classList.remove('hidden', 'success');
            loginMessage.classList.add('error');
            return;
        }

        loginModalOverlay.classList.remove('active');
        loginModalOverlay.addEventListener('transitionend', function handler() {
            loginModalOverlay.classList.add('hidden');
            loginModalOverlay.removeEventListener('transitionend', handler);
        }, { once: true });
    });

    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const users = loadUsers();
        let restaurants = loadRestaurants(); // Load restaurants to check active status

        const foundUser = users.find(u => u.username === username && u.password === password);

        if (foundUser) {
            loginAttempts = 0; // Reset attempts on successful login
            sessionStorage.setItem('loginAttempts', 0); // Save to session storage

            if (foundUser.role === 'restaurant') {
                const restaurant = restaurants.find(r => r.id === foundUser.id);
                if (restaurant && !restaurant.active) {
                    loginMessage.textContent = 'Tu restaurante está inactivo. Contacta al administrador.';
                    loginMessage.classList.remove('hidden', 'success');
                    loginMessage.classList.add('error');
                    return;
                }
                // New: Check subscription dates for restaurant users
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize to start of day
                const startDate = restaurant.startDate ? new Date(restaurant.startDate) : null;
                const endDate = restaurant.endDate ? new Date(restaurant.endDate) : null;
                
                if (startDate && today < startDate) {
                    loginMessage.textContent = `Tu suscripción comienza el ${startDate.toLocaleDateString('es-ES')}.`;
                    loginMessage.classList.remove('hidden', 'success');
                    loginMessage.classList.add('error');
                    return;
                }
                if (endDate && today > endDate) {
                    // Automatically deactivate if end date is passed
                    if (restaurant.active) {
                        restaurant.active = false;
                        saveRestaurants(restaurants); // Save the deactivated status
                        // Re-fetch restaurants to ensure latest state is used next time
                        restaurants = loadRestaurants(); 
                    }
                    loginMessage.textContent = `Tu suscripción expiró el ${endDate.toLocaleDateString('es-ES')}. Contacta al administrador.`;
                    loginMessage.classList.remove('hidden', 'success');
                    loginMessage.classList.add('error');
                    return;
                }
            }
            setCurrentUser(foundUser);
            loginMessage.textContent = `¡Bienvenido, ${foundUser.username}!`;
            loginMessage.classList.remove('hidden', 'error');
            loginMessage.classList.add('success');

            containerWrapper.classList.remove('hidden');
            loginModalOverlay.classList.remove('active');
            loginModalOverlay.classList.add('hidden');

            setTimeout(() => {
                loginMessage.classList.add('hidden');
            }, 1000);
        } else {
            loginAttempts++;
            sessionStorage.setItem('loginAttempts', loginAttempts); // Save to session storage
            updateLoginAttemptsMessage();

            if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                loginMessage.textContent = 'Has excedido el número máximo de intentos. Inténtalo más tarde.';
                loginMessage.classList.remove('hidden', 'success');
                loginMessage.classList.add('error');
                loginBtn.disabled = true; // Disable login button
                usernameInput.disabled = true;
                passwordInput.disabled = true;
            } else {
                loginMessage.textContent = 'Usuario o contraseña incorrectos.';
                loginMessage.classList.remove('hidden', 'success');
                loginMessage.classList.add('error');
            }
        }
    });

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

    const loadRestaurants = () => {
        const restaurants = localStorage.getItem('restaurants'); 
        return restaurants ? JSON.parse(restaurants) : [];
    };

    const saveRestaurants = (restaurants) => {
        localStorage.setItem('restaurants', JSON.stringify(restaurants)); 
    };

    const renderRestaurantManagement = () => {
        restaurantListManagementDiv.innerHTML = '';
        let restaurants = loadRestaurants();
        
        // New: Check and deactivate restaurants if their end date has passed
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        let needsSave = false;
        restaurants.forEach(restaurant => {
            if (restaurant.endDate) {
                const endDate = new Date(restaurant.endDate);
                endDate.setHours(0, 0, 0, 0); // Normalize to start of day
                if (today > endDate && restaurant.active) {
                    restaurant.active = false;
                    needsSave = true;
                    console.log(`Restaurante ${restaurant.name} (ID: ${restaurant.id}) desactivado automáticamente por fecha de finalización.`);
                }
            }
        });

        if (needsSave) {
            saveRestaurants(restaurants);
            restaurants = loadRestaurants(); // Reload to ensure data consistency
        }

        if (restaurants.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No hay restaurantes registrados.';
            restaurantListManagementDiv.appendChild(p);
            return;
        }

        restaurants.forEach(restaurant => {
            const div = document.createElement('div');
            div.classList.add('restaurant-entry');

            const statusToggle = document.createElement('label');
            statusToggle.classList.add('restaurant-status-toggle');
            statusToggle.innerHTML = `
                <input type="checkbox" data-id="${restaurant.id}" ${restaurant.active ? 'checked' : ''}>
                <span class="slider round"></span>
            `;
            statusToggle.querySelector('input').addEventListener('change', (e) => toggleRestaurantStatus(e.target.dataset.id, e.target.checked));

            // Format dates for display
            const startDateDisplay = restaurant.startDate ? new Date(restaurant.startDate).toLocaleDateString('es-ES') : 'N/A';
            const endDateDisplay = restaurant.endDate ? new Date(restaurant.endDate).toLocaleDateString('es-ES') : 'N/A';

            div.innerHTML = `
                <div class="restaurant-info">
                    <strong>ID:</strong> ${restaurant.id}<br>
                    <strong>Nombre:</strong> ${restaurant.name}<br>
                    <strong>Estado:</strong> ${restaurant.active ? 'Activo' : 'Inactivo'}<br>
                    <strong>Inicio Suscripción:</strong> ${startDateDisplay}<br>
                    <strong>Fin Suscripción:</strong> ${endDateDisplay}
                </div>
                <div class="restaurant-actions">
                    <button class="edit-restaurant-btn" data-id="${restaurant.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-restaurant-btn" data-id="${restaurant.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            `;
            div.querySelector('.restaurant-info').appendChild(statusToggle); // Append toggle to info div

            restaurantListManagementDiv.appendChild(div);
        });

        restaurantListManagementDiv.querySelectorAll('.edit-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => startEditRestaurant(e.currentTarget.dataset.id));
        });
        restaurantListManagementDiv.querySelectorAll('.delete-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteRestaurant(e.currentTarget.dataset.id));
        });
    };

    const toggleRestaurantStatus = (id, isActive) => {
        let restaurants = loadRestaurants();
        const restaurantIndex = restaurants.findIndex(r => r.id === id);

        if (restaurantIndex > -1) {
            restaurants[restaurantIndex].active = isActive;
            saveRestaurants(restaurants);
            renderRestaurantManagement(); // Re-render to show updated status
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'green';
            orderResultDiv.textContent = `Restaurante "${restaurants[restaurantIndex].name}" ahora está ${isActive ? 'Activo' : 'Inactivo'}.`;
        } else {
            console.warn('Attempted to toggle status for non-existent restaurant with ID:', id);
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'red';
            orderResultDiv.textContent = 'Error: No se pudo encontrar el restaurante para cambiar su estado.';
        }
    };

    const addUpdateRestaurant = () => {
        const id = restaurantIdInput.value.trim();
        const name = restaurantNameManagementInput.value.trim();
        const password = restaurantPasswordInput.value.trim();
        const startDate = startDateInput.value; // Get date values
        const endDate = endDateInput.value;     // Get date values

        if (!id || !name || !password || !startDate || !endDate) { // All fields mandatory
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'Todos los campos de restaurante (incluyendo fechas) son obligatorios.';
            return;
        }

        // Validate dates: End Date must be after Start Date
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'orange';
            orderResultDiv.textContent = 'La fecha de finalización debe ser posterior a la fecha de inicio.';
            return;
        }

        let restaurants = loadRestaurants();
        let users = loadUsers();

        if (editingRestaurantId) {
            const restaurantIndex = restaurants.findIndex(r => r.id === editingRestaurantId);
            const userIndex = users.findIndex(u => u.id === editingRestaurantId);

            if (restaurantIndex > -1) {
                if (restaurants.some(r => r.id !== editingRestaurantId && r.id === id) ||
                    restaurants.some(r => r.id !== editingRestaurantId && r.name.toLowerCase() === name.toLowerCase())) {
                    orderResultDiv.classList.add('error');
                    orderResultDiv.style.color = 'orange';
                    orderResultDiv.textContent = 'El ID o Nombre de restaurante ya está en uso por otro restaurante.';
                    return;
                }

                restaurants[restaurantIndex] = { 
                    id: id, 
                    name: name, 
                    password: password, 
                    active: restaurants[restaurantIndex].active || true, // Preserve active status
                    startDate: startDate, // Save start date
                    endDate: endDate      // Save end date
                }; 
                if (userIndex > -1) {
                    users[userIndex] = { id: id, username: name, password: password, role: 'restaurant' };
                } else {
                    users.push({ id: id, username: name, password: password, role: 'restaurant' });
                }
                orderResultDiv.classList.remove('error');
                orderResultDiv.style.color = 'green';
                orderResultDiv.textContent = `Restaurante "${name}" actualizado.`;
            } else {
                orderResultDiv.classList.add('error');
                orderResultDiv.style.color = 'red';
                orderResultDiv.textContent = 'Error: Restaurante no encontrado para actualizar.';
            }
        } else {
            if (restaurants.some(r => r.id === id) || restaurants.some(r => r.name.toLowerCase() === name.toLowerCase())) {
                orderResultDiv.classList.add('error');
                orderResultDiv.style.color = 'orange';
                orderResultDiv.textContent = 'El ID o Nombre de Restaurante ya existe.';
                return;
            }
            if (users.some(u => u.id === id || u.username.toLowerCase() === name.toLowerCase())) {
                orderResultDiv.classList.add('error');
                orderResultDiv.style.color = 'orange';
                orderResultDiv.textContent = 'Ya existe un usuario con este ID o nombre.';
                return;
            }

            const newRestaurant = { id: id, name: name, password: password, active: true, startDate: startDate, endDate: endDate }; // New restaurants are active by default
            restaurants.push(newRestaurant);
            users.push({ id: id, username: name, password: password, role: 'restaurant' });
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'green';
            orderResultDiv.textContent = `Restaurante "${name}" añadido.`;
        }
        saveRestaurants(restaurants);
        saveUsers(users);
        renderRestaurantManagement();
        cancelEditRestaurant();
    };

    const startEditRestaurant = (id) => {
        const restaurants = loadRestaurants();
        const restaurantToEdit = restaurants.find(r => r.id === id);

        if (restaurantToEdit) {
            editingRestaurantId = id;
            restaurantIdInput.value = restaurantToEdit.id;
            restaurantNameManagementInput.value = restaurantToEdit.name;
            restaurantPasswordInput.value = restaurantToEdit.password;
            startDateInput.value = restaurantToEdit.startDate || ''; // Populate start date
            endDateInput.value = restaurantToEdit.endDate || '';     // Populate end date
            addUpdateRestaurantBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Restaurante';
            cancelEditRestaurantBtn.classList.remove('hidden');
            restaurantIdInput.disabled = true;
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = `Editando restaurante: "${restaurantToEdit.name}"`;
        } else {
            console.warn('Attempted to edit non-existent restaurant with ID:', id);
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'red';
            orderResultDiv.textContent = 'Error: No se pudo encontrar el restaurante para editar.';
            cancelEditRestaurant();
        }
    };

    const deleteRestaurant = (id) => {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar este restaurante? Esto también eliminará su usuario y todos sus datos (pedidos, menú, resumen).');
        if (!confirmed) {
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = '#333';
            orderResultDiv.textContent = 'Eliminación de restaurante cancelada.';
            return;
        }

        let restaurants = loadRestaurants();
        let users = loadUsers();
        const initialRestaurantLength = restaurants.length;
        const restaurantToDelete = restaurants.find(r => r.id === id);
        const restaurantName = restaurantToDelete ? restaurantToDelete.name : 'un restaurante';

        restaurants = restaurants.filter(r => r.id !== id);
        users = users.filter(u => u.id !== id);

        if (restaurants.length < initialRestaurantLength) {
            saveRestaurants(restaurants);
            saveUsers(users);
            renderRestaurantManagement();
            orderResultDiv.classList.remove('error');
            orderResultDiv.style.color = 'green';
            orderResultDiv.textContent = `Restaurante "${restaurantName}" eliminado.`;
            if (editingRestaurantId === id) {
                cancelEditRestaurant();
            }

            // Clear all data associated with this restaurant ID
            const restaurantSpecificKeys = [
                `${id}_menuItems`,
                `${id}_orderHistory`,
                `${id}_lastOrderNumber`,
                `${id}_dailySummary`,
                `${id}_topItemsSold`,
                `restaurant_${id}_appSettings`, // Clear restaurant-specific settings
                `restaurant_${id}_appVolume` // Clear restaurant-specific volume
            ];
            restaurantSpecificKeys.forEach(key => localStorage.removeItem(key));

            if (currentUser && currentUser.id === id) {
                logout(); // Log out if the current user's restaurant is deleted
            }

        } else {
            orderResultDiv.classList.add('error');
            orderResultDiv.style.color = 'red';
            orderResultDiv.textContent = 'Error: No se pudo encontrar el restaurante para eliminar.';
        }
    };

    const cancelEditRestaurant = () => {
        editingRestaurantId = null;
        restaurantIdInput.value = '';
        restaurantNameManagementInput.value = '';
        restaurantPasswordInput.value = '';
        startDateInput.value = ''; // Clear start date
        endDateInput.value = '';     // Clear end date
        addUpdateRestaurantBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Añadir Restaurante';
        cancelEditRestaurantBtn.classList.add('hidden');
        restaurantIdInput.disabled = false;
    };

    addUpdateRestaurantBtn.addEventListener('click', addUpdateRestaurant);
    cancelEditRestaurantBtn.addEventListener('click', cancelEditRestaurant);

    currentYearSpan.textContent = new Date().getFullYear();

    // Initialize floating total
    updateFloatingTotal();

    // Initial setup logic
    currentUser = getCurrentUser(); // Set currentUser at startup

    // Ensure admin user exists on first load
    const allUsers = loadUsers();
    if (!allUsers.some(user => user.username === 'fastVis77' && user.role === 'admin')) {
        let currentUsers = allUsers.filter(user => !(user.username === 'admin' && user.role === 'admin')); 
        currentUsers.push({ id: 'admin', username: 'fastVis77', password: 'Fast/Vis/77', role: 'admin' });
        saveUsers(currentUsers);
    }
    
    // Ensure menu is populated with default items if empty
    if (currentUser && (currentUser.role === 'restaurant' || currentUser.role === 'admin')) {
        const currentMenu = loadMenu();
        if (!currentMenu || currentMenu.length === 0) {
            saveMenu(defaultMenuItems);
        }
    }

    // Always load and render the menu regardless of user state
    loadAppSettings(); // Load settings
    const initialMenu = loadMenu();
    renderMainMenu(initialMenu);
    updateTotalPrice();

    updateLoginButton(); // Update button based on current user status
    updateSidebarVisibility(); // Update sidebar visibility based on current user role

    if (currentUser) {
        containerWrapper.classList.remove('hidden');
        loginModalOverlay.classList.remove('active');
        loginModalOverlay.classList.add('hidden');
        updateDailySummary();
        renderTopItemsChart();
    } else {
        openLoginModal(); // If no user, show login modal
    }

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

    // New: Weekly Stats functionality
    // let weeklyRevenueChartInstance = null; // To hold the Chart.js instance

    // const loadWeeklyStats = () => {
    //     const startDateString = weeklyStartDateInput.value;
    //     const endDateString = weeklyEndDateInput.value;

    //     if (!startDateString || !endDateString) {
    //         noWeeklyStatsMessage.textContent = 'Por favor, selecciona un rango de fechas válido.';
    //         noWeeklyStatsMessage.classList.remove('hidden');
    //         weeklyTotalOrdersSpan.textContent = '0';
    //         weeklyTotalRevenueSpan.textContent = '0.00';
    //         if (weeklyRevenueChartInstance) {
    //             weeklyRevenueChartInstance.destroy();
    //             weeklyRevenueChartInstance = null;
    //         }
    //         weeklyRevenueChartCanvas.classList.add('hidden');
    //         return;
    //     }

    //     const startDate = new Date(startDateString);
    //     const endDate = new Date(endDateString);
    //     endDate.setHours(23, 59, 50, 999); // Set to end of the day

    //     if (startDate > endDate) {
    //         noWeeklyStatsMessage.textContent = 'La fecha de inicio no puede ser posterior a la fecha de finalización.';
    //         noWeeklyStatsMessage.classList.remove('hidden');
    //         weeklyTotalOrdersSpan.textContent = '0';
    //         weeklyTotalRevenueSpan.textContent = '0.00';
    //         if (weeklyRevenueChartInstance) {
    //             weeklyRevenueChartInstance.destroy();
    //             weeklyRevenueChartInstance = null;
    //         }
    //         weeklyRevenueChartCanvas.classList.add('hidden');
    //         return;
    //     }

    //     const history = loadOrderHistory();
    //     let totalOrders = 0;
    //     let totalRevenue = 0;
    //     const dailyRevenue = {}; // To store revenue for each day

    //     // Initialize dailyRevenue for all days in the range
    //     for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    //         dailyRevenue[d.toDateString()] = 0;
    //     }

    //     history.forEach(order => {
    //         const orderDate = new Date(order.timestamp);
    //         if (order.status === 'Recibido' && orderDate >= startDate && orderDate <= endDate) {
    //             totalOrders++;
    //             totalRevenue += order.totalPrice;
    //             const orderDateString = orderDate.toDateString();
    //             dailyRevenue[orderDateString] = (dailyRevenue[orderDateString] || 0) + order.totalPrice;
    //         }
    //     });

    //     weeklyTotalOrdersSpan.textContent = totalOrders;
    //     weeklyTotalRevenueSpan.textContent = totalRevenue.toFixed(2);
    //     weeklyCurrencyDisplaySpan.textContent = appSettings.currencySymbol || '$';

    //     renderWeeklyRevenueChart(dailyRevenue, startDate, endDate);
    // };

    // const renderWeeklyRevenueChart = (dailyRevenue = {}, startDate = null, endDate = null) => {
    //     if (!startDate || !endDate) {
    //         const history = loadOrderHistory();
    //         if (history.length > 0) {
    //             // Determine a default date range if not provided
    //             startDate = new Date(history[history.length - 1].timestamp); // Oldest order date
    //             endDate = new Date(); // Today
    //             endDate.setHours(23, 59, 59, 999);
    //         } else {
    //             noWeeklyStatsMessage.classList.remove('hidden');
    //             weeklyRevenueChartCanvas.classList.add('hidden');
    //             if (weeklyRevenueChartInstance) {
    //                 weeklyRevenueChartInstance.destroy();
    //                 weeklyRevenueChartInstance = null;
    //             }
    //             return;
    //         }
    //     }
        
    //     // Re-calculate dailyRevenue based on the current full order history and provided date range
    //     // This ensures the chart accurately reflects changes if `loadOrderHistory` or date inputs change
    //     const history = loadOrderHistory();
    //     const calculatedDailyRevenue = {};
    //     for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    //         calculatedDailyRevenue[d.toDateString()] = 0;
    //     }

    //     history.forEach(order => {
    //         const orderDate = new Date(order.timestamp);
    //         if (order.status === 'Recibido' && orderDate >= startDate && orderDate <= endDate) {
    //             const orderDateString = orderDate.toDateString();
    //             calculatedDailyRevenue[orderDateString] = (calculatedDailyRevenue[orderDateString] || 0) + order.totalPrice;
    //         }
    //     });
    //     dailyRevenue = calculatedDailyRevenue; // Use the freshly calculated data

    //     const labels = [];
    //     const data = [];

    //     for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    //         labels.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
    //         data.push(dailyRevenue[d.toDateString()] || 0);
    //     }

    //     if (weeklyRevenueChartInstance) {
    //         weeklyRevenueChartInstance.destroy();
    //     }

    //     if (labels.length === 0 || data.every(val => val === 0)) {
    //         weeklyRevenueChartCanvas.classList.add('hidden');
    //         noWeeklyStatsMessage.classList.remove('hidden');
    //         return;
    //     } else {
    //         weeklyRevenueChartCanvas.classList.remove('hidden');
    //         noWeeklyStatsMessage.classList.add('hidden');
    //     }

    //     const ctx = weeklyRevenueChartCanvas.getContext('2d');
    //     weeklyRevenueChartInstance = new Chart(ctx, {
    //         type: 'line',
    //         data: {
    //             labels: labels,
    //             datasets: [{
    //                 label: 'Ingresos Diarios',
    //                 data: data,
    //                 borderColor: '#2196F3', // Blue line
    //                 backgroundColor: 'rgba(33, 150, 243, 0.2)', // Light blue fill
    //                 tension: 0.4, // Smooth curve
    //                 fill: true,
    //                 pointBackgroundColor: '#2196F3',
    //                 pointBorderColor: '#fff',
    //                 pointHoverBackgroundColor: '#fff',
    //                 pointHoverBorderColor: '#2196F3',
    //                 pointRadius: 5,
    //                 pointHoverRadius: 7
    //             }]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 y: {
    //                     beginAtZero: true,
    //                     title: {
    //                         display: true,
    //                         text: `Ingresos (${appSettings.currencySymbol || '$'})`
    //                     }
    //                 },
    //                 x: {
    //                     title: {
    //                         display: true,
    //                         text: 'Fecha'
    //                     }
    //                 }
    //             },
    //             plugins: {
    //                 legend: {
    //                     display: false // We only have one dataset, no need for legend
    //                 },
    //                 title: {
    //                     display: true,
    //                     text: 'Ingresos Semanales'
    //                 },
    //                 tooltip: {
    //                     callbacks: {
    //                         label: function(context) {
    //                             return ` ${context.dataset.label}: ${context.raw.toFixed(2)} ${appSettings.currencySymbol || '$'}`
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // };

    // New: Function to render Order Type Distribution Chart
    const renderOrderTypeChart = () => {
        const history = loadOrderHistory();
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
    };

    downloadTopItemsBtn.addEventListener('click', () => {
        const topItemsData = {}; // Re-calculate based on today's orders
        const history = loadOrderHistory();
        const currentMenu = loadMenu();
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
    downloadHistoryBtn.addEventListener('click', () => {
        const history = loadOrderHistory();
        const currencySymbol = appSettings.currencySymbol || '$';
        const currentMenu = loadMenu(); // Needed to get all item names for 'top items'

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

        const summary = loadDailySummary(); // Reuse daily summary logic for overall revenue
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