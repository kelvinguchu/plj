import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const email = "kulmidigital@gmail.com";
    const user = await admin.auth().getUserByEmail(email);

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        customClaims: user.customClaims,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
