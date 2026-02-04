import { NextRequest, NextResponse } from "next/server";
import { logger, LogLevel } from "@/lib/logger";
import { cookies } from "next/headers";

// Only allow in development or for authenticated admins
async function isAuthorized(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  return authCookie?.value === "authenticated";
}

// GET /api/logs - Get recent logs
export async function GET(request: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") as LogLevel | null;
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const format = searchParams.get("format"); // "claude" for formatted output

  const logs = logger.getRecentLogs(level || undefined, limit);

  if (format === "claude") {
    const formatted = logger.formatForClaude(logs);
    return new NextResponse(formatted, {
      headers: { "Content-Type": "text/markdown" },
    });
  }

  return NextResponse.json({
    logs,
    count: logs.length,
    timestamp: new Date().toISOString(),
  });
}

// DELETE /api/logs - Clear logs
export async function DELETE() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.clear();
  logger.info("Logs cleared by admin");

  return NextResponse.json({ success: true });
}

// POST /api/logs - Log from client-side
export async function POST(request: NextRequest) {
  try {
    const { level, message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const validLevels: LogLevel[] = ["debug", "info", "warn", "error"];
    const logLevel: LogLevel = validLevels.includes(level) ? level : "info";

    // Add client-side marker
    const clientContext = {
      ...context,
      source: "client",
      userAgent: request.headers.get("user-agent"),
    };

    switch (logLevel) {
      case "debug":
        logger.debug(message, clientContext);
        break;
      case "info":
        logger.info(message, clientContext);
        break;
      case "warn":
        logger.warn(message, clientContext);
        break;
      case "error":
        logger.error(message, undefined, clientContext);
        break;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
