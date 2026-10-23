const menu=document.querySelector(".menu-btn");
const nav=document.querySelector(".nav");
if(menu&&nav){menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});}
document.querySelectorAll(".lang-panel a").forEach(a=>a.addEventListener("click",()=>{const d=a.closest("details");if(d)d.open=false;}));

const mobileOfferBar=document.querySelector(".mobile-offer-bar");
if(mobileOfferBar){
 const mobileQuery=window.matchMedia("(max-width: 900px)");
 const hero=document.querySelector(".market-hero,.subpage-hero,.page-hero,.hero");
 const offerLinks=[...mobileOfferBar.querySelectorAll("a")];
 let visible=false;
 const syncMobileOffer=()=>{
  const trigger=hero?Math.max(180,hero.offsetTop+Math.min(hero.offsetHeight*.55,420)):240;
  const next=mobileQuery.matches&&window.scrollY>trigger;
  if(next===visible)return;
  visible=next;
  mobileOfferBar.classList.toggle("is-visible",visible);
  mobileOfferBar.setAttribute("aria-hidden",String(!visible));
  offerLinks.forEach(link=>link.tabIndex=visible?0:-1);
  document.body.classList.toggle("has-mobile-offer",visible);
 };
 syncMobileOffer();
 window.addEventListener("scroll",syncMobileOffer,{passive:true});
 window.addEventListener("resize",syncMobileOffer,{passive:true});
}
