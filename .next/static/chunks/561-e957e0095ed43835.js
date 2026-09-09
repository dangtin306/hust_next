"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[561],{561:(e,t,r)=>{r.d(t,{R:()=>m});var n=r(6738),i=r(2194),o=r(9425),a=r(8632);let l="orders-related-meta-text",s=(0,i.$e)(l,{fontSize:12,leading:12,fontMetrics:o.A}),d=`
${s}

.${l} {
    display: block;
    flex: none;
    margin: 0;
    padding: 0;
    font-family: inherit;
    font-size: 11px;
    line-height: 12px;
    font-weight: 400;
    font-synthesis: none;
    white-space: nowrap;
}

@supports (text-box-trim: trim-both) and (text-box-edge: cap alphabetic) {
    .${l} {
        text-box-trim: trim-both;
        text-box-edge: cap alphabetic;
    }

    .${l}::before,
    .${l}::after {
        content: none !important;
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }
}
`;function c({className:e="",svgRef:t,graphicRef:r,boundsRef:i,measureRef:o}){return(0,n.FD)("svg",{ref:t,width:"12",height:"12",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",preserveAspectRatio:"xMidYMid meet",shapeRendering:"geometricPrecision",className:e,children:[(0,n.FD)("g",{ref:r,"data-orders-icon-bounds-group":"calendar","data-orders-devtools-target":"true",transform:"translate(0 2.4)",pointerEvents:"bounding-box",style:{pointerEvents:"bounding-box"},children:[(0,n.Y)("rect",{x:"50%",y:"10%",width:"0.001%",height:"80%",fill:"currentColor",fillOpacity:"0",stroke:"none",pointerEvents:"none","aria-hidden":"true","data-orders-icon-80-percent-frame":"calendar"}),(0,n.Y)("path",{"data-orders-icon-art":"calendar",pointerEvents:"none","aria-hidden":"true",d:"M7.5 2.75v2.5M16.5 2.75v2.5M3.75 8.75h16.5M6 4.75h12A2.25 2.25 0 0 1 20.25 7v11A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7A2.25 2.25 0 0 1 6 4.75Z",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,n.Y)("rect",{ref:o,x:"2.9",y:"1.9",width:"18.2",height:"19.2",fill:"currentColor",fillOpacity:"0",stroke:"none",pointerEvents:"none","aria-hidden":"true","data-orders-icon-measure-bounds":"calendar"}),(0,n.Y)("rect",{ref:i,x:"2.9",y:"1.9",width:"18.2",height:"19.2",fill:"currentColor",fillOpacity:"0.001",stroke:"none",pointerEvents:"none","aria-hidden":"true","data-orders-icon-fixed-bounds":"calendar","data-orders-devtools-bounds":"true"})]})}function p({className:e="",svgRef:t,graphicRef:r,boundsRef:i,measureRef:o}){return(0,n.FD)("svg",{ref:t,width:"12",height:"12",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",preserveAspectRatio:"xMidYMid meet",shapeRendering:"geometricPrecision",className:e,children:[(0,n.FD)("g",{ref:r,"data-orders-icon-bounds-group":"tag","data-orders-devtools-target":"true",transform:"translate(0 3.6)",pointerEvents:"bounding-box",style:{pointerEvents:"bounding-box"},children:[(0,n.Y)("rect",{x:"50%",y:"10%",width:"0.001%",height:"75%",fill:"currentColor",fillOpacity:"0",stroke:"none",pointerEvents:"none","aria-hidden":"true","data-orders-icon-80-percent-frame":"tag"}),(0,n.Y)("path",{"data-orders-icon-art":"tag",pointerEvents:"none","aria-hidden":"true",d:"M10.25 4.75H6.75A2.25 2.25 0 0 0 4.5 7v4.043a2.25 2.25 0 0 0 .659 1.591l5.707 5.707a2.25 2.25 0 0 0 3.182 0l4.293-4.293a2.25 2.25 0 0 0 0-3.182l-5.909-5.909a2.25 2.25 0 0 0-1.591-.659Z",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round"}),(0,n.Y)("circle",{"data-orders-icon-art-dot":"tag",pointerEvents:"none","aria-hidden":"true",cx:"8.25",cy:"8.25",r:"1.1",fill:"currentColor"})]}),(0,n.Y)("rect",{ref:o,x:"3.64",y:"3.44",width:"16.22",height:"16.42",fill:"currentColor",fillOpacity:"0",stroke:"none",pointerEvents:"none","aria-hidden":"true","data-orders-icon-measure-bounds":"tag"}),(0,n.Y)("rect",{ref:i,x:"3.64",y:"3.44",width:"16.22",height:"16.42",fill:"currentColor",fillOpacity:"0.001",stroke:"none",pointerEvents:"none","aria-hidden":"true","data-orders-icon-fixed-bounds":"tag","data-orders-devtools-bounds":"true"})]})}function h({label:e,Icon:t,className:r="",logLayout:i=!1}){let{pillRef:o,rowRef:s,textRef:d,svgRef:c,graphicRef:p,boundsRef:h,measureRef:m}=function(e="",t=!1){let r=(0,a.useRef)(null),n=(0,a.useRef)(null),i=(0,a.useRef)(null),o=(0,a.useRef)(null),l=(0,a.useRef)(null),s=(0,a.useRef)(null),d=(0,a.useRef)(null),[c,p]=(0,a.useState)(!1);return(0,a.useLayoutEffect)(()=>{let n=r.current;if(!n)return;let i=!1,o=0,a=()=>{if(i)return;i=!0,p(!1),n.style.setProperty("--meta-content-offset-y","0px"),n.style.setProperty("--meta-content-padding-bottom","0px"),n.style.removeProperty("height"),n.style.removeProperty("--meta-anchor-height"),n.style.removeProperty("--meta-content-height");let r=n.getBoundingClientRect(),o=r.height;if(o<=0){i=!1;return}n.style.setProperty("--meta-content-shift-y",`${-.03*o}px`);let a=.24*o,l=Math.max(0,o-a-2);n.style.setProperty("--meta-anchor-height",`${a}px`),n.style.setProperty("--meta-content-height",`${l}px`),n.style.setProperty("--meta-icon-offset-y","0px"),n.style.height=`${o}px`,requestAnimationFrame(()=>{requestAnimationFrame(()=>{let e=n.querySelector('[data-orders-meta-content-layer="true"]'),t=n.querySelector('[data-orders-meta-anchor="true"]');if(!e||!t)return void p(!0);n.style.setProperty("--meta-icon-offset-y",`${.12*a}px`),n.style.setProperty("--meta-content-offset-y","0px");let r=(e.firstElementChild||e).getBoundingClientRect(),i=n.querySelector('[data-orders-meta-text="true"]'),o=n.querySelector("svg"),l=i?i.getBoundingClientRect().bottom:r.bottom,s=o?o.getBoundingClientRect().bottom:r.bottom,d=t.getBoundingClientRect().top-Math.max(l,s)+4;n.style.setProperty("--meta-content-offset-y",`${d}px`),requestAnimationFrame(()=>{requestAnimationFrame(()=>{p(!0)})})})}),t&&console.table([{Label:e,PillTopViewport:`${r.top.toFixed(4)}px`,PillBottomViewport:`${r.bottom.toFixed(4)}px`,PillHeightViewport:`${o.toFixed(4)}px`,AnchorHeightViewport:`${a.toFixed(4)}px`,AnchorRatio:"24%"}]),i=!1};a();let l=()=>{cancelAnimationFrame(o),o=requestAnimationFrame(a)};return window.addEventListener("resize",l),window.visualViewport?.addEventListener("resize",l),()=>{cancelAnimationFrame(o),window.removeEventListener("resize",l),window.visualViewport?.removeEventListener("resize",l)}},[e,t,r]),{pillRef:r,rowRef:n,textRef:i,svgRef:o,graphicRef:l,boundsRef:s,measureRef:d,isMeasured:c}}(e,i);return(0,n.FD)("div",{ref:o,"data-orders-meta-pill":"true",className:`
                relative
                box-border
                inline-flex
                shrink-0
                flex-col
                items-stretch
                whitespace-nowrap
                rounded-full
                px-2
                text-slate-600
                isolate w-max flex-nowrap
                ${r}
            `.trim(),style:{height:"auto",minHeight:"24px",minWidth:"max-content",paddingTop:"0px",paddingBottom:"0px"},children:[(0,n.Y)("div",{"data-orders-meta-content-layer":"true",className:"relative mt-auto mb-[var(--meta-anchor-height,6px)] inline-flex w-max flex-nowrap",children:(0,n.FD)("div",{ref:s,className:"inline-flex flex-nowrap items-end gap-[4px] whitespace-nowrap",children:[(0,n.Y)("div",{className:" grid h-[12px] w-[12px] shrink-0 place-items-center overflow-visible leading-none ","data-orders-meta-icon":"true",children:(0,n.Y)(u,{Icon:t,svgRef:c,graphicRef:p,boundsRef:h,measureRef:m})}),(0,n.Y)("div",{ref:d,"data-orders-meta-text":"true",className:`
                        ${l}
                        shrink-0
                        whitespace-nowrap
                        font-normal
                        text-slate-600
                            `.trim(),style:{transform:"translateY(var(--meta-content-shift-y, 0px))"},children:e})]})}),(0,n.Y)("div",{"data-orders-meta-anchor":"true","aria-hidden":"true",className:"pointer-events-none absolute inset-x-0 bottom-0 block w-full shrink-0",style:{height:"var(--meta-anchor-height, 6px)",boxSizing:"border-box",background:"linear-gradient(to bottom, rgba(220, 38, 38, 0.8) 0.5px, transparent 0.5px)",minHeight:0}})]})}function u({Icon:e,svgRef:t,graphicRef:r,boundsRef:i,measureRef:o}){return(0,n.Y)(e,{svgRef:t,graphicRef:r,boundsRef:i,measureRef:o,className:" block h-[12px] w-[12px] min-h-[12px] min-w-[12px] max-h-[12px] max-w-[12px] shrink-0 overflow-visible leading-none "})}function m({dateRaw:e="",hashName:t="Hust Media",className:r="",logLayout:i=!1}){let o=function(e){let t=String(e||"").trim();if(!t)return"";let r=new Date(t.replace(" ","T"));return Number.isNaN(r.getTime())?t:`${r.getMonth()+1}/${r.getDate()}/${r.getFullYear()}`}(e),a=String(t||"").trim()||"Hust Media";return(0,n.FD)(n.FK,{children:[(0,n.Y)("style",{dangerouslySetInnerHTML:{__html:d}}),(0,n.FD)("div",{className:`
                    mt-2
                    flex
                    w-full
                    flex-nowrap
                    items-center
                    justify-start
                    gap-1.5
                    overflow-hidden
                    ${r}
                `.trim(),children:[o?(0,n.Y)(h,{label:o,Icon:c,logLayout:i,className:" border border-slate-300/80 bg-slate-200/80 "}):null,(0,n.Y)(h,{label:a,Icon:p,logLayout:i,className:" border border-slate-300/80 bg-slate-200/80 "})]})]})}},2194:(e,t,r)=>{r.d(t,{$e:()=>o});let n=e=>parseFloat(e.toFixed(4)),i=({lineHeight:e,fontSize:t,capHeightTrim:r,baselineTrim:n})=>({fontSize:t,lineHeight:e,"::before":{content:"''",marginBottom:r,display:"table"},"::after":{content:"''",marginTop:n,display:"table"}});function o(e,t){let{"::before":r,"::after":o,...a}="capHeightTrim"in t?i(t):i(function(e){let{fontSize:t,lineHeight:r,fontMetrics:i}=function(e){let t,r,n;if("leading"in e&&"lineGap"in e)throw Error("Only a single line height style can be provided. Please pass either `lineGap` OR `leading`.");if("capHeight"in e&&"fontSize"in e)throw Error("Please pass either `capHeight` OR `fontSize`, not both.");let{fontMetrics:i}=e,o=i.capHeight/i.unitsPerEm;if("capHeight"in e)t=e.capHeight/o,r=e.capHeight;else if("fontSize"in e)t=e.fontSize,r=e.fontSize*o;else throw Error("Please pass either `capHeight` OR `fontSize`.");return"lineGap"in e?n=r+e.lineGap:"leading"in e&&(n=e.leading),{fontSize:t,lineHeight:n,fontMetrics:i}}(e),o=Math.abs(i.descent),a=i.capHeight/i.unitsPerEm,l=o/i.unitsPerEm,s=i.ascent/i.unitsPerEm,d=i.lineGap/i.unitsPerEm,c=(i.ascent+i.lineGap+o)/i.unitsPerEm*t,p=e=>r?e-(c-r)/2/t:e,h=-1*p(s-a+d/2),u=-1*p(l+d/2);return{fontSize:`${n(t)}px`,lineHeight:r?`${n(r)}px`:"normal",capHeightTrim:`${n(h)}em`,baselineTrim:`${n(u)}em`}}(t)),l=(t,r)=>`
.${e}${r?`::${r}`:""} {
${Object.keys(t).map(e=>`  ${e.replace(/[A-Z]/g,"-$&").toLowerCase()}: ${t[e].replace(/'/g,'"')}`).join(";\n")};
}`;return[l(a),l(r,"before"),l(o,"after")].join("\n")}},9425:(e,t,r)=>{r.d(t,{A:()=>n});let n={familyName:"Inter",fullName:"Inter Regular",postscriptName:"Inter-Regular",category:"sans-serif",capHeight:1490,ascent:1984,descent:-494,lineGap:0,unitsPerEm:2048,xHeight:1118,xWidthAvg:978,subsets:{latin:{xWidthAvg:978},thai:{xWidthAvg:1344}}}}}]);