export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }
  return res.status(200).json({
    ok: true,
    service: "qorvynt-genesis-world-server",
    version: "0.1.0",
    mode: "world-api-foundation",
    persistence: "not-configured",
    multiplayer: false,
    timestamp: new Date().toISOString()
  });
}
