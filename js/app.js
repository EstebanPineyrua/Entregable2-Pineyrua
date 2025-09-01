import { Product, CartItem } from './models.js';
import { storage } from './storage.js';
import { $, $$, el, fmtMoney } from './dom.js';

// Estado
let catalog = storage.read('catalog', []);
let cart = storage.read('cart', []);

// Elementos
const catalogBody = $('#catalog-body');
const cartBody = $('#cart-body');
const itemsCount = $('#items-count');
const orderTotal = $('#order-total');
const form = $('#product-form');
const formMsg = $('#form-msg');
const search = $('#search');
const seedBtn = $('#seed-data');
const clearCatalogBtn = $('#clear-catalog');
const clearCartBtn = $('#clear-cart');
const checkoutForm = $('#checkout-form');
const checkoutMsg = $('#checkout-msg');

// Render
function renderCatalog(list = catalog){
  catalogBody.innerHTML = '';
  for(const p of list){
    const tr = el('tr', {}, [
      el('td', {}, [p.name, ' ', el('span', {className:'badge'}, [`#${p.id.slice(0,6)}`]) ]),
      el('td', {className:'price'}, [fmtMoney(p.price)]),
      el('td', {}, [String(p.stock)]),
      el('td', {}, [
        el('button', {className:'btn', onClick: ()=> handleAddToCart(p.id)}, ['Agregar']),
        ' ',
        el('button', {className:'btn', onClick: ()=> fillFormForEdit(p.id)}, ['Editar']),
        ' ',
        el('button', {className:'btn danger', onClick: ()=> deleteProduct(p.id)}, ['Eliminar']),
      ])
    ]);
    catalogBody.append(tr);
  }
}
function renderCart(){
  cartBody.innerHTML = '';
  let total = 0;
  let count = 0;
  for(const item of cart){
    total += item.price * item.qty;
    count += item.qty;
    const tr = el('tr', {}, [
      el('td', {}, [item.name]),
      el('td', {className:'price'}, [fmtMoney(item.price)]),
      el('td', {}, [
        el('button', {className:'icon-btn', onClick: ()=> updateQty(item.productId, item.qty - 1)}, ['−']),
        ' ' + item.qty + ' ',
        el('button', {className:'icon-btn', onClick: ()=> updateQty(item.productId, item.qty + 1)}, ['+']),
      ]),
      el('td', {className:'price'}, [fmtMoney(item.subtotal)]),
      el('td', {}, [
        el('button', {className:'btn danger', onClick: ()=> removeFromCart(item.productId)}, ['Quitar'])
      ])
    ]);
    cartBody.append(tr);
  }
  itemsCount.textContent = `${count} ítems`;
  orderTotal.textContent = fmtMoney(total);
}
function persist(){
  storage.write('catalog', catalog);
  storage.write('cart', cart);
}

// Catálogo (CRUD)
function addOrUpdateProduct(data){
  const product = new Product(data);
  const idx = catalog.findIndex(p => p.id === product.id);
  if(idx >= 0){
    catalog[idx] = product;
    showFormMsg('Producto actualizado ✅');
  }else{
    catalog.push(product);
    showFormMsg('Producto agregado ✅');
  }
  persist(); renderCatalog();
  form.reset();
  $('#product-id').value = '';
}
function deleteProduct(id){
  catalog = catalog.filter(p => p.id !== id);
  persist(); renderCatalog();
}
function fillFormForEdit(id){
  const p = catalog.find(p=> p.id === id);
  if(!p) return;
  $('#product-id').value = p.id;
  $('#name').value = p.name;
  $('#price').value = p.price;
  $('#stock').value = p.stock;
  showFormMsg('Editando producto. Guardá para confirmar… ✍️');
}
function showFormMsg(msg){
  formMsg.textContent = msg;
  setTimeout(()=>{ formMsg.textContent = ''; }, 2500);
}

// Carrito
function handleAddToCart(id){
  const p = catalog.find(p=> p.id === id);
  if(!p || p.stock <= 0) return;
  const existing = cart.find(ci => ci.productId === id);
  if(existing){
    if(existing.qty < p.stock){ existing.qty++; }
  }else{
    cart.push(new CartItem(p, 1));
  }
  persist(); renderCart();
}
function removeFromCart(id){
  cart = cart.filter(ci => ci.productId !== id);
  persist(); renderCart();
}
function updateQty(id, qty){
  const p = catalog.find(p=> p.id === id);
  const item = cart.find(ci => ci.productId === id);
  if(!item || !p) return;
  if(qty <= 0){
    removeFromCart(id);
    return;
  }
  if(qty > p.stock){
    checkoutMsg.textContent = 'No hay stock suficiente para aumentar más 😬';
    setTimeout(()=> checkoutMsg.textContent = '', 2000);
    return;
  }
  item.qty = qty;
  persist(); renderCart();
}

// Búsqueda en catálogo
function filterCatalog(term){
  term = term.trim().toLowerCase();
  if(!term) return renderCatalog();
  const filtered = catalog.filter(p => p.name.toLowerCase().includes(term));
  renderCatalog(filtered);
}

// Eventos
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = $('#product-id').value || undefined;
  const name = $('#name').value;
  const price = parseFloat($('#price').value);
  const stock = parseInt($('#stock').value, 10);
  if(!name || !Number.isFinite(price) || !Number.isInteger(stock)){
    showFormMsg('Completá todos los campos correctamente.');
    return;
  }
  addOrUpdateProduct({ id, name, price, stock });
});

$('#reset-form').addEventListener('click', ()=>{
  $('#product-id').value = '';
  formMsg.textContent = '';
});

search.addEventListener('input', (e)=> filterCatalog(e.target.value));

seedBtn.addEventListener('click', async ()=>{
  try{
    const resp = await fetch('./data/seed.json');
    const data = await resp.json();
    // Evita duplicados por id
    const ids = new Set(catalog.map(p => p.id));
    for(const raw of data){
      if(!ids.has(raw.id)){
        catalog.push(new Product(raw));
      }
    }
    persist(); renderCatalog();
  }catch(err){
    console.error(err);
  }
});

clearCatalogBtn.addEventListener('click', ()=>{
  catalog = [];
  persist(); renderCatalog();
});

clearCartBtn.addEventListener('click', ()=>{
  cart = [];
  persist(); renderCart();
});

checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  if(cart.length === 0){
    checkoutMsg.textContent = 'Agregá productos al carrito antes de confirmar.';
    setTimeout(()=> checkoutMsg.textContent = '', 2500);
    return;
  }
  const formData = new FormData(checkoutForm);
  const order = {
    id: crypto.randomUUID(),
    customer: formData.get('customer'),
    email: formData.get('email'),
    items: cart.map(ci => ({ id: ci.productId, name: ci.name, price: ci.price, qty: ci.qty })),
    total: cart.reduce((acc, it) => acc + it.subtotal, 0),
    createdAt: new Date().toISOString()
  };
  // Guardar historial de pedidos en storage
  const history = storage.read('orders', []);
  history.push(order);
  storage.write('orders', history);

  // Descontar stock
  for(const it of cart){
    const p = catalog.find(p => p.id === it.productId);
    if(p){ p.stock -= it.qty; }
  }
  cart = [];
  persist(); renderCatalog(); renderCart();
  checkoutForm.reset();
  checkoutMsg.textContent = `¡Pedido ${order.id.slice(0,6)} confirmado por ${order.customer}!`;
  setTimeout(()=> checkoutMsg.textContent = '', 3500);
});

// Inicio
function init(){
  // Primera carga: si no hay catálogo, crear arreglo vacío para cumplir criterios
  if(!Array.isArray(catalog)) catalog = [];
  if(!Array.isArray(cart)) cart = [];
  renderCatalog();
  renderCart();
}
document.addEventListener('DOMContentLoaded', init);
