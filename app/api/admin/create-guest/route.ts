import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";

// Helper function to ensure we always return JSON
const errorResponse = (message: string, status: number = 500) => {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export async function POST(request: Request) {
  try {
    // Check environment variables first
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      return errorResponse(
        "Server configuration error: Missing environment variables"
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse("Invalid request body", 400);
    }

    const { name, email, password, imageUrl } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse("Missing required fields", 400);
    }

    // Initialize Firebase Admin if needed
    if (!admin.apps.length) {
      try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        );
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          } as admin.ServiceAccount),
        });
      } catch (initError: any) {
        return errorResponse(
          `Server configuration error: ${initError.message}`
        );
      }
    }

    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        photoURL: imageUrl || undefined,
      });
      console.log("Created auth user with uid:", userRecord.uid);
    } catch (authError: any) {
      return errorResponse(authError.message || "Failed to create user");
    }

    // Create document in Firestore
    try {
      const db = getFirestore();
      const guestData = {
        uid: userRecord.uid,
        name,
        email,
        createdAt: new Date().toISOString(),
        ...(imageUrl && { profilePicture: imageUrl }),
      };
      console.log("Creating guest document with data:", guestData);

      const docRef = await db.collection("podcastGuests").add(guestData);
      console.log("Created guest document with id:", docRef.id);

      return new NextResponse(
        JSON.stringify({
          success: true,
          uid: userRecord.uid,
          docId: docRef.id,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (firestoreError: any) {
      console.error("Error creating guest document:", firestoreError);
      // Clean up auth user if Firestore fails
      try {
        await admin.auth().deleteUser(userRecord.uid);
      } catch (deleteError) {
        // Silently handle cleanup error
      }

      return errorResponse("Failed to create user profile");
    }
  } catch (error: any) {
    return errorResponse("An unexpected error occurred");
  }
}
