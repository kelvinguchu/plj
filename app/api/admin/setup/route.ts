import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

// POST endpoint to set up admin user
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    return NextResponse.json({
      success: true,
      message: `Admin privileges granted to ${email}`,
    });
  } catch (error: any) {
    console.error("Error setting up admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to set up admin",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to verify admin setup
export async function GET() {
  try {
    const email = "kulmidigital@gmail.com"; // Default admin email
    const user = await admin.auth().getUserByEmail(email);
    const userRecord = await admin.auth().getUser(user.uid);

    return NextResponse.json({
      success: true,
      isAdmin: userRecord.customClaims?.admin === true,
      user: {
        email: user.email,
        uid: user.uid,
        customClaims: userRecord.customClaims,
      },
    });
  } catch (error: any) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check admin status",
      },
      { status: 500 }
    );
  }
}
