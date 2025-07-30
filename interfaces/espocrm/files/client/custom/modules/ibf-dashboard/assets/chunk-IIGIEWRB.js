var i=(e,t)=>{e.componentOnReady?e.componentOnReady().then(a=>t(a)):r(()=>t(e))},s=e=>e.componentOnReady!==void 0;var o=(e,t,a,n)=>e.addEventListener(t,a,n),u=(e,t,a,n)=>e.removeEventListener(t,a,n);var r=e=>typeof __zone_symbol__requestAnimationFrame=="function"?__zone_symbol__requestAnimationFrame(e):typeof requestAnimationFrame=="function"?requestAnimationFrame(e):setTimeout(e);var c=(e,t,a)=>Math.max(e,Math.min(t,a));var d=e=>{if(e){let t=e.changedTouches;if(t&&t.length>0){let a=t[0];return{x:a.clientX,y:a.clientY}}if(e.pageX!==void 0)return{x:e.pageX,y:e.pageY}}return{x:0,y:0}};var l=(e,t)=>{if(e??(e={}),t??(t={}),e===t)return!0;let a=Object.keys(e);if(a.length!==Object.keys(t).length)return!1;for(let n of a)if(!(n in t)||e[n]!==t[n])return!1;return!0};export{i as a,s as b,o as c,u as d,r as e,c as f,d as g,l as h};
/*! Bundled license information:

@ionic/core/components/helpers.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
