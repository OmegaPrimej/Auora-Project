# 🔧 Troubleshooting Guide - Auora Agent

---

## ❌ Git Push Fails with 403 Error

**Error Message:**
```
fatal: Permission to OmegaPrimej/Auora-Project.git denied to github-actions[bot].
```

**Root Cause:**
GITHUB_TOKEN doesn't have `contents: write` scope.

**Solution:**

1. **Check workflow permissions** (`.github/workflows/auora-agent.yml`):
   ```yaml
   permissions:
     contents: write    # ← Must be present
     actions: read
   ```

2. **Verify token in actions**:
   ```yaml
   env:
     GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

3. **If still failing, use Personal Access Token**:
   - Go to Settings → Developer settings → Personal access tokens
   - Create new token with `repo` scope
   - Add as secret: Settings → Secrets and variables → Actions → New secret
   - Name: `GH_PAT` → Value: `ghp_...`
   - Update workflow:
     ```yaml
     env:
       GITHUB_TOKEN: ${{ secrets.GH_PAT }}
     ```

---

## ⏱️ Lock Timeout - Task Never Completes

**Error Message:**
```
⚠️ [Hive] Lock held by Agent-123 until 2026-04-09T14:35:00Z
```

**Root Cause:**
Previous agent didn't release lock, or task took longer than timeout.

**Solution:**

1. **Check current lock**:
   ```bash
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs status
   ```

2. **If lock is stale (>5 min old)**:
   ```bash
   rm .hive-lock.json
   git add .hive-lock.json
   git commit -m "Cleared stale lock"
   git push origin main
   ```

3. **Increase timeout for long tasks**:
   ```javascript
   // In Hive-Queen.cjs, change:
   const timeouts = {
     'complex': 300000,   // 5min → increase to 600000 (10min)
   };
   ```

---

## 📝 State File Corruption

**Error Message:**
```
[Nexus] Atomic write failed: ENOENT: no such file or directory
```

**Root Cause:**
State file deleted or directory missing during write.

**Solution:**

1. **Recreate state file**:
   ```bash
   mkdir -p Potter-Quadrant/Core-Logic
   echo '{"version":"2.0.0","cycle":0,"lastHeartbeat":null,"quadrant":"Aether-Grid","signedBy":"ΩP|ΩΕ∞Π|InfinitePi|Aether-7x7-Matrix","history":[],"operatingMode":"solo"}' > .auora-state.json
   ```

2. **Verify atomic write pattern**:
   - Check `Nexus-Symbiosis.cjs` line 8-16
   - Should write to `.tmp` first, then rename

3. **Commit and push**:
   ```bash
   git add .auora-state.json
   git commit -m "Restored state file"
   git push origin main
   ```

---

## 🔄 Agents Register but Never Sync

**Symptom:**
```
.agents-registry.json has agents, but lastSync is old
```

**Root Cause:**
`Orchestra.cjs sync` not called, or agents not responding.

**Solution:**

1. **Manually trigger sync**:
   ```bash
   node Potter-Quadrant/Core-Logic/Orchestra.cjs sync
   ```

2. **Check for stale agents**:
   ```bash
   node Potter-Quadrant/Core-Logic/Orchestra.cjs status
   ```

3. **If agents marked "stale"**:
   - Agents haven't pinged in 5+ minutes
   - Tasks assigned to them will be reassigned
   - This is normal behavior for fault tolerance

4. **Deregister dead agents**:
   ```bash
   node Potter-Quadrant/Core-Logic/Orchestra.cjs deregister Agent-123
   ```

---

## 🚨 Task Queue Growing Endlessly

**Symptom:**
```
"pending": 47,
"running": 3,
"completed": 12,
```

**Root Cause:**
Tasks added but never completed/failed.

**Solution:**

1. **Check queue**:
   ```bash
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs queue-status
   ```

2. **Manually complete task**:
   ```bash
   // Add to Orchestra.cjs if needed, then:
   // Task ID from queue-status output
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs complete-task abc123
   ```

3. **Clear failed tasks**:
   ```bash
   # Edit .hive-queue.json, remove old items from "failed" array
   git add .hive-queue.json && git commit -m "Cleared old failed tasks"
   ```

4. **Prevent future buildup**:
   - Reduce task creation rate
   - Increase agent count to process faster
   - Lower priority on background tasks

---

## 🔓 Lock Won't Release

**Symptom:**
```
getNext task() always returns null
Lock status shows locked but no process running
```

**Root Cause:**
Agent crashed mid-execution, lock wasn't released.

**Solution:**

1. **Force-release lock**:
   ```bash
   rm .hive-lock.json
   git add .hive-lock.json
   git commit -m "Force released lock"
   git push origin main
   ```

2. **Verify workflow cleanup**:
   In `.github/workflows/auora-agent.yml`, ensure:
   ```yaml
   - name: 🔓 Release Hive Lock
     if: always()    # ← Runs even if failed
     run: node Potter-Quadrant/Core-Logic/Hive-Queen.cjs unlock "Agent-${{ github.run_id }}" || true
   ```

3. **If still stuck**:
   ```bash
   # Add this to next workflow run:
   - name: Emergency Lock Release
     run: rm -f .hive-lock.json
   ```

---

## 💔 Workflow Job Fails Silently

**Symptom:**
```
Job runs but exits with no output
```

**Root Cause:**
Node.js version mismatch or missing dependencies.

**Solution:**

1. **Verify Node version**:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: '20'  # ← Must be 18+
   ```

2. **Add debug output**:
   ```bash
   node --version
   npm --version
   ls -la Potter-Quadrant/Core-Logic/
   ```

3. **Check file permissions**:
   ```bash
   chmod +x Potter-Quadrant/Core-Logic/*.cjs
   git add -A
   git commit -m "Fixed file permissions"
   ```

---

## 📊 Metrics Show Zero Cycles

**Symptom:**
```json
{
  "totalCycles": 0,
  "quadrant": "Aether-Grid"
}
```

**Root Cause:**
Heartbeat never called, or state not saved.

**Solution:**

1. **Manually trigger heartbeat**:
   ```bash
   node Potter-Quadrant/Core-Logic/Nexus-Symbiosis.cjs heartbeat
   ```

2. **Verify state saved**:
   ```bash
   cat .auora-state.json
   # Should show cycle > 0
   ```

3. **Check workflow execution**:
   - GitHub Actions → Auora Autonomous Agent → View latest run
   - Check if "Nexus Heartbeat" step completed

4. **If workflow not triggering**:
   - Go to Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is enabled
   - Manually trigger: Actions → Workflow name → Run workflow

---

## 🌍 Cannot Connect to LLM (Oracle)

**Error Message:**
```
Oracle requires OPENAI_API_KEY or ANTHROPIC_API_KEY
```

**Root Cause:**
LLM provider not configured.

**Solution:**

1. **Add OpenAI API Key** (if using OpenAI):
   - Get key from https://platform.openai.com/api-keys
   - Settings → Secrets and variables → New secret
   - Name: `OPENAI_API_KEY` → Value: `sk_...`
   - Update workflow:
     ```yaml
     - name: 🧠 Oracle Analysis
       env:
         OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
       run: node Potter-Quadrant/Core-Logic/Oracle-120B.cjs "analyze system"
     ```

2. **Or use Anthropic**:
   - Add `ANTHROPIC_API_KEY` secret
   - Set `LLM_PROVIDER: anthropic` in env

3. **Or use local Ollama** (free):
   - Install: https://ollama.ai
   - Run: `ollama run llama2`
   - Set `LLM_PROVIDER: ollama` in workflow
   - No API key needed

---

## 🐝 Hive Mode - Agents Not Coordinating

**Symptom:**
```
All agents register, but no tasks assigned
Hive lock acquiring but not releasing
```

**Root Cause:**
Orchestra not delegating tasks properly.

**Solution:**

1. **Manually add task**:
   ```bash
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs add-task "test-payload" 5
   ```

2. **Check lock acquisition**:
   ```bash
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs lock Agent-001 normal
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs status
   ```

3. **If lock acquired but not released**:
   ```bash
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs unlock Agent-001
   ```

4. **Verify Orchestra delegation**:
   ```bash
   node Potter-Quadrant/Core-Logic/Orchestra.cjs delegate "test-task" 5
   node Potter-Quadrant/Core-Logic/Hive-Queen.cjs next-task
   ```

---

## 📈 Performance Degradation Over Time

**Symptom:**
```
Workflow takes 5min initially, now takes 15min
```

**Root Cause:**
State/history files growing too large.

**Solution:**

1. **Check file sizes**:
   ```bash
   wc -c .auora-state.json .hive-queue.json .agents-registry.json
   ```

2. **Trim history** (Nexus keeps last 100):
   ```javascript
   // Already built-in, but can reduce to 50 if needed
   if (state.history.length > 50) {
     state.history = state.history.slice(-50);
   }
   ```

3. **Archive old tasks**:
   ```bash
   # Remove tasks older than 30 days from .hive-queue.json
   # Edit "completed" and "failed" arrays
   ```

4. **Reduce workflow frequency**:
   ```yaml
   schedule:
     - cron: '*/60 * * * *'  # 60min instead of 30min
   ```

---

## ✅ All Green Lights - Common Checks

**Before declaring "operational":**

- [ ] `.auora-state.json` exists and updates each cycle
- [ ] `.hive-queue.json` exists (even if empty)
- [ ] `.agents-registry.json` exists with agents registered
- [ ] Workflow completes in < 5min
- [ ] No 403 errors in logs
- [ ] Lock properly released after each run
- [ ] Git push succeeds

**If all green**, you're ready for production swarm deployment. 🚀