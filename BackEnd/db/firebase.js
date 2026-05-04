const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../firebase/serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: serviceAccount.project_id + ".appspot.com",
  });
}

const db = admin.firestore();

module.exports = { admin, db };