/**
 * Mock camera: generates placeholder frames (timestamp + FPS) for development.
 * When USE_MOCK_CAMERA=false, the server uses RTSP via FFmpeg instead.
 */

const DEFAULT_FPS = 15;

export function getMockFrameInterval(): number {
  const fps = parseInt(process.env.CAMERA_FPS ?? String(DEFAULT_FPS), 10) || DEFAULT_FPS;
  return 1000 / fps;
}

/** Returns a minimal "frame" payload for WebSocket (e.g. base64 placeholder or metadata). */
export function createMockFrame(): string {
  const payload = JSON.stringify({
    t: Date.now(),
    fps: parseInt(process.env.CAMERA_FPS ?? String(DEFAULT_FPS), 10) || DEFAULT_FPS,
    mock: true,
  });
  return Buffer.from(payload).toString("base64");
}
