import{b as n}from"./chunk-M74WUKY6.js";import"./chunk-74OYS3EQ.js";import"./chunk-2R6CW7ES.js";var g="ionKeyboardDidShow",p="ionKeyboardDidHide",b=150,r={},o={},s=!1,v=()=>{r={},o={},s=!1},k=e=>{if(n.getEngine())y(e);else{if(!e.visualViewport)return;o=c(e.visualViewport),e.visualViewport.onresize=()=>{K(e),l()||D(e)?a(e):d(e)&&i(e)}}},y=e=>{e.addEventListener("keyboardDidShow",t=>a(e,t)),e.addEventListener("keyboardDidHide",()=>i(e))},a=(e,t)=>{E(e,t),s=!0},i=e=>{u(e),s=!1},l=()=>{let e=(r.height-o.height)*o.scale;return!s&&r.width===o.width&&e>b},D=e=>s&&!d(e),d=e=>s&&o.height===e.innerHeight,E=(e,t)=>{let h=t?t.keyboardHeight:e.innerHeight-o.height,f=new CustomEvent(g,{detail:{keyboardHeight:h}});e.dispatchEvent(f)},u=e=>{let t=new CustomEvent(p);e.dispatchEvent(t)},K=e=>{r=Object.assign({},o),o=c(e.visualViewport)},c=e=>({width:Math.round(e.width),height:Math.round(e.height),offsetTop:e.offsetTop,offsetLeft:e.offsetLeft,pageTop:e.pageTop,pageLeft:e.pageLeft,scale:e.scale});export{p as KEYBOARD_DID_CLOSE,g as KEYBOARD_DID_OPEN,c as copyVisualViewport,d as keyboardDidClose,l as keyboardDidOpen,D as keyboardDidResize,v as resetKeyboardAssist,i as setKeyboardClose,a as setKeyboardOpen,k as startKeyboardAssist,K as trackViewportChanges};
/*! Bundled license information:

@ionic/core/components/keyboard.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
