document.addEventListener('DOMContentLoaded', async () => {
    const detailMonitorListDiv = document.getElementById('detail-monitor-list');
    const restaurantNameElement = document.getElementById('restaurant-name-details');
    const restaurantLogoElement = document.getElementById('restaurant-logo-details');
    const monitorDetailsHeader = document.querySelector('.monitor-details-header');

    const currentRestaurantId = new URLSearchParams(window.location.search).get('rest');
    let orderHistory = [];

    const { db, auth, onAuthStateChanged } = await import('./firebase-init.js');
    const { collection, onSnapshot, query, where, getDocs, doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js');
    const initializeApp = async (restaurantId) => {
        try {
            const docSnap = await getDoc(doc(db, 'restaurants', restaurantId));
            if (docSnap.exists()) {
                const restaurant = docSnap.data();
                restaurantNameElement.textContent = restaurant.name;

                // Display restaurant ID indicator
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

            // Load settings and update header
            await updateHeader();

            // Listen to Firestore orders
            listenToOrders(restaurantId);
        } catch (e) {
            console.error('Error initializing app:', e);
        }
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
            snapshot.docChanges().forEach(change => {
                const data = change.doc.data();
                if (change.type === 'added') {
                    orderHistory.push(data);
                } else if (change.type === 'modified') {
                    const index = orderHistory.findIndex(o => o.id === data.id);
                    if (index !== -1) {
                        orderHistory[index] = data;
                    }
                } else if (change.type === 'removed') {
                    orderHistory = orderHistory.filter(o => o.id !== data.id);
                }
            });
            renderDetailMonitorView();
        });
    };

    // Function to load settings from Firestore
    const loadAppSettings = async () => {
        if (!currentRestaurantId) return {};
        try {
            const restaurantRef = doc(db, 'restaurants', currentRestaurantId);
            const docSnap = await getDoc(restaurantRef);
            return docSnap.exists() ? (docSnap.data().settings || {}) : {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    };

    const getRestaurantVolume = async () => {
        if (!currentRestaurantId) return 1;
        try {
            const restaurantRef = doc(db, 'restaurants', currentRestaurantId);
            const docSnap = await getDoc(restaurantRef);
            const settings = docSnap.exists() ? (docSnap.data().settings || {}) : {};
            return settings.appVolume !== undefined ? parseFloat(settings.appVolume) : 1;
        } catch (error) {
            console.error('Error fetching volume:', error);
            return 1;
        }
    };

    // Function to update restaurant name and logo on the monitor
    const updateHeader = async () => {
        const settings = await loadAppSettings();
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

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('id', '==', parseInt(orderId, 10)), where('restaurantId', '==', currentRestaurantId));
        const snapshot = await getDocs(q);
        const targetDoc = snapshot.docs[0];

        if (targetDoc) {
            await updateDoc(doc(db, 'orders', targetDoc.id), { status: newStatus });

            if (oldStatus !== 'Listo' && newStatus === 'Listo') {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const gainNode = audioContext.createGain();
                    gainNode.connect(audioContext.destination);
                    const savedVolume = await getRestaurantVolume();
                    gainNode.gain.value = savedVolume;

                    const response = await fetch('/new_sound.mp3');
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


    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        if (currentRestaurantId) {
            initializeApp(currentRestaurantId);
        } else {
            detailMonitorListDiv.innerHTML = '<p style="color: #6A1B9A; font-weight: bold;">No se proporcionó el ID del restaurante en la URL.</p>';
        }
    });
});