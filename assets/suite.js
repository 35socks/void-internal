/* Personal creative suite — core runtime. Static, no backend. All data lives in this browser. */
(function(){
'use strict';
const SCRIPT = document.currentScript.src;
const ROOT = SCRIPT.slice(0, SCRIPT.lastIndexOf('assets/'));

/* ------------------------------ registry ------------------------------ */
const CATS = { music:'Music', film:'Film', photo:'Photo', lab:'Homelab', life:'Life', system:'System' };
const APPS = [
 // music
 {id:'lrc',cat:'music',name:'LRC Tagger',desc:'Hold space to time lyrics line by line. Exports .lrc.'},
 {id:'tempo',cat:'music',name:'Tempo Tools',desc:'Tap tempo, delay & reverb times, BPM to ms, song length maths.'},
 {id:'metro',cat:'music',name:'Metronome',desc:'Accurate WebAudio click with accents, subdivisions & tempo ramp.'},
 {id:'theory',cat:'music',name:'Key & Chords',desc:'Scales, diatonic chords, Camelot wheel and transposer.'},
 {id:'tuner',cat:'music',name:'Tuner & Tones',desc:'Mic pitch detection plus a reference tone generator.'},
 {id:'tracklist',cat:'music',name:'Release Sheet',desc:'Tracklists with ISRC, BPM, key and runtime. CSV export.'},
 {id:'setlist',cat:'music',name:'Setlist Builder',desc:'Order songs for a show and see total set time.'},
 {id:'demos',cat:'music',name:'Demo Vault',desc:'Upload, play and share demos stored in your own S3 bucket.'},
 {id:'lossless',cat:'music',name:'Lossless Checker',desc:'Spectrum and metadata analysis to spot lossy transcodes.'},
 {id:'barcode',cat:'music',name:'Barcode Maker',desc:'EAN, UPC and Code 128 barcodes as PNG.'},
 // film
 {id:'shots',cat:'film',name:'Shot List',desc:'Scenes, shots, lenses and status for a shoot day.'},
 {id:'script',cat:'film',name:'Screenplay',desc:'Fountain-style screenplay writer with live page estimate.'},
 {id:'timecode',cat:'film',name:'Timecode Calc',desc:'Add, subtract and convert timecode across frame rates.'},
 {id:'cam',cat:'film',name:'Camera Calc',desc:'Depth of field, field of view, shutter angle, ND and EV.'},
 {id:'media',cat:'film',name:'Media Calc',desc:'Footage storage, bitrates, transfer times and RAID capacity.'},
 {id:'sun',cat:'film',name:'Sun Planner',desc:'Sunrise, sunset and golden hour for any place and date.'},
 {id:'board',cat:'film',name:'Moodboard',desc:'Drop reference images onto boards. Stored locally.'},
 {id:'gear',cat:'film',name:'Gear Locker',desc:'Inventory of kit with serials, value and condition.'},
 {id:'projects',cat:'film',name:'Project Board',desc:'Kanban for songs, films and shoots in flight.'},
 // photo
 {id:'image',cat:'photo',name:'Image Lab',desc:'Resize, convert, crop, grayscale and strip EXIF. Reads EXIF.'},
 {id:'palette',cat:'photo',name:'Palette Lab',desc:'Pull colours from a photo; contrast and format converter.'},
 {id:'shootlog',cat:'photo',name:'Shoot Log',desc:'Log shoots, film stocks, settings and keepers.'},
 // lab
 {id:'launcher',cat:'lab',name:'Lab Launcher',desc:'Bookmark your self-hosted services with reachability checks.'},
 {id:'hosts',cat:'lab',name:'Host Registry',desc:'Machines, IPs, ports and roles with conflict detection.'},
 {id:'net',cat:'lab',name:'Network Calc',desc:'CIDR and subnet maths, plus a common port reference.'},
 {id:'forge',cat:'lab',name:'Config Forge',desc:'Cron, chmod, systemd, compose and nginx generators.'},
 {id:'dev',cat:'lab',name:'Dev Toolbox',desc:'JSON, Base64, hashes, UUIDs, timestamps, regex and diff.'},
 // life
 {id:'notes',cat:'life',name:'Notes',desc:'Markdown-ish notes with tags, pins and search.'},
 {id:'tasks',cat:'life',name:'Tasks',desc:'Todos with priority, due dates and areas.'},
 {id:'habits',cat:'life',name:'Habits',desc:'Daily habit tracker with streaks and a 12-week grid.'},
 {id:'journal',cat:'life',name:'Journal',desc:'One entry a day with mood and word count.'},
 {id:'timer',cat:'life',name:'Timers',desc:'Pomodoro, countdown and stopwatch with lap times.'},
 {id:'bookmarks',cat:'life',name:'Bookmarks',desc:'Links with tags, searchable.'},
 {id:'snippets',cat:'life',name:'Snippets',desc:'Reusable text and code with one-click copy.'},
 {id:'finance',cat:'life',name:'Money',desc:'Income and expenses by category, monthly totals.'},
 {id:'scratch',cat:'life',name:'Scratchpad',desc:'One always-saved text area for anything.'},
 {id:'countdown',cat:'life',name:'Countdowns',desc:'Live countdowns to deadlines, releases and shows.'},
 {id:'contacts',cat:'life',name:'Contacts',desc:'People, roles, links and last contact.'},
 {id:'vault',cat:'life',name:'Vault',desc:'AES-GCM encrypted secrets behind a separate master password.'},
 // system
 {id:'settings',cat:'system',name:'Settings',desc:'Name, passcode, effects, backup and restore.'}
];
const appById = id => APPS.find(a=>a.id===id);
const appUrl = id => id==='home' ? ROOT + 'index.html' : ROOT + id + (location.protocol==='file:' ? '/index.html' : '/');

/* ------------------------------ helpers ------------------------------ */
const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
function h(tag, attrs, ...kids){
  const e = document.createElement(tag);
  if(attrs) for(const k in attrs){
    const v = attrs[k];
    if(v==null || v===false) continue;
    if(k==='class') e.className = v;
    else if(k==='html') e.innerHTML = v;
    else if(k==='text') e.textContent = v;
    else if(k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if(k==='value') e.value = v;
    else e.setAttribute(k, v===true?'':v);
  }
  kids.flat().forEach(c=>{ if(c==null||c===false) return; e.append(c.nodeType?c:document.createTextNode(c)); });
  return e;
}
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad = n => String(n).padStart(2,'0');
const today = () => { const d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const dur = s => { s=Math.max(0,Math.round(s||0)); const hh=Math.floor(s/3600), m=Math.floor(s%3600/60); return (hh?hh+':'+pad(m):m)+':'+pad(s%60); };
const parseDur = t => { if(t==null||t==='') return 0; if(!isNaN(t)) return +t; const p=String(t).split(':').map(Number); if(p.some(isNaN)) return 0; return p.reduce((a,b)=>a*60+b,0); };
const bytes = n => { if(!isFinite(n)) return '—'; const u=['B','KB','MB','GB','TB','PB']; let i=0; while(n>=1024&&i<u.length-1){ n/=1024; i++; } return n.toFixed(n<10&&i?2:i?1:0)+' '+u[i]; };
function toast(msg){ let t=$('#toast'); if(!t){ t=h('div',{id:'toast'}); document.body.append(t); } t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),2000); }
function copy(text){ return (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(()=>toast('Copied'),()=>{ const ta=h('textarea',{value:text}); document.body.append(ta); ta.select(); try{document.execCommand('copy'); toast('Copied');}catch{ toast('Copy failed'); } ta.remove(); }); }
function download(name, data, type){ const b = data instanceof Blob ? data : new Blob([data],{type:type||'text/plain'}); const a=h('a',{href:URL.createObjectURL(b),download:name}); document.body.append(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},800); }
function csvEncode(rows){ return rows.map(r=>r.map(v=>{ v=v==null?'':String(v); return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(',')).join('\r\n'); }
function csvParse(t){ const rows=[]; let r=[],c='',q=false; for(let i=0;i<t.length;i++){ const ch=t[i]; if(q){ if(ch==='"'){ if(t[i+1]==='"'){c+='"';i++;} else q=false; } else c+=ch; } else if(ch==='"') q=true; else if(ch===','){ r.push(c); c=''; } else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&t[i+1]==='\n') i++; r.push(c); c=''; rows.push(r); r=[]; } else c+=ch; } if(c!==''||r.length){ r.push(c); rows.push(r); } return rows.filter(r=>r.some(x=>x!=='')); }
function pickFile(accept){ return new Promise(res=>{ const i=h('input',{type:'file',accept,onchange:()=>res(i.files[0]||null)}); i.click(); }); }

/* ------------------------------ storage ------------------------------ */
const P='su:';
let onWrite = () => {};
const store = {
  get(k,d){ try{ const v=localStorage.getItem(P+k); return v==null?d:JSON.parse(v); }catch{ return d; } },
  set(k,v){ try{ localStorage.setItem(P+k, JSON.stringify(v)); onWrite(k); return true; }catch(e){ toast('Storage full — export a backup'); return false; } },
  del(k){ localStorage.removeItem(P+k); onWrite(k); },
  keys(){ return Object.keys(localStorage).filter(k=>k.startsWith(P)).map(k=>k.slice(P.length)); }
};
const idb = (function(){
  let dbp; const open=()=>dbp||(dbp=new Promise((res,rej)=>{ const r=indexedDB.open('su',1); r.onupgradeneeded=()=>r.result.createObjectStore('kv'); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }));
  const tx=(m,f)=>open().then(db=>new Promise((res,rej)=>{ const t=db.transaction('kv',m), s=t.objectStore('kv'), rq=f(s); t.oncomplete=()=>res(rq&&rq.result); t.onerror=()=>rej(t.error); }));
  return { get:k=>tx('readonly',s=>s.get(k)), set:(k,v)=>tx('readwrite',s=>s.put(v,k)).then(r=>{ onWrite('idb:'+k); return r; }), del:k=>tx('readwrite',s=>s.delete(k)).then(r=>{ onWrite('idb:'+k); return r; }), keys:()=>tx('readonly',s=>s.getAllKeys()) };
})();

/* ------------------------------ S3 (SigV4 in the browser) ------------------------------ */
/* Credentials come from the user (Settings) and live only in this browser's localStorage under su:s3. Never put keys in files. */
const s3 = (function(){
  const enc=new TextEncoder(), hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const sha=async d=>hex(await crypto.subtle.digest('SHA-256',typeof d==='string'?enc.encode(d):d));
  const hm=async(k,d)=>{ const ck=await crypto.subtle.importKey('raw',k,{name:'HMAC',hash:'SHA-256'},false,['sign']); return new Uint8Array(await crypto.subtle.sign('HMAC',ck,enc.encode(d))); };
  const rfc=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
  const conf=()=>store.get('s3',null);
  const ok=()=>{ const c=conf(); return !!(c&&c.bucket&&c.region&&c.ak&&c.sk&&window.crypto&&crypto.subtle); };
  const host=c=>c.bucket+'.s3.'+c.region+'.amazonaws.com';
  const path=k=>'/'+String(k).split('/').map(rfc).join('/');
  const cq=q=>Object.keys(q||{}).sort().map(k=>rfc(k)+'='+rfc(q[k])).join('&');
  const stamp=()=>new Date().toISOString().replace(/[:-]|\.\d{3}/g,'');
  async function signKey(c,date){ let k=await hm(enc.encode('AWS4'+c.sk),date); k=await hm(k,c.region); k=await hm(k,'s3'); return hm(k,'aws4_request'); }
  async function req(method,key,o){
    o=o||{}; if(!ok()) throw new Error('S3 not configured'); const c=conf();
    const amz=stamp(), date=amz.slice(0,8), q=cq(o.query), ph='UNSIGNED-PAYLOAD', sh='host;x-amz-content-sha256;x-amz-date';
    const canon=[method,path(key||''),q,'host:'+host(c)+'\nx-amz-content-sha256:'+ph+'\nx-amz-date:'+amz+'\n',sh,ph].join('\n');
    const scope=date+'/'+c.region+'/s3/aws4_request';
    const sig=hex(await hm(await signKey(c,date),['AWS4-HMAC-SHA256',amz,scope,await sha(canon)].join('\n')));
    const res=await fetch('https://'+host(c)+path(key||'')+(q?'?'+q:''),{method,body:o.body,headers:{'x-amz-date':amz,'x-amz-content-sha256':ph,'Authorization':'AWS4-HMAC-SHA256 Credential='+c.ak+'/'+scope+', SignedHeaders='+sh+', Signature='+sig}});
    if(!res.ok&&res.status!==404) throw new Error('S3 '+res.status+(res.status===403?' (access denied or bad keys)':''));
    return res;
  }
  async function presign(key,expires){
    const c=conf(); if(!ok()) throw new Error('S3 not configured'); const amz=stamp(), date=amz.slice(0,8), scope=date+'/'+c.region+'/s3/aws4_request';
    const q={'X-Amz-Algorithm':'AWS4-HMAC-SHA256','X-Amz-Credential':c.ak+'/'+scope,'X-Amz-Date':amz,'X-Amz-Expires':String(expires||3600),'X-Amz-SignedHeaders':'host'}, qs=cq(q);
    const canon=['GET',path(key),qs,'host:'+host(c)+'\n','host','UNSIGNED-PAYLOAD'].join('\n');
    const sig=hex(await hm(await signKey(c,date),['AWS4-HMAC-SHA256',amz,scope,await sha(canon)].join('\n')));
    return 'https://'+host(c)+path(key)+'?'+qs+'&X-Amz-Signature='+sig;
  }
  async function list(prefix){
    const out=[]; let token=null;
    do{ const q={'list-type':'2',prefix:prefix||''}; if(token) q['continuation-token']=token;
      const r=await req('GET','',{query:q}), x=new DOMParser().parseFromString(await r.text(),'text/xml');
      x.querySelectorAll('Contents').forEach(n=>out.push({key:n.querySelector('Key').textContent,size:+n.querySelector('Size').textContent,modified:n.querySelector('LastModified').textContent}));
      const tr=x.querySelector('IsTruncated'); token=(tr&&tr.textContent==='true')?x.querySelector('NextContinuationToken').textContent:null;
    }while(token);
    return out;
  }
  return { ok, conf, req, presign, list,
    put:(key,body)=>req('PUT',key,{body}), get:key=>req('GET',key), del:key=>req('DELETE',key),
    async test(){ await list('suite/'); return true; } };
})();

/* ------------------------------ cloud sync (backup.json in the bucket) ------------------------------ */
const SYNCKEY='suite/backup.json', SKIP=['s3','syncmeta','recent'];
let applying=false, pushT=null;
const sync = {
  async snapshot(){ const data={}; store.keys().filter(k=>!SKIP.includes(k)).forEach(k=>data[k]=store.get(k)); const images={}; for(const k of await idb.keys()) images[k]=await idb.get(k); return {t:Date.now(),data,idb:images}; },
  async remote(){ const r=await s3.get(SYNCKEY); return r.ok?r.json():null; },
  async push(force){
    const m=store.get('syncmeta',{}); if(!force){ const r=await sync.remote(); if(r&&r.t>(m.t||0)&&m.t){ toast('Cloud has newer data — pull or force push in Settings'); return null; } }
    const snap=await sync.snapshot(); await s3.put(SYNCKEY, JSON.stringify(snap)); applying=true; store.set('syncmeta',{t:snap.t,dirty:false}); applying=false; return snap;
  },
  async pull(){
    const s=await sync.remote(); if(!s) throw new Error('No backup in the bucket yet'); applying=true;
    store.keys().filter(k=>!SKIP.includes(k)).forEach(k=>store.del(k)); Object.keys(s.data).forEach(k=>store.set(k,s.data[k]));
    for(const k of Object.keys(s.idb||{})) await idb.set(k,s.idb[k]);
    store.set('syncmeta',{t:s.t,dirty:false}); applying=false; return s;
  },
  async autoPull(){
    const c=s3.conf(); if(!(c&&c.auto&&s3.ok())) return;
    try{ const s=await sync.remote(), m=store.get('syncmeta',{});
      if(s&&s.t>(m.t||0)){ if(m.dirty) toast('Cloud has newer data — resolve in Settings'); else { await sync.pull(); location.reload(); } } }catch(e){ console.warn('autoPull',e); }
  }
};
onWrite = k => {
  if(applying||SKIP.includes(k)) return;
  const m=store.get('syncmeta',{}); if(!m.dirty){ applying=true; store.set('syncmeta',Object.assign({},m,{dirty:true})); applying=false; }
  const c=s3.conf(); if(c&&c.auto&&s3.ok()){ clearTimeout(pushT); pushT=setTimeout(()=>sync.push().catch(()=>toast('Cloud sync failed')),4000); }
};

/* ------------------------------ modal ------------------------------ */
function modal(title, body, actions){
  return new Promise(res=>{
    const close = v => { ov.remove(); document.removeEventListener('keydown',onKey); res(v); };
    const onKey = e => { if(e.key==='Escape') close(null); };
    const acts = (actions||[{label:'Close',value:null}]).map(a=>h('button',{class:'btn '+(a.cls||''),onclick:()=>{ if(a.validate&&a.validate()===false) return; close(a.fn?a.fn():a.value); }},a.label));
    const m = h('div',{class:'modal'}, title?h('h3',{text:title}):null, body, h('div',{class:'actions'},acts));
    const ov = h('div',{class:'overlay',onmousedown:e=>{ if(e.target===ov) close(null); }}, m);
    document.body.append(ov); document.addEventListener('keydown',onKey);
    const f=$('input,textarea,select',m); if(f) setTimeout(()=>f.focus(),30);
  });
}
const confirmBox = msg => modal('Confirm', h('p',{text:msg}), [{label:'Cancel',cls:'ghost',value:false},{label:'Confirm',cls:'primary',value:true}]);
const promptBox = (title,def='',ph='') => { const i=h('input',{type:'text',value:def,placeholder:ph}); return modal(title,i,[{label:'Cancel',cls:'ghost',value:null},{label:'OK',cls:'primary',fn:()=>i.value}]); };

/* ------------------------------ form builder ------------------------------ */
function buildForm(fields, vals){
  vals = vals||{}; const inputs={}; const root=h('div');
  fields.forEach(f=>{
    let inp; const v = vals[f.k]!=null ? vals[f.k] : (f.def!=null ? (typeof f.def==='function'?f.def():f.def) : '');
    if(f.t==='select') inp=h('select',null,(f.opts||[]).map(o=>h('option',{value:o,selected:o===v},o)));
    else if(f.t==='area') inp=h('textarea',{value:v,placeholder:f.ph||'',class:f.mono?'mono':''});
    else if(f.t==='check') inp=h('input',{type:'checkbox'}), inp.checked=!!v;
    else { inp=h('input',{type:f.t==='num'?'number':f.t||'text',value:v,placeholder:f.ph||'',step:f.step||(f.t==='num'?'any':null)}); }
    inputs[f.k]=inp;
    root.append(f.t==='check'
      ? h('label',{class:'check',style:'margin-bottom:12px'},inp,f.l)
      : h('label',{class:'f'},h('span',null,f.l),inp));
  });
  const get=()=>{ const o={}; fields.forEach(f=>{ const i=inputs[f.k]; o[f.k]= f.t==='check'?i.checked : f.t==='num'?(i.value===''?null:+i.value) : i.value.trim(); }); return o; };
  return {el:root,get,inputs};
}

/* ------------------------------ generic CRUD ------------------------------ */
function crud(root, cfg){
  let items = store.get(cfg.key, []);
  let q='', filt='', sortK=cfg.sort||null, sortDir=1;
  const save=()=>store.set(cfg.key, items);
  const listF = cfg.fields.filter(f=>f.list!==false);
  const bar = h('div',{class:'row',style:'margin-bottom:12px'});
  const search = h('input',{type:'search',placeholder:'Search '+cfg.noun+'s…',class:'grow',oninput:()=>{ q=search.value.toLowerCase(); draw(); }});
  const ff = cfg.filter ? cfg.fields.find(f=>f.k===cfg.filter) : null;
  const fsel = ff ? h('select',{style:'width:auto',onchange:()=>{ filt=fsel.value; draw(); }}, h('option',{value:''},'All '+ff.l.toLowerCase()), (ff.opts||[]).map(o=>h('option',{value:o},o))) : null;
  bar.append(search, fsel, h('button',{class:'btn primary',onclick:()=>edit()},'+ Add '+cfg.noun),
    h('button',{class:'btn ghost',onclick:exportCsv},'CSV ↓'), h('button',{class:'btn ghost',onclick:importCsv},'CSV ↑'));
  const wrap=h('div',{class:'tablewrap'}), foot=h('div',{class:'small muted',style:'margin-top:10px'});
  root.append(bar, wrap, foot);

  function cell(f,it){
    const v=it[f.k];
    if(f.fmt) return f.fmt(v,it);
    if(f.t==='check') return v?'✓':'';
    if(f.t==='url'&&v) return h('a',{href:/^https?:/.test(v)?v:'https://'+v,target:'_blank',rel:'noopener',style:'text-decoration:underline',onclick:e=>e.stopPropagation()},v.replace(/^https?:\/\//,'').slice(0,40));
    if(f.t==='select'&&v) return h('span',{class:'tag'},v);
    if(f.t==='area') return (v||'').length>90?v.slice(0,90)+'…':v;
    return v==null?'':String(v);
  }
  function draw(){
    let rows = items.filter(it=>(!filt||it[cfg.filter]===filt) && (!q || cfg.fields.some(f=>String(it[f.k]==null?'':it[f.k]).toLowerCase().includes(q))));
    if(sortK && !cfg.order){ rows=rows.slice().sort((a,b)=>{ const x=a[sortK],y=b[sortK]; return (x==null?-1:y==null?1:(typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),undefined,{numeric:true})))*sortDir; }); }
    wrap.innerHTML='';
    if(!rows.length){ wrap.append(h('div',{class:'empty'}, items.length?'No matches':'Nothing here yet — add your first '+cfg.noun)); }
    else {
      const t=h('table'), hr=h('tr');
      if(cfg.order) hr.append(h('th',{style:'width:1%'},'#'));
      listF.forEach(f=>hr.append(h('th',{class:f.t==='num'?'num':'',onclick:()=>{ if(cfg.order) return; sortDir = sortK===f.k?-sortDir:1; sortK=f.k; draw(); }},f.l+(sortK===f.k&&!cfg.order?(sortDir>0?' ↑':' ↓'):''))));
      hr.append(h('th')); t.append(h('thead',null,hr));
      const tb=h('tbody');
      rows.forEach((it,ri)=>{
        const tr=h('tr',{onclick:()=>edit(it)});
        if(cfg.order) tr.append(h('td',{class:'muted mono'},pad(ri+1)));
        listF.forEach(f=>tr.append(h('td',{class:f.t==='num'?'num':''},cell(f,it))));
        const a=h('td',{class:'act'});
        if(cfg.order){ const i=items.indexOf(it); a.append(
          h('button',{class:'btn sm ghost',title:'Move up',onclick:e=>{ e.stopPropagation(); if(i>0){ [items[i-1],items[i]]=[items[i],items[i-1]]; save(); draw(); } }},'▲'),' ',
          h('button',{class:'btn sm ghost',title:'Move down',onclick:e=>{ e.stopPropagation(); if(i<items.length-1){ [items[i+1],items[i]]=[items[i],items[i+1]]; save(); draw(); } }},'▼')); }
        if(cfg.rowAction) a.append(' ', cfg.rowAction(it, ()=>{ save(); draw(); }));
        tr.append(a); tb.append(tr);
      });
      t.append(tb); wrap.append(t);
    }
    foot.innerHTML = items.length+' '+cfg.noun+(items.length===1?'':'s') + (cfg.summary?' · '+cfg.summary(items):'');
    if(cfg.onDraw) cfg.onDraw(items);
  }
  async function edit(it){
    const isNew=!it, form=buildForm(cfg.fields, it||{});
    const acts=[{label:'Cancel',cls:'ghost',value:null}];
    if(!isNew) acts.unshift({label:'Delete',cls:'danger ghost',value:'del'});
    acts.push({label:'Save',cls:'primary',value:'save',validate:()=>{ const req=cfg.fields.find(f=>f.req&&!form.get()[f.k]&&form.get()[f.k]!==0); if(req){ toast(req.l+' is required'); return false; } }});
    const r = await modal((isNew?'Add ':'Edit ')+cfg.noun, form.el, acts);
    if(r==='del'){ if(await confirmBox('Delete this '+cfg.noun+'?')){ items=items.filter(x=>x!==it); save(); draw(); } }
    else if(r==='save'){ const d=form.get(); if(isNew) items.push(Object.assign({id:uid(),created:Date.now()},d)); else Object.assign(it,d); save(); draw(); }
  }
  function exportCsv(){ download((cfg.csv||cfg.key)+'.csv', csvEncode([cfg.fields.map(f=>f.l)].concat(items.map(it=>cfg.fields.map(f=>it[f.k])))), 'text/csv'); }
  async function importCsv(){
    const f=await pickFile('.csv,text/csv'); if(!f) return;
    const rows=csvParse(await f.text()); if(rows.length<2){ toast('Empty CSV'); return; }
    const head=rows[0].map(x=>x.trim().toLowerCase()); let n=0;
    rows.slice(1).forEach(r=>{ const o={id:uid(),created:Date.now()}; cfg.fields.forEach(fl=>{ const i=head.indexOf(fl.l.toLowerCase()); if(i>=0){ let v=r[i]; o[fl.k]= fl.t==='num'?(v===''?null:+v) : fl.t==='check'?/^(1|true|yes|✓|y)$/i.test(v) : v; } }); items.push(o); n++; });
    save(); draw(); toast('Imported '+n);
  }
  draw();
  return { refresh:()=>{ items=store.get(cfg.key,[]); draw(); }, get:()=>items };
}

/* ------------------------------ tabs ------------------------------ */
function tabs(root, list){
  const bar=h('div',{class:'tabs'}), body=h('div'); root.append(bar,body);
  const show=i=>{ $$('.tab',bar).forEach((b,j)=>b.classList.toggle('on',i===j)); body.innerHTML=''; list[i].render(body); };
  list.forEach((t,i)=>bar.append(h('button',{class:'tab',onclick:()=>show(i)},t.label)));
  show(0);
}

/* ------------------------------ config / auth ------------------------------ */
let cfg = store.get('cfg', null);
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c=>c.charCodeAt(0));
async function hashPass(pass, saltB64){
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unb64(saltB64),iterations:150000,hash:'SHA-256'}, key, 256));
}
const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)));

/* ------------------------------ background fx ------------------------------ */
function startFx(){
  const canvas=h('canvas',{id:'dotfield'}); document.body.prepend(canvas, h('div',{class:'noise'}), h('div',{class:'scanline-overlay'}));
  const ctx=canvas.getContext('2d'); let w,hh,dots=[],spacing=26,mouse={x:-9999,y:-9999},t=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize(){ w=canvas.width=innerWidth; hh=canvas.height=innerHeight; dots=[]; for(let y=0;y<Math.ceil(hh/spacing)+2;y++)for(let x=0;x<Math.ceil(w/spacing)+2;x++)dots.push({x:x*spacing,y:y*spacing,b:Math.random()*.16+.04,p:Math.random()*6.28,s:Math.random()*.6+.3}); }
  addEventListener('resize',resize); addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;}); addEventListener('mouseleave',()=>{mouse.x=mouse.y=-9999;});
  (function draw(){ if(!document.body.classList.contains('nofx')){ ctx.clearRect(0,0,w,hh);
    for(const d of dots){ const f=reduced?d.b:d.b+Math.sin(t*d.s+d.p)*.05, dx=d.x-mouse.x, dy=d.y-mouse.y, boost=Math.max(0,1-Math.sqrt(dx*dx+dy*dy)/180)*.55;
      ctx.fillStyle='rgba(255,255,255,'+Math.min(1,f+boost)+')'; ctx.beginPath(); ctx.arc(d.x,d.y,1+boost*1.3,0,6.283); ctx.fill(); }
    t+=.02; } requestAnimationFrame(draw); })();
  resize();
}

/* ------------------------------ shell ------------------------------ */
const ready=[]; let isReady=false;
function onReady(fn){ if(isReady) fn(); else ready.push(fn); }
const appId = document.body.dataset.app || 'home';
const wm = () => (cfg && cfg.wordmark) || 'SUITE';

function buildShell(){
  const app = $('#app'); const meta = appById(appId);
  const shell = h('div',{id:'shell'});
  const crumbs = h('div',{class:'crumbs'}, h('a',{href:appUrl('home')},'Home'), meta?[h('span',null,'/'),h('a',{href:appUrl('home')+'#'+meta.cat},CATS[meta.cat]),h('span',null,'/'),h('span',{style:'color:var(--paper)'},meta.name)]:null);
  const header = h('header',{class:'top'},
    h('a',{class:'wordmark',href:appUrl('home')},wm()), crumbs,
    h('div',{class:'hdr-actions'},
      h('button',{class:'hbtn',onclick:openPalette},'Apps',h('kbd',null,'Ctrl K')),
      cfg&&cfg.hash?h('button',{class:'hbtn',onclick:()=>{ sessionStorage.removeItem('su:unlocked'); location.reload(); }},'Lock'):null,
      h('a',{class:'hbtn',href:appUrl('settings')},'Settings')));
  const main = h('main',{class:'wrap'});
  if(meta){ main.append(h('div',{class:'page-head'}, h('div',{class:'eyebrow'},h('span',{class:'dot-pulse'}),CATS[meta.cat]), h('h1',{text:meta.name}), h('p',{text:meta.desc}))); document.title = meta.name+' — '+wm(); }
  else document.title = wm();
  if(app) main.append(app);
  shell.append(header, main, h('footer',{class:'foot'},wm()+' · PRIVATE WORKSPACE',h('br'),'DATA STAYS IN THIS BROWSER'));
  document.body.append(shell);
  return shell;
}

/* ------------------------------ palette ------------------------------ */
function openPalette(){
  if($('.pal')) return;
  const items = APPS.map(a=>({name:a.name,cat:CATS[a.cat],url:appUrl(a.id),desc:a.desc})).concat([{name:'Home',cat:'Go',url:appUrl('home'),desc:''}]);
  const inp=h('input',{type:'text',placeholder:'Jump to an app…'}), list=h('div',{class:'pal-list'});
  let sel=0, shown=[];
  const draw=()=>{ const q=inp.value.toLowerCase().trim();
    shown=items.filter(i=>!q||(i.name+' '+i.cat+' '+i.desc).toLowerCase().includes(q)).sort((a,b)=>(b.name.toLowerCase().startsWith(q)?1:0)-(a.name.toLowerCase().startsWith(q)?1:0));
    sel=Math.min(sel,Math.max(0,shown.length-1)); list.innerHTML='';
    shown.forEach((i,n)=>list.append(h('div',{class:'pal-item'+(n===sel?' sel':''),onclick:()=>go(i)},h('span',null,i.name),h('span',{class:'c'},i.cat))));
    const s=$('.sel',list); if(s) s.scrollIntoView({block:'nearest'}); };
  const go=i=>{ location.href=i.url; };
  inp.addEventListener('input',()=>{ sel=0; draw(); });
  inp.addEventListener('keydown',e=>{ if(e.key==='ArrowDown'){ sel=Math.min(sel+1,shown.length-1); draw(); e.preventDefault(); } else if(e.key==='ArrowUp'){ sel=Math.max(0,sel-1); draw(); e.preventDefault(); } else if(e.key==='Enter'&&shown[sel]) go(shown[sel]); else if(e.key==='Escape') ov.remove(); });
  const ov=h('div',{class:'overlay pal',onmousedown:e=>{ if(e.target===ov) ov.remove(); }},h('div',{class:'modal'},inp,list));
  document.body.append(ov); draw(); inp.focus();
}
addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); if(isReady) openPalette(); } });

/* ------------------------------ gate ------------------------------ */
function gateUI(kind){
  return new Promise(res=>{
    const gate = h('div',{id:'gate'}); const box = h('div',{class:'gate-box'}); gate.append(box); document.body.append(gate);
    const corners=['tl','tr','bl','br'].map(c=>h('div',{style:'position:absolute;width:18px;height:18px;border:2px solid #fff;opacity:.8;'+({tl:'top:-9px;left:-9px;border-width:2px 0 0 2px',tr:'top:-9px;right:-9px;border-width:2px 2px 0 0',bl:'bottom:-9px;left:-9px;border-width:0 0 2px 2px',br:'bottom:-9px;right:-9px;border-width:0 2px 2px 0'})[c]}));
    const msg=h('div',{class:'small muted',style:'margin-top:14px;min-height:16px;letter-spacing:.14em;text-transform:uppercase'});
    const card=h('div',{class:'panel',style:'padding:28px 26px;margin:0'}); box.append(...corners, card);
    card.append(h('div',{class:'pix',style:'font-size:24px;letter-spacing:.1em;margin-bottom:6px'},kind==='setup'?'WELCOME':wm()), h('div',{class:'eyebrow',style:'margin-bottom:22px'},h('span',{class:'dot-pulse'}),kind==='setup'?'First-run setup':'Locked'));
    if(kind==='setup'){
      const name=h('input',{type:'text',placeholder:'Your name (for greetings)'}), mark=h('input',{type:'text',placeholder:'Wordmark (default SUITE)',maxlength:18}), pass=h('input',{type:'password',placeholder:'Optional passcode',autocomplete:'new-password'});
      card.append(h('label',{class:'f'},h('span',null,'Name'),name), h('label',{class:'f'},h('span',null,'Wordmark'),mark), h('label',{class:'f'},h('span',null,'Passcode (optional)'),pass),
        h('p',{class:'small muted',style:'margin-bottom:16px;line-height:1.6'},'The passcode is a local lock for this browser. It keeps casual eyes out but is not encryption — use the Vault app for secrets.'),
        h('button',{class:'btn primary',style:'width:100%',onclick:async()=>{
          const c={name:name.value.trim(),wordmark:(mark.value.trim()||'SUITE').toUpperCase(),fx:true,boot:true};
          if(pass.value){ if(!crypto.subtle){ msg.textContent='Passcode needs a secure context (https)'; return; } c.salt=newSalt(); c.hash=await hashPass(pass.value,c.salt); }
          store.set('cfg',c); cfg=c; sessionStorage.setItem('su:unlocked','1'); gate.remove(); res(); }},'Enter'), msg);
      name.focus();
    } else {
      const pass=h('input',{type:'password',placeholder:'Passcode',autocomplete:'current-password'});
      const go=async()=>{ msg.textContent='Checking…'; if(await hashPass(pass.value,cfg.salt)===cfg.hash){ sessionStorage.setItem('su:unlocked','1'); gate.remove(); res(); } else { msg.textContent='Incorrect passcode'; pass.value=''; pass.focus(); } };
      pass.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
      card.append(h('label',{class:'f'},h('span',null,'Passcode'),pass), h('button',{class:'btn primary',style:'width:100%',onclick:go},'Unlock'), msg);
      pass.focus();
    }
  });
}

function runBoot(){
  return new Promise(res=>{
    if(sessionStorage.getItem('su:booted')||(cfg&&cfg.boot===false)||matchMedia('(prefers-reduced-motion: reduce)').matches){ res(); return; }
    sessionStorage.setItem('su:booted','1');
    const lines=[wm()+'// CREATIVE SUITE','MOUNTING LOCAL STORAGE...','LOADING '+APPS.length+' MODULES...','READY'];
    const b=h('div',{id:'boot'}, lines.map((t,i)=>h('div',{class:'line',id:'b'+i},i===3?[t,h('span',{class:'cursor'})]:t)));
    document.body.append(b);
    lines.forEach((_,i)=>setTimeout(()=>$('#b'+i).classList.add('on'),150+i*220));
    setTimeout(()=>{ b.classList.add('hide'); setTimeout(()=>b.remove(),700); res(); },1200);
  });
}

async function init(){
  cfg = store.get('cfg', null);
  document.body.classList.toggle('nofx', cfg && cfg.fx===false);
  startFx();
  const shell = buildShell();
  const secure = !!(window.crypto && crypto.subtle);
  if(!cfg) await gateUI('setup');
  else if(cfg.hash && secure && sessionStorage.getItem('su:unlocked')!=='1') await gateUI('lock');
  await runBoot();
  await Promise.race([sync.autoPull(), new Promise(r=>setTimeout(r,3500))]);
  shell.classList.add('reveal');
  const rec = store.get('recent',[]).filter(x=>x!==appId); if(appId!=='home'&&appId!=='settings'){ rec.unshift(appId); store.set('recent',rec.slice(0,8)); }
  isReady=true; ready.forEach(fn=>{ try{ fn(); }catch(e){ console.error(e); } });
}

window.SU = { s3, sync, $, $$, h, esc, uid, pad, today, dur, parseDur, bytes, toast, copy, download, csvEncode, csvParse, pickFile, store, idb, modal, confirm:confirmBox, prompt:promptBox, buildForm, crud, tabs, APPS, CATS, appById, appUrl, ROOT, ready:onReady, openPalette, hashPass, newSalt, getCfg:()=>cfg, setCfg:c=>{ cfg=c; store.set('cfg',c); document.body.classList.toggle('nofx',c.fx===false); } };

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
