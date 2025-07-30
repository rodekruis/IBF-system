import{a as c}from"./chunk-IIGIEWRB.js";import{g as s}from"./chunk-2R6CW7ES.js";var l="ION-CONTENT",i="ion-content",a=".ion-content-scroll-host",T=`${i}, ${a}`,n=o=>o.tagName===l,u=o=>s(null,null,function*(){return n(o)?(yield new Promise(t=>c(o,t)),o.getScrollElement()):o});var f=o=>o.closest(T),m=(o,t)=>n(o)?o.scrollToTop(t):Promise.resolve(o.scrollTo({top:0,left:0,behavior:"smooth"})),E=(o,t,r,e)=>n(o)?o.scrollByPoint(t,r,e):Promise.resolve(o.scrollBy({top:r,left:t,behavior:e>0?"smooth":"auto"}));export{u as a,f as b,m as c,E as d};
/*! Bundled license information:

@ionic/core/components/index8.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
