const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../Neural_Logs');

console.log("🧠 Auora Omni-Channel: Analyzing Harvest...");

fs.readdir(logDir, (err, files) => {
    if (err) {
        console.error("❌ Link Error: Could not access Neural_Logs");
        return;
    }
    const logCount = files.filter(file => file.endsWith('.log')).length;
    console.log(`📊 Symbiotic Status: ${logCount} Neural Logs identified.`);
    console.log("🧬 Connection: Stable. Aether-Grid is receptive.");
});
