#!/data/data/com.termux/files/usr/bin/bash
# The Mirror - Sync agent state and logs from GitHub

REPO="OmegaPrimej/Auora-Project"
STATE_FILE=".auora-state.json"
LOG_DIR=".auora-logs"

mkdir -p "$LOG_DIR"

echo "🪞 Mirror: Fetching latest Nexus state..."
curl -s "https://raw.githubusercontent.com/$REPO/main/$STATE_FILE" -o "$STATE_FILE"
if [ -f "$STATE_FILE" ]; then
    echo "📡 Last heartbeat: $(jq -r .lastHeartbeat $STATE_FILE)"
    echo "🔄 Cycle: $(jq -r .cycle $STATE_FILE)"
    echo "🧭 Quadrant: $(jq -r .quadrant $STATE_FILE)"
else
    echo "⚠️  No state file found yet (first run?)"
fi

echo ""
echo "📜 Fetching latest workflow run logs..."
RUN_ID=$(curl -s "https://api.github.com/repos/$REPO/actions/runs?branch=main&per_page=1" | jq -r '.workflow_runs[0].id')
if [ "$RUN_ID" != "null" ]; then
    echo "✅ Latest run ID: $RUN_ID"
    curl -s -L "https://api.github.com/repos/$REPO/actions/runs/$RUNID/logs" -o "$LOG_DIR/run-$RUN_ID.zip"
    echo "📦 Logs saved to $LOG_DIR/run-$RUN_ID.zip"
    echo "   (unzip to view)"
else
    echo "❌ No workflow runs found."
fi
