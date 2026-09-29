const fs=require("fs"),path=require("path");function w(p,c){const d=path.dirname(p);if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});fs.writeFileSync(p,c,"utf8");console.log("wrote:",p);}const S=String.raw`d:\Final SIh\server`;

// demoData
const demoData = "// NIRIKSHAN AI - Demo MPLADS Dataset\n// PROTOTYPE DATA - NOT OFFICIAL MPLADS RECORDS\n";
w(S+"\\data\\demoData.js","// placeholder\n");console.log("done");
