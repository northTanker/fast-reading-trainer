import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const adminAuth = getAdminAuth();
    return NextResponse.json({ message: "Firebase Admin initialized successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
