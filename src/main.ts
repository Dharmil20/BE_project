/**
 * Dashboard: canvas + stats cards + WebSocket reconnect.
 */

const WS_URL = `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`;
const apiBase = "/api";

let ws: WebSocket | null = null;
let frameCount = 0;
let lastFps = 0;

function $(sel: string): HTMLElement {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing: ${sel}`);
  return el as HTMLElement;
}

function render() {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = `
    <div class="dashboard">
      <header><h1>RDK Camera Dashboard</h1></header>
      <div class="stats">
        <div class="card"><span class="label">Frames</span><span id="stat-frames">0</span></div>
        <div class="card"><span class="label">FPS</span><span id="stat-fps">0</span></div>
        <div class="card"><span class="label">Status</span><span id="stat-status">Connecting…</span></div>
      </div>
      <div class="canvas-wrap">
        <canvas id="canvas" width="640" height="480"></canvas>
      </div>
      <button id="refresh">Refresh connection</button>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .dashboard { font-family: system-ui, sans-serif; padding: 1rem; max-width: 900px; margin: 0 auto; }
    .stats { display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap; }
    .card { background: #1a1a2e; color: #eee; padding: 1rem 1.5rem; border-radius: 8px; min-width: 120px; }
    .card .label { display: block; font-size: 0.85rem; color: #888; }
    .canvas-wrap { margin: 1rem 0; border-radius: 8px; overflow: hidden; background: #111; }
    #canvas { display: block; width: 100%; height: auto; }
    #refresh { margin-top: 0.5rem; padding: 0.5rem 1rem; cursor: pointer; }
  `;
  document.head.appendChild(style);

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const canvasCtx: CanvasRenderingContext2D = ctx;

  function drawPlaceholder(
    c: CanvasRenderingContext2D,
    text: string
  ) {
    c.fillStyle = "#1a1a2e";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "#888";
    c.font = "16px system-ui";
    c.textAlign = "center";
    c.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  function updateStats() {
    const framesEl = document.getElementById("stat-frames");
    const fpsEl = document.getElementById("stat-fps");
    const statusEl = document.getElementById("stat-status");
    if (framesEl) framesEl.textContent = String(frameCount);
    if (fpsEl) fpsEl.textContent = String(lastFps);
    if (statusEl) statusEl.textContent = ws?.readyState === WebSocket.OPEN ? "Connected" : "Disconnected";
  }

  function connect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    const statusEl = document.getElementById("stat-status");
    if (statusEl) statusEl.textContent = "Connecting…";
    ws = new WebSocket(WS_URL);
    ws.onopen = () => updateStats();
    ws.onclose = () => updateStats();
    ws.onerror = () => updateStats();
    ws.onmessage = (ev) => {
      try {
        const raw = atob(ev.data as string);
        const j = JSON.parse(raw) as { t?: number; fps?: number; mock?: boolean };
        frameCount++;
        if (typeof j.fps === "number") lastFps = j.fps;
        drawPlaceholder(canvasCtx, `Frame #${frameCount} (mock) @ ${lastFps} FPS`);
      } catch {
        frameCount++;
        drawPlaceholder(canvasCtx, `Frame #${frameCount}`);
      }
      updateStats();
    };
  }

  drawPlaceholder(canvasCtx, "Waiting for stream…");
  connect();
  $("#refresh").addEventListener("click", () => connect());
}

render();
