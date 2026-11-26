const http = require("http"), fs = require("fs"), path = require("path");

// .env faylidan o'qish
if (fs.existsSync(".env")) {
  for (const l of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const { BOT_TOKEN, CHAT_ID, PORT = 3000 } = process.env;
const TURLAR = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".js": "text/javascript" };

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/aloqa") {
    let b = ""; req.on("data", d => (b += d)); 
    return req.on("end", async () => {
      try {
        const { ism, aloqa, xabar } = JSON.parse(b);
        const text = `Saytdan yangi xabar\nIsm: ${ism}\nAloqa: ${aloqa}\n\n${xabar}`.slice(0, 4000);
        const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text })
        });
        res.writeHead(r.ok ? 200 : 500).end();
      } catch { res.writeHead(400).end(); }
    });
  }
  const f = path.join(__dirname, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!f.startsWith(__dirname) || f.includes(".env") || f.endsWith("server.js") || !fs.existsSync(f)) return res.writeHead(404).end("Topilmadi");
  res.writeHead(200, { "Content-Type": TURLAR[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`Sayt: http://localhost:${PORT}`));
