import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    // Check if all required environment variables are present
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("FIREBASE_PROJECT_ID is not set");
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("FIREBASE_CLIENT_EMAIL is not set");
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("FIREBASE_PRIVATE_KEY is not set");
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      } as admin.ServiceAccount),
    });

    console.log("Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("Firebase admin initialization error:", {
      message: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw the error to prevent silent failures
  }
}

export { admin };
