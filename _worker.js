const enc=new TextEncoder();
const json=(v,status=200,headers={})=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function hash(v){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(v))),x=>x.toString(16).padStart(2,'0')).join('')}
async function equal(a,b){const [x,y]=await Promise.all([hash(a),hash(b)]);return crypto.subtle.timingSafeEqual(enc.encode(x),enc.encode(y))}
async function readBody(r,max=1000000){const reader=r.body?.getReader();if(!reader)return '';let n=0,chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>max){await reader.cancel();throw new Error('Payload too large')}chunks.push(value)}const b=new Uint8Array(n);let at=0;for(const c of chunks){b.set(c,at);at+=c.length}return b}
async function defaults(env,request){return (await env.ASSETS.fetch(new Request(new URL('/cms-default.json',request.url)))).json()}
async function auth(request,env){const token=request.headers.get('Cookie')?.match(/(?:^|; )cms_session=([a-f0-9]+)/)?.[1];return token&&await env.CMS.get('session:'+await hash(token))}
function validate(doc,base){if(!doc||typeof doc.pages!=='object'||!Array.isArray(doc.projects))throw new Error('Nội dung không hợp lệ');if(Object.keys(doc.pages).sort().join()!==Object.keys(base.pages).sort().join())throw new Error('Danh sách trang không hợp lệ');for(const [p,page] of Object.entries(base.pages)){const fields=doc.pages[p]?.fields;if(!fields||Object.keys(fields).sort().join()!==Object.keys(page.fields).sort().join())throw new Error('Thiếu trường nội dung');for(const [id,f] of Object.entries(fields)){const original=page.fields[id];if(f.type!==original.type||f.original!==original.original||typeof f.value!=='string'||f.value.length>20000)throw new Error('Trường không hợp lệ');if(f.type!=='text'&&!/^(https?:\/\/|mailto:|tel:|\/|\.\.?\/|#)/i.test(f.value))throw new Error('Liên kết hoặc ảnh phải dùng URL an toàn');if(f.type==='image'&&f.alt!==undefined&&typeof f.alt!=='string')throw new Error('Alt ảnh không hợp lệ')}}}
export default {async fetch(request,env){try{
 const u=new URL(request.url),p=u.pathname;
 if(p.startsWith('/cms-media/')){const k=p.split('/').pop();if(!/^[a-f0-9-]+$/.test(k))return new Response('Not found',{status:404});const v=await env.CMS.getWithMetadata('media:'+k,{type:'arrayBuffer'});return v.value?new Response(v.value,{headers:{'Content-Type':v.metadata.type,'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}}):new Response('Not found',{status:404})}
 if(!p.startsWith('/api/cms/'))return env.ASSETS.fetch(request);
 if(request.method!=='GET'&&request.headers.get('Origin')!==u.origin)return json({error:'Origin không hợp lệ'},403);
 if(p==='/api/cms/public')return json(await env.CMS.get('published','json')||await defaults(env,request));
 if(p==='/api/cms/login'&&request.method==='POST'){
  const ip=await hash(request.headers.get('CF-Connecting-IP')||'unknown');const key='login:'+ip;const tries=Number(await env.CMS.get(key)||0);if(tries>=8)return json({error:'Thử lại sau 15 phút'},429);
  const b=JSON.parse(new TextDecoder().decode(await readBody(request,4096)));const saved=await env.CMS.get('password');const correct=saved?await equal(await hash(String(b.password)),saved):env.CMS_PASSWORD&&await equal(String(b.password),env.CMS_PASSWORD);
  if(!correct){await env.CMS.put(key,String(tries+1),{expirationTtl:900});return json({error:'Mật khẩu không đúng'},401)}
  await env.CMS.delete(key);const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');await env.CMS.put('session:'+await hash(token),'1',{expirationTtl:28800});return json({ok:true},200,{'Set-Cookie':`cms_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`})
 }
 if(!await auth(request,env))return json({error:'Vui lòng đăng nhập'},401);
 if(p==='/api/cms/logout'){const token=request.headers.get('Cookie')?.match(/cms_session=([a-f0-9]+)/)?.[1];if(token)await env.CMS.delete('session:'+await hash(token));return json({ok:true},200,{'Set-Cookie':'cms_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'})}
 if(p==='/api/cms/password'&&request.method==='POST'){const b=JSON.parse(new TextDecoder().decode(await readBody(request,4096)));if(typeof b.password!=='string'||b.password.length<12)return json({error:'Dùng mật khẩu ít nhất 12 ký tự'},400);await env.CMS.put('password',await hash(b.password));return json({ok:true})}
 if(p==='/api/cms/upload'&&request.method==='POST'){const type=request.headers.get('Content-Type');if(!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(type))return json({error:'Chỉ nhận JPG, PNG, WebP, GIF, AVIF'},400);const bytes=await readBody(request,5000000);const id=crypto.randomUUID();await env.CMS.put('media:'+id,bytes,{metadata:{type}});return json({url:'/cms-media/'+id})}
 const base=await defaults(env,request);
 if(p==='/api/cms/draft'&&request.method==='GET')return json(await env.CMS.get('draft','json')||await env.CMS.get('published','json')||{...base,revision:0});
 if(p==='/api/cms/draft'&&request.method==='PUT'){
  const doc=JSON.parse(new TextDecoder().decode(await readBody(request)));validate(doc,base);const current=await env.CMS.get('draft','json');if(current&&current.revision!==doc.revision)return json({error:'Nội dung đã thay đổi ở phiên khác. Tải lại trước khi lưu.'},409);doc.revision=(doc.revision||0)+1;doc.updatedAt=new Date().toISOString();await env.CMS.put('draft',JSON.stringify(doc));return json(doc)
 }
 if(p==='/api/cms/publish'&&request.method==='POST'){const doc=await env.CMS.get('draft','json');if(!doc)return json({error:'Hãy lưu nháp trước'},400);validate(doc,base);const prev=await env.CMS.get('published');if(prev)await env.CMS.put('previous',prev);doc.publishedAt=new Date().toISOString();await env.CMS.put('published',JSON.stringify(doc));return json({ok:true,publishedAt:doc.publishedAt})}
 if(p==='/api/cms/restore'&&request.method==='POST'){const prev=await env.CMS.get('previous','json');if(!prev)return json({error:'Chưa có phiên bản trước'},404);const current=await env.CMS.get('draft','json');prev.revision=(current?.revision||0)+1;await env.CMS.put('draft',JSON.stringify(prev));return json(prev)}
 return json({error:'Không tìm thấy'},404);
 }catch(e){console.error('cms_request_failed',e.message);return json({error:e.message==='Payload too large'?'File hoặc nội dung quá lớn':'Không xử lý được yêu cầu'},400)}}};
