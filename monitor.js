document.addEventListener('DOMContentLoaded', async () => {
    const monitorListDiv = document.getElementById('monitor-list');
    const restaurantNameElement = document.getElementById('restaurant-name');
    const restaurantLogoElement = document.getElementById('restaurant-logo');
    const monitorTipElement = document.querySelector('.monitor-tip'); // Get the tip element

    // New: Ticket functionality
    const ticketNumberInput = document.getElementById('ticket-number-input');
    const addTicketBtn = document.getElementById('add-ticket-btn');
    let trackedTickets = new Set();

    let currentUser = null; // Variable to store current user
    let orderHistory = []; // Orders fetched from Firestore

    const { db, auth, onAuthStateChanged } = await import('./firebase-init.js');
    const { collection, onSnapshot, query, where, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js');

    // Listen for order updates in Firestore
    let unsubscribeOrders = null;
    const listenToOrders = (user) => {
        if (!user) return;
        if (unsubscribeOrders) unsubscribeOrders();
        let ordersRef = collection(db, 'orders');
        if (user.role === 'restaurant') {
            ordersRef = query(ordersRef, where('restaurantId', '==', user.id));
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
            renderMonitorView();
        });
    };

    // Function to load settings (restaurant name and logo) from Firestore
    const loadSettings = async () => {
        if (!currentUser) {
            console.error("Cannot load settings: No user logged in.");
            return {};
        }
        try {
            const docRef = currentUser.role === 'restaurant'
                ? doc(db, 'restaurants', currentUser.id)
                : doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? (docSnap.data().settings || {}) : {};
        } catch (e) {
            console.error('Error loading settings:', e);
            return {};
        }
    };

    // Function to update restaurant name and logo on the monitor
    const updateHeader = async () => {
        const settings = await loadSettings();
        const restaurantName = settings.restaurantName || 'Monitor de Pedidos';
        const restaurantLogoDataUrl = settings.restaurantLogoUrl; // Now expects a Data URL

        restaurantNameElement.textContent = restaurantName;

        if (restaurantLogoDataUrl) {
            restaurantLogoElement.src = restaurantLogoDataUrl;
            restaurantLogoElement.classList.remove('hidden');
        } else {
            restaurantLogoElement.src = ''; // Clear src
            restaurantLogoElement.classList.add('hidden');
        }
    };

    // New: Enhanced vibration with pattern
    const vibrateDevice = () => {
        if ('vibrate' in navigator) {
            // Create a festive vibration pattern
            const pattern = [
                100, 50, 100, 50, 100, 50, 100, 50, 100, 200,
                200, 100, 200, 100, 200, 100, 200, 100, 200
            ];
            navigator.vibrate(pattern);
        }
    };

    // New: Play festive notification sound
    const playNotificationSound = () => {
        const audio = new Audio('/ready_sound.mpeg');
        audio.volume = 1.0;
        audio.play().catch(e => {
            console.log('Error playing notification sound:', e);
        });
    };

    // New: Create fireworks animation
    const createFireworks = (element) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
        const particles = 50;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            `;
            
            element.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 50 + Math.random() * 100;
            const lifetime = 1000 + Math.random() * 1000;
            
            particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% + ${Math.sin(angle) * velocity}px)) scale(1)`,
                    opacity: 0
                }
            ], {
                duration: lifetime,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    };

    // New: Enhanced ticket notification with fireworks
    const showTicketNotification = (orderNumber) => {
        // Create overlay for fireworks
        const fireworksOverlay = document.createElement('div');
        fireworksOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,69,0,0.1) 100%);
        `;
        document.body.appendChild(fireworksOverlay);

        // Show notification
        const notification = document.createElement('div');
        notification.className = 'ticket-notification';
        notification.innerHTML = `
            <i class="fas fa-bell"></i>
            ¡Tu pedido #${orderNumber} está listo!
        `;
        document.body.appendChild(notification);

        // Create fireworks burst
        setTimeout(() => {
            const orderElement = document.querySelector(`[data-order-id="${orderNumber}"]`);
            if (orderElement) {
                createFireworks(orderElement);
                createFireworks(fireworksOverlay);
            }
        }, 100);

        // Cleanup
        setTimeout(() => {
            fireworksOverlay.remove();
            notification.remove();
        }, 5000);
    };

    // New: Display tracked tickets at the top
    const trackedTicketsDisplay = document.getElementById('tracked-tickets-display');
    const trackedTicketsList = document.getElementById('tracked-tickets-list');

    // Modified: Add ticket function to update display
    const addTicket = () => {
        const ticketNumber = parseInt(ticketNumberInput.value);
        if (!ticketNumber || isNaN(ticketNumber)) {
            alert('Por favor ingresa un número de ficha válido');
            return;
        }

        trackedTickets.add(ticketNumber);
        ticketNumberInput.value = '';
        alert(`Ficha #${ticketNumber} agregada para notificaciones`);
        
        // Add visual indicator to the order
        const orderElement = document.querySelector(`[data-order-id="${ticketNumber}"]`);
        if (orderElement) {
            orderElement.classList.add('ticket-active');
        }
        
        // Update the tracked tickets display
        updateTrackedTicketsDisplay();
    };

    // New: Function to display tracked tickets at the top
    const updateTrackedTicketsDisplay = () => {
        if (trackedTickets.size === 0) {
            trackedTicketsDisplay.classList.add('hidden');
            return;
        }

        trackedTicketsDisplay.classList.remove('hidden');
        trackedTicketsList.innerHTML = '';

        const history = orderHistory;
        
        Array.from(trackedTickets).forEach(ticketNumber => {
            const order = history.find(o => o.id === ticketNumber);
            const ticketDiv = document.createElement('div');
            ticketDiv.classList.add('tracked-ticket');
            
            if (order && order.status === 'Listo') {
                ticketDiv.classList.add('ready');
            }
            
            ticketDiv.textContent = `#${ticketNumber}`;
            trackedTicketsList.appendChild(ticketDiv);
        });
    };

    // Modified: Enhanced render function to include tracked tickets display
    const renderMonitorView = () => {
        // Ensure currentUser is set before rendering specific data
        if (!currentUser) {
            monitorListDiv.innerHTML = '<p style="color: #6A1B9A; font-weight: bold;">No se ha iniciado sesión.</p>';
            monitorTipElement.classList.add('hidden');
            return;
        }

        const history = orderHistory;
        monitorListDiv.innerHTML = ''; // Clear current monitor view

        // Filter orders by status
        const listoOrders = history.filter(order => order.status === 'Listo');
        const preparandoOrders = history.filter(order => order.status === 'Preparando');
        // Recibido orders are not displayed on the monitor view

        // Sort Listo orders by timestamp (oldest first), as these are waiting for pickup
        listoOrders.sort((a, b) => a.timestamp - b.timestamp);

        // Sort Preparando orders by timestamp (most recent first)
        preparandoOrders.sort((a, b) => b.timestamp - a.timestamp);

        const ordersToDisplay = [];
        const maxDisplayCount = 6; // Maximum number of orders to display

        // Add 'Listo' orders first, up to the maximum limit
        for (let i = 0; i < listoOrders.length && ordersToDisplay.length < maxDisplayCount; i++) {
            ordersToDisplay.push(listoOrders[i]);
        }

        // If there's still space, add 'Preparando' orders (most recent first)
        if (ordersToDisplay.length < maxDisplayCount) {
            const remainingSlots = maxDisplayCount - ordersToDisplay.length;
            for (let i = 0; i < remainingSlots && i < preparandoOrders.length; i++) {
                 ordersToDisplay.push(preparandoOrders[i]);
            }
        }

        if (ordersToDisplay.length === 0) {
            monitorListDiv.innerHTML = '<p style="color: #6A1B9A; font-weight: bold;">No hay pedidos activos para mostrar.</p>';
            monitorTipElement.classList.add('hidden'); // Hide tip if no orders
            return;
        } else {
            monitorTipElement.classList.remove('hidden'); // Show tip if there are orders
        }

        // Render the combined list.
        ordersToDisplay.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.classList.add('order-number-indicator');
            orderElement.classList.add(`status-${order.status}`);
            orderElement.setAttribute('data-order-id', order.id);

            // Check if this order is being tracked
            if (trackedTickets.has(order.id)) {
                orderElement.classList.add('ticket-active');
            }

            // Format items for display without price
            // ONLY DISPLAY ORDER ID
            orderElement.innerHTML = `
                <div class="order-id">#${order.id}</div>
            `;

            // Add relative positioning for fireworks
            orderElement.style.position = 'relative';
            orderElement.style.overflow = 'visible';

            monitorListDiv.appendChild(orderElement);

            // Check if order just became ready and is tracked
            if (order.status === 'Listo' && trackedTickets.has(order.id)) {
                setTimeout(() => {
                    vibrateDevice();
                    playNotificationSound();
                    showTicketNotification(order.id);
                    trackedTickets.delete(order.id); // Remove after notification
                    
                    // Update the tracked tickets display
                    updateTrackedTicketsDisplay();
                }, 500);
            }
        });

        // Update the tracked tickets display
        updateTrackedTicketsDisplay();
    };

    // Add CSS for fireworks
    const style = document.createElement('style');
    style.textContent = `
        .firework-particle {
            animation: firework 0.5s ease-out forwards;
        }
        
        @keyframes firework {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(0);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        .ticket-notification {
            background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
            color: #D32F2F;
            padding: 20px 30px;
            border-radius: 50px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            font-size: 1.4em;
            font-weight: bold;
            z-index: 10000;
            animation: bounceIn 0.6s ease;
            border: 3px solid #D32F2F;
            font-family: 'Fredoka One', cursive;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        @keyframes bounceIn {
            0% { transform: translate(-50%, -100px) scale(0.3); opacity: 0; }
            50% { transform: translate(-50%, 0) scale(1.05); }
            100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    // Event listeners
    addTicketBtn.addEventListener('click', addTicket);

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                currentUser = userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null;
            } catch (e) {
                console.error('Error fetching user data:', e);
                currentUser = null;
            }
            await updateHeader();
            listenToOrders(currentUser);
        } else {
            currentUser = null;
            if (unsubscribeOrders) {
                unsubscribeOrders();
                unsubscribeOrders = null;
            }
        }
        renderMonitorView();
    });
});
