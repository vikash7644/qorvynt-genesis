const NPCs = [
  { id: "mira", name: "Mira", role: "Field Medic", home: "Emberfall Outpost", routine: ["check_supplies", "treat_survivors", "rest"] },
  { id: "kael", name: "Kael", role: "Scout", home: "Emberfall Outpost", routine: ["patrol", "survey_frontier", "report_threats"] },
  { id: "orin", name: "Orin", role: "Mechanic", home: "Emberfall Outpost", routine: ["repair_equipment", "salvage_parts", "rest"] },
  { id: "sera", name: "Sera", role: "Archivist", home: "Emberfall Outpost", routine: ["study_records", "decode_signals", "archive_discoveries"] }
];

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }
  const now = new Date();
  const hour = now.getUTCHours();
  const phase = hour >= 6 && hour < 18 ? "day" : "night";
  return res.status(200).json({
    world: "QORVYNT: Genesis",
    worldId: "genesis-frontier",
    worldVersion: 1,
    serverTime: now.toISOString(),
    cycle: phase,
    settlements: [{ id: "emberfall", name: "Emberfall Outpost", status: "active", population: NPCs.length }],
    npcs: NPCs,
    features: { authoritativeWorldState: false, persistentPlayerSaves: false, multiplayer: false }
  });
}
