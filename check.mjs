import fs from "node:fs";
import path from "node:path";
const out=path.resolve("dist");
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):files.push(p);}}
walk(out);
const html=files.filter(f=>f.endsWith(".html"));
let bad=[];
for(const f of html){const s=fs.readFileSync(f,"utf8");const isRoot=f===path.join(out,"index.html");for(const needle of ["<title>","canonical","hreflang","og:image","application/ld+json"]){if(!isRoot&&!s.includes(needle))bad.push(f+": "+needle);}if(/😀|🎰|✅|⭐|🔥|🎁/.test(s))bad.push(f+": emoji");if(/\b01\b|\b02\b/.test(s))bad.push(f+": decorative numbering");}
const sitemap=fs.readFileSync(path.join(out,"sitemap.xml"),"utf8");
const count=(sitemap.match(/<url>/g)||[]).length;
if(count!==170)bad.push("sitemap expected 170 URLs, got "+count);
if(bad.length){console.error(bad.join("\n"));process.exit(1);}
console.log("Checked "+html.length+" HTML files and "+count+" sitemap URLs");
