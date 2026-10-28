import fs from "node:fs";
import path from "node:path";
const out=path.resolve("dist");
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):files.push(p);}}
walk(out);
const html=files.filter(f=>f.endsWith(".html")&&!path.basename(f).startsWith("yandex_"));
let bad=[];
for(const f of html){const s=fs.readFileSync(f,"utf8");for(const needle of ["<title>","canonical","hreflang","og:image","application/ld+json"]){if(!s.includes(needle))bad.push(f+": "+needle);}if(/😀|🎰|✅|⭐|🔥|🎁/.test(s))bad.push(f+": emoji");}
if(fs.existsSync(path.join(out,"index.html")))bad.push("root index.html must not exist; Vercel redirects / to /de/");
for(const lang of ["de","pt"]){
 const file=path.join(out,lang,"index.html"),s=fs.readFileSync(file,"utf8");
 const screenshots=(s.match(/(?:betano-screen-[1-6]|betano-br-[a-z-]+)\.(?:webp|jpg)/g)||[]).length;
 const words=s.replace(/<[^>]+>/g," ").trim().split(/\s+/).length;
 if(screenshots<6)bad.push(lang+": expected at least 6 product screenshots, got "+screenshots);
 if(words<1800)bad.push(lang+": homepage is too thin, got "+words+" words");
 if(!s.includes("https://r1wbjhb.com/?p=9n57"))bad.push(lang+": affiliate URL missing");
 if(!s.includes('FAQPage'))bad.push(lang+": FAQ schema missing");
 if(!s.includes('class="mobile-offer-bar"'))bad.push(lang+": mobile offer bar missing");
 if((s.match(/class="mobile-(?:login|register)"/g)||[]).length!==2)bad.push(lang+": mobile offer bar must contain two links");
}
for(const f of html){const s=fs.readFileSync(f,"utf8");if(/Stand: 23\. Oktober 2026|Atualizado em 23 de outubro de 2026|Inhalt geprüft am 23\.10\.2026|Conteúdo revisado em 23\/10\/2026|© 2026 betano\.media ·/.test(s))bad.push(f+": visible review date remains");}
const redirectedRegional=new Set(["/de/chile/","/de/argentina/","/pt/chile/","/pt/argentina/"]);
for(const f of html){
 const s=fs.readFileSync(f,"utf8");
 for(const href of [...s.matchAll(/href="(\/[^"]*)"/g)].map(m=>m[1].split(/[?#]/)[0]))if(redirectedRegional.has(href))bad.push(f+": internal link points to redirected regional URL "+href);
}
for(const asset of ["de-hero.webp","de-bonus.webp","pt-hero.webp","pt-bonus.webp","pt-hero-br.webp","pt-bonus-br.webp"]){if(!fs.existsSync(path.join(out,"assets","banners",asset)))bad.push("missing banner "+asset);}
for(let i=1;i<=6;i++){if(!fs.existsSync(path.join(out,"assets","screenshots","betano-screen-"+i+".webp")))bad.push("missing product screenshot "+i);}
const sitemap=fs.readFileSync(path.join(out,"sitemap.xml"),"utf8");
const entries=[...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)].map(m=>({url:m[1],lastmod:m[2]}));
const count=(sitemap.match(/<url>/g)||[]).length;
if(count!==166)bad.push("sitemap expected 166 URLs, got "+count);
if((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length!==count)bad.push("every sitemap URL must have a valid lastmod");
if(entries.length!==count)bad.push("sitemap URL entries must contain exactly one loc followed by one valid lastmod");
if(new Set(entries.map(e=>e.url)).size!==entries.length)bad.push("sitemap contains duplicate URLs");
const today=new Date().toISOString().slice(0,10);
for(const {url,lastmod} of entries){
 if(lastmod>today)bad.push(url+": future lastmod "+lastmod);
 const rel=new URL(url).pathname.replace(/^\//,"");
 const file=path.join(out,rel,"index.html");
 if(!fs.existsSync(file)){bad.push(url+": sitemap target missing");continue;}
 const s=fs.readFileSync(file,"utf8");
 const canonical=s.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
 if(canonical!==url)bad.push(url+": canonical mismatch "+(canonical||"missing"));
 if(/<meta name="robots" content="[^"]*noindex/i.test(s))bad.push(url+": indexable sitemap page contains noindex");
 if((s.match(/<h1(?:\s|>)/g)||[]).length!==1)bad.push(url+": expected exactly one H1");
}
const notFound=fs.readFileSync(path.join(out,"404.html"),"utf8");
if(!/<meta name="robots" content="noindex,follow">/.test(notFound))bad.push("404 page must be noindex,follow");
const robots=fs.readFileSync(path.join(out,"robots.txt"),"utf8");
if(!/^User-agent: \*\nAllow: \/\nSitemap: https:\/\/betano\.media\/sitemap\.xml\n$/.test(robots))bad.push("robots.txt must allow crawling and declare the canonical sitemap");
const llmsPath=path.join(out,"llms.txt");
if(!fs.existsSync(llmsPath))bad.push("llms.txt missing");
else{
 const llms=fs.readFileSync(llmsPath,"utf8");
 for(const needle of ["# betano.media","## Main sections","## Localized editions","https://betano.media/sitemap.xml"]){if(!llms.includes(needle))bad.push("llms.txt missing "+needle);}
 const offsite=[...llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>m[1]).filter(u=>!u.startsWith("https://betano.media/"));
 if(offsite.length)bad.push("llms.txt contains off-site links: "+offsite.join(", "));
}
if(!fs.existsSync(path.join(out,"4e7db1d1c6f24e98a73c42c699f5eb41.txt")))bad.push("standard IndexNow key file missing");
if(bad.length){console.error(bad.join("\n"));process.exit(1);}
console.log("Checked "+html.length+" HTML files and "+count+" sitemap URLs");

