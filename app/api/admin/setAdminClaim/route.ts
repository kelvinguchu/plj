import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, isAdmin } = await req.json();

    // Set admin claim
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting admin claim:", error);
    return NextResponse.json(
      { error: "Failed to set admin claim" },
      { status: 500 }
    );
  }
}
