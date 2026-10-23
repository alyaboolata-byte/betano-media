import fs from "node:fs";
import path from "node:path";
const out=path.resolve("dist");
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):files.push(p);}}
walk(out);
const html=files.filter(f=>f.endsWith(".html"));
let bad=[];
for(const f of html){const s=fs.readFileSync(f,"utf8");const isRoot=f===path.join(out,"index.html");for(const needle of ["<title>","canonical","hreflang","og:image","application/ld+json"]){if(!isRoot&&!s.includes(needle))bad.push(f+": "+needle);}if(/😀|🎰|✅|⭐|🔥|🎁/.test(s))bad.push(f+": emoji");if(/\b01\b|\b02\b/.test(s))bad.push(f+": decorative numbering");}
for(const lang of ["de","pt"]){
 const file=path.join(out,lang,"index.html"),s=fs.readFileSync(file,"utf8");
 const screenshots=(s.match(/betano-screen-[1-6]\.webp/g)||[]).length;
 const words=s.replace(/<[^>]+>/g," ").trim().split(/\s+/).length;
 if(screenshots<6)bad.push(lang+": expected at least 6 product screenshots, got "+screenshots);
 if(words<1800)bad.push(lang+": homepage is too thin, got "+words+" words");
 if(!s.includes("https://r1wbjhb.com/?p=9n57"))bad.push(lang+": affiliate URL missing");
 if(!s.includes('FAQPage'))bad.push(lang+": FAQ schema missing");
}
for(const asset of ["de-hero.webp","de-bonus.webp","pt-hero.webp","pt-bonus.webp"]){if(!fs.existsSync(path.join(out,"assets","banners",asset)))bad.push("missing banner "+asset);}
for(let i=1;i<=6;i++){if(!fs.existsSync(path.join(out,"assets","screenshots","betano-screen-"+i+".webp")))bad.push("missing product screenshot "+i);}
const sitemap=fs.readFileSync(path.join(out,"sitemap.xml"),"utf8");
const count=(sitemap.match(/<url>/g)||[]).length;
if(count!==170)bad.push("sitemap expected 170 URLs, got "+count);
if(bad.length){console.error(bad.join("\n"));process.exit(1);}
console.log("Checked "+html.length+" HTML files and "+count+" sitemap URLs");
