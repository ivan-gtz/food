document.addEventListener('DOMContentLoaded', async () => {
    const detailMonitorListDiv = document.getElementById('detail-monitor-list');
    const restaurantNameElement = document.getElementById('restaurant-name-details');
    const restaurantLogoElement = document.getElementById('restaurant-logo-details');
    const monitorDetailsHeader = document.querySelector('.monitor-details-header');

    // New: Security modal elements
    const securityModal = document.createElement('div');
    securityModal.id = 'security-modal-overlay';
    securityModal.className = 'modal-overlay';
    securityModal.innerHTML = `
        <div class="modal-content">
            <h2> Acceso Restringido</h2>
            <p>Ingresa el ID del restaurante para acceder al Monitor de Detalles</p>
            <div class="form-group">
                <input type="text" id="security-restaurant-id" placeholder="Ej: R001" maxlength="10">
            </div>
            <button id="security-confirm-btn" class="confirm-button">
                <i class="fas fa-unlock"></i> Acceder
            </button>
            <button id="security-cancel-btn" class="confirm-button" style="background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);">
                <i class="fas fa-times"></i> Cancelar
            </button>
            <p id="security-message" class="modal-message hidden"></p>
        </div>
    `;
    document.body.appendChild(securityModal);

    let currentUser = null;
    let isAuthenticated = false;
    let currentRestaurantId = null;
    let orderHistory = [];

    const { db } = await import('./firebase-init.js');
    const { collection, onSnapshot, query, where, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js');

    // Security check function
    const checkSecurityAccess = () => {
        const storedAuth = localStorage.getItem('monitorDetailsAuthenticated');
        const storedId = localStorage.getItem('monitorDetailsRestaurantId');
        
        if (storedAuth === 'true' && storedId) {
            isAuthenticated = true;
            currentRestaurantId = storedId;
            return true;
        }
        
        return false;
    };

    // Clear authentication on page refresh/load
    const clearAuthentication = () => {
        localStorage.removeItem('monitorDetailsAuthenticated');
        localStorage.removeItem('monitorDetailsRestaurantId');
        isAuthenticated = false;
        currentRestaurantId = null;
    };

    // Show security modal
    const showSecurityModal = () => {
        securityModal.classList.remove('hidden');
        void securityModal.offsetWidth;
        securityModal.classList.add('active');
        
        const securityInput = document.getElementById('security-restaurant-id');
        const securityConfirm = document.getElementById('security-confirm-btn');
        const securityCancel = document.getElementById('security-cancel-btn');
        const securityMessage = document.getElementById('security-message');
        
        securityInput.focus();
        
        securityConfirm.onclick = () => {
            const restaurantId = securityInput.value.trim().toUpperCase();
            if (!restaurantId) {
                securityMessage.textContent = 'Por favor ingresa un ID de restaurante válido';
                securityMessage.classList.remove('hidden');
                securityMessage.classList.add('error');
                return;
            }
            
            const restaurants = loadRestaurants();
            const restaurant = restaurants.find(r => r.id === restaurantId && r.active);
            
            if (restaurant) {
                localStorage.setItem('monitorDetailsAuthenticated', 'true');
                localStorage.setItem('monitorDetailsRestaurantId', restaurantId);
                currentRestaurantId = restaurantId;
                isAuthenticated = true;
                
                securityModal.classList.remove('active');
                setTimeout(() => {
                    securityModal.classList.add('hidden');
                    initializeApp(restaurantId);
                }, 300);
            } else {
                securityMessage.textContent = 'ID de restaurante inválido o restaurante inactivo';
                securityMessage.classList.remove('hidden');
                securityMessage.classList.add('error');
            }
        };
        
        securityCancel.onclick = () => {
            securityModal.classList.remove('active');
            setTimeout(() => {
                securityModal.classList.add('hidden');
                window.close(); // Close window on cancel
            }, 300);
        };
    };

    // Initialize app after authentication
    const initializeApp = (restaurantId) => {
        // Update header with restaurant info
        const restaurants = loadRestaurants();
        const restaurant = restaurants.find(r => r.id === restaurantId);
        
        if (restaurant) {
            restaurantNameElement.textContent = restaurant.name;
            
            // Add authenticated indicator
            const authIndicator = document.createElement('div');
            authIndicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: #4CAF50;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8em;
                font-weight: bold;
            `;
            authIndicator.textContent = ` ${restaurantId}`;
            monitorDetailsHeader.appendChild(authIndicator);
        }
        
          // Load settings
          loadAppSettings();
          updateHeader();

          // Listen to Firestore orders
          listenToOrders(restaurantId);
      };

    // Function to get the current user from localStorage
    const getCurrentUser = () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };

    // Function to load restaurants
    const loadRestaurants = () => {
        const restaurants = localStorage.getItem('restaurants');
        return restaurants ? JSON.parse(restaurants) : [];
    };

    // Firestore real-time listener for orders
    let unsubscribeOrders = null;
    const listenToOrders = (restaurantId) => {
        if (unsubscribeOrders) unsubscribeOrders();
        let ordersRef = collection(db, 'orders');
        if (restaurantId) {
            ordersRef = query(ordersRef, where('restaurantId', '==', restaurantId));
        }
        unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
            orderHistory = snapshot.docs.map(doc => doc.data());
            renderDetailMonitorView();
        });
    };

    // Function to load settings from localStorage
    const loadAppSettings = () => {
        if (!currentRestaurantId) return {};
        
        const settingsKey = `restaurant_${currentRestaurantId}_appSettings`;
        const settings = localStorage.getItem(settingsKey);
        return settings ? JSON.parse(settings) : {};
    };

    // Function to update restaurant name and logo on the monitor
    const updateHeader = () => {
        const settings = loadAppSettings();
        const restaurantName = settings.restaurantName || 'Monitor de Detalles de Pedidos';
        const restaurantLogoDataUrl = settings.restaurantLogoUrl;

        restaurantNameElement.textContent = restaurantName;

        if (restaurantLogoDataUrl) {
            restaurantLogoElement.src = restaurantLogoDataUrl;
            restaurantLogoElement.classList.remove('hidden');
        } else {
            restaurantLogoElement.src = '';
            restaurantLogoElement.classList.add('hidden');
        }
    };

    // Function to update order status in Firestore
    const updateOrderStatus = async (orderId, newStatus) => {
        if (!currentRestaurantId) return;

        const existing = orderHistory.find(o => o.id === parseInt(orderId, 10));
        const oldStatus = existing ? existing.status : null;

        const snapshot = await getDocs(collection(db, 'orders'));
        let targetDoc = null;
        snapshot.forEach(docSnap => {
            if (docSnap.data().id === parseInt(orderId, 10)) {
                targetDoc = docSnap;
            }
        });

        if (targetDoc) {
            await updateDoc(doc(db, 'orders', targetDoc.id), { status: newStatus });

            if (oldStatus !== 'Listo' && newStatus === 'Listo') {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const gainNode = audioContext.createGain();
                    gainNode.connect(audioContext.destination);
                    const savedVolume = parseFloat(localStorage.getItem(`restaurant_${currentRestaurantId}_appVolume`) || '1');
                    gainNode.gain.value = savedVolume;

                    const response = await fetch('/ready_sound.mp3');
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(gainNode);
                    source.start(0);
                } catch (e) {
                    console.warn('AudioContext not available or active, cannot play sound:', e);
                }
            }
        }
    };

    // Function to render the detailed monitor view
    const renderDetailMonitorView = () => {
        detailMonitorListDiv.innerHTML = '';

        const history = orderHistory;
        
        if (history.length === 0) {
            detailMonitorListDiv.innerHTML = '<p style="color: #6A1B9A; font-weight: bold;">No hay pedidos registrados en el sistema.</p>';
            return;
        }

        // Show only orders that are NOT Recibido (delivered)
        const activeOrders = history.filter(order => order.status !== 'Recibido');
        
        if (activeOrders.length === 0) {
            detailMonitorListDiv.innerHTML = '<p style="color: #6A1B9A; font-weight: bold;">No hay pedidos activos para mostrar.</p>';
            return;
        }

        // Sort by timestamp (newest first) for active orders
        activeOrders.sort((a, b) => b.timestamp - a.timestamp);

        activeOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('detail-order-card');

            const date = new Date(order.timestamp);
            const timeString = date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                day: '2-digit',
                month: '2-digit'
            });

            const itemsListHtml = order.items.map(item => {
                const itemName = typeof item === 'object' ? item.name : item;
                const quantity = typeof item === 'object' && item.quantity !== undefined ? item.quantity : 1;
                return `<li>${itemName} (x${quantity})</li>`;
            }).join('');

            const statusSelect = document.createElement('select');
            statusSelect.dataset.orderId = order.id;
            statusSelect.classList.add('order-status-select');

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

            orderCard.innerHTML = `
                <div class="order-card-header">
                    <h3>Pedido #${order.id}</h3>
                    <span class="order-status-tag status-${order.status}">${order.status}</span>
                </div>
                <div class="order-card-content">
                    <p><strong>Cliente:</strong> ${order.name}</p>
                    <p><strong>Tipo:</strong> ${order.orderType || 'No especificado'}</p>
                    <p><strong>Fecha/Hora:</strong> ${timeString}</p>
                    <p><strong>Items:</strong></p>
                    <ul>
                        ${itemsListHtml}
                    </ul>
                    ${order.notes ? `<p class="order-notes-display"><strong>Notas:</strong> ${order.notes}</p>` : ''}
                </div>
                <div class="order-card-actions">
                    <label for="status-select-${order.id}">Cambiar Estado:</label>
                </div>
            `;
            orderCard.querySelector('.order-card-actions').appendChild(statusSelect);
            detailMonitorListDiv.appendChild(orderCard);
        });
    };


    // Clear authentication on page load/refresh
    clearAuthentication();

    // Always show security modal on load
    showSecurityModal();
});