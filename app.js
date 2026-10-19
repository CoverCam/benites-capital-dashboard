const D=window.BC_DATA,has=s=>!!document.querySelector(s);
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NAVY="#2962FF",INK="#111111",MUTE="#6B7178",LINE="#E5E8EC",PAL=["#2962FF","#6B7178","#2A9D8F","#C0392B","#7B4FB0","#D4A017","#3B82C4","#8E5B3A","#5E6B78","#E05FA0","#4CAF50","#111111","#00A6C7"];
const pc=(a,b)=>b?((a/b)-1)*100:null;
const fmt=(v,d=2)=>v==null?"n/a":v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fp=(v,d=2)=>v==null?'<span class="cap">n/a</span>':`<span class="${v>=0?"up":"dn"}">${v>=0?"+":""}${fmt(v,d)}%</span>`;
const md=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const wd=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
function back(h,days){const end=new Date(h[h.length-1][0]);const st=new Date(end);st.setDate(st.getDate()-days);const k=st.toISOString().slice(0,10);let i=h.findIndex(p=>p[0]>=k);return i<0?0:i}
function since(h,range){if(range==="YTD"){const y=h[h.length-1][0].slice(0,4);let i=h.findIndex(p=>p[0]>=y+"-01-01");return Math.max(0,i-1)}return back(h,{"1M":30,"3M":91,"6M":182,"1Y":365}[range])}
function perf(t){const h=D.hist[t];if(!h)return{};const n=h.length,c=h[n-1][1];return{price:c,d1:pc(c,h[n-2]?.[1]),d5:pc(c,h[n-6]?.[1]),m1:pc(c,h[since(h,"1M")][1]),ytd:pc(c,h[since(h,"YTD")][1])}}
/* svg helpers */
function line(pts,W,H,P,lo,hi,color,w=2){if(pts.length<2)return"";const sx=i=>P.l+i*(W-P.l-P.r)/(pts.length-1),sy=v=>P.t+(hi-v)/(hi-lo||1)*(H-P.t-P.b);
 return`<path d="${pts.map((v,i)=>(i?"L":"M")+sx(i).toFixed(1)+" "+sy(v).toFixed(1)).join("")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`}
function ticks(lo,hi,n=5){const s=(hi-lo)/n,m=Math.pow(10,Math.floor(Math.log10(s||1))),st=[1,2,2.5,5,10].map(x=>x*m).find(x=>x>=s)||s;const out=[];for(let v=Math.ceil(lo/st)*st;v<=hi+1e-9;v+=st)out.push(+v.toFixed(6));return out}
function spark(h){const p=h.slice(-30).map(x=>x[1]),lo=Math.min(...p),hi=Math.max(...p),up=p[p.length-1]>=p[0];
 return`<svg viewBox="0 0 80 28" width="80" height="28">${line(p,80,28,{l:1,r:1,t:2,b:2},lo,hi,up?NAVY:INK,1.5)}</svg>`}
const CH={};let chN=0;
function axisChart(series,opt){/* series:[{pts,color,w,label}] dates:[] */
 const W=opt.W||760,H=opt.H||300,P={l:8,r:56,t:12,b:28};let all=series.flatMap(s=>s.pts).filter(v=>v!=null);(opt.extra||[]).forEach(v=>all.push(v));
 let lo=Math.min(...all),hi=Math.max(...all);const pad=(hi-lo)*.06||1;lo-=pad;hi+=pad;const T=ticks(lo,hi,opt.zero?7:5),sy=v=>P.t+(hi-v)/(hi-lo)*(H-P.t-P.b);
 let g=T.map(v=>`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(v)}" y2="${sy(v)}" stroke="${LINE}"/><text x="${W-P.r+8}" y="${sy(v)+4}" font-size="12" fill="${MUTE}" class="num">${opt.yf(v)}</text>`).join("");
 if(opt.zero&&lo<0&&hi>0)g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(0)}" y2="${sy(0)}" stroke="${MUTE}" stroke-opacity=".6"/>`;
 const d=opt.dates,n=d.length,sx=i=>P.l+i*(W-P.l-P.r)/(n-1);[0,Math.round((n-1)/3),Math.round(2*(n-1)/3),n-1].forEach((i,k)=>{g+=`<text x="${sx(i)}" y="${H-8}" font-size="12" fill="${MUTE}" text-anchor="${k==0?"start":k==3?"end":"middle"}">${md(d[i])}</text>`});
 (opt.hlines||[]).forEach(h=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(h.v)}" y2="${sy(h.v)}" stroke="${h.color}" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${P.l+4}" y="${sy(h.v)-6}" font-size="12" font-weight="600" fill="${h.color}">${esc(h.label)}</text>`});
 if(opt.area){const s=series[0];g+=`<path d="${s.pts.map((v,i)=>(i?"L":"M")+sx(i).toFixed(1)+" "+sy(v).toFixed(1)).join("")}L${sx(n-1)} ${H-P.b}L${sx(0)} ${H-P.b}Z" fill="${NAVY}" opacity=".07"/>`}
 g+=series.map(s=>line(s.pts,W,H,P,lo,hi,s.color,s.w||2)).join("");
 const ends=series.filter(s=>s.label).map(s=>({y:sy(s.pts[s.pts.length-1]),s}));
 g+=ends.map(e=>`<circle cx="${sx(n-1)}" cy="${e.y}" r="3.5" fill="${e.s.color}"/>`).join("");
 const id="c"+(++chN);CH[id]={W,H,P,sx,sy,n,dates:d,series,tip:opt.tip};
 return`<svg viewBox="0 0 ${W} ${H}" role="img" data-cid="${id}">${g}<g class="hv" style="display:none"></g></svg>`}
/* hover readout: delegated, survives re-renders */
function hvHide(svg){if(!svg)return;const g=svg.querySelector(".hv");if(g)g.style.display="none";const t=svg.parentNode.querySelector(".tip");if(t)t.style.display="none"}
function hvMove(svg,cx){const c=CH[svg.dataset.cid];if(!c||c.n<2)return;const r=svg.getBoundingClientRect(),k=r.width/c.W,vx=(cx-r.left)/k;
 const i=Math.max(0,Math.min(c.n-1,Math.round((vx-c.P.l)/(c.W-c.P.l-c.P.r)*(c.n-1)))),x=c.sx(i);
 const g=svg.querySelector(".hv");g.style.display="";g.innerHTML=`<line x1="${x}" x2="${x}" y1="${c.P.t}" y2="${c.H-c.P.b}" stroke="#2962FF" stroke-opacity=".55" stroke-dasharray="3 3"/>`+c.series.filter(s=>s.pts[i]!=null).map(s=>`<circle cx="${x}" cy="${c.sy(s.pts[i])}" r="4.5" fill="${s.color}" stroke="#fff" stroke-width="2"/>`).join("");
 const box=svg.parentNode;let t=box.querySelector(".tip");if(!t){t=document.createElement("div");t.className="tip";box.appendChild(t)}
 t.innerHTML=`<div class="td">${wd(c.dates[i])}</div>`+(c.tip?c.tip(i,c.series):"");t.style.display="block";
 const px=x*k+(r.left-box.getBoundingClientRect().left),tw=t.offsetWidth,bw=box.clientWidth;let L=px+12;if(L+tw>bw)L=px-12-tw;t.style.left=Math.max(0,L)+"px";t.style.top="4px"}
document.addEventListener("pointermove",e=>{const svg=e.target.closest&&e.target.closest("svg[data-cid]");document.querySelectorAll("svg[data-cid] .hv").forEach(g=>{const s=g.ownerSVGElement;if(s!==svg&&g.style.display!="none")hvHide(s)});if(svg)hvMove(svg,e.clientX)});
document.addEventListener("pointerdown",e=>{const svg=e.target.closest&&e.target.closest("svg[data-cid]");if(svg)hvMove(svg,e.clientX)});
document.addEventListener("pointerleave",e=>{if(e.target.matches&&e.target.matches("svg[data-cid]"))hvHide(e.target)},true);
document.addEventListener("pointercancel",e=>{const svg=e.target.closest&&e.target.closest("svg[data-cid]");if(svg)hvHide(svg)});
document.addEventListener("pointerup",e=>{if(e.pointerType!="mouse"){const svg=e.target.closest&&e.target.closest("svg[data-cid]");if(svg)setTimeout(()=>hvHide(svg),1500)}});
/* render */
if(has("#asof"))$("#asof").textContent="Data as of "+D.asof+" · latest daily bar "+md(D.lastbar);if(has("#topline")){$("#topline").textContent=D.topline;$("#newsdate").textContent="From today's digest: "+D.news_date}
if(has("#snap"))$("#snap").innerHTML=D.snap.map(s=>{const h=D.hist[s.sym];if(!h)return"";const n=h.length,v=h[n-1][1],ch=s.sym==="^TNX"?(v-h[n-2][1])*100:pc(v,h[n-2][1]);
 const cs=s.sym==="^TNX"?`<span class="chg ${ch>=0?"up":"dn"} num">${ch>=0?"+":""}${ch.toFixed(0)} bp</span>`:`<span class="chg num">${fp(ch)}</span>`;
 return`<div class="sc"><div class="n">${esc(s.name)}</div><div class="v num">${s.pre}${fmt(v,s.dec)}${s.suf}</div><div class="row">${cs}${spark(h)}</div></div>`}).join("");
const COLS=[["t","Ticker"],["price","Price"],["d1","Day"],["d5","5 day"],["m1","1 month"],["ytd","YTD"]];
let sortK="d1",sortD=-1,sel=null;const P=Object.fromEntries(D.tickers.map(t=>[t,perf(t)]));
function renderWL(){const th=$("#wl thead tr");th.innerHTML=COLS.map(([k,l],i)=>`<th data-k="${k}" class="${k==sortK?"on":""} ${i>=4?"hide-m":""}">${l}${k==sortK?`<span class="ar">${sortD<0?"▼":"▲"}</span>`:""}</th>`).join("");
 th.querySelectorAll("th").forEach(e=>e.onclick=()=>{const k=e.dataset.k;sortD=k==sortK?-sortD:(k=="t"?1:-1);sortK=k;renderWL()});
 const ts=D.tickers.filter(t=>D.hist[t]).sort((a,b)=>sortK=="t"?sortD*a.localeCompare(b):sortD*((P[a][sortK]??-1e9)-(P[b][sortK]??-1e9)));
 $("#wl tbody").innerHTML=ts.map(t=>{const p=P[t];return`<tr data-t="${t}" class="${t==sel?"sel":""}"><td><span class="tk">${t}</span><span class="nm">${esc(D.tick[t].name)}</span></td><td class="num">$${fmt(p.price)}</td><td class="num">${fp(p.d1)}</td><td class="num">${fp(p.d5)}</td><td class="num hide-m">${fp(p.m1)}</td><td class="num hide-m">${fp(p.ytd)}</td></tr>`}).join("");
 $("#wl tbody").querySelectorAll("tr").forEach(r=>r.onclick=()=>select(r.dataset.t,true));if(!sel)select(ts[0])}
let dRange="3M";
function select(t,scroll){sel=t;if(scroll)history.replaceState(null,"","#"+t);document.querySelectorAll("#wl tbody tr").forEach(r=>r.classList.toggle("sel",r.dataset.t==t));renderDetail();if(scroll&&innerWidth<1100)$("#detail").scrollIntoView({behavior:"smooth",block:"start"})}
function renderDetail(){const t=sel,x=D.tick[t],p=P[t],h=D.hist[t],i0=since(h,dRange),seg=h.slice(i0),pts=seg.map(z=>z[1]);
 const room=x.target?pc(x.target,p.price):null,rp=x.rating?`<span class="pill ${x.rating=="Hold"?"h":x.rating=="Sell"?"s":""}">${x.rating}</span>`:'<span class="cap">No coverage</span>';
 const e=x.earnings;const rng=pc(pts[pts.length-1],pts[0]);
 const nws=(D.news[t]||[]).map(i=>`<div class="it"><div class="h">${esc(i.headline)}</div>${i.summary?`<div class="b">${esc(i.summary)}</div>`:""}<div class="m"><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.source)}</a></div></div>`).join("");
 const lds=D.leaders.filter(l=>(l.tickers||[]).includes(t)).map(l=>`<div class="it"><div class="h">${esc(l.name)} <span class="cap" style="font-weight:400">${esc(l.title||"")}</span></div><div class="b">${esc(l.text)}</div><div class="m">${esc(l.format)} · ${esc(l.date)} · <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.source)}</a></div></div>`).join("");
 $("#detail").innerHTML=`<div class="dh"><span class="t">${t}</span><span class="cap" style="font-size:15px">${esc(x.name)}</span><span class="p num">$${fmt(p.price)}</span><span class="chg num">${fp(p.d1)}</span></div>
 <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0 8px;flex-wrap:wrap"><span class="seg" id="dr">${["1M","3M","6M","1Y","YTD"].map(r=>`<button class="${r==dRange?"on":""}">${r}</button>`).join("")}</span><span class="cap num">${dRange}: ${fp(rng)}</span></div>
 <div class="chart" id="dchart">${axisChart([{pts,color:NAVY,w:2,label:1}],{W:Math.max(300,($("#detail").clientWidth||800)-48),H:innerWidth<640?220:300,dates:seg.map(z=>z[0]),yf:v=>"$"+fmt(v,(Math.max(...pts)-Math.min(...pts))>=8?0:2),area:1,tip:(i,S)=>`<div class="tv num">$${fmt(S[0].pts[i])}</div>`,extra:x.target?[x.target]:[],hlines:x.target?[{v:x.target,color:"#6B7178",label:"Avg target $"+fmt(x.target)}]:[]})}</div>
 <div class="stats"><div><div class="k">Analysts</div><div class="v">${rp}</div>${x.n?`<div class="cap">${x.n} analysts</div>`:""}</div>
 <div><div class="k">Avg target</div><div class="v num">${x.target?"$"+fmt(x.target):"n/a"}</div>${x.low?`<div class="cap num">Range $${fmt(x.low,0)} to $${fmt(x.high,0)}</div>`:""}</div>
 <div><div class="k">Room to target</div><div class="v num">${room==null?"n/a":fp(room,1)}</div></div>
 <div><div class="k">Next earnings</div><div class="v">${e?wd(e.date):x.fund?"n/a (fund)":"Not set"}</div>${e&&e.eps!=null?`<div class="cap num">EPS est. $${fmt(e.eps)}</div>`:""}</div></div>
 <div class="sub2" style="margin-top:0">Latest news</div><div class="items">${nws||'<div class="empty">No major news in today\'s digest.</div>'}</div>
 <div class="sub2">Leaders on the record</div><div class="items">${lds||'<div class="empty">No new commentary in today\'s digest.</div>'}</div>`;
 $("#dr").querySelectorAll("button").forEach(b=>b.onclick=()=>{dRange=b.textContent;renderDetail()})}
/* analysts */
(function(){if(!has("#bars"))return;const r=D.tickers.filter(t=>D.tick[t]?.target).map(t=>({t,room:pc(D.tick[t].target,P[t].price)})).sort((a,b)=>b.room-a.room);
 const mx=Math.max(...r.map(z=>Math.abs(z.room))),neg=r.some(z=>z.room<0),mn=Math.min(0,...r.map(z=>z.room)),span=Math.max(...r.map(z=>z.room))-mn,zp=-mn/span*100;
 $("#bars").innerHTML=r.map(z=>{const l=z.room>=0?zp:zp+z.room/span*100,w=Math.abs(z.room)/span*100;return`<div class="bar" data-t="${z.t}"><span class="tk">${z.t}</span><span class="tr"><span class="z" style="left:${zp}%"></span><span class="f ${z.room<0?"n":""}" style="left:${l}%;width:${w}%"></span></span><span class="v num ${z.room>=0?"up":"dn"}">${z.room>=0?"+":""}${z.room.toFixed(0)}%</span></div>`}).join("");
 $("#bars").querySelectorAll(".bar").forEach(b=>b.onclick=()=>select(b.dataset.t,true));
 $("#anotes").innerHTML=(D.notes.length?`<p style="margin:16px 0 0"><b>Worth noting:</b> ${esc(D.notes.join(" "))}</p>`:"")+`<div class="cap" style="margin-top:8px">No targets for ${esc(D.uncovered.join(", "))}. Wall Street consensus via Yahoo Finance.</div>`})();
/* calendar */
const EARN=D.cal.filter(c=>c.kind=="Earnings"),MAC=D.cal.filter(c=>c.kind!="Earnings");
const calRow=c=>`<tr><td><div class="d">${wd(c.date)}</div><div class="cap">${esc(c.time||"Time TBC")}</div></td><td><div class="tag">${c.kind}</div><div style="font-weight:600">${esc(c.title)}</div><div class="cap">${[c.eps!=null?"EPS est. $"+fmt(c.eps):"",c.note].filter(Boolean).map(esc).join(" · ")}${c.url?` · <a href="${esc(c.url)}" target="_blank" rel="noopener">Source</a>`:""}</div></td></tr>`;
if(has("#macrocal")){if(MAC.length)$("#macrocal tbody").innerHTML=MAC.map(calRow).join("");else $("#macrocal").remove()}
if(has("#cal"))$("#cal tbody").innerHTML=EARN.length?EARN.map(c=>`<tr><td><div class="d">${wd(c.date)}</div><div class="cap">${esc(c.time||"Time TBC")}</div></td><td><div class="tag">${c.kind}</div><div style="font-weight:600">${esc(c.title)}</div><div class="cap">${[c.eps!=null?"EPS est. $"+fmt(c.eps):"",c.note].filter(Boolean).map(esc).join(" · ")}${c.url?` · <a href="${esc(c.url)}" target="_blank" rel="noopener">Source</a>`:""}</div></td></tr>`).join(""):'<tr><td class="empty">Nothing scheduled.</td></tr>';
if(D.macro_note&&has("#macro"))$("#macro").innerHTML=`<p style="margin:${has("#macrocal")?16:0}px 0 0"><b>Macro:</b> ${esc(D.macro_note)}</p>${D.macro_source?`<div class="cap"><a href="${esc(D.macro_source.url)}" target="_blank" rel="noopener">${esc(D.macro_source.source)}</a></div>`:""}`;
/* comparison */
let cRange="3M";const on=new Set(["SPY","WL","NVDA","MSFT","JPM"]);const keys=["WL",...D.tickers.filter(t=>D.hist[t])];const col=k=>k=="WL"?NAVY:k=="SPY"?INK:PAL[(D.tickers.indexOf(k)%12)+1];
function cmp(){const sh=D.hist.SPY,i0=since(sh,cRange),dates=sh.slice(i0).map(z=>z[0]);
 const ser=k=>{if(k=="WL"){const s=D.tickers.filter(t=>D.hist[t]).map(t=>ser(t));return dates.map((_,i)=>{const v=s.map(a=>a[i]).filter(x=>x!=null);return v.reduce((a,b)=>a+b,0)/v.length})}
  const m=new Map(D.hist[k].map(z=>[z[0],z[1]]));let last=null;const raw=dates.map(d=>{if(m.has(d))last=m.get(d);return last});const b=raw.find(v=>v!=null);return raw.map(v=>v==null?null:(v/b-1)*100)};
 $("#chips").innerHTML=keys.map(k=>`<button class="chip ${on.has(k)?"on":""}" data-k="${k}"><i style="background:${on.has(k)?col(k):LINE}"></i>${k=="WL"?"Benites Capital portfolio (equal-weight)":k}</button>`).join("");
 $("#chips").querySelectorAll(".chip").forEach(c=>c.onclick=()=>{const k=c.dataset.k;on.has(k)?on.delete(k):on.add(k);cmp()});
 const S=keys.filter(k=>on.has(k)).map(k=>({pts:ser(k),color:col(k),w:k=="WL"?3:k=="SPY"?2.5:1.75,label:k}));
 $("#cmp").innerHTML=S.length?axisChart(S,{W:Math.max(300,$("#cmp").clientWidth||1200),H:innerWidth<640?260:340,dates,yf:v=>(v>0?"+":"")+fmt(v,0)+"%",zero:1,tip:(i,S)=>S.filter(s=>s.pts[i]!=null).slice().sort((a,b)=>b.pts[i]-a.pts[i]).map(s=>`<div class="tr"><b style="color:${s.color}">${s.label=="WL"?"Portfolio":s.label}</b><span class="num">${fp(s.pts[i],1)}</span></div>`).join("")})+`<div class="chips" style="margin:12px 0 0">${S.map(s=>{const v=s.pts[s.pts.length-1];return`<span class="cap num"><b style="color:${s.color}">${s.label=="WL"?"Portfolio":s.label}</b> ${fp(v,1)}</span>`}).join("")}</div>`:'<div class="empty">Select at least one line.</div>';
 $("#cmpr").innerHTML=["1M","3M","6M","1Y","YTD"].map(r=>`<button class="${r==cRange?"on":""}">${r}</button>`).join("");$("#cmpr").querySelectorAll("button").forEach(b=>b.onclick=()=>{cRange=b.textContent;cmp()})}
if(has("#big"))$("#big").innerHTML=D.big.map(b=>`<div class="it"><div class="h">${esc(b.headline)}</div><div class="b">${esc(b.why)}</div><div class="m"><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.source)}</a></div></div>`).join("");
/* treasuries */
let uRange="1Y";const UST=D.ust||{};
function bp(a,b){return a==null||b==null?null:(a-b)*100}
const fbp=v=>v==null?'<span class="cap">n/a</span>':`<span class="${v>=0?"up":"dn"}">${v>=0?"+":""}${v.toFixed(0)} bp</span>`;
if(has("#usttiles"))$("#usttiles").innerHTML=[["y2","2-yr (futures)"],["y5","5-yr"],["y10","10-yr"],["y30","30-yr"]].map(([k,l])=>{const h=UST[k];if(!h||h.length<2)return"";const n=h.length,v=h[n-1][1];
 return`<div class="sc"><div class="n">${l} yield</div><div class="v num">${fmt(v,2)}%</div><div class="row"><span class="chg num">${fbp(bp(v,h[n-2][1]))} day</span>${spark(h)}</div><div class="cap">Close ${md(h[n-1][0])}</div></div>`}).join("");
function renderUST(){const h=UST.y10;if(!h){$("#usthist").innerHTML='<div class="empty">Treasury data unavailable.</div>';return}
 const i0=uRange=="5Y"?0:since(h,uRange),seg=h.slice(i0),pts=seg.map(z=>z[1]);
 $("#ur").innerHTML=["1M","3M","6M","1Y","5Y"].map(r=>`<button class="${r==uRange?"on":""}">${r}</button>`).join("");$("#ur").querySelectorAll("button").forEach(b=>b.onclick=()=>{uRange=b.textContent;renderUST()});
 $("#urc").innerHTML=`${uRange}: ${fbp(bp(pts[pts.length-1],pts[0]))}`;
 const W=Math.max(300,($("#ustc").clientWidth||800)-48);
 $("#uchart").innerHTML=axisChart([{pts,color:NAVY,w:2,label:1}],{W,H:innerWidth<640?220:300,dates:seg.map(z=>z[0]),yf:v=>fmt(v,2)+"%",area:1,tip:(i,S)=>{const d=i>0?bp(S[0].pts[i],S[0].pts[i-1]):null;return`<div class="tv num">${fmt(S[0].pts[i],3)}%</div>${d!=null?`<div class="num">${fbp(d)} vs prior day</div>`:""}`}})}
let tvDone=false;function loadTV(){if(tvDone)return;tvDone=true;const w=$("#tvw");w.innerHTML='<div class="tradingview-widget-container" style="height:100%;width:100%"><div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div></div>';
 const sc=document.createElement("script");sc.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";sc.async=true;
 sc.text=JSON.stringify({autosize:true,symbol:"US10Y",interval:"5",range:"1D",timezone:"America/New_York",theme:"light",style:"3",locale:"en",allow_symbol_change:false,hide_side_toolbar:true,hide_volume:true,save_image:false,calendar:false,backgroundColor:"#ffffff",gridColor:"rgba(233,236,239,1)",support_host:"https://www.tradingview.com"});
 w.firstChild.appendChild(sc)}
if(has("#ustab")){$("#ustab").querySelectorAll("button").forEach((b,j)=>b.onclick=()=>{$("#ustab").querySelectorAll("button").forEach((x,k)=>x.classList.toggle("on",k==j));$("#ustlive").style.display=j?"none":"";$("#usthist").style.display=j?"":"none";if(j)renderUST();else loadTV()});
if(location.hash=="#hist")$("#ustab button:last-child").click();else loadTV()}
/* subscribe: swap SUB_ENDPOINT for a Google Form / Formspree URL later (then POST instead of mailto) */
const SUB_ENDPOINT="mailto:benitescapital@gmail.com";
document.querySelectorAll("form[data-sub]").forEach(f=>f.onsubmit=e=>{e.preventDefault();const em=f.email.value.trim(),m=f.querySelector(".msg");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){m.textContent="Enter a valid email address.";f.email.focus();return}
 if(SUB_ENDPOINT.startsWith("mailto:")){location.href=SUB_ENDPOINT+"?subject="+encodeURIComponent("Subscribe: Benites Capital daily digest")+"&body="+encodeURIComponent("Please add me to the Benites Capital daily digest.\n\nEmail: "+em);m.textContent="Your email app should open. Hit send and we'll add you to the list."}
 else fetch(SUB_ENDPOINT,{method:"POST",headers:{Accept:"application/json"},body:new FormData(f)}).then(r=>{m.textContent=r.ok?"You're on the list.":"Something went wrong. Try again."}).catch(()=>m.textContent="Something went wrong. Try again.")});
/* news page */
const item=i=>`<div class="it"><div class="h">${esc(i.headline)}</div>${i.summary?`<div class="b">${esc(i.summary)}</div>`:""}<div class="m"><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.source)}</a></div></div>`;
if(has("#stock"))$("#stock").innerHTML=D.tickers.filter(t=>(D.news[t]||[]).length).map(t=>`<div class="sn"><div class="sub2" style="margin:0 0 8px"><a href="portfolio.html#${t}">${t}</a> <span class="cap" style="font-weight:400">${esc(D.tick[t]?.name||"")}</span></div><div class="items">${D.news[t].map(item).join("")}</div></div>`).join("")||'<div class="empty">No stock news in today\'s digest.</div>';
if(has("#leaders"))$("#leaders").innerHTML=D.leaders.map(l=>`<div class="it"><div class="h">${esc(l.name)} <span class="cap" style="font-weight:400">${esc(l.title||"")}</span></div><div class="b">${esc(l.text)}</div><div class="m">${esc(l.format)} · ${esc(l.date)} · <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.source)}</a></div></div>`).join("")||'<div class="empty">No new commentary in today\'s digest.</div>';
/* overview previews */
if(has("#pv-ust")){const h=UST.y10;if(h){const n=h.length,v=h[n-1][1];$("#pv-ust").innerHTML=`<div class="big1 num">${fmt(v,2)}%</div><div class="chg num">${fbp(bp(v,h[n-2][1]))} today</div><div style="margin-top:12px">${spark(h).replace('width="80" height="28"','width="100%" height="56" preserveAspectRatio="none"')}</div><div class="cap">10-year yield, last 30 sessions</div>`}}
if(has("#pv-mov")){const ts=D.tickers.filter(t=>D.hist[t]).sort((a,b)=>P[b].d1-P[a].d1),pick=[...ts.slice(0,3),...ts.slice(-3)];$("#pv-mov").innerHTML=pick.map(t=>`<div class="mv"><a href="portfolio.html#${t}"><b>${t}</b></a><span class="num">$${fmt(P[t].price)} &nbsp;${fp(P[t].d1)}</span></div>`).join("")}
if(has("#pv-earn"))$("#pv-earn").innerHTML=EARN.slice(0,3).map(c=>`<div class="mv"><span><b>${esc(c.t||c.title)}</b> <span class="cap">${esc(c.time||"")}</span></span><span class="num" style="color:var(--blue);font-weight:600">${md(c.date)}</span></div>`).join("")||'<div class="empty">No earnings in the next 14 days.</div>';
if(has("#pv-big"))$("#pv-big").innerHTML=D.big.slice(0,2).map(b=>`<div class="it" style="margin-bottom:12px"><div class="h">${esc(b.headline)}</div><div class="m"><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.source)}</a></div></div>`).join("");
/* header nav: hover (CSS) + click + keyboard; mobile drawer */
(function(){const dds=[...document.querySelectorAll(".dd")],close=x=>dds.forEach(d=>{if(d!==x){d.classList.remove("open");d.querySelector(".ddb").setAttribute("aria-expanded","false")}});
 dds.forEach(d=>{const b=d.querySelector(".ddb"),links=[...d.querySelectorAll(".ddm a")];
  b.onclick=e=>{e.stopPropagation();const o=!d.classList.contains("open");if(innerWidth>900)close(d);d.classList.toggle("open",o);b.setAttribute("aria-expanded",o)};
  b.onkeydown=e=>{if(e.key=="ArrowDown"){e.preventDefault();e.stopPropagation();close(d);d.classList.add("open");b.setAttribute("aria-expanded","true");links[0].focus()}};
  d.onkeydown=e=>{const i=links.indexOf(document.activeElement);if(e.key=="Escape"){d.classList.remove("open");b.setAttribute("aria-expanded","false");b.focus()}
   else if(i>=0&&(e.key=="ArrowDown"||e.key=="ArrowUp")){e.preventDefault();links[(i+(e.key=="ArrowDown"?1:links.length-1))%links.length].focus()}};
  d.addEventListener("focusout",e=>{if(!d.contains(e.relatedTarget)&&innerWidth>900){d.classList.remove("open");b.setAttribute("aria-expanded","false")}})});
 document.addEventListener("click",e=>{if(innerWidth>900&&!e.target.closest(".dd"))close()});
 const hb=$(".hamb");hb.onclick=()=>{const o=!document.body.classList.contains("drawer");document.body.classList.toggle("drawer",o);hb.setAttribute("aria-expanded",o);if(o){const a=$(".dd.on");if(a){a.classList.add("open");a.querySelector(".ddb").setAttribute("aria-expanded","true")}}};
 document.querySelectorAll(".mnav a").forEach(a=>a.addEventListener("click",()=>{document.body.classList.remove("drawer");hb.setAttribute("aria-expanded","false");close()}));
 addEventListener("resize",()=>{if(innerWidth>900)document.body.classList.remove("drawer")});
 document.querySelectorAll('a[href^="#s-sub"]').forEach(a=>a.addEventListener("click",e=>{const t=$(a.getAttribute("href"));if(t){e.preventDefault();t.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>t.querySelector("input").focus({preventScroll:true}),500)}}))})();
/* ticker deep link: portfolio.html#NVDA */
if(has("#wl")){const hk=decodeURIComponent(location.hash.slice(1)).toUpperCase();const dl=D.tickers.includes(hk);renderWL();if(dl)select(hk);if(dl)setTimeout(()=>$("#detail").scrollIntoView({block:"start"}),50)}
if(has("#cmp"))cmp();let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(has("#detail")&&sel)renderDetail();if(has("#cmp"))cmp();if(has("#usthist")&&$("#usthist").style.display!="none")renderUST()},150)});

