const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Creates a Firestore user document whenever a new Firebase Auth user is
 * created. The role is taken from custom claims if present, otherwise from the
 * configurable `defaults.role` parameter (defaults to `user`). This keeps
 * manually created users in Firebase Authentication automatically synchronized
 * with the `users/{uid}` collection.
 */
exports.onAuthUserCreate = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();

  const defaultRole =
    (functions.config().defaults && functions.config().defaults.role) ||
    'user';

  const role = (user.customClaims && user.customClaims.role) || defaultRole;

  const username =
    user.displayName || (user.email ? user.email.split('@')[0] : 'anonymous');

  const docRef = db.collection('users').doc(user.uid);
  const snapshot = await docRef.get();

  const data = {
    username,
    email: user.email || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Set the role only if it doesn't exist to avoid overwriting existing roles.
  if (!snapshot.exists || !snapshot.data().role) {
    data.role = role;
  }

  await docRef.set(data, { merge: true });
});

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
