// Nexus-Symbiosis.cjs - State manager for Auora
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../.auora-state.json');

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { cycle: 0, lastHeartbeat: null, quadrant: 'Aether-Grid' };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function heartbeat() {
  const state = loadState();
  state.cycle++;
  state.lastHeartbeat = new Date().toISOString();
  saveState(state);
  console.log(`[Nexus] Heartbeat #${state.cycle} – ${state.lastHeartbeat}`);
  return state;
}

function promoteQuadrant(next) {
  const state = loadState();
  state.quadrant = next;
  saveState(state);
  console.log(`[Nexus] Quadrant advanced to: ${next}`);
}

// If run directly
if (require.main === module) {
  const action = process.argv[2];
  if (action === 'heartbeat') heartbeat();
  else if (action === 'status') console.log(loadState());
  else console.log('Usage: node Nexus-Symbiosis.cjs [heartbeat|status]');
}

module.exports = { loadState, saveState, heartbeat, promoteQuadrant };
