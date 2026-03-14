#!/bin/bash
# Usage: ./scripts/deploy.sh
bun run build
ssh $RDK_USER@$RDK_HOST "mkdir -p ~/rdk-dashboard"
scp -r dist/ src/server/ src/camera/ package.json .env $RDK_USER@$RDK_HOST:~/rdk-dashboard/
ssh $RDK_USER@$RDK_HOST "cd ~/rdk-dashboard && bun install --production"
echo "Deployed. Run: ssh $RDK_USER@$RDK_HOST 'cd ~/rdk-dashboard && bash scripts/start-rdk.sh'"
