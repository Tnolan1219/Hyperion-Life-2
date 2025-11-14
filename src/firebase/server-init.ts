import * as admin from 'firebase-admin';

let firebaseAdmin: admin.app.App;

export async function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    
    const credentials = JSON.parse(serviceAccount);
    
    if (admin.apps.length === 0) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } else {
      firebaseAdmin = admin.app();
    }
  }
  return firebaseAdmin;
}
