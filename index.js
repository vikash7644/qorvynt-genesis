const express = require("express");
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
const npcs = [
  { id:"mira", name:"Mira", role:"Field Medic", home:"Emberfall Outpost", routine:["check_supplies","treat_survivors","rest"] },
  { id:"kael", name:"Kael", role:"Scout", home:"Emberfall Outpost", routine:["patrol","survey_frontier","report_threats"] },
  { id:"orin", name:"Orin", role:"Mechanic", home:"Emberfall Outpost", routine:["repair_equipment","salvage_parts","rest"] },
  { id:"sera", name:"Sera", role:"Archivist", home:"Emberfall Outpost", routine:["study_records","decode_signals","archive_discoveries"] }
];
app.get("/api/health", (_req,res) => res.set("Cache-Control","no-store").json({ ok:true, service:"qorvynt-genesis-world-server", version:"0.1.0", persistence:false, multiplayer:false, timestamp:new Date().toISOString() }));
app.get("/api/world", (_req,res) => { const now=new Date(); res.set("Cache-Control","no-store").json({ world:"QORVYNT: Genesis", worldId:"genesis-frontier", worldVersion:1, serverTime:now.toISOString(), cycle:now.getUTCHours()>=6&&now.getUTCHours()<18?"day":"night", settlements:[{id:"emberfall",name:"Emberfall Outpost",status:"active",population:npcs.length}], npcs, features:{authoritativeWorldState:false,persistentPlayerSaves:false,multiplayer:false} }); });
app.get("/", (_req,res) => res.json({ service:"QORVYNT: Genesis World Server", health:"/api/health", world:"/api/world" }));
module.exports = app;
