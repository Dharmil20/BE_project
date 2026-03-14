/**
 * RDK Camera Dashboard server: API + WebSocket for live frames.
 * Set USE_MOCK_CAMERA=false and RTSP_URL for real RTSP (requires FFmpeg).
 */

import { createMockFrame, getMockFrameInterval } from "../camera/mockCamera";
import { checkFFmpeg } from "../camera/verifyFFmpeg";

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

async function main() {
  const useMock = process.env.USE_MOCK_CAMERA !== "false";
  const ff = await checkFFmpeg();
  if (!ff.available) {
    if (!useMock) {
      throw new Error(
        "FFmpeg is required when USE_MOCK_CAMERA=false. Install FFmpeg (e.g. apt install ffmpeg) and ensure it is on PATH."
      );
    }
    console.warn("FFmpeg not found; running with mock camera only.");
  }

  const server = Bun.serve<{ id: number }>({
    port: PORT,
    async fetch(req, server) {
      const url = new URL(req.url);
      if (url.pathname === "/api/health") {
        return Response.json({ ok: true, clients: wsClientCount });
      }
      if (url.pathname === "/api/system") {
        const ffmpeg = await checkFFmpeg();
        return Response.json({
          ffmpeg,
          nodeVersion: process.version,
          uptime: process.uptime(),
        });
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
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`System: http://localhost:${PORT}/api/system`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
