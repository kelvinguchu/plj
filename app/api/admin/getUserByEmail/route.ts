import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await admin.auth().getUserByEmail(email);

    return NextResponse.json({ uid: user.uid });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
