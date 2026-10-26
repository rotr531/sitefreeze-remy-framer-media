(async()=>{
 if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.filter(reg=>new URL(reg.scope).origin===location.origin).map(reg=>reg.unregister()))).catch(()=>{});

 const key=location.pathname.replace(/index\.html$/,'').replace(/\/$/,'')+'/',preview=new URLSearchParams(location.search).has('cms-preview');

 const embedded=document.getElementById('kiin-initial-data');
 let initial;try{initial=embedded&&JSON.parse(embedded.textContent)}catch{}
 if(initial?.schemaVersion===2){
  let current=initial,pending=false;
  const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;applyCurrent()})});
  function applyCurrent(){observer.disconnect();for(const a of document.querySelectorAll('a[href]')){if(['Contact Me',current.site.ctaLabel].includes(a.textContent.trim())&&a.getAttribute('href')!==current.site.ctaUrl)a.setAttribute('href',current.site.ctaUrl);try{const url=new URL(a.getAttribute('href'),location.href);if(url.origin!==location.origin)continue;const slug=url.pathname.replace(/index\.html$/,'').split('/').filter(Boolean).at(-1);if(current.projects.some(p=>p.slug===slug)){const target='/work/'+slug+'/';if(a.getAttribute('href')!==target)a.setAttribute('href',target)}}catch{}}window.KIIN_CMS_RENDER?.(current);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','src','srcset']});}
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',applyCurrent,{once:true});else applyCurrent();
  window.addEventListener('resize',applyCurrent);
  fetch('/api/cms/'+(preview?'draft':'public'),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(next=>{if(next?.schemaVersion===2&&(next.revision!==current.revision||next.updatedAt!==current.updatedAt)){current=next;applyCurrent()}}).catch(()=>{});
  if(preview){const badge=document.createElement('a');badge.href='/admin/';badge.textContent='BẢN NHÁP · Quay lại CMS';badge.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#263c2e;color:#fff;padding:12px 20px;border-radius:30px;font:13px system-ui';document.body.append(badge)}
  document.addEventListener('click',e=>{const a=e.target.closest?.('a');if(a&&!e.defaultPrevented&&e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&(!a.target||a.target==='_self')&&new URL(a.href,location.href).origin===location.origin&&a.getAttribute('href')?.includes('/work/')){e.preventDefault();e.stopImmediatePropagation();location.assign(a.href)}},true);
  return;
 }
 let data;try{const r=await fetch('/api/cms/'+(preview?'draft':'public'),{cache:'no-store'});if(!r.ok)throw Error();data=await r.json()}catch{return}
 const aliases=await (await fetch('/cms-aliases.json')).json(); const page=data.pages[key]||data.pages['/'],fields=Object.entries(page.fields),textMap=new Map(fields.filter(([,f])=>f.type==='text').map(([id,f])=>[f.original,{id,...f}]));
 const origins=new WeakMap();
 const local=aliases.pages[key];
 const replacements={...aliases.text,...(local?.text||{})};
 function textField(original){const desired=replacements[original]??original;return textMap.get(desired)||(Object.prototype.hasOwnProperty.call(replacements,original)?{original:desired,value:desired}:undefined)}
 function canonical(v){if(v.includes('hello@remy.design'))return 'mailto:hello@kiin.ai';if(v.includes('cal.com'))return 'mailto:hello@kiin.ai';return v.replace(/index\.html(?=#|$)/,'').replace(/\/$/,'')}

 function safe(v){return /^(https?:\/\/|mailto:|tel:|\/|\.\.?\/|#)/i.test(v)}
 function apply(){
  observer.disconnect();
  document.title=page.title+" — KIIN";
  for(const a of document.querySelectorAll('a[href*="framer.link/thaerswailem"]')){const p=a.parentElement;if(p&&p.textContent.length<150)p.style.setProperty('display','none','important')}

  for(const a of document.querySelectorAll('a[href*="framer.link/LFp4JP9"],a[href*="framer.link/thaerswailem"]')){let p=a.parentElement;for(let i=0;p&&i<5;i++,p=p.parentElement){if(p.textContent.length<120&&(p.textContent.includes('Similar Templates')||p.textContent.includes('Designed in'))){p.style.setProperty('display','none','important');break}}a.style.setProperty('display','none','important')}
  for(const e of document.querySelectorAll('p,span'))if(e.textContent.trim()==='Similar Templates'){let p=e;for(let i=0;i<3&&p.parentElement&&p.parentElement.textContent.trim()==='Similar Templates';i++)p=p.parentElement;p.style.setProperty('display','none','important')}

  for(const a of document.querySelectorAll('a'))if(['Remix for Free','Similar Templates'].includes(a.textContent.trim()))a.style.setProperty('display','none','important');
  for(const e of document.querySelectorAll('p,span,div'))if(e.children.length===0&&['Designed in','By','Thaer'].includes(e.textContent.trim())){let p=e.parentElement;while(p&&p.textContent.length<90&&!p.textContent.includes('©')&&p!==document.body){if(p.textContent.includes('Designed in')&&p.textContent.includes('Thaer')){p.style.setProperty('display','none','important');break}p=p.parentElement}}
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('script,style,svg,[data-cms-extra],.framer-1pyigoo')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;
  while(n=w.nextNode()){const original=origins.get(n)||n.nodeValue.trim(),f=textField(original);if(f){origins.set(n,original);if(n.nodeValue.trim()!==f.value)n.nodeValue=f.value}}
  for(const e of document.querySelectorAll('[data-cms-text]')){if(e.closest('.framer-1pyigoo'))continue;const f=page.fields[e.dataset.cmsText];if(f&&e.textContent!==f.value)e.textContent=f.value}
  for(const e of document.querySelectorAll('img,a')){
   if(data.schemaVersion===2&&e.tagName==='IMG')continue;
   const type=e.tagName==='IMG'?'image':'link',attr=type==='image'?'src':'href',value=origins.get(e)||e.getAttribute(attr);if(!value)continue;origins.set(e,value);
   const id=e.getAttribute('data-cms-'+type);
   let target=value;
   if(type==='image')target=aliases.images[value.split('/').pop()]||(!e.closest('a[href*="work/"]')&&local?.image)||value;
   else {
    target=canonical(value);
    if(value.includes('thaer.shop'))target=data.projects.find(p=>key==='/work/'+p.slug+'/')?.source||'mailto:hello@kiin.ai';
    if(['KIIN','Index'].includes(e.textContent.trim()))target='/';
    if(e.textContent.trim()==='Info')target='/#about';
    try{const url=new URL(value,location.href);if(url.origin===location.origin){const parts=url.pathname.replace(/index\.html$/,'').split('/').filter(Boolean),slug=parts.at(-1);if(data.projects.some(p=>p.slug===slug))target='/work/'+slug+'/'}}catch{}
   }
   let f=page.fields[id]||fields.find(([,f])=>f.type===type&&(canonical(f.original)===canonical(target)))?.[1];
   if(!f&&target!==value)f={value:target,original:target};
   if(type==='link'&&value.includes('framer.com/@thaer'))f={value:'https://www.linkedin.com/'};

   if(f&&safe(f.value)){if(e.getAttribute(attr)!==f.value)e.setAttribute(attr,f.value);if(type==='image'){e.removeAttribute('srcset');if(f.alt!==undefined)e.alt=f.alt}}
  }
  for(const a of document.querySelectorAll('a[href*="/work/"]')){const slug=a.getAttribute('href').split('/work/')[1]?.split('/')[0];const year={morrow:'2026',northbeam:'2024',hana:'2025',orbit:'2026'}[slug]||'';const walker=document.createTreeWalker(a,NodeFilter.SHOW_TEXT);let t;while(t=walker.nextNode())if(/^['’]\d{2}$/.test(t.nodeValue.trim()))t.nodeValue=year?"'"+year.slice(2):''}
  // Extend each existing ticker with the four additional source projects, retaining its card markup.
  if(data.schemaVersion!==2&&key==='/')for(const ul of document.querySelectorAll('ul')){
   const sample=ul.querySelector('li a[href*="work/relay"]');if(!sample||ul.querySelector('[data-cms-extra]'))continue;
   for(const pr of data.projects.slice(8)){
    const li=sample.closest('li').cloneNode(true);li.dataset.cmsExtra='1';for(const el of li.querySelectorAll('[data-cms-text],[data-cms-link],[data-cms-image]'))for(const a of ['text','link','image'])el.removeAttribute('data-cms-'+a);
    const a=li.querySelector('a');a.href='/work/'+pr.slug+'/';for(const img of li.querySelectorAll('img')){img.src=pr.image;img.removeAttribute('srcset');img.alt=pr.title}const tw=document.createTreeWalker(li,NodeFilter.SHOW_TEXT);let tn;while(tn=tw.nextNode())if(tn.nodeValue.trim()===data.projects[7].title)tn.nodeValue=pr.title;ul.append(li)
   }
  }
  window.KIIN_CMS_RENDER?.(data);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','src','srcset']});
 }
 let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})});
 if(document.readyState!=='complete')await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
 setTimeout(apply,700);
 window.addEventListener('resize',apply);
 // Full document navigation also supports the four added project routes.
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&new URL(a.href,location.href).origin===location.origin&&a.getAttribute('href')?.includes('/work/')&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();location.assign(a.href)}},true);
 if(preview){const b=document.createElement('a');b.href='/admin/';b.textContent='BẢN NHÁP · Quay lại CMS';b.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#263c2e;color:#fff;padding:12px 20px;border-radius:30px;font:13px system-ui;text-decoration:none';document.body.append(b)}
})()
