import{a}from"./chunk-5F7RQEA2.js";import{m as h}from"./chunk-NQOZPK3S.js";import{a as p}from"./chunk-3VPKZZES.js";import"./chunk-55MUSWHY.js";import"./chunk-RUGFDS43.js";import"./chunk-2R6CW7ES.js";var A=(o,g,X,f,w)=>{let c=o.ownerDocument.defaultView,n=a(o),v=t=>{let{startX:e}=t;return n?e>=c.innerWidth-50:e<=50},l=t=>n?-t.deltaX:t.deltaX,y=t=>n?-t.velocityX:t.velocityX;return p({el:o,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:t=>(n=a(o),v(t)&&g()),onStart:X,onMove:t=>{let e=l(t)/c.innerWidth;f(e)},onEnd:t=>{let s=l(t),e=c.innerWidth,r=s/e,i=y(t),D=e/2,u=i>=0&&(i>.2||s>D),d=(u?1-r:r)*e,m=0;if(d>5){let M=d/Math.abs(i);m=Math.min(M,540)}w(u,r<=0?.01:h(0,r,.9999),m)}})};export{A as createSwipeBackGesture};
/*! Bundled license information:

@ionic/core/dist/esm/swipe-back-VdaUzLWy.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
