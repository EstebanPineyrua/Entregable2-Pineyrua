// Modelos y tipados ligeros (sin TS)
export class Product {
  constructor({ id, name, price, stock }){
    this.id = id ?? crypto.randomUUID();
    this.name = String(name).trim();
    this.price = Number(price);
    this.stock = Number.isFinite(Number(stock)) ? Number(stock) : 0;
  }
}
export class CartItem {
  constructor(product, qty=1){
    this.productId = product.id;
    this.name = product.name;
    this.price = product.price;
    this.qty = qty;
  }
  get subtotal(){ return this.qty * this.price; }
}
