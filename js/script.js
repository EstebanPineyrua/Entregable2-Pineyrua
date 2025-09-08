// Espera a que el contenido del DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DATOS INICIALES Y DEFINICIONES ---

    // Array de objetos con la información de los productos.
    // Esta es la "información estática" de nuestro simulador.
    const products = [
        { id: 1, name: "Procesador Ryzen 5", price: 250 },
        { id: 2, name: "Tarjeta Gráfica RTX 4070", price: 400 },
        { id: 3, name: "Memoria RAM 16GB", price: 80 },
        { id: 4, name: "SSD 1TB", price: 120 },
    ];

    // Array para almacenar los productos del carrito.
    // Se inicializa cargando los datos desde localStorage, o como un array vacío si no hay nada.
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- 2. SELECCIÓN DE ELEMENTOS DEL DOM ---

    // Se obtienen las referencias a los elementos HTML para no tener que buscarlos repetidamente.
    const productListContainer = document.getElementById('product-list');
    const productSelect = document.getElementById('product-select');
    const addToCartForm = document.getElementById('add-to-cart-form');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    // --- 3. FUNCIONES PRINCIPALES ---

    /**
     * Función para renderizar (mostrar) los productos en la página.
     * Lee el array `products` y crea el HTML correspondiente.
     */
    function renderProducts() {
        // Muestra las tarjetas de productos
        productListContainer.innerHTML = ''; // Limpia el contenedor primero
        products.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <h3>${product.name}</h3>
                    <p>Precio: $${product.price.toFixed(2)}</p>
                </div>
            `;
            productListContainer.innerHTML += productCard;
        });

        // Carga los productos en el menú desplegable del formulario
        productSelect.innerHTML = '';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    }

    /**
     * Función para renderizar los items del carrito en el DOM.
     * También actualiza el total.
     */
    function renderCart() {
        cartItemsContainer.innerHTML = ''; // Limpia el contenedor del carrito
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const cartItemHTML = `
                    <div class="cart-item">
                        <span>${item.name} (x${item.quantity})</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;
            });
        }
        updateCartTotal();
        saveCartToStorage(); // Guarda el carrito en localStorage cada vez que se actualiza
    }

    /**
     * Función para actualizar el precio total del carrito.
     */
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.textContent = total.toFixed(2);
    }
    
    /**
     * Función para guardar el estado actual del carrito en localStorage.
     */
    function saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
     * Maneja la lógica de agregar un producto al carrito.
     * @param {number} productId - El ID del producto a agregar.
     * @param {number} quantity - La cantidad del producto.
     */
    function handleAddToCart(productId, quantity) {
        // Busca si el producto ya está en el carrito
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            // Si ya existe, solo actualiza la cantidad
            existingItem.quantity += quantity;
        } else {
            // Si es nuevo, busca los detalles del producto y lo agrega al carrito
            const productToAdd = products.find(p => p.id === productId);
            cart.push({ ...productToAdd, quantity: quantity });
        }

        renderCart(); // Vuelve a dibujar el carrito para mostrar los cambios
    }


    // --- 4. EVENT LISTENERS (MANEJADORES DE EVENTOS) ---

    // Evento para el formulario: se dispara al hacer clic en "Agregar al Carrito".
    addToCartForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario

        const selectedProductId = parseInt(productSelect.value);
        const quantity = parseInt(document.getElementById('quantity-input').value);

        // Llama a la función que maneja la lógica de agregar al carrito
        handleAddToCart(selectedProductId, quantity);
        
        // Opcional: resetear el formulario
        addToCartForm.reset();
    });

    // Evento para el botón de vaciar carrito.
    clearCartBtn.addEventListener('click', () => {
        cart = []; // Limpia el array del carrito
        renderCart(); // Actualiza la vista del carrito (que ahora estará vacío)
    });


    // --- 5. INICIALIZACIÓN ---

    // Llama a las funciones iniciales para que la página se cargue con los datos correctos.
    renderProducts(); // Dibuja la lista de productos y el select
    renderCart(); // Dibuja el carrito con los datos de localStorage (si existen)
});