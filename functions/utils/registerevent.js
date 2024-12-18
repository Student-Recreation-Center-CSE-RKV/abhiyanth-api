const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
exports.registerEvent = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          return res.status(405).send('Method Not Allowed');
        }
  
        const { name, email, phone, eventId ,userId} = req.body;
  
        if (!name || !email || !phone || !eventId) {
          return res.status(400).send('Missing required fields');
        }
  
        const newRegistrationRef = db.collection('Event-Registrations').doc();
        
        await newRegistrationRef.set({
          userId,
          name,
          email,
          phone,
          registeredEvent: eventId
        });
  
        
  
        console.log('Registered successfully');
        res.status(200).send('Registered successfully');
      } catch (error) {
        console.error('Error registering event:', error);
        res.status(500).send('Error registering for event');
      }
    });
  });