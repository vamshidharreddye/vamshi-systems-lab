import { NextResponse } from "next/server";

import { getSignalFeed } from "@/lib/signals";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const feed = await getSignalFeed();
    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "no-store",
        "X-Signals-Cache": feed.cachedSources.length > 0 ? "memory" : "miss"
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Signal sources are temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
