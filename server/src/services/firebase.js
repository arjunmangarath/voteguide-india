const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  let serviceAccount;
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    serviceAccount = JSON.parse(jsonEnv);
  } else {
    const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
    const saPath = path.isAbsolute(saEnv) ? saEnv : path.resolve(process.cwd(), saEnv);
    serviceAccount = require(saPath);
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
