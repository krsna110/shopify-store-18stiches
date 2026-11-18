(()=>{
const T=window.theme,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=c=>{const n=c/100,f=T.money||'Rs. {{amount}}';
 const a=n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 const b=n.toLocaleString('en-IN',{maximumFractionDigits:0});
 return f.replace(/{{\s*amount_no_decimals\s*}}/,b).replace(/{{\s*\w+\s*}}/,a)};
const drawer=$('#CartDrawer');
let filterOpener=null;
const searchDrawer=$('[data-search-drawer]');let searchOpener=null,cartOpener=null;
const openDrawer=()=>{if(!drawer)return;drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('lock');$('.drawer__close',drawer)?.focus()};
const closeDrawer=()=>{drawer?.classList.remove('is-open');drawer?.setAttribute('aria-hidden','true');document.body.classList.remove('lock');if(cartOpener?.isConnected)cartOpener.focus()};
const openSearch=opener=>{if(!searchDrawer)return;searchOpener=opener;searchDrawer.classList.add('is-open');searchDrawer.setAttribute('aria-hidden','false');opener?.setAttribute('aria-expanded','true');document.body.classList.add('lock');$('[data-predictive-input]',searchDrawer)?.focus()};
const closeSearch=()=>{searchDrawer?.classList.remove('is-open');searchDrawer?.setAttribute('aria-hidden','true');document.body.classList.remove('lock');searchOpener?.setAttribute('aria-expanded','false');if(searchOpener?.isConnected)searchOpener.focus()};
const refresh=async()=>{
 const response=await fetch(`${T.routes.root}?sections=cart-drawer`,{headers:{Accept:'application/json'}});
 if(!response.ok)throw new Error('Could not refresh cart');
 const j=await response.json();
 if(!j['cart-drawer'])throw new Error('Cart drawer section unavailable');
 const d=new DOMParser().parseFromString(j['cart-drawer'],'text/html');
 const inner=$('#CartDrawerInner',d);if(!inner)throw new Error('Cart contents unavailable');
 $('#CartDrawerInner').innerHTML=inner.innerHTML;
 const cartResponse=await fetch(`${T.routes.cart}.js`,{headers:{Accept:'application/json'}});if(!cartResponse.ok)throw new Error('Could not refresh cart count');
 const c=await cartResponse.json();
 $$('[data-cart-count]').forEach(e=>{e.textContent=c.item_count;e.hidden=!c.item_count});
};
const showCartError=message=>{const m=$('[data-cart-error]',drawer);if(m){m.textContent=message;m.hidden=false}};
document.addEventListener('click',async e=>{
 const searchOpen=e.target.closest('[data-search-open]');if(searchOpen){e.preventDefault();openSearch(searchOpen);return}
 const searchClose=e.target.closest('[data-search-close]');if(searchClose){closeSearch();return}
 const submenuToggle=e.target.closest('[data-submenu-toggle]');if(submenuToggle){
  const item=submenuToggle.closest('.has-sub'),expanded=submenuToggle.getAttribute('aria-expanded')==='true';
  $$('.has-sub.is-expanded',item?.parentElement).forEach(openItem=>{if(openItem!==item){openItem.classList.remove('is-expanded');const button=$('[data-submenu-toggle]',openItem);button?.setAttribute('aria-expanded','false');button?.setAttribute('aria-label',`Show ${openItem.querySelector(':scope > a')?.textContent.trim()||'menu'} submenu`)}});
  item?.classList.toggle('is-expanded',!expanded);submenuToggle.setAttribute('aria-expanded',String(!expanded));
  submenuToggle.setAttribute('aria-label',`${expanded?'Show':'Hide'} ${item?.querySelector(':scope > a')?.textContent.trim()||'menu'} submenu`);return;
 }
 const thumb=e.target.closest('[data-gallery-thumb]');
 if(thumb){
  const sec=thumb.closest('[data-product-section]'),slide=sec?.querySelector(`[data-media-id="${thumb.dataset.galleryThumb}"]`);
  slide?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'start'});
  $$('[data-gallery-thumb]',thumb.parentElement).forEach(b=>{b.removeAttribute('aria-current');if(b===thumb)b.setAttribute('aria-current','true')});
  return;
 }
 const zoom=e.target.closest('[data-zoom-src]');
 if(zoom){const dlg=zoom.closest('[data-product-section]')?.querySelector('[data-product-zoom]');if(dlg){const im=$('[data-zoom-image]',dlg);im.src=zoom.dataset.zoomSrc;im.alt=zoom.dataset.zoomAlt||'';dlg.showModal()}return}
 const zoomClose=e.target.closest('[data-zoom-close]');if(zoomClose){zoomClose.closest('dialog')?.close();return}
 const guideOpen=e.target.closest('[data-size-guide-open]');
 if(guideOpen){document.getElementById(guideOpen.dataset.sizeGuideOpen)?.showModal();return}
 const guideClose=e.target.closest('[data-size-guide-close]');if(guideClose){guideClose.closest('dialog')?.close();return}
 const t=e.target.closest('[data-cart-open],[data-cart-close],[data-qty],[data-menu-toggle]');
 if(!t)return;
 if(t.matches('[data-menu-toggle]')){const h=$('[data-header]');const o=h.classList.toggle('is-open');t.setAttribute('aria-expanded',o);t.setAttribute('aria-label',o?'Close menu':'Open menu');if(!o)$$('[data-submenu-toggle]',h).forEach(b=>{b.setAttribute('aria-expanded','false');b.setAttribute('aria-label',`Show ${b.closest('.has-sub')?.querySelector(':scope > a')?.textContent.trim()||'menu'} submenu`);b.closest('.has-sub')?.classList.remove('is-expanded')})}
 else if(t.matches('[data-cart-open]')){cartOpener=t;if(drawer&&!document.body.classList.contains('template-cart')){e.preventDefault();openDrawer()}}
 else if(t.matches('[data-cart-close]')){closeDrawer()}
 else if(t.matches('[data-qty]')){
  $$('[data-qty]',drawer).forEach(b=>b.disabled=true);drawer.setAttribute('aria-busy','true');
  const loading=$('[data-cart-loading]',drawer);if(loading)loading.hidden=false;
  const error=$('[data-cart-error]',drawer);if(error)error.hidden=true;
  try{
   const response=await fetch(`${T.routes.cart_change}.js`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({line:+t.dataset.line,quantity:+t.dataset.value})});
   const result=await response.json();if(!response.ok)throw new Error(result.description||result.message||'Cart update failed');
   await refresh();$('.drawer__close',drawer)?.focus();
  }catch(err){try{await refresh()}catch(refreshError){}showCartError(err.message||'We could not update your bag. Please try again.');$('.drawer__close',drawer)?.focus()}
  finally{drawer.removeAttribute('aria-busy');const currentLoading=$('[data-cart-loading]',drawer);if(currentLoading)currentLoading.hidden=true}
 }
});
document.addEventListener('keydown',e=>{
 if(e.key==='Tab'){
  const activeDialog=drawer?.classList.contains('is-open')?$('.drawer__panel',drawer):searchDrawer?.classList.contains('is-open')?$('.search-drawer__panel',searchDrawer):null;
  if(activeDialog){const focusable=$$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',activeDialog).filter(el=>el.offsetParent!==null);if(focusable.length){const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
  return;
 }
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  const input=e.target.closest('[data-predictive-input]');if(input){const links=$$('a[role="option"]',input.closest('[data-predictive-search]'));if(links.length){e.preventDefault();links[e.key==='ArrowDown'?0:links.length-1].focus()}return}
 }
 if(e.key==='Escape'&&searchDrawer?.classList.contains('is-open')){closeSearch();return}
 if(e.key!=='Escape')return;
 const openSubmenu=$('.has-sub.is-expanded [data-submenu-toggle]');if(openSubmenu){const item=openSubmenu.closest('.has-sub');item?.classList.remove('is-expanded');openSubmenu.setAttribute('aria-expanded','false');openSubmenu.setAttribute('aria-label',`Show ${item?.querySelector(':scope > a')?.textContent.trim()||'menu'} submenu`);openSubmenu.focus();return}
 if(drawer?.classList.contains('is-open'))closeDrawer();
 if($('[data-filters]')?.classList.contains('is-open')){
  $('[data-filters]').classList.remove('is-open');document.body.classList.remove('filters-open','lock');filterOpener?.setAttribute('aria-expanded','false');filterOpener?.focus();
 }
 const h=$('[data-header]'),menu=$('[data-menu-toggle]',h);
 if(h?.classList.contains('is-open')){h.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open menu');$$('[data-submenu-toggle]',h).forEach(b=>{b.setAttribute('aria-expanded','false');b.setAttribute('aria-label',`Show ${b.closest('.has-sub')?.querySelector(':scope > a')?.textContent.trim()||'menu'} submenu`);b.closest('.has-sub')?.classList.remove('is-expanded')});menu?.focus()}
});
const msg=(f,t)=>{const m=$('[data-form-msg]',f);if(m)m.textContent=t||''};
document.addEventListener('submit',async e=>{
 const discount=e.target.closest('[data-discount-form]');
 if(discount){
  e.preventDefault();const input=$('[name=discount_code]',discount),code=input?.value.trim(),message=$('[data-discount-message]',discount);
  if(!code){input?.focus();return}
  if(message)message.textContent='Applying code…';
  const root=T.routes.root.endsWith('/')?T.routes.root:`${T.routes.root}/`;
  const target=`${root}discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(T.routes.cart)}`;
  window.location.assign(target);return;
 }
 const cartForm=e.target.closest('[data-cart-page-form]');
 if(cartForm&&e.submitter?.name==='update'){cartForm.setAttribute('aria-busy','true');e.submitter.disabled=true;e.submitter.setAttribute('aria-busy','true');e.submitter.textContent='Updating…'}
 const f=e.target.closest('[data-product-form]');if(!f||!drawer)return;
 e.preventDefault();const b=$('[name=add]',f);b.classList.add('is-loading');
 try{
  const j=await (await fetch(`${T.routes.cart_add}.js`,{method:'POST',headers:{Accept:'application/json'},body:new FormData(f)})).json();
  if(j.status){msg(f,j.description||j.message)}else{msg(f,'');cartOpener=b;await refresh();openDrawer()}
 }catch(err){msg(f,'Could not add to bag. Please try again.')}
 b.classList.remove('is-loading');
});
document.addEventListener('click',e=>{
 const step=e.target.closest('[data-cart-qty-step]');if(!step)return;
 const input=document.getElementById(step.dataset.qtyInput),form=input?.form;if(!input||!form)return;
 const next=Math.max(0,(Number.parseInt(input.value,10)||0)+Number(step.dataset.cartQtyStep));input.value=String(next);
 form.requestSubmit($('[name=update]',form));
});
$$('[data-predictive-search]').forEach(wrap=>{
 const input=$('[data-predictive-input]',wrap),list=$('[data-predictive-results]',wrap),status=$('[data-predictive-status]',wrap),clear=$('[data-search-clear]',wrap);
 let timer,controller;
 const hide=()=>{list.replaceChildren();list.hidden=true;input.setAttribute('aria-expanded','false')};
 const render=products=>{
  list.replaceChildren();
  products.forEach((product,index)=>{
   if(!product.url||!product.title)return;
   const href=new URL(product.url,location.origin);if(href.origin!==location.origin)return;
   const li=document.createElement('li'),a=document.createElement('a');li.className='predictive-search__item';a.className='predictive-search__link';a.href=href.pathname+href.search;a.id=`${list.id}-option-${index}`;a.setAttribute('role','option');a.setAttribute('aria-selected','false');a.tabIndex=-1;
   const rawImage=typeof product.featured_image==='string'?product.featured_image:product.featured_image?.url||product.image;
   if(rawImage){try{const imageUrl=new URL(rawImage,location.origin);if(['https:','http:'].includes(imageUrl.protocol)){const img=document.createElement('img');img.src=imageUrl.href;img.alt=product.featured_image?.alt||'';img.loading='lazy';img.width=64;img.height=82;a.append(img)}}catch(error){}}
   const info=document.createElement('span');info.className='predictive-search__info';const title=document.createElement('span');title.className='predictive-search__title';title.textContent=product.title;info.append(title);
   if(product.price!=null){const price=document.createElement('span');price.className='predictive-search__price';const raw=String(product.price);price.textContent=/^[\d,]+(?:\.\d+)?$/.test(raw)?fmt(Math.round(Number(raw.replace(/,/g,''))*100)):raw;info.append(price)}
   a.append(info);li.append(a);list.append(li);
   a.addEventListener('keydown',event=>{
    const links=$$('a[role="option"]',list),position=links.indexOf(a);
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();links[(position+(event.key==='ArrowDown'?1:-1)+links.length)%links.length]?.focus()}
    else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();hide();input.focus()}
   });
  });
  const count=list.children.length;list.hidden=count===0;input.setAttribute('aria-expanded',String(count>0));
  if(status)status.textContent=count?`${count} product suggestions available.`:'No product suggestions. Press Enter to search all products.';
 };
 input.addEventListener('input',()=>{
  clear.disabled=!input.value;status.textContent='';
  if(timer)clearTimeout(timer);controller?.abort();hide();
  const query=input.value.trim();if(query.length<2)return;
  status.textContent='Finding products…';
  timer=setTimeout(async()=>{
   controller=new AbortController();const params=new URLSearchParams({q:query,'resources[type]':'product','resources[limit]':'6','resources[options][unavailable_products]':'last','resources[options][fields]':'title,product_type,variants.title,vendor'});
   const endpoint=(T.routes.predictive_search||'/search/suggest').replace(/\/$/,'');
   try{const response=await fetch(`${endpoint}.json?${params}`,{headers:{Accept:'application/json'},signal:controller.signal});if(!response.ok)throw new Error('Search suggestions unavailable');const data=await response.json();render(data.resources?.results?.products||[])}
   catch(error){if(error.name!=='AbortError'){hide();status.textContent='Suggestions are unavailable. Press Enter to search.'}}
  },180);
 });
 clear.addEventListener('click',()=>{input.value='';clear.disabled=true;status.textContent='';hide();input.focus()});
 input.addEventListener('keydown',event=>{if(event.key==='Escape'&&!list.hidden){event.stopPropagation();hide()}});
 wrap.addEventListener('focusout',event=>{if(!wrap.contains(event.relatedTarget)){setTimeout(()=>{if(!wrap.contains(document.activeElement))hide()},80)}});
});
document.addEventListener('change',e=>{const f=e.target.form;if(!f||!f.matches('[data-filter-form]'))return;
 if(e.target.matches('#SortBy')||!matchMedia('(max-width: 900px)').matches)f.requestSubmit()});
document.addEventListener('click',e=>{const o=e.target.closest('[data-filter-open],[data-filter-close]');if(!o)return;
 const open=o.matches('[data-filter-open]'),panel=$('[data-filters]');
 if(open){filterOpener=o;o.setAttribute('aria-expanded','true');panel?.classList.add('is-open');document.body.classList.add('filters-open','lock');$('[data-filter-close]',panel)?.focus()}
 else{panel?.classList.remove('is-open');document.body.classList.remove('filters-open','lock');filterOpener?.setAttribute('aria-expanded','false');filterOpener?.focus()}
});
const pg=$('[data-plp-grid]');if(pg){const set=n=>{pg.style.setProperty('--cols',n);$$('[data-cols]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cols==n));try{localStorage.setItem('cols',n)}catch(x){}};
 let c='4';try{c=localStorage.getItem('cols')||'4'}catch(x){}set(c);document.addEventListener('click',e=>{const b=e.target.closest('[data-cols]');if(b)set(b.dataset.cols)})}
$$('[data-country-select]').forEach(select=>{const country=select.dataset.default;if(!country)return;const option=$$('option',select).find(item=>item.value===country||item.textContent.trim()===country);if(option)option.selected=true});
$$('[data-product-section]').forEach(sec=>{
 const data=JSON.parse($('[data-product-json]',sec).textContent);
 const groups=$$('[data-option-index]',sec);
 const sync=(updateUrl=true)=>{
  let sel=groups.length?groups.map(fs=>$('input:checked',fs)?.value):(data.variants[0]?.options||[]);
  groups.forEach((fs,i)=>{
   $$('[data-option]',fs).forEach(input=>{
    input.disabled=!data.variants.some(v=>v.available&&v.options[i]===input.value&&v.options.every((o,j)=>j===i||o===sel[j]));
   });
   const checked=$('input:checked',fs);
   if(checked?.disabled){
    const next=$$('[data-option]',fs).find(input=>!input.disabled);
    if(next){checked.checked=false;next.checked=true;sel[i]=next.value}
   }
  });
  groups.forEach((fs,i)=>$$('[data-option]',fs).forEach(input=>{
   input.disabled=!data.variants.some(v=>v.available&&v.options[i]===input.value&&v.options.every((o,j)=>j===i||o===sel[j]));
  }));
  const v=data.variants.find(v=>v.options.every((o,i)=>o===sel[i]));
  const btn=$('[name=add]',sec),price=$('[data-price]',sec);
  if(!v){btn.disabled=true;btn.textContent='Unavailable';return}
  $('[data-variant-id]',sec).value=v.id;
  btn.disabled=!v.available;btn.textContent=v.available?'Add to bag':'Sold out';
  const sku=$('[data-variant-sku]',sec),skuWrap=$('[data-variant-sku-wrap]',sec);if(sku)sku.textContent=v.sku||'';if(skuWrap)skuWrap.hidden=!v.sku;
  price.innerHTML=v.compare_at_price>v.price
   ?`<s class="price__was">${fmt(v.compare_at_price)}</s><span class="price__now price__now--sale">${fmt(v.price)}</span><span class="price__off">${Math.floor((v.compare_at_price-v.price)*100/v.compare_at_price)}% off</span>`
   :`<span class="price__now">${fmt(v.price)}</span>`;
  if(updateUrl)history.replaceState(null,'','?variant='+v.id);
 };
 sec.addEventListener('change',e=>{if(e.target.matches('[data-option]'))sync()});
 sync(false);
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
const WK='wishlist',wishlistPage=$('[data-wishlist-grid]'),wishlistStatus=$('[data-wishlist-status]'),wishlistEmpty=$('[data-wishlist-empty]');
const wget=()=>{try{const value=JSON.parse(localStorage.getItem(WK)||'[]');return Array.isArray(value)?[...new Set(value.filter(h=>typeof h==='string'&&/^[a-z0-9][a-z0-9-]*$/i.test(h)))]:[]}catch(e){return[]}};
const wsave=handles=>{try{localStorage.setItem(WK,JSON.stringify(handles));return true}catch(e){return false}};
const wpaint=()=>{const w=wget();$$('[data-wish]').forEach(b=>{const saved=w.includes(b.dataset.handle),title=b.dataset.title||'this product';b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',`${saved?'Remove':'Save'} ${title} ${saved?'from':'to'} wishlist`)});$$('[data-wish-count]').forEach(b=>{b.textContent=w.length;b.hidden=!w.length})};
let wishlistRenderToken=0;
const paintWishlist=async()=>{
 if(!wishlistPage)return;
 const renderToken=++wishlistRenderToken;
 const handles=wget();wishlistPage.replaceChildren();wishlistEmpty.hidden=handles.length>0;
 if(!handles.length){wishlistStatus.textContent='Your saved products are stored in this browser.';return}
 wishlistStatus.textContent='Loading your saved pieces…';
 const results=await Promise.all(handles.map(async handle=>{
  const root=T.routes.root.endsWith('/')?T.routes.root:`${T.routes.root}/`;
  try{const response=await fetch(`${root}products/${encodeURIComponent(handle)}.js`,{headers:{Accept:'application/json'}});if(response.status===404)return{handle,missing:true};if(!response.ok)throw new Error('Could not load saved products');return{handle,product:await response.json()}}
  catch(error){return{handle,error}}
 }));
 if(renderToken!==wishlistRenderToken)return;
 const missing=results.filter(result=>result.missing).map(result=>result.handle);if(missing.length)wsave(wget().filter(handle=>!missing.includes(handle)));
 const products=results.filter(result=>result.product).map(result=>result.product);
 products.forEach(product=>{
  const article=document.createElement('article');article.className='wishlist-card';
  const url=new URL(`${T.routes.root.replace(/\/$/,'')}/products/${encodeURIComponent(product.handle)}`,location.origin);if(url.origin!==location.origin)return;
  const media=document.createElement('a');media.className='wishlist-card__media';media.href=url.pathname+url.search;
  if(product.images?.[0]){try{const imageUrl=new URL(product.images[0],location.origin);imageUrl.searchParams.set('width','700');const image=document.createElement('img');image.src=imageUrl.href;image.alt=product.title;image.loading='lazy';image.width=500;image.height=650;media.append(image)}catch(error){}}
  const body=document.createElement('div');body.className='wishlist-card__body';const title=document.createElement('a');title.className='wishlist-card__title';title.href=media.href;title.textContent=product.title;
  const price=document.createElement('div');price.className='wishlist-card__price';
  if(product.compare_at_price>product.price){const was=document.createElement('s');was.textContent=fmt(product.compare_at_price);price.append(was)}
  const now=document.createElement('strong');now.textContent=fmt(product.price);price.append(now);
  if(product.compare_at_price>product.price){const discount=document.createElement('span');discount.className='wishlist-card__sale';discount.textContent=`${Math.floor((product.compare_at_price-product.price)*100/product.compare_at_price)}% off`;price.append(discount)}
  const availability=document.createElement('p');availability.className='wishlist-card__availability';availability.textContent=product.available?'':'Currently unavailable';
  const actions=document.createElement('div');actions.className='wishlist-card__actions';const view=document.createElement('a');view.className='btn';view.href=media.href;view.textContent=product.available?'View product':'View details';
  const remove=document.createElement('button');remove.type='button';remove.className='link';remove.dataset.wishRemove=product.handle;remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${product.title} from wishlist`);
  actions.append(view,remove);body.append(title,price);if(!product.available)body.append(availability);body.append(actions);article.append(media,body);wishlistPage.append(article);
 });
 wpaint();
 if(results.some(result=>result.error))wishlistStatus.textContent='Some saved products could not be loaded. Refresh the page to try again.';
 else if(!products.length){wishlistEmpty.hidden=false;wishlistStatus.textContent='Saved products are no longer available.'}
 else wishlistStatus.textContent=`${products.length} saved ${products.length===1?'piece':'pieces'} · stored in this browser.`;
};
document.addEventListener('click',e=>{
 const remove=e.target.closest('[data-wish-remove]');
 if(remove){const next=wget().filter(handle=>handle!==remove.dataset.wishRemove);if(!wsave(next)){wishlistStatus.textContent='Browser storage is unavailable. Your wishlist could not be updated.';return}wpaint();paintWishlist();return}
 const button=e.target.closest('[data-wish]');if(!button)return;e.preventDefault();
 const handles=wget(),handle=button.dataset.handle;if(!handle)return;
 const next=handles.includes(handle)?handles.filter(item=>item!==handle):[...handles,handle];
 if(!wsave(next)){if(wishlistStatus)wishlistStatus.textContent='Browser storage is unavailable. Your wishlist could not be updated.';return}
 wpaint();if(wishlistStatus)wishlistStatus.textContent=next.includes(handle)?`${button.dataset.title||'Product'} saved in this browser.`:`${button.dataset.title||'Product'} removed from your wishlist.`;paintWishlist();
});
wpaint();paintWishlist();window.addEventListener('storage',event=>{if(event.key===WK){wpaint();paintWishlist()}});
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
