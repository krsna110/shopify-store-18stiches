(()=>{
const T=window.theme,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=c=>{const n=c/100,f=T.money||'Rs. {{amount}}';
 const a=n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 const b=n.toLocaleString('en-IN',{maximumFractionDigits:0});
 return f.replace(/{{\s*amount_no_decimals\s*}}/,b).replace(/{{\s*\w+\s*}}/,a)};
const drawer=$('#CartDrawer');
const openDrawer=()=>{drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('lock');$('.drawer__close',drawer)?.focus()};
const closeDrawer=()=>{drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('lock')};
const refresh=async()=>{
 const j=await (await fetch(`${T.routes.root}?sections=cart-drawer`)).json();
 const d=new DOMParser().parseFromString(j['cart-drawer'],'text/html');
 $('#CartDrawerInner').innerHTML=$('#CartDrawerInner',d).innerHTML;
 const c=await (await fetch('/cart.js')).json();
 $$('[data-cart-count]').forEach(e=>{e.textContent=c.item_count;e.hidden=!c.item_count});
};
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-cart-open],[data-cart-close],[data-qty],[data-menu-toggle]');
 if(!t)return;
 if(t.matches('[data-menu-toggle]')){const h=$('[data-header]');const o=h.classList.toggle('is-open');t.setAttribute('aria-expanded',o)}
 else if(t.matches('[data-cart-open]')){if(drawer&&!document.body.classList.contains('template-cart')){e.preventDefault();openDrawer()}}
 else if(t.matches('[data-cart-close]')){closeDrawer()}
 else if(t.matches('[data-qty]')){
  t.disabled=true;
  await fetch(`${T.routes.cart_change}.js`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({line:+t.dataset.line,quantity:+t.dataset.value})});
  await refresh();
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer?.classList.contains('is-open'))closeDrawer()});
const msg=(f,t)=>{const m=$('[data-form-msg]',f);if(m)m.textContent=t||''};
document.addEventListener('submit',async e=>{
 const f=e.target.closest('[data-product-form]');if(!f||!drawer)return;
 e.preventDefault();const b=$('[name=add]',f);b.classList.add('is-loading');
 try{
  const j=await (await fetch(`${T.routes.cart_add}.js`,{method:'POST',headers:{Accept:'application/json'},body:new FormData(f)})).json();
  if(j.status){msg(f,j.description||j.message)}else{msg(f,'');await refresh();openDrawer()}
 }catch(err){msg(f,'Could not add to bag. Please try again.')}
 b.classList.remove('is-loading');
});
document.addEventListener('change',e=>{const f=e.target.form;if(!f||!f.matches('[data-filter-form]'))return;
 if(e.target.matches('#SortBy')||!matchMedia('(max-width: 900px)').matches)f.requestSubmit()});
document.addEventListener('click',e=>{const o=e.target.closest('[data-filter-open],[data-filter-close]');if(!o)return;
 const open=o.matches('[data-filter-open]');$('[data-filters]')?.classList.toggle('is-open',open);document.body.classList.toggle('filters-open',open);document.body.classList.toggle('lock',open)});
const pg=$('[data-plp-grid]');if(pg){const set=n=>{pg.style.setProperty('--cols',n);$$('[data-cols]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cols==n));try{localStorage.setItem('cols',n)}catch(x){}};
 let c='3';try{c=localStorage.getItem('cols')||'3'}catch(x){}set(c);document.addEventListener('click',e=>{const b=e.target.closest('[data-cols]');if(b)set(b.dataset.cols)})}
$$('[data-product-section]').forEach(sec=>{
 const data=JSON.parse($('[data-product-json]',sec).textContent);
 const sync=()=>{
  const sel=$$('[data-option-index]',sec).map(fs=>$('input:checked',fs)?.value);
  const v=data.variants.find(v=>v.options.every((o,i)=>o===sel[i]));
  const btn=$('[name=add]',sec),price=$('[data-price]',sec);
  if(!v){btn.disabled=true;btn.textContent='Unavailable';return}
  $('[data-variant-id]',sec).value=v.id;
  btn.disabled=!v.available;btn.textContent=v.available?'Add to bag':'Sold out';
  price.innerHTML=v.compare_at_price>v.price
   ?`<s class="price__was">${fmt(v.compare_at_price)}</s><span class="price__now price__now--sale">${fmt(v.price)}</span><span class="price__off">${Math.floor((v.compare_at_price-v.price)*100/v.compare_at_price)}% off</span>`
   :`<span class="price__now">${fmt(v.price)}</span>`;
  history.replaceState(null,'','?variant='+v.id);
 };
 sec.addEventListener('change',e=>{if(e.target.matches('[data-option]'))sync()});
});
$$('[data-recs]').forEach(async el=>{
 try{const t=await (await fetch(el.dataset.url)).text();
  const n=$('[data-recs]',new DOMParser().parseFromString(t,'text/html'));
  if(n&&n.children.length)el.innerHTML=n.innerHTML;else el.closest('section').hidden=true;
 }catch(e){}
});

$$('[data-slider]').forEach(s=>{const tr=$('[data-slider-track]',s),n=tr.children.length;if(n<2)return;let i=0;
 const go=k=>{i=(k+n)%n;tr.scrollTo({left:tr.clientWidth*i,behavior:'smooth'})};
 $('[data-prev]',s).addEventListener('click',()=>go(i-1));$('[data-next]',s).addEventListener('click',()=>go(i+1));
 tr.addEventListener('scroll',()=>{i=Math.round(tr.scrollLeft/tr.clientWidth)},{passive:true});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const t=setInterval(()=>go(i+1),5500);s.addEventListener('mouseenter',()=>clearInterval(t));s.addEventListener('touchstart',()=>clearInterval(t),{passive:true})}});
const WK='wishlist',wget=()=>{try{return JSON.parse(localStorage.getItem(WK)||'[]')}catch(e){return[]}};
const wpaint=()=>{const w=wget();$$('[data-wish]').forEach(b=>b.setAttribute('aria-pressed',w.includes(b.dataset.handle)))};
document.addEventListener('click',e=>{const b=e.target.closest('[data-wish]');if(!b)return;e.preventDefault();
 let w=wget();const h=b.dataset.handle;w=w.includes(h)?w.filter(x=>x!==h):[...w,h];
 try{localStorage.setItem(WK,JSON.stringify(w))}catch(x){}wpaint()});
wpaint();
document.addEventListener('click',e=>{const t=e.target.closest('[data-seo-toggle]');if(!t)return;const s=t.closest('[data-seo]');const o=s.classList.toggle('is-open');t.textContent=o?'View less':'View more'});
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-unit]');if(!btn)return;
 const wrap=btn.closest('[data-size-guide]');if(!wrap)return;
 const u=btn.dataset.unit;
 wrap.querySelectorAll('[data-unit]').forEach(b=>b.classList.toggle('is-active',b===btn));
 const tbl=wrap.querySelector('.size-table');
 if(tbl){tbl.querySelectorAll('td[data-in]').forEach(td=>{td.textContent=td.dataset[u]||td.dataset.in})}
});
})();
