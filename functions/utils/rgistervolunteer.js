const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.submitVolunteer = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { name, email, phone, eventId } = req.body;

      if (!name || !email || !phone || !eventId) {
        return res.status(400).send('Missing required fields');
      }

      const newVolunteerRef = db.collection('Volunteers').doc();
      
      // Add the new volunteer to the Volunteers collection
      await newVolunteerRef.set({
        name,
        email,
        phone,
        assignedEvent: eventId
      });

      // Add the volunteer ID to the Event's assignedVolunteers array
      await db.collection('Event').doc(eventId).update({
        assignedVolunteers: admin.firestore.FieldValue.arrayUnion(newVolunteerRef.id)
      });

      console.log('Volunteer registered successfully');
      res.status(200).send('Volunteer registered successfully');
    } catch (error) {
      console.error('Error registering volunteer:', error);
      res.status(500).send('Error registering volunteer');
    }
  });
});