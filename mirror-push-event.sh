#!/data/data/com.termux/files/usr/bin/bash
# Push a local event back to the agent (creates a commit with a marker)

MESSAGE="${1:-Local event triggered}"
TIMESTAMP=$(date -Iseconds)

echo "🪞 Mirror: Pushing local event to GitHub..."
echo "$TIMESTAMP - $MESSAGE" > .local-event.log
git add .local-event.log
git commit -m "Mirror event: $MESSAGE"
git push origin main
echo "✅ Event pushed. Workflow will pick it up."
