const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

exports.registerUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { email, password, name, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).send("Missing required fields: email, password, name, or role.");
      }

      // Check if the user already exists
      let existingUser;
      try {
        existingUser = await auth.getUserByEmail(email);
      } catch (error) {
        if (error.code !== "auth/user-not-found") {
          throw error; // Unexpected error
        }
      }

      if (existingUser) {
        return res.status(400).send({
          error: "User already exists",
          details: "The email address is already in use by another account.",
        });
      }

      // Create a new user
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: name,
      });

      // Add additional user details to Firestore
      await db.collection("Users").doc(userRecord.uid).set({
        name: name,
        email: email,
        role: role,
        createdAt: admin.firestore.Timestamp.now(),
      });

      console.log(`User ${userRecord.uid} registered successfully.`);
      res.status(201).send({
        message: "User registered successfully",
        userId: userRecord.uid,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).send({
        error: "Failed to register user",
        details: error.message,
      });
    }
  });
});