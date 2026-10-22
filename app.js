const LOGOS=window.BC_LOGOS||{};const lg=(t,c="")=>LOGOS[t]?`<span class="lg ${c}"><img src="${LOGOS[t]}" alt="" loading="lazy" onerror="if(!this.dataset.r&&this.src.slice(0,5)!='data:'){this.dataset.r=1;this.src=this.src.split('#')[0]+'&r='+Date.now();return}this.parentNode.classList.add('mono');this.parentNode.textContent='${t}'.slice(0,2)"></span>`:`<span class="lg mono ${c}" aria-hidden="true">${t.replace(/[^A-Z]/g,"").slice(0,2)}</span>`;
const D=window.BC_DATA,has=s=>!!document.querySelector(s);
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NAVY="var(--pf)",INK="var(--ink)",MUTE="var(--mute)",LINE="var(--line)",PAL=["var(--ink)"];const cv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const pc=(a,b)=>b?((a/b)-1)*100:null;
const fmt=(v,d=2)=>v==null?"n/a":v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fp=(v,d=2)=>v==null?'<span class="cap">n/a</span>':`<span class="${v>=0?"up":"dn"}">${v>=0?"+":""}${fmt(v,d)}%</span>`;
const md=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const wd=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
function back(h,days){const end=new Date(h[h.length-1][0]);const st=new Date(end);st.setDate(st.getDate()-days);const k=st.toISOString().slice(0,10);let i=h.findIndex(p=>p[0]>=k);return i<0?0:i}
function since(h,range){if(range==="YTD"){const y=h[h.length-1][0].slice(0,4);let i=h.findIndex(p=>p[0]>=y+"-01-01");return Math.max(0,i-1)}return back(h,{"1M":30,"3M":91,"6M":182,"1Y":365}[range])}
function perf(t){const h=D.hist[t];if(!h)return{};const n=h.length,c=h[n-1][1];return{price:c,d1:pc(c,h[n-2]?.[1]),d5:pc(c,h[n-6]?.[1]),m1:pc(c,h[since(h,"1M")][1]),ytd:pc(c,h[since(h,"YTD")][1])}}
/* svg helpers */
function line(pts,W,H,P,lo,hi,color,w=2,dash=""){if(pts.length<2)return"";const sx=i=>P.l+i*(W-P.l-P.r)/(pts.length-1),sy=v=>P.t+(hi-v)/(hi-lo||1)*(H-P.t-P.b);
 return`<path d="${pts.map((v,i)=>(i?"L":"M")+sx(i).toFixed(1)+" "+sy(v).toFixed(1)).join("")}" fill="none" style="stroke:${color}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:""} stroke-linejoin="round" stroke-linecap="round"/>`}
function ticks(lo,hi,n=5){const s=(hi-lo)/n,m=Math.pow(10,Math.floor(Math.log10(s||1))),st=[1,2,2.5,5,10].map(x=>x*m).find(x=>x>=s)||s;const out=[];for(let v=Math.ceil(lo/st)*st;v<=hi+1e-9;v+=st)out.push(+v.toFixed(6));return out}
function spark(h){const p=h.slice(-30).map(x=>x[1]),lo=Math.min(...p),hi=Math.max(...p),up=p[p.length-1]>=p[0];
 return`<svg viewBox="0 0 80 28" width="80" height="28">${line(p,80,28,{l:1,r:1,t:2,b:2},lo,hi,up?NAVY:INK,1.5)}</svg>`}
const CH={};let chN=0;
function axisChart(series,opt){/* series:[{pts,color,w,label}] dates:[] */
 const W=opt.W||760,H=opt.H||300,P={l:8,r:56,t:12,b:28};let all=series.flatMap(s=>s.pts).filter(v=>v!=null);(opt.extra||[]).forEach(v=>all.push(v));
 let lo=Math.min(...all),hi=Math.max(...all);const pad=(hi-lo)*.06||1;lo-=pad;hi+=pad;const T=ticks(lo,hi,opt.zero?7:5),sy=v=>P.t+(hi-v)/(hi-lo)*(H-P.t-P.b);
 let g=T.map(v=>`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(v)}" y2="${sy(v)}" style="stroke:${LINE}"/><text x="${W-P.r+8}" y="${sy(v)+4}" font-size="12" style="fill:${MUTE}" class="num">${opt.yf(v)}</text>`).join("");
 if(opt.zero&&lo<0&&hi>0)g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(0)}" y2="${sy(0)}" style="stroke:${MUTE}"/>`;
 const d=opt.dates,n=d.length,sx=i=>P.l+i*(W-P.l-P.r)/(n-1);(n<=8?d.map((_,i)=>i):[0,Math.round((n-1)/3),Math.round(2*(n-1)/3),n-1]).forEach(i=>{g+=`<text x="${sx(i)}" y="${H-8}" font-size="12" style="fill:${MUTE}" text-anchor="${i==0?"start":i==n-1?"end":"middle"}">${md(d[i])}</text>`});
 (opt.hlines||[]).forEach(h=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(h.v)}" y2="${sy(h.v)}" style="stroke:${h.color}" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${P.l+4}" y="${sy(h.v)-6}" font-size="12" font-weight="600" style="fill:${INK}">${esc(h.label)}</text>`});
 if(opt.area){const s=series[0];g+=``}
 g+=series.map(s=>line(s.pts,W,H,P,lo,hi,s.color,s.w||2,s.dash||"")).join("");
 const ends=series.filter(s=>s.label&&s.pts[s.pts.length-1]!=null).map(s=>({y:sy(s.pts[s.pts.length-1]),s}));
 g+=ends.map(e=>`<circle cx="${sx(n-1)}" cy="${e.y}" r="3.5" style="fill:${e.s.color}"/>`).join("");
 const id="c"+(++chN);CH[id]={W,H,P,sx,sy,n,dates:d,series,tip:opt.tip};
 return`<svg viewBox="0 0 ${W} ${H}" role="img" data-cid="${id}">${g}<g class="hv" style="display:none"></g></svg>`}
/* hover readout: delegated, survives re-renders */
function hvHide(svg){if(!svg)return;const g=svg.querySelector(".hv");if(g)g.style.display="none";const t=svg.parentNode.querySelector(".tip");if(t)t.style.display="none"}
function hvMove(svg,cx){const c=CH[svg.dataset.cid];if(!c||c.n<2)return;const r=svg.getBoundingClientRect(),k=r.width/c.W,vx=(cx-r.left)/k;
 const i=Math.max(0,Math.min(c.n-1,Math.round((vx-c.P.l)/(c.W-c.P.l-c.P.r)*(c.n-1)))),x=c.sx(i);
 const g=svg.querySelector(".hv");g.style.display="";g.innerHTML=`<line x1="${x}" x2="${x}" y1="${c.P.t}" y2="${c.H-c.P.b}" style="stroke:var(--ink)" stroke-dasharray="3 3"/>`+c.series.filter(s=>s.pts[i]!=null).map(s=>`<circle cx="${x}" cy="${c.sy(s.pts[i])}" r="4.5" style="fill:${s.color};stroke:var(--surf)" stroke-width="2"/>`).join("");
 const box=svg.parentNode;let t=box.querySelector(".tip");if(!t){t=document.createElement("div");t.className="tip";box.appendChild(t)}
 t.innerHTML=`<div class="td">${wd(c.dates[i])}</div>`+(c.tip?c.tip(i,c.series):"");t.style.display="block";
 const px=x*k+(r.left-box.getBoundingClientRect().left),tw=t.offsetWidth,bw=box.clientWidth;let L=px+12;if(L+tw>bw)L=px-12-tw;t.style.left=Math.max(0,L)+"px";t.style.top="4px"}
document.addEventListener("pointermove",e=>{const svg=e.target.closest&&e.target.closest("svg[data-cid]");document.querySelectorAll("svg[data-cid] .hv").forEach(g=>{const s=g.ownerSVGElement;if(s!==svg&&g.style.display!="none")hvHide(s)});if(svg)hvMove(svg,e.clientX)});
document.addEventListener("pointerdown",e=>{const svg=e.target.closest&&e.target.closest("svg[data-cid]");if(svg)hvMove(svg,e.clientX)});
document.addEventListener("pointerleave",e=>{if(e.target.matches&&e.target.matches("svg[data-cid]"))hvHide(e.target)},true);
document.addEventListener("pointercancel",e=>{const svg=e.target.closest&&e.target.closest("svg[data-cid]");if(svg)hvHide(svg)});
document.addEventListener("pointerup",e=>{if(e.pointerType!="mouse"){const svg=e.target.closest&&e.target.closest("svg[data-cid]");if(svg)setTimeout(()=>hvHide(svg),1500)}});
/* render */
if(has("#asof"))$("#asof").textContent="Closes as of "+md(D.lastbar)+" · updated "+D.asof.replace(/^\w+,? /,"").replace(/, \d{4},/,",");if(has("#topline")){$("#topline").textContent=D.topline;$("#newsdate").textContent="From today's digest"}
if(has("#snap"))$("#snap").innerHTML=D.snap.map(s=>{const h=D.hist[s.sym];if(!h)return"";const n=h.length,v=h[n-1][1],ch=s.sym==="^TNX"?(v-h[n-2][1])*100:pc(v,h[n-2][1]);
 const cs=s.sym==="^TNX"?`<span class="chg ${ch>=0?"up":"dn"} num">${ch>=0?"+":""}${ch.toFixed(0)} bp</span>`:`<span class="chg num">${fp(ch)}</span>`;
 return`<button class="sc sct" data-sym="${esc(s.sym)}" aria-controls="snp" title="Open chart"><div class="n">${esc(s.name)}<span class="lv">Chart ›</span></div><div class="v num">${s.pre}${fmt(v,s.dec)}${s.suf}</div><div class="row">${cs}${spark(h)}</div></button>`}).join("");
const COLS=[["t","Ticker"],["price","Close"],["d1","Day"],["d5","5 day"],["m1","1 month"],["ytd","YTD"]];
let sortK="d1",sortD=-1,sel=null;const P=Object.fromEntries(D.tickers.map(t=>[t,perf(t)]));
function renderWL(){const th=$("#wl thead tr");th.innerHTML=COLS.map(([k,l],i)=>`<th data-k="${k}" class="${k==sortK?"on":""} ${i>=4?"hide-m":""}">${l}${k==sortK?`<span class="ar">${sortD<0?"▼":"▲"}</span>`:""}</th>`).join("");
 th.querySelectorAll("th").forEach(e=>e.onclick=()=>{const k=e.dataset.k;sortD=k==sortK?-sortD:(k=="t"?1:-1);sortK=k;renderWL()});
 const ts=D.tickers.filter(t=>D.hist[t]).sort((a,b)=>sortK=="t"?sortD*a.localeCompare(b):sortD*((P[a][sortK]??-1e9)-(P[b][sortK]??-1e9)));
 $("#wl tbody").innerHTML=ts.map(t=>{const p=P[t];return`<tr data-t="${t}" class="${t==sel?"sel":""}"><td><span class="tkw">${lg(t)}<span><span class="tk">${t}</span><span class="nm">${esc(D.tick[t].name)}</span></span></span></td><td class="num">$${fmt(p.price)}</td><td class="num">${fp(p.d1)}</td><td class="num">${fp(p.d5)}</td><td class="num hide-m">${fp(p.m1)}</td><td class="num hide-m">${fp(p.ytd)}</td></tr>`}).join("");
 $("#wl tbody").querySelectorAll("tr").forEach(r=>r.onclick=()=>select(r.dataset.t,true));if(!sel)select(ts[0])}
let dRange="3M",dLive=true;
function select(t,scroll){sel=t;if(scroll)history.replaceState(null,"","#"+t);document.querySelectorAll("#wl tbody tr").forEach(r=>r.classList.toggle("sel",r.dataset.t==t));renderDetail();if(scroll&&innerWidth<1100)$("#detail").scrollIntoView({behavior:"smooth",block:"start"})}
function renderDetail(){const t=sel,x=D.tick[t],p=P[t],h=D.hist[t],i0=since(h,dRange),seg=h.slice(i0),pts=seg.map(z=>z[1]);
 const room=x.target?pc(x.target,p.price):null,rp=x.rating?`<span class="pill ${x.rating=="Hold"?"h":x.rating=="Sell"?"s":""}">${x.rating}</span>`:'<span class="cap">No coverage</span>';
 const e=x.earnings;const rng=pc(pts[pts.length-1],pts[0]);
 const nws=(D.news[t]||[]).map(i=>`<div class="it"><div class="h">${esc(i.headline)}</div>${i.summary?`<div class="b">${esc(i.summary)}</div>`:""}<div class="m"><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.source)}</a></div></div>`).join("");
 const lds=D.leaders.filter(l=>(l.tickers||[]).includes(t)).map(l=>`<div class="it"><div class="h">${esc(l.name)} <span class="cap" style="font-weight:400">${esc(l.title||"")}</span></div><div class="b">${esc(l.text)}</div><div class="m">${esc(l.format)} · ${esc(l.date)} · <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.source)}</a></div></div>`).join("");
 $("#detail").innerHTML=`<div class="dh">${lg(t,"l")}<span class="t">${t}</span><span class="cap" style="font-size:var(--t-body)">${esc(x.name)}</span><span class="p num">$${fmt(p.price)}</span><span class="chg num">${fp(p.d1)}</span></div>
 <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0 8px;flex-wrap:wrap"><span style="display:flex;gap:8px;flex-wrap:wrap"><span class="seg" id="dlv"><button class="${dLive?"":"on"}">History</button><button class="${dLive?"on":""}">Live</button></span><span class="seg" id="dr" style="${dLive?"display:none":""}">${["1M","3M","6M","1Y","YTD"].map(r=>`<button class="${r==dRange?"on":""}">${r}</button>`).join("")}</span></span><span class="cap num" style="${dLive?"display:none":""}">${dRange}: ${fp(rng)}</span></div>
 ${dLive?`<div class="tvw" id="dtv"></div><div class="cap" style="margin-top:8px">Live via TradingView.</div>`:""}
 <div style="${dLive?"display:none":""}"><div class="chart" id="dchart">${axisChart([{pts,color:NAVY,w:2,label:1}],{W:Math.max(300,($("#detail").clientWidth||800)-48),H:innerWidth<640?220:300,dates:seg.map(z=>z[0]),yf:v=>"$"+fmt(v,(Math.max(...pts)-Math.min(...pts))>=8?0:2),area:1,tip:(i,S)=>`<div class="tv num">$${fmt(S[0].pts[i])}</div>`,extra:x.target?[x.target]:[],hlines:x.target?[{v:x.target,color:INK,label:"Avg target $"+fmt(x.target)}]:[]})}</div>
${asofNote()}</div>
 <div class="stats"><div><div class="k">Analysts</div><div class="v">${rp}</div>${x.n?`<div class="cap">${x.n} analysts</div>`:""}</div>
 <div><div class="k">Avg target</div><div class="v num">${x.target?"$"+fmt(x.target):"n/a"}</div>${x.low?`<div class="cap num">Range $${fmt(x.low,0)} to $${fmt(x.high,0)}</div>`:""}</div>
 <div><div class="k">Room to target</div><div class="v num">${room==null?"n/a":fp(room,1)}</div></div>
 <div><div class="k">Next earnings</div><div class="v">${e?wd(e.date):x.fund?"n/a (fund)":"Not set"}</div>${e&&e.eps!=null?`<div class="cap num">EPS est. $${fmt(e.eps)}</div>`:""}</div></div>
 <div class="sub2" style="margin-top:0">Latest news</div><div class="items">${nws||'<div class="empty">No major news in today\'s digest.</div>'}</div>
 <div class="sub2">Leaders on the record</div><div class="items">${lds||'<div class="empty">No new commentary today.</div>'}</div>`;
 $("#dr").querySelectorAll("button").forEach(b=>b.onclick=()=>{dRange=b.textContent;renderDetail()});
 $("#dlv").querySelectorAll("button").forEach((b,k)=>b.onclick=()=>{dLive=k==1;renderDetail()});if(dLive)tvEmbed($("#dtv"),TV[t])}
/* analysts */
(function(){if(!has("#bars"))return;const r=D.tickers.filter(t=>D.tick[t]?.target).map(t=>({t,room:pc(D.tick[t].target,P[t].price)})).sort((a,b)=>b.room-a.room);
 const mx=Math.max(...r.map(z=>Math.abs(z.room))),neg=r.some(z=>z.room<0),mn=Math.min(0,...r.map(z=>z.room)),span=Math.max(...r.map(z=>z.room))-mn,zp=-mn/span*100;
 $("#bars").innerHTML=r.map(z=>{const l=z.room>=0?zp:zp+z.room/span*100,w=Math.abs(z.room)/span*100;return`<div class="bar" data-t="${z.t}"><span class="tk">${z.t}</span><span class="tr"><span class="z" style="left:${zp}%"></span><span class="f ${z.room<0?"n":""}" style="left:${l}%;width:${w}%"></span></span><span class="v num ${z.room>=0?"up":"dn"}">${z.room>=0?"+":""}${z.room.toFixed(0)}%</span></div>`}).join("");
 $("#bars").querySelectorAll(".bar").forEach(b=>b.onclick=()=>select(b.dataset.t,true));
 $("#anotes").innerHTML=(D.notes.length?`<p style="margin:16px 0 0"><b>Worth noting:</b> ${esc(D.notes.join(" "))}</p>`:"")+`<div class="cap" style="margin-top:8px">No targets for ${esc(D.uncovered.join(", "))}. Consensus via Yahoo Finance.</div>`})();
/* calendar */
const EARN=D.cal.filter(c=>c.kind=="Earnings"),MAC=D.cal.filter(c=>c.kind!="Earnings");
const calRow=c=>`<tr><td><div class="d">${wd(c.date)}</div><div class="cap">${esc(c.time||"Time TBC")}</div></td><td><div class="tag">${c.kind}</div><div style="font-weight:600">${c.t?`<a href="earnings.html?t=${esc(c.t)}" style="color:var(--ink)">${esc(c.title)}</a>`:esc(c.title)}</div><div class="cap">${[c.eps!=null?"EPS est. $"+fmt(c.eps):"",c.note].filter(Boolean).map(esc).join(" · ")}${c.url?` · <a href="${esc(c.url)}" target="_blank" rel="noopener">Source</a>`:""}</div></td></tr>`;
if(has("#macrocal")){if(MAC.length)$("#macrocal tbody").innerHTML=MAC.map(calRow).join("");else $("#macrocal").remove()}
if(has("#cal"))$("#cal tbody").innerHTML=EARN.length?EARN.map(c=>`<tr><td><div class="d">${wd(c.date)}</div><div class="cap">${esc(c.time||"Time TBC")}</div></td><td><div class="tag">${c.kind}</div><div style="font-weight:600">${c.t?`<a href="earnings.html?t=${esc(c.t)}" style="color:var(--ink)">${esc(c.title)}</a>`:esc(c.title)}</div><div class="cap">${[c.eps!=null?"EPS est. $"+fmt(c.eps):"",c.note].filter(Boolean).map(esc).join(" · ")}${c.url?` · <a href="${esc(c.url)}" target="_blank" rel="noopener">Source</a>`:""}</div></td></tr>`).join(""):'<tr><td class="empty">Nothing scheduled.</td></tr>';
if(D.macro_note&&has("#macro"))$("#macro").innerHTML=`<p style="margin:${has("#macrocal")?16:0}px 0 0"><b>Macro:</b> ${esc(D.macro_note)}</p>${D.macro_source?`<div class="cap"><a href="${esc(D.macro_source.url)}" target="_blank" rel="noopener">${esc(D.macro_source.source)}</a></div>`:""}`;
/* comparison */
let cRange="3M";const on=new Set(["SPY","WL"]);const HOLD=D.tickers.filter(t=>t!="SPY"&&D.hist[t]);let wlNote="";const keys=["WL",...D.tickers.filter(t=>D.hist[t])];const col=k=>k=="WL"?NAVY:k=="SPY"?INK:INK;const DASH=["","6 4","2 3","8 3 2 3"];const dsh=k=>k=="WL"||k=="SPY"?"":DASH[D.tickers.indexOf(k)%4];
function cmp(){const sh=D.hist.SPY,i0=since(sh,cRange),dates=sh.slice(i0).map(z=>z[0]);
 const ser=k=>{if(k=="WL"){/* equal-weight buy-and-hold from range start: mean of each holding's cumulative price return; holdings not trading at the range start are left out for that range */
  const all=HOLD.map(t=>[t,ser(t)]),inn=all.filter(([t,a])=>a[0]!=null),out=all.filter(([t,a])=>a[0]==null).map(([t])=>t);
  wlNote=`${inn.length} holdings, equal weight from the ${md(dates[0])} close. Price return, no dividends. SPY is the benchmark.`+(out.length?` ${out.join(" and ")} excluded, listed after range start.`:"");
  return dates.map((_,i)=>{const v=inn.map(([t,a])=>a[i]).filter(x=>x!=null);return v.reduce((a,b)=>a+b,0)/v.length})}
  const m=new Map(D.hist[k].map(z=>[z[0],z[1]]));let last=null;const raw=dates.map(d=>{if(m.has(d))last=m.get(d);return last});const b=raw.find(v=>v!=null);return raw.map(v=>v==null?null:(v/b-1)*100)};
 $("#chips").innerHTML=`<div class="chiprow">${["WL","SPY"].map(k=>`<button class="chip ${on.has(k)?"on":""}" data-k="${k}"><i style="background:${on.has(k)?col(k):LINE}"></i>${k=="WL"?"Benites Capital portfolio (equal-weight)":"SPY (S&P 500 benchmark)"}</button>`).join("")}</div><div class="chiprow"><span class="chl">Holdings</span>${HOLD.map(k=>`<button class="chip ${on.has(k)?"on":""}" data-k="${k}"><i style="background:${on.has(k)?col(k):LINE}"></i>${k}</button>`).join("")}</div>`;
 $("#chips").querySelectorAll(".chip").forEach(c=>c.onclick=()=>{const k=c.dataset.k;on.has(k)?on.delete(k):on.add(k);cmp()});
 const wlS=ser("WL");if(has("#cmpnote"))$("#cmpnote").textContent=wlNote;const S=keys.filter(k=>on.has(k)).map(k=>({pts:k=="WL"?wlS:ser(k),color:col(k),dash:dsh(k),w:k=="WL"?3:k=="SPY"?2.5:1.5,label:k}));
 $("#cmp").innerHTML=S.length?axisChart(S,{W:Math.max(300,$("#cmp").clientWidth||1200),H:innerWidth<640?260:340,dates,yf:v=>(v>0?"+":"")+fmt(v,0)+"%",zero:1,tip:(i,S)=>S.filter(s=>s.pts[i]!=null).slice().sort((a,b)=>b.pts[i]-a.pts[i]).map(s=>`<div class="tr"><b style="color:${s.color}">${s.label=="WL"?"Portfolio":s.label}</b><span class="num">${fp(s.pts[i],1)}</span></div>`).join("")})+`<div class="chips" style="margin:12px 0 0">${S.map(s=>{const v=s.pts[s.pts.length-1];return`<span class="cap num"><b style="color:${s.color}">${s.label=="WL"?"Portfolio":s.label}</b> ${fp(v,1)}${s.pts[0]==null?` <span class="cap">since ${md(dates[s.pts.findIndex(x=>x!=null)])} listing</span>`:""}</span>`}).join("")}</div>`:'<div class="empty">Select at least one line.</div>';
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
/* TradingView official free Advanced Chart widget (attribution kept as shipped). Lazy: only called when a Live tab opens. */
const TV={AXP:"NYSE:AXP",HHH:"NYSE:HHH",INTC:"NASDAQ:INTC",JPM:"NYSE:JPM",LMT:"NYSE:LMT",MRNA:"NASDAQ:MRNA",MSFT:"NASDAQ:MSFT",NVDA:"NASDAQ:NVDA",PS:"NYSE:PS",PSUS:"NYSE:PSUS",RJF:"NYSE:RJF",SPY:"AMEX:SPY",TSM:"NYSE:TSM",
 "BZ=F":"TVC:UKOIL","GC=F":"TVC:GOLD","^VIX":"CAPITALCOM:VIX","DX-Y.NYB":"CAPITALCOM:DXY","^TNX":"US10Y"};
const TVNOTE={"^VIX":"Live is a VIX CFD; may differ from History.","DX-Y.NYB":"Live is a dollar index CFD; may differ from History.","BZ=F":"Live is a Brent CFD; History is the front-month future.","GC=F":"Live is spot gold; History is the front-month future."};
function tvEmbed(w,symbol,o={}){if(!w)return;w.innerHTML='<div class="tradingview-widget-container" style="height:100%;width:100%"><div class="tradingview-widget-container__widget" style="height:calc(100% - 32px);width:100%"></div><div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a></div></div>';
 const sc=document.createElement("script");sc.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";sc.async=true;
 sc.text=JSON.stringify(Object.assign({autosize:true,symbol,interval:"D",range:"3M",timezone:"America/New_York",theme:"light",style:"3",locale:"en",allow_symbol_change:false,hide_side_toolbar:true,hide_volume:true,save_image:false,calendar:false,backgroundColor:cv("--surf"),gridColor:cv("--line"),lineColor:"#2962FF",topColor:"#2962FF",bottomColor:cv("--surf"),overrides:{"mainSeriesProperties.areaStyle.color1":"#2962FF","mainSeriesProperties.areaStyle.color2":cv("--surf"),"mainSeriesProperties.areaStyle.linecolor":"#2962FF"},support_host:"https://www.tradingview.com"},o));
 w.firstChild.appendChild(sc)}
let tvDone=false;function loadTV(){if(tvDone)return;tvDone=true;tvEmbed($("#tvw"),"US10Y",{interval:"5",range:"1D"})}
const asofNote=()=>"";
if(has("#ustab")){$("#ustab").querySelectorAll("button").forEach((b,j)=>b.onclick=()=>{$("#ustab").querySelectorAll("button").forEach((x,k)=>x.classList.toggle("on",k==j));$("#ustlive").style.display=j?"none":"";$("#usthist").style.display=j?"":"none";if(j)renderUST();else loadTV()});
if(location.hash=="#hist")$("#ustab button:last-child").click();else loadTV()}
/* subscribe: swap SUB_ENDPOINT for a Google Form / Formspree URL later (then POST instead of mailto) */
const SUB_ENDPOINT="mailto:benitescapital@gmail.com";
document.querySelectorAll("form[data-sub]").forEach(f=>f.onsubmit=e=>{e.preventDefault();const em=f.email.value.trim(),m=f.querySelector(".msg");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){m.textContent="Enter a valid email address.";f.email.focus();return}
 if(SUB_ENDPOINT.startsWith("mailto:")){location.href=SUB_ENDPOINT+"?subject="+encodeURIComponent("Subscribe: Benites Capital daily digest")+"&body="+encodeURIComponent("Please add me to the Benites Capital daily digest.\n\nEmail: "+em);m.textContent="Your email app will open. Hit send to join."}
 else fetch(SUB_ENDPOINT,{method:"POST",headers:{Accept:"application/json"},body:new FormData(f)}).then(r=>{m.textContent=r.ok?"You're on the list.":"Something went wrong. Try again."}).catch(()=>m.textContent="Something went wrong. Try again.")});
/* snapshot chart panel (index): History = our data, Live = TradingView */
let snSym=null,snLive=true,snRange="3M";
function renderSnap(){const pn=$("#snp");if(!snSym){pn.hidden=true;pn.innerHTML="";document.querySelectorAll(".sct").forEach(b=>b.classList.remove("on"));return}
 const s=D.snap.find(z=>z.sym==snSym),h=D.hist[snSym],tv=TV[snSym]&&snSym!="^TNX";document.querySelectorAll(".sct").forEach(b=>b.classList.toggle("on",b.dataset.sym==snSym));
 if(!tv)snLive=false;const i0=since(h,snRange),seg=h.slice(i0),pts=seg.map(z=>z[1]),yf=v=>s.pre+fmt(v,s.dec)+s.suf;pn.hidden=false;
 pn.innerHTML=`<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px"><b style="font-size:var(--t-card)">${esc(s.name)}</b>
 <span class="seg" id="snt"><button class="${snLive?"":"on"}">History</button>${tv?`<button class="${snLive?"on":""}">Live</button>`:""}</span>
 <span class="seg" id="snr" style="${snLive?"display:none":""}">${["1M","3M","6M","1Y"].map(r=>`<button class="${r==snRange?"on":""}">${r}</button>`).join("")}</span>
 <button class="x" id="snx" aria-label="Close chart">&times;</button></div>
 ${snLive?`<div class="tvw" id="sntv"></div><div class="cap" style="margin-top:8px">Live via TradingView. ${esc(TVNOTE[snSym]||"")}</div>`
 :`<div class="chart">${axisChart([{pts,color:NAVY,w:2,label:1}],{W:Math.max(300,pn.clientWidth||900),H:innerWidth<640?220:280,dates:seg.map(z=>z[0]),yf,area:1,tip:(i,S)=>`<div class="tv num">${yf(S[0].pts[i])}</div>`})}</div>${asofNote()}`}`;
 $("#snt").querySelectorAll("button").forEach((b,k)=>b.onclick=()=>{snLive=k==1;renderSnap()});$("#snr").querySelectorAll("button").forEach(b=>b.onclick=()=>{snRange=b.textContent;renderSnap()});
 $("#snx").onclick=()=>{snSym=null;renderSnap()};if(snLive)tvEmbed($("#sntv"),TV[snSym])}
if(has("#snp"))document.querySelectorAll(".sct").forEach(b=>b.onclick=()=>{if(snSym==b.dataset.sym){snSym=null}else{snSym=b.dataset.sym;snLive=!!TV[snSym]}renderSnap();if(snSym)$("#snp").scrollIntoView({behavior:"smooth",block:"nearest"})});
document.querySelectorAll(".asof2").forEach(e=>e.innerHTML=asofNote());
/* old anchors on news.html */
if(has("#s-earn")&&["#s-cal","#s-up","#s-feed"].includes(location.hash))setTimeout(()=>$(location.hash=="#s-feed"?"#s-big":"#s-earn").scrollIntoView(),50);
/* news page */
const item=i=>`<div class="it"><div class="h">${esc(i.headline)}</div>${i.summary?`<div class="b">${esc(i.summary)}</div>`:""}<div class="m"><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.source)}</a></div></div>`;
if(has("#stock"))$("#stock").innerHTML=D.tickers.filter(t=>(D.news[t]||[]).length).map(t=>`<div class="sn"><div class="sub2 lgh" style="margin:0 0 16px">${lg(t,"s")}<a href="portfolio.html#${t}">${t}</a> <span class="cap" style="font-weight:400">${esc(D.tick[t]?.name||"")}</span></div><div class="items">${D.news[t].map(item).join("")}</div></div>`).join("")||'<div class="empty">No stock news today.</div>';
if(has("#leaders"))$("#leaders").innerHTML=D.leaders.map(l=>`<div class="it"><div class="h">${esc(l.name)} <span class="cap" style="font-weight:400">${esc(l.title||"")}</span></div><div class="b">${esc(l.text)}</div><div class="m">${esc(l.format)} · ${esc(l.date)} · <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.source)}</a></div></div>`).join("")||'<div class="empty">No new commentary today.</div>';
/* overview previews */
if(has("#pv-ust")){const h=UST.y10;if(h){const n=h.length,v=h[n-1][1];$("#pv-ust").innerHTML=`<div class="big1 num">${fmt(v,2)}%</div><div class="chg num">${fbp(bp(v,h[n-2][1]))} today</div><div style="margin-top:12px">${spark(h).replace('width="80" height="28"','width="100%" height="56" preserveAspectRatio="none"')}</div><div class="cap">10-year yield, last 30 sessions</div>`}}
if(has("#pv-mov")){const ts=D.tickers.filter(t=>D.hist[t]).sort((a,b)=>P[b].d1-P[a].d1),pick=[...ts.slice(0,3),...ts.slice(-3)];$("#pv-mov").innerHTML=pick.map(t=>`<div class="mv"><a href="portfolio.html#${t}"><b>${t}</b></a><span class="num">$${fmt(P[t].price)} &nbsp;${fp(P[t].d1)}</span></div>`).join("")}
if(has("#pv-earn"))$("#pv-earn").innerHTML=EARN.slice(0,3).map(c=>`<div class="mv"><span><b>${c.t?`<a href="earnings.html?t=${esc(c.t)}" style="color:var(--ink)">${esc(c.t)}</a>`:esc(c.title)}</b> <span class="cap">${esc(c.time||"")}</span></span><span class="num" style="color:var(--blue);font-weight:600">${md(c.date)}</span></div>`).join("")||'<div class="empty">No earnings in the next 14 days.</div>';
if(has("#pv-big"))$("#pv-big").innerHTML=D.big.slice(0,2).map(b=>`<div class="it" style="margin-bottom:12px"><div class="h">${esc(b.headline)}</div><div class="m"><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.source)}</a></div></div>`).join("");
/* sidebar nav: mobile drawer */
(function(){const hb=$(".hamb"),setD=o=>{document.body.classList.toggle("drawer",o);hb.setAttribute("aria-expanded",o)};hb.onclick=()=>setD(!document.body.classList.contains("drawer"));
 $(".scrim").onclick=()=>setD(false);document.addEventListener("keydown",e=>{if(e.key=="Escape")setD(false)});addEventListener("resize",()=>{if(innerWidth>900)setD(false)});
 document.querySelectorAll(".sb a").forEach(a=>a.addEventListener("click",()=>setD(false)));
 document.querySelectorAll('a[href^="#s-sub"]').forEach(a=>a.addEventListener("click",e=>{const t=$(a.getAttribute("href"))||$("#s-sub2");if(t){e.preventDefault();setD(false);t.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>t.querySelector("input").focus({preventScroll:true}),500)}}))})();
/* page summary card: bullets generated from data only */
(function(){if(!has("#sumt"))return;const pgn=document.body.dataset.page,S=$("#sums"),pct=v=>fp(v);let L=[];
 const sents=t=>String(t||"").split(/(?<=[.!?])\s+(?=[A-Z"\u201C])/).map(x=>esc(x.trim())).filter(Boolean);
 if(pgn=="markets"){L=Array.isArray(D.topline_points)&&D.topline_points.length?D.topline_points.map(esc):sents(D.topline);S.textContent="From today's digest"}
 else if(pgn=="index"){const hs=D.tickers.filter(t=>t!="SPY"&&P[t]&&P[t].d1!=null),wl=hs.reduce((a,t)=>a+P[t].d1,0)/hs.length,sp=P.SPY?.d1,srt=hs.slice().sort((a,b)=>P[b].d1-P[a].d1),hi=srt[0],lo=srt[srt.length-1];
  L=[`Portfolio <b>${pct(wl)}</b> today${sp==null?"":`, ${wl>=sp?"ahead of":"behind"} SPY at ${pct(sp)}`}.`,`Top mover: <b>${hi}</b> ${pct(P[hi].d1)} (${esc(D.tick[hi].name)}).`,`Bottom mover: <b>${lo}</b> ${pct(P[lo].d1)} (${esc(D.tick[lo].name)}).`];
  S.textContent=`Equal weight, ${hs.length} holdings vs prior close.`}
 else if(pgn=="calendar"){const now=D.lastbar,lim=new Date(now+"T12:00:00");lim.setDate(lim.getDate()+7);const k=lim.toISOString().slice(0,10);let ev=D.cal.filter(c=>c.date>=now&&c.date<=k);if(!ev.length)ev=D.cal.slice(0,3);
  L=ev.slice(0,3).map(c=>`<b>${wd(c.date)}</b>: ${esc(c.kind=="Earnings"?(c.t||c.title)+" earnings":c.title)}${c.time?" ("+esc(c.time.toLowerCase())+")":""}.`);
  if(D.macro_note)L.push("Macro: "+esc(D.macro_note));if(!L.length)L=["Nothing scheduled in the next 14 days."];S.textContent="Earnings dates via Yahoo Finance; macro from today's digest."}
 else if(pgn=="earnings"&&D.earn){const E=D.earn,ts=Object.keys(E),rec=ts.filter(t=>E[t].history.length).sort((a,b)=>E[b].history.at(-1).date.localeCompare(E[a].history.at(-1).date)),up=ts.filter(t=>E[t].next).sort((a,b)=>E[a].next.date.localeCompare(E[b].next.date));
  const r=rec[0];if(r){const h=E[r].history.at(-1);L.push(`Latest: <b>${r}</b> ${md(h.date)}, EPS $${fmt(h.eps)} vs $${fmt(h.est)} est. (${fp(h.surprise,1)}).`)}
  up.slice(0,3).forEach(t=>L.push(`Next: <b>${t}</b> ${md(E[t].next.date)}${E[t].next.time?" "+E[t].next.time:""}.`));
  S.textContent="Via Yahoo Finance."}
 else if(pgn=="news"){const b=D.big[0],ev=D.cal.find(c=>c.date>=D.lastbar),ld=D.leaders[0];
  if(b)L.push(`Top story: <b>${esc(b.headline)}.</b> ${esc(b.why)}`);
  if(ev)L.push(`Next event: <b>${wd(ev.date)}</b>, ${esc(ev.kind=="Earnings"?(ev.t||ev.title)+" earnings":ev.title)}${ev.time?" ("+esc(ev.time.toLowerCase())+")":""}.`);
  const b2=D.big[1];if(b2)L.push(`Also: <b>${esc(b2.headline)}.</b>`);else if(ld)L.push(`${esc(ld.name)}: ${esc(ld.text)}`);
  S.innerHTML=(b?`<a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.source)}</a> · `:"")+"from today's digest"}
 $("#sumt").outerHTML=`<ul class="bul" id="sumt">${L.slice(0,4).map(x=>`<li>${x}</li>`).join("")}</ul>`})();
/* old overview anchors moved to markets.html */
if(has("#wl")&&["#s-snap","#ustc","#hist","#usttiles","#s-sub"].includes(location.hash)&&location.hash!="#s-sub")location.replace("markets.html"+location.hash);
/* ticker deep link: portfolio.html#NVDA */
if(has("#wl")){const hk=decodeURIComponent(location.hash.slice(1)).toUpperCase();const dl=D.tickers.includes(hk);renderWL();if(dl)select(hk);if(dl)setTimeout(()=>$("#detail").scrollIntoView({block:"start"}),50)}
if(has("#cmp"))cmp();let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(has("#detail")&&sel&&!dLive)renderDetail();if(has("#cmp"))cmp();if(has("#usthist")&&$("#usthist").style.display!="none")renderUST()},150)});



/* TradingView live widgets (free, official embeds, branding kept) */
function tvWidget(el,kind,cfg){if(!el)return;el.innerHTML='<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a></div></div>';
 const sc=document.createElement("script");sc.src="https://s3.tradingview.com/external-embedding/embed-widget-"+kind+".js";sc.async=true;sc.text=JSON.stringify(Object.assign({colorTheme:"light",isTransparent:true,locale:"en"},cfg));el.firstChild.appendChild(sc)}
const LIVE=D.tickers.filter(t=>TV[t]);
tvWidget($("#tape"),"ticker-tape",{symbols:LIVE.map(t=>({proName:TV[t],title:t})),showSymbolLogo:false,displayMode:"compact"});
tvWidget($("#liveq"),"market-quotes",{width:"100%",height:innerWidth<640?600:560,showSymbolLogo:false,symbolsGroups:[{name:"Holdings and SPY",originalName:"Holdings",symbols:LIVE.map(t=>({name:TV[t],displayName:t+" · "+((D.tick[t]||{}).name||t)}))}]});


/* earnings page */
if(has("#ecal")&&D.earn){
 const E=D.earn,TS=D.tickers.filter(t=>E[t]),run=D.lastbar,NM=t=>(D.tick[t]||{}).name||t;
 const money=v=>v==null?"n/a":(Math.abs(v)>=1e9?"$"+fmt(v/1e9,2)+"B":"$"+fmt(v/1e6,0)+"M");
 const days=(a,b)=>(new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5;
 const lastH=t=>E[t].history.at(-1),recent=t=>{const h=lastH(t);return h&&days(h.date,run)<=45&&days(h.date,run)>=-1};
 const chip=s=>s==null?"":`<span class="ech ${s>=0?"b":"m"}">${s>=0?"Beat":"Miss"}</span>`;
 const order=[...TS.filter(recent).sort((a,b)=>lastH(b).date.localeCompare(lastH(a).date)),
   ...TS.filter(t=>!recent(t)&&E[t].next).sort((a,b)=>E[a].next.date.localeCompare(E[b].next.date)),...TS.filter(t=>!recent(t)&&!E[t].next)];
 let cur=new URLSearchParams(location.search).get("t");cur=cur&&E[cur.toUpperCase()]?cur.toUpperCase():(order.find(recent)||order[0]);
 function cal(){$("#ecal").innerHTML=order.map(t=>{const r=recent(t),h=lastH(t),n=E[t].next;
   const when=r?`${md(h.date)}${h.time?" · "+h.time:""}`:n?`${md(n.date)}${n.time?" · "+n.time:""}`:"Date not set";
   return`<button class="ect${t==cur?" on":""}" data-t="${t}"><div class="ett"><span class="lgn">${lg(t,"s")}<b>${t}</b></span>${r?'<span class="ech r">Reported</span>':""}</div><div class="cap">${esc(NM(t))}</div><div class="ewn num${r?" rp":""}">${when}${r?chip(h.surprise):""}</div></button>`}).join("");
  $("#ecal").querySelectorAll(".ect").forEach(b=>b.onclick=()=>pick(b.dataset.t,1));
  $("#ecalnote").textContent=""}
 $("#esel").innerHTML=TS.map(t=>`<button role="tab" data-t="${t}" class="lgb">${t}${lg(t,"xs")}</button>`).join("");
 $("#esel").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(b.dataset.t));
 function pick(t,scroll){cur=t;history.replaceState(null,"","?t="+t);cal();render();if(scroll)$("#s-edet").scrollIntoView({behavior:"smooth",block:"start"})}
 const marg=(q,k)=>q&&q[k]!=null&&q.revenue?q[k]/q.revenue*100:null,pctv=v=>v==null?'<span class="cap">n/a</span>':`<span class="num">${fmt(v,1)}%</span>`;
 function kpi(k,v,sub,c){return`<div class="ek"><div class="k">${k}</div><div class="v">${v}${c?" "+c:""}</div><div class="cap">${sub||"&nbsp;"}</div></div>`}
 function bars(vals,labels,yf,H=220){const W=520,P={l:8,r:8,t:16,b:28},n=vals.length;if(!n)return'<div class="empty">No data.</div>';
  const mx=Math.max(0,...vals.filter(v=>v!=null)),mn=Math.min(0,...vals.filter(v=>v!=null)),sy=v=>P.t+(mx-v)/((mx-mn)||1)*(H-P.t-P.b),bw=(W-P.l-P.r)/n;
  let g=`<line x1="${P.l}" x2="${W-P.r}" y1="${sy(0)}" y2="${sy(0)}" style="stroke:var(--ink)" stroke-opacity=".25"/>`;
  vals.forEach((v,i)=>{const x=P.l+i*bw+bw*.2,w=bw*.6;g+=`<text x="${x+w/2}" y="${H-8}" font-size="12" text-anchor="middle" style="fill:var(--ink)">${labels[i]}</text>`;
   if(v==null)return;const y0=sy(0),y1=sy(v);g+=`<rect x="${x}" y="${Math.min(y0,y1)}" width="${w}" height="${Math.max(1,Math.abs(y1-y0))}" rx="3" style="fill:${v<0?"var(--ink)":"var(--blue)"}"/><text x="${x+w/2}" y="${v<0?y0+14:y1-5}" font-size="11" font-weight="600" text-anchor="middle" style="fill:var(--ink)">${yf(v)}</text>`});
  return`<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`}
 const ql=d=>{const m=+d.slice(5,7);return"Q"+Math.ceil(m/3)+" '"+d.slice(2,4)};
 function render(){const x=E[cur],qs=x.quarters,q=qs.at(-1),h=lastH(cur),src=x.latest_src||{};
  $("#esel").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.t==cur));
  const yo=q&&qs.find(z=>z.period.slice(0,4)==String(+q.period.slice(0,4)-1)&&z.period.slice(5,7)==q.period.slice(5,7)),prev=yo?yo.revenue:src.revenue_prior_year,yoy=q&&q.revenue&&prev?(q.revenue/prev-1)*100:null;
  const rest=src.revenue_est,rs=q&&rest?(q.revenue/rest-1)*100:null,n=x.next;
  $("#edet").innerHTML=`<div class="eh"><div class="lgh">${lg(cur,"l")}<span class="t">${cur}</span> <span class="cap" style="font-size:var(--t-body)">${esc(NM(cur))}</span></div>
   <div class="cap">${q?ql(q.period).replace(" '"," 20"):"No quarterly data"}${h?" · Reported "+md(h.date):""}${n?" · Next "+md(n.date)+(n.time?" "+n.time:""):""}</div></div>
   <div class="ekg">${kpi("Revenue",q?money(q.revenue):"n/a",rest?`vs ${money(rest)} est. ${fp(rs,1)}`:"Estimate n/a",rest?chip(rs):"")}
   ${kpi("EPS",h?"$"+fmt(h.eps):"n/a",h&&h.est!=null?`vs $${fmt(h.est)} est. ${fp(h.surprise,1)}`:"Estimate n/a",h&&h.est!=null?chip(h.surprise):"")}
   ${kpi("Revenue YoY",yoy==null?"n/a":fp(yoy,1),yo||prev?"vs year ago":"Prior year n/a")}
   ${kpi("Gross margin",pctv(marg(q,"gross")),"")}${kpi("Operating margin",pctv(marg(q,"operating")),"")}${kpi("Net margin",pctv(marg(q,"net")),"")}</div>
   ${x.guidance||x.takeaway?`<div class="enotes">${x.takeaway?`<div><div class="k">Takeaway</div><p>${esc(x.takeaway)} ${x.takeaway_url?`<a href="${esc(x.takeaway_url)}" target="_blank" rel="noopener">${esc(x.takeaway_source||"Source")}</a>`:""}</p></div>`:""}${x.guidance?`<div><div class="k">Guidance</div><p>${esc(x.guidance)}</p></div>`:""}</div>`:""}`;
  $("#erev").innerHTML=bars(qs.map(z=>z.revenue),qs.map(z=>ql(z.period)),money);
  const hs=x.history;$("#eeps").innerHTML=hs.length?(()=>{const W=520,H=220,P={l:8,r:8,t:16,b:28},all=hs.flatMap(z=>[z.eps,z.est]).filter(v=>v!=null),mx=Math.max(...all),mn=Math.min(...all),pad=(mx-mn)*.15||1,sy=v=>P.t+(mx+pad-v)/((mx-mn+2*pad))*(H-P.t-P.b),bw=(W-P.l-P.r)/hs.length;
   let g="";hs.forEach((z,i)=>{const cx=P.l+bw*(i+.5);g+=`<text x="${cx}" y="${H-8}" font-size="12" text-anchor="middle" style="fill:var(--ink)">${ql(new Date(new Date(z.date).getTime()-50*864e5).toISOString().slice(0,10))}</text>`;
    if(z.est!=null)g+=`<circle cx="${cx}" cy="${sy(z.est)}" r="6" fill="none" style="stroke:var(--ink)" stroke-width="1.5"/>`;
    if(z.eps!=null)g+=`<circle cx="${cx}" cy="${sy(z.eps)}" r="6" style="fill:${z.surprise!=null&&z.surprise<0?"var(--ink)":"var(--blue)"}"/><text x="${cx}" y="${z.est!=null&&z.eps<z.est?sy(z.eps)+22:sy(Math.max(z.eps,z.est??z.eps))-12}" font-size="11" font-weight="600" text-anchor="middle" style="fill:var(--ink)">$${fmt(z.eps)}</text>`});
   return`<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg><div class="legend"><span class="lgi"><i style="background:var(--blue)"></i>Actual, beat</span> <span class="lgi"><i style="background:var(--ink)"></i>Actual, miss</span> <span class="lgi"><i class="o"></i>Estimate</span></div>`})():'<div class="empty">No EPS history.</div>';
  const mq=qs.filter(z=>z.revenue);const MS=[["Gross","gross","var(--blue)",2,""],["Operating","operating","var(--ink)",2,""],["Net","net","var(--ink)",1.5,"5 4"]].map(([nm,k,c,w,dash])=>({nm,pts:mq.map(z=>marg(z,k)),color:c,w,dash,label:1})).map(x=>({...x,ok:x.pts.some(v=>v!=null)}));const MSo=MS.filter(x=>x.ok);
  $("#emar").innerHTML=mq.length>1&&MSo.length?axisChart(MSo,
   {W:Math.max(300,$("#emar").clientWidth||520),H:220,dates:mq.map(z=>z.period),yf:v=>fmt(v,0)+"%",zero:1,tip:(i,S)=>S.map(x=>`<div class="tr"><span>${x.nm}</span><b class="num">${x.pts[i]==null?"n/a":fmt(x.pts[i],1)+"%"}</b></div>`).join("")})+'<div class="legend">'+MS.map(x=>`<span class="lgi${x.ok?"":" off"}"><i class="ln" style="border-top:${x.w}px ${x.dash?"dashed":"solid"} ${x.color}"></i>${x.nm}${x.ok?"":" n/a"}</span>`).join("")+'</div>':'<div class="empty">Not enough quarters.</div>';
  const an=x.annual;$("#eann").innerHTML=an.length?`<div class="k2">Revenue</div>${bars(an.map(z=>z.revenue),an.map(z=>z.year),money,130)}<div class="k2">Net income</div>${bars(an.map(z=>z.net),an.map(z=>z.year),money,130)}`:'<div class="empty">No annual data.</div>';
  $("#esrc").innerHTML=`Via Yahoo Finance${src.url?`; latest quarter from <a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.source)}</a>${src.revenue_est_source?"; estimate "+esc(src.revenue_est_source):""}`:""}.`}
 cal();render();let er;addEventListener("resize",()=>{clearTimeout(er);er=setTimeout(render,150)})}
