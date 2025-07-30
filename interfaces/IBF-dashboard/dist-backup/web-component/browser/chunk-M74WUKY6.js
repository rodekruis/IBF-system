import{a as n}from"./chunk-74OYS3EQ.js";var t=()=>{if(n!==void 0)return n.Capacitor};var r=function(e){return e.Unimplemented="UNIMPLEMENTED",e.Unavailable="UNAVAILABLE",e}(r||{}),o=function(e){return e.Body="body",e.Ionic="ionic",e.Native="native",e.None="none",e}(o||{}),c={getEngine(){let e=t();if(e?.isPluginAvailable("Keyboard"))return e.Plugins.Keyboard},getResizeMode(){let e=this.getEngine();return e?.getResizeMode?e.getResizeMode().catch(i=>{if(i.code!==r.Unimplemented)throw i}):Promise.resolve(void 0)}};export{o as a,c as b};
/*! Bundled license information:

@ionic/core/components/capacitor.js:
@ionic/core/components/keyboard2.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
