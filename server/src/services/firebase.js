const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
  const saPath = path.isAbsolute(saEnv) ? saEnv : path.resolve(process.cwd(), saEnv);
  const serviceAccount = require(saPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
