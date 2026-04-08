// Hive-Queen.cjs - Distributed agent coordination
const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, '../../../.hive-queue.json');

function getLock() {
  const now = Date.now();
  let queue = { lockedBy: null, lockExpiry: 0, tasks: [] };
  if (fs.existsSync(QUEUE_FILE)) queue = JSON.parse(fs.readFileSync(QUEUE_FILE));
  if (queue.lockedBy && queue.lockExpiry > now) return false;
  queue.lockedBy = process.env.GITHUB_ACTOR || 'local';
  queue.lockExpiry = now + 120000; // 2 min
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  return true;
}

function releaseLock() {
  let queue = { lockedBy: null, lockExpiry: 0, tasks: [] };
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function addTask(task) {
  let queue = fs.existsSync(QUEUE_FILE) ? JSON.parse(fs.readFileSync(QUEUE_FILE)) : { tasks: [] };
  queue.tasks.push({ task, time: new Date().toISOString() });
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

if (require.main === module) {
  if (process.argv[2] === 'lock') console.log(getLock());
  else if (process.argv[2] === 'unlock') releaseLock();
  else if (process.argv[2] === 'add') addTask(process.argv[3]);
}
