// Forge-Anvil.cjs - Self-updating agent
const { execSync } = require('child_process');
const fs = require('fs');

const UPDATE_BRANCH = 'forge/candidate';
const MAIN_BRANCH = 'main';

function checkForUpdates() {
  try {
    execSync(`git fetch origin ${UPDATE_BRANCH}`, { stdio: 'pipe' });
    const diff = execSync(`git diff origin/${MAIN_BRANCH}..origin/${UPDATE_BRANCH} --name-only`, { stdio: 'pipe' }).toString();
    if (diff.trim()) {
      console.log('[Forge] Updates found:', diff.trim());
      return true;
    }
    console.log('[Forge] No pending updates');
    return false;
  } catch(e) {
    console.log('[Forge] No update branch yet');
    return false;
  }
}

function applyUpdate() {
  console.log('[Forge] Applying update...');
  execSync(`git merge origin/${UPDATE_BRANCH} --no-edit`, { stdio: 'inherit' });
  execSync(`git push origin ${MAIN_BRANCH}`, { stdio: 'inherit' });
  console.log('[Forge] Update applied. Restarting agent...');
  process.exit(0);
}

if (require.main === module) {
  if (checkForUpdates()) applyUpdate();
}
