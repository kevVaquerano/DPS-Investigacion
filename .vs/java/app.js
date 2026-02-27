// app.js




// ===============================
// VARIABLES GLOBALES
// ===============================
let productos = []; 
let carrito = [];

export async function cargarProductosDesdeDB() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos');
        // Guardamos los datos que vienen de Railway en nuestra variable global 'productos'
        productos = await respuesta.json(); 
        mostrarProductos(); // Ahora sí, mostramos lo que trajo la DB
    } catch (error) {
        console.error("No se pudo conectar con el servidor", error);
        listaProductos.innerHTML = "<p>Error al cargar productos. ¿Olvidaste encender el servidor Node?</p>";
    }
}

// Elementos del DOM
const listaProductos = document.getElementById("lista-productos");
const itemsCarrito = document.getElementById("items-carrito");
const totalGeneral = document.getElementById("total-general");
const btnConfirmar = document.getElementById("btn-confirmar");
const modal = document.getElementById("modal-factura");
const detalleFactura = document.getElementById("detalle-factura");
const btnSeguir = document.getElementById("btn-seguir-comprando");

// ===============================
// MOSTRAR PRODUCTOS EN EL DOM
// ===============================

function mostrarProductos() {
    listaProductos.innerHTML = "";
    
    if (!Array.isArray(productos)) return;

    productos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto-card");

        div.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion || ''}</p>
            <p>Stock: <strong>${producto.stock}</strong></p>
            <p><strong>$${parseFloat(producto.precio).toFixed(2)}</strong></p>
            <button class="btn-primary" data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>
                ${producto.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
        `;
        listaProductos.appendChild(div);
    });
}

// ===============================
// AGREGAR PRODUCTO AL CARRITO
// ===============================
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    actualizarCarrito();
}

// ===============================
// ELIMINAR PRODUCTO
// ===============================
function eliminarProducto(id) {
    carrito = carrito.filter(producto => producto.id !== id);
    actualizarCarrito();
}

// ===============================
// ACTUALIZAR TABLA DEL CARRITO
// ===============================
function actualizarCarrito() {
    itemsCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-danger" data-id="${producto.id}">
                    X
                </button>
            </td>
        `;

        itemsCarrito.appendChild(tr);
    });

    totalGeneral.textContent = total.toFixed(2);
}

// ===============================
// GENERAR FACTURA
// ===============================
function generarFactura() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    detalleFactura.innerHTML = "<h3>Detalle de Compra:</h3>";
    let total = 0;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        detalleFactura.innerHTML += `
            <p>
                ${producto.nombre} x${producto.cantidad} 
                - $${subtotal.toFixed(2)}
            </p>
        `;
    });

    detalleFactura.innerHTML += `
        <hr>
        <strong>Total Pagado: $${total.toFixed(2)}</strong>
    `;

    modal.style.display = "flex";
}

// ===============================
// EVENTOS
// ===============================

// Delegación de eventos para productos
listaProductos.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-primary")) {
        const id = parseInt(e.target.dataset.id);
        agregarAlCarrito(id);
    }
});

// Delegación de eventos para eliminar
itemsCarrito.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-danger")) {
        const id = parseInt(e.target.dataset.id);
        eliminarProducto(id);
    }
});


// Confirmar compra
btnConfirmar.addEventListener("click", generarFactura);

// Seguir comprando
btnSeguir.addEventListener("click", () => {
    modal.style.display = "none";
    carrito = [];
    actualizarCarrito();
});

// ===============================
// INICIALIZAR APP
// ===============================
mostrarProductos();