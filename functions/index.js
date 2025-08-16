const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.createRestaurantAdmin = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { email, password, username, restaurantId, restaurantName, startDate, endDate } = req.body || {};

    if (!email || !password || !username || !restaurantId || !restaurantName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Create user in Firebase Authentication
      const userRecord = await admin.auth().createUser({ email, password });

      // Create user document in Firestore
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        username,
        role: 'restaurant',
        restaurantId,
      });

      // Prepare restaurant document
      const restaurantData = {
        id: restaurantId,
        name: restaurantName,
        uid: userRecord.uid,
        active: true,
        menuItems: [],
        settings: {
          restaurantName,
          restaurantLogoUrl: '',
          currencySymbol: '$',
          volume: 1
        }
      };

      if (startDate) {
        restaurantData.startDate = new Date(startDate);
      }
      if (endDate) {
        restaurantData.endDate = new Date(endDate);
      }

      // Create or update restaurant document
      await admin.firestore().collection('restaurants').doc(restaurantId).set(restaurantData, { merge: true });

      return res.json({ uid: userRecord.uid });
    } catch (error) {
      console.error('Error creating restaurant admin:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});
