import { NextResponse } from "next/server";

/** Manual create/update disabled — posts are published via secured cron only. */
export async function POST() {
  return NextResponse.json(
    { error: "Manual post creation is disabled. Posts are published automatically." },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Manual post updates are disabled. Posts are published automatically." },
    { status: 403 }
  );
}
