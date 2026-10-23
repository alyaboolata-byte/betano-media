const menu=document.querySelector(".menu-btn");
const nav=document.querySelector(".nav");
if(menu&&nav){menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});}
document.querySelectorAll(".lang-panel a").forEach(a=>a.addEventListener("click",()=>{const d=a.closest("details");if(d)d.open=false;}));
