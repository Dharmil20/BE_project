#!/bin/bash
export USE_MOCK_CAMERA=false
export RTSP_URL=rtsp://127.0.0.1:554/stream
export CAMERA_FPS=15
export PORT=3001
echo "Starting RDK Camera Server..."
bun src/server/index.ts
