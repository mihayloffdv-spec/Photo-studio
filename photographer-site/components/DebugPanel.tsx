"use client";

import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const level = filter !== "all" ? `?level=${filter}` : "";
      const res = await fetch(`/api/logs${level}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, filter, fetchLogs]);

  useEffect(() => {
    if (autoRefresh && isOpen) {
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isOpen, fetchLogs]);

  const copyForClaude = async () => {
    try {
      const res = await fetch("/api/logs?format=claude");
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Clear all logs?")) return;
    await fetch("/api/logs", { method: "DELETE" });
    fetchLogs();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "warn":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "debug":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Panel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        {logs.filter((l) => l.level === "error").length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {logs.filter((l) => l.level === "error").length}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Debug Panel</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-50 border-b p-3 flex flex-wrap gap-2 items-center">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors Only</option>
                <option value="warn">Warnings+</option>
                <option value="info">Info+</option>
                <option value="debug">Debug+</option>
              </select>

              <button
                onClick={fetchLogs}
                disabled={loading}
                className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>

              <div className="flex-1" />

              <button
                onClick={copyForClaude}
                className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                {copied ? "Copied!" : "📋 Copy for Claude"}
              </button>

              <button
                onClick={clearLogs}
                className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
              >
                Clear
              </button>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No logs yet. Actions will appear here.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase font-semibold">
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 font-medium">{log.message}</p>
                    {log.context && (
                      <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    )}
                    {log.stack && (
                      <pre className="mt-2 text-xs bg-red-50 text-red-800 p-2 rounded overflow-auto max-h-40">
                        {log.stack}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t p-3 text-xs text-gray-500 text-center">
              {logs.length} log entries • Click "Copy for Claude" to share logs for debugging
            </div>
          </div>
        </div>
      )}
    </>
  );
}
