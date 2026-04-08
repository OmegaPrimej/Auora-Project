// Oracle-120B.cjs - Interface to 120B parameter LLM (via API)
const https = require('https');
const http = require('http');

const API_KEY = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const PROVIDER = process.env.LLM_PROVIDER || "openai";

async function queryLLM(prompt, maxTokens = 500) {
  if (PROVIDER === "openai") return await queryOpenAI(prompt, maxTokens);
  if (PROVIDER === "anthropic") return await queryAnthropic(prompt, maxTokens);
  if (PROVIDER === "ollama") return await queryOllama(prompt);
  throw new Error("Unknown LLM provider");
}

async function queryOpenAI(prompt, maxTokens) {
  const data = JSON.stringify({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7
  });
  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Length": Buffer.byteLength(data)
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          const answer = json.choices?.[0]?.message?.content || "No response";
          resolve(answer);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function queryAnthropic(prompt, maxTokens) {
  const data = JSON.stringify({
    model: "claude-3-opus-20240229",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }]
  });
  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(data)
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve(json.content?.[0]?.text || "No response");
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function queryOllama(prompt) {
  const data = JSON.stringify({ model: "llama2:70b", prompt: prompt, stream: false });
  const options = {
    hostname: "localhost",
    port: 11434,
    path: "/api/generate",
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
  };
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve(json.response || "No response");
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

if (require.main === module) {
  const prompt = process.argv.slice(2).join(" ");
  if (!prompt) { console.log("Usage: node Oracle-120B.cjs 'prompt'"); process.exit(1); }
  queryLLM(prompt).then(answer => console.log("\n🧠 Oracle says:\n", answer)).catch(err => console.error("Error:", err.message));
}

module.exports = { queryLLM };
