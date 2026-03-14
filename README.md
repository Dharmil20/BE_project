# RDK Camera Dashboard

Backend + dashboard for live camera streams (mock or RTSP). Built with Bun, Vite, and optional FFmpeg for real streams.

## Prerequisites

- **Bun** – [install](https://bun.sh)
- **FFmpeg** – required only when using a real RTSP camera (`USE_MOCK_CAMERA=false`)
- **Node types** – installed via `@types/node` in the project

## Setup

```bash
git clone <repo-url>
cd BE_Project
bun install
cp .env.example .env
bun run dev
```

- **Dashboard:** http://localhost:5173  
- **API / WebSocket:** http://localhost:3001  

## Switching to real camera

1. Set in `.env` (or environment):
   - `USE_MOCK_CAMERA=false`
   - `RTSP_URL=rtsp://<host>:<port>/<path>`
2. Ensure FFmpeg is installed; the server will verify at startup and fail with instructions if missing.
3. Restart: `bun run dev` (or on RDK use `scripts/start-rdk.sh`).

## Finding RTSP URL on RDK board

- **v4l2-rtsp-server:** If you run `v4l2-rtsp-server` on the board, the stream is often:
  - `rtsp://<board-ip>:554/stream` (or the path shown in the server’s output).
- **Horizon SDK / default ports:** Check your SDK docs for the default RTSP port and path (commonly 554 or 8554).

## Environment variables

| Variable            | Default                  | Description                                      |
|--------------------|--------------------------|--------------------------------------------------|
| `USE_MOCK_CAMERA`  | `true`                   | `true` = mock frames; `false` = RTSP via FFmpeg  |
| `RTSP_URL`         | `rtsp://127.0.0.1:554/stream` | RTSP stream URL (when not using mock)      |
| `CAMERA_FPS`       | `15`                     | Capture/encode FPS                               |
| `PORT`             | `3001`                   | Server port (API + WebSocket)                    |
| `RDK_USER`         | —                        | SSH user for deploy (e.g. `root`)                |
| `RDK_HOST`         | —                        | RDK board host or IP for `scripts/deploy.sh`     |

## Scripts

- `bun run dev` – start server + Vite dev server
- `bun run build` – build frontend
- `bun run type-check` – run TypeScript check
- `bun run server` – run API/WebSocket server only

## Deployment (RDK)

See `scripts/start-rdk.sh` and `scripts/deploy.sh`. Use `make deploy` (set `RDK_USER` and `RDK_HOST` in `.env` or environment). On Unix, make scripts executable: `chmod +x scripts/*.sh`.
