// Helpers DOM
export const $ = (sel, parent=document) => parent.querySelector(sel);
export const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));
export const fmtMoney = (n) => new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS'}).format(n ?? 0);

export function el(tag, attrs={}, children=[]){
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k.startsWith('on') && typeof v === 'function'){
      node.addEventListener(k.slice(2).toLowerCase(), v);
    }else if(k==='className'){
      node.className = v;
    }else{
      node.setAttribute(k, v);
    }
  });
  for(const child of [].concat(children)){
    if(child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}
