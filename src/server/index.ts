/**
 * RDK Camera Dashboard server: API + WebSocket for live frames.
 * Set USE_MOCK_CAMERA=false and RTSP_URL for real RTSP (requires FFmpeg).
 */

import { createMockFrame, getMockFrameInterval } from "../camera/mockCamera";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
let wsClientCount = 0;
let frameIntervalId: ReturnType<typeof setInterval> | null = null;

function broadcastFrames(server: import("bun").Server<{ id: number }>) {
  if (frameIntervalId) return;
  const interval = getMockFrameInterval();
  frameIntervalId = setInterval(() => {
    const frame = createMockFrame();
    server.publish("frames", frame);
  }, interval);
}

function stopBroadcast() {
  if (frameIntervalId) {
    clearInterval(frameIntervalId);
    frameIntervalId = null;
  }
}

const server = Bun.serve<{ id: number }>({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, clients: wsClientCount });
    }
    if (url.pathname === "/ws" || url.pathname === "/ws/") {
      const upgraded = server.upgrade(req, { data: { id: Date.now() } });
      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      wsClientCount++;
      ws.subscribe("frames");
      broadcastFrames(server);
    },
    close() {
      wsClientCount = Math.max(0, wsClientCount - 1);
      if (wsClientCount === 0) stopBroadcast();
    },
    message() {},
  },
});

console.log(`Server listening on http://localhost:${PORT}`);
console.log(`WebSocket: ws://localhost:${PORT}/ws`);
console.log(`Health: http://localhost:${PORT}/api/health");
