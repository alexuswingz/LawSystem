import { initializeDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("Database init error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("Database init error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
