var o=class{constructor(){this.m=new Map}reset(e){this.m=new Map(Object.entries(e))}get(e,t){let n=this.m.get(e);return n!==void 0?n:t}getBoolean(e,t=!1){let n=this.m.get(e);return n===void 0?t:typeof n=="string"?n==="true":!!n}getNumber(e,t){let n=parseFloat(this.m.get(e));return isNaN(n)?t!==void 0?t:NaN:n}set(e,t){this.m.set(e,t)}},i=new o;var s=function(r){return r.OFF="OFF",r.ERROR="ERROR",r.WARN="WARN",r}(s||{}),c=(r,...e)=>{let t=i.get("logLevel",s.WARN);if([s.WARN].includes(t))return console.warn(`[Ionic Warning]: ${r}`,...e)},a=(r,...e)=>{let t=i.get("logLevel",s.ERROR);if([s.ERROR,s.WARN].includes(t))return console.error(`[Ionic Error]: ${r}`,...e)};export{i as a,c as b,a as c};
/*! Bundled license information:

@ionic/core/components/index4.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
