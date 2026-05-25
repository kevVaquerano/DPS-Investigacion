// app.js

import { productos } from "./BD.js";

let carrito = JSON.parse(localStorage.getItem("carritoAmaretto")) || [];

const listaProductos = document.getElementById("lista-productos");

const itemsCarrito = document.getElementById("items-carrito");
const totalGeneral = document.getElementById("total-general");
const btnConfirmar = document.getElementById("btn-confirmar");

const modal = document.getElementById("modal-factura");
const detalleFactura = document.getElementById("detalle-factura");
const btnSeguir = document.getElementById("btn-seguir-comprando");

const modalPago = document.getElementById("modal-pago");
const btnPagoEfectivo = document.getElementById("btn-pago-efectivo");
const btnPagoTarjeta = document.getElementById("btn-pago-tarjeta");
const formPagoTarjeta = document.getElementById("form-pago-tarjeta");
const btnCerrarPago = document.getElementById("btn-cerrar-pago");
const mensajePago = document.getElementById("mensaje-pago");

const itemsCarritoFlotante = document.getElementById("items-carrito-flotante");
const subtotalFlotante = document.getElementById("subtotal-flotante");
const ivaFlotante = document.getElementById("iva-flotante");
const totalFlotante = document.getElementById("total-flotante");
const btnConfirmarFlotante = document.getElementById("btn-confirmar-flotante");
const carritoFlotante = document.getElementById("carritoFlotante");
const contadorCarrito = document.getElementById("contador-carrito");
const btnSeguirOffcanvas = document.getElementById("btn-seguir-comprando-offcanvas");

function guardarCarrito() {
    localStorage.setItem("carritoAmaretto", JSON.stringify(carrito));
}

function obtenerVendidoProducto(idProducto) {
    const ventas = JSON.parse(localStorage.getItem("ventasAmaretto")) || [];
    let vendido = 0;

    ventas.forEach(venta => {
        venta.productos.forEach(producto => {
            if (producto.id === idProducto) {
                vendido += producto.cantidad;
            }
        });
    });

    return vendido;
}

function obtenerStockDisponible(idProducto) {
    const producto = productos.find(p => p.id === idProducto);

    if (!producto) return 0;

    const vendido = obtenerVendidoProducto(idProducto);
    const enCarrito = carrito.find(p => p.id === idProducto)?.cantidad || 0;

    return producto.stock - vendido - enCarrito;
}

function mostrarProductos() {
    listaProductos.innerHTML = "";

    productos.forEach(producto => {
        const vendido = obtenerVendidoProducto(producto.id);
        const disponible = producto.stock - vendido;
        const sinStock = disponible <= 0;

        const div = document.createElement("div");
        div.classList.add("producto-card");

        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <span class="badge bg-warning text-dark mb-2">${producto.categoria}</span>
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p class="precio-producto"><strong>$${producto.precio.toFixed(2)}</strong></p>
            <p class="${sinStock ? "estado-stock-bajo" : "estado-stock-ok"}">
                Stock disponible: ${disponible}
            </p>
            <button class="btn-primary btn-agregar" data-id="${producto.id}" ${sinStock ? "disabled" : ""}>
                <i class="bi bi-cart-plus-fill"></i> ${sinStock ? "Sin stock" : "Agregar al carrito"}
            </button>
        `;

        listaProductos.appendChild(div);
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);

    if (!producto) return;

    const stockDisponible = obtenerStockDisponible(id);

    if (stockDisponible <= 0) {
        alert(`No hay más stock disponible para ${producto.nombre}.`);
        return;
    }

    const existe = carrito.find(p => p.id === id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarrito();
    mostrarProductos();
    abrirCarritoFlotante();
}

function aumentarCantidad(id) {
    const producto = carrito.find(p => p.id === id);
    const productoBase = productos.find(p => p.id === id);

    if (!producto || !productoBase) return;

    const vendido = obtenerVendidoProducto(id);
    const stockMaximoDisponible = productoBase.stock - vendido;

    if (producto.cantidad >= stockMaximoDisponible) {
        alert(`Solo hay ${stockMaximoDisponible} unidades disponibles de ${producto.nombre}.`);
        return;
    }

    producto.cantidad++;

    guardarCarrito();
    actualizarCarrito();
    mostrarProductos();
}

function disminuirCantidad(id) {
    const producto = carrito.find(p => p.id === id);

    if (!producto) return;

    if (producto.cantidad > 1) {
        producto.cantidad--;
    } else {
        eliminarProducto(id);
        return;
    }

    guardarCarrito();
    actualizarCarrito();
    mostrarProductos();
}

function eliminarProducto(id) {
    carrito = carrito.filter(producto => producto.id !== id);

    guardarCarrito();
    actualizarCarrito();
    mostrarProductos();
}

function calcularTotales(lista = carrito) {
    const subtotal = lista.reduce((acumulador, producto) => {
        return acumulador + producto.precio * producto.cantidad;
    }, 0);

    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    return {
        subtotal,
        iva,
        total
    };
}

function actualizarContadorCarrito() {
    if (!contadorCarrito) return;

    const cantidadTotal = carrito.reduce((total, producto) => {
        return total + producto.cantidad;
    }, 0);

    contadorCarrito.textContent = cantidadTotal;

    if (cantidadTotal === 0) {
        contadorCarrito.classList.add("d-none");
    } else {
        contadorCarrito.classList.remove("d-none");
    }
}

function actualizarCarrito() {
    actualizarCarritoOculto();
    actualizarCarritoFlotante();
    actualizarContadorCarrito();
}

function actualizarCarritoOculto() {
    if (!itemsCarrito || !totalGeneral) return;

    itemsCarrito.innerHTML = "";

    if (carrito.length === 0) {
        itemsCarrito.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    Tu carrito está vacío.
                </td>
            </tr>
        `;

        totalGeneral.textContent = "0.00";
        return;
    }

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-danger btn-eliminar" data-id="${producto.id}">
                    X
                </button>
            </td>
        `;

        itemsCarrito.appendChild(tr);
    });

    const totales = calcularTotales();
    totalGeneral.textContent = totales.total.toFixed(2);
}

function actualizarCarritoFlotante() {
    if (!itemsCarritoFlotante) return;

    itemsCarritoFlotante.innerHTML = "";

    if (carrito.length === 0) {
        itemsCarritoFlotante.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-cart-x fs-2 d-block mb-2"></i>
                <p>Tu carrito está vacío.</p>
            </div>
        `;

        subtotalFlotante.textContent = "0.00";
        ivaFlotante.textContent = "0.00";
        totalFlotante.textContent = "0.00";
        return;
    }

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        const productoBase = productos.find(p => p.id === producto.id);
        const vendido = obtenerVendidoProducto(producto.id);
        const stockMaximoDisponible = productoBase.stock - vendido;

        const div = document.createElement("div");
        div.classList.add("item-flotante");

        div.innerHTML = `
            <h6>${producto.nombre}</h6>

            <p>
                ${producto.categoria}<br>
                $${producto.precio.toFixed(2)} x ${producto.cantidad}
            </p>

            <small class="d-block mb-2">
                Stock restante después de esta selección: <strong>${stockMaximoDisponible - producto.cantidad}</strong>
            </small>

            <div class="item-flotante-acciones">
                <div>
                    <button class="btn-cantidad-flotante btn-restar" data-id="${producto.id}">-</button>
                    <span class="mx-2">${producto.cantidad}</span>
                    <button class="btn-cantidad-flotante btn-sumar" data-id="${producto.id}">+</button>
                </div>

                <button class="btn-eliminar-flotante btn-eliminar" data-id="${producto.id}">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>

            <small class="d-block mt-2">
                Subtotal: <strong>$${subtotal.toFixed(2)}</strong>
            </small>
        `;

        itemsCarritoFlotante.appendChild(div);
    });

    const totales = calcularTotales();

    subtotalFlotante.textContent = totales.subtotal.toFixed(2);
    ivaFlotante.textContent = totales.iva.toFixed(2);
    totalFlotante.textContent = totales.total.toFixed(2);
}

function abrirCarritoFlotante() {
    if (!carritoFlotante) return;

    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(carritoFlotante);
    offcanvas.show();
}

function cerrarCarritoFlotante() {
    if (!carritoFlotante) return;

    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(carritoFlotante);
    offcanvas.hide();
}

function registrarVenta(listaCompra, totales, metodoPago, autorizacion = "N/A") {
    const ventas = JSON.parse(localStorage.getItem("ventasAmaretto")) || [];

    const nuevaVenta = {
        id: Date.now(),
        fecha: new Date().toLocaleString("es-SV"),
        metodoPago,
        autorizacion,
        productos: listaCompra.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            cantidad: producto.cantidad,
            precio: producto.precio,
            subtotal: producto.precio * producto.cantidad
        })),
        subtotal: totales.subtotal,
        iva: totales.iva,
        total: totales.total
    };

    ventas.push(nuevaVenta);
    localStorage.setItem("ventasAmaretto", JSON.stringify(ventas));
}

function abrirModalPago() {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de confirmar la compra.");
        return;
    }

    cerrarCarritoFlotante();

    if (formPagoTarjeta) {
        formPagoTarjeta.style.display = "none";
        formPagoTarjeta.reset();
    }

    if (mensajePago) {
        mensajePago.textContent = "";
    }

    modalPago.style.display = "flex";
}
function descargarFacturaPDF(compraRealizada, totales, metodoPago, autorizacion, fecha) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Amaretto Coffee Shop", 105, y, { align: "center" });

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Factura / Resumen de compra", 105, y, { align: "center" });

    y += 12;
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 15, y);
    y += 7;
    doc.text(`Metodo de pago: ${metodoPago}`, 15, y);
    y += 7;
    doc.text(`Autorizacion: ${autorizacion}`, 15, y);

    y += 10;
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Detalle de productos", 15, y);
    y += 8;

    doc.setFont("helvetica", "normal");

    compraRealizada.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;

        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(producto.nombre, 15, y);

        doc.setFont("helvetica", "normal");
        y += 6;
        doc.text(`Categoria: ${producto.categoria}`, 15, y);
        y += 6;
        doc.text(`Cantidad: ${producto.cantidad}`, 15, y);
        y += 6;
        doc.text(`Precio unitario: $${producto.precio.toFixed(2)}`, 15, y);
        y += 6;
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 15, y);
        y += 8;
    });

    y += 4;
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: $${totales.subtotal.toFixed(2)}`, 15, y);
    y += 7;
    doc.text(`IVA 13%: $${totales.iva.toFixed(2)}`, 15, y);
    y += 8;

    doc.setFontSize(14);
    doc.text(`TOTAL PAGADO: $${totales.total.toFixed(2)}`, 15, y);

    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Gracias por comprar en Amaretto Coffee Shop.", 105, y, { align: "center" });

    doc.save(`factura-amaretto-${Date.now()}.pdf`);
}

function finalizarCompra(metodoPago, autorizacion = "N/A") {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const compraRealizada = carrito.map(producto => ({
        ...producto
    }));

    const totales = calcularTotales(compraRealizada);
    const fecha = new Date().toLocaleString("es-SV");

    registrarVenta(compraRealizada, totales, metodoPago, autorizacion);
    descargarFacturaPDF(compraRealizada, totales, metodoPago, autorizacion, fecha);

    detalleFactura.innerHTML = `
        <div class="factura-header">
            <h3><i class="bi bi-receipt-cutoff"></i> Resumen de compra</h3>
            <p><strong>Amaretto Coffee Shop</strong></p>
            <p>Fecha: ${fecha}</p>
            <p>Método de pago: <strong>${metodoPago}</strong></p>
            <p>Autorización: <strong>${autorizacion}</strong></p>
            <hr>
        </div>
    `;

    compraRealizada.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;

        detalleFactura.innerHTML += `
            <div class="factura-item">
                <p>
                    <strong>${producto.nombre}</strong><br>
                    Cantidad: ${producto.cantidad} |
                    Precio: $${producto.precio.toFixed(2)} |
                    Subtotal: $${subtotal.toFixed(2)}
                </p>
            </div>
        `;
    });

    detalleFactura.innerHTML += `
        <hr>

        <div class="factura-totales">
            <p>Subtotal: <strong>$${totales.subtotal.toFixed(2)}</strong></p>
            <p>IVA 13%: <strong>$${totales.iva.toFixed(2)}</strong></p>
            <h4>Total pagado: $${totales.total.toFixed(2)}</h4>
        </div>

        <p class="mt-3">
            Gracias por comprar en Amaretto Coffee Shop.
        </p>
    `;

    carrito = [];
    guardarCarrito();
    actualizarCarrito();
    mostrarProductos();

    modalPago.style.display = "none";
    modal.style.display = "flex";
}

listaProductos.addEventListener("click", (e) => {
    const botonAgregar = e.target.closest(".btn-agregar");

    if (botonAgregar) {
        const id = parseInt(botonAgregar.dataset.id);
        agregarAlCarrito(id);
    }
});

if (itemsCarritoFlotante) {
    itemsCarritoFlotante.addEventListener("click", (e) => {
        const botonEliminar = e.target.closest(".btn-eliminar");
        const botonSumar = e.target.closest(".btn-sumar");
        const botonRestar = e.target.closest(".btn-restar");

        if (botonEliminar) {
            const id = parseInt(botonEliminar.dataset.id);
            eliminarProducto(id);
        }

        if (botonSumar) {
            const id = parseInt(botonSumar.dataset.id);
            aumentarCantidad(id);
        }

        if (botonRestar) {
            const id = parseInt(botonRestar.dataset.id);
            disminuirCantidad(id);
        }
    });
}

if (btnConfirmarFlotante) {
    btnConfirmarFlotante.addEventListener("click", abrirModalPago);
}

if (btnConfirmar) {
    btnConfirmar.addEventListener("click", abrirModalPago);
}

if (btnPagoEfectivo) {
    btnPagoEfectivo.addEventListener("click", () => {
        finalizarCompra("Efectivo");
    });
}

if (btnPagoTarjeta) {
    btnPagoTarjeta.addEventListener("click", () => {
        formPagoTarjeta.style.display = "block";
        mensajePago.textContent = "Ingrese datos ficticios para simular el pago.";
        mensajePago.style.color = "#6f3f24";
    });
}

if (formPagoTarjeta) {
    formPagoTarjeta.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre-tarjeta").value.trim();
        const numero = document.getElementById("numero-tarjeta").value.trim();
        const fecha = document.getElementById("fecha-tarjeta").value.trim();
        const cvv = document.getElementById("cvv-tarjeta").value.trim();

        if (nombre === "" || numero === "" || fecha === "" || cvv === "") {
            mensajePago.textContent = "Complete todos los campos para simular el pago.";
            mensajePago.style.color = "#dc3545";
            return;
        }

        mensajePago.textContent = "Procesando pago...";
        mensajePago.style.color = "#6f3f24";

        setTimeout(() => {
            const autorizacion = "AMT-" + Math.floor(100000 + Math.random() * 900000);
            finalizarCompra("Tarjeta", autorizacion);
            formPagoTarjeta.reset();
        }, 1200);
    });
}

if (btnCerrarPago) {
    btnCerrarPago.addEventListener("click", () => {
        modalPago.style.display = "none";
    });
}

if (btnSeguirOffcanvas) {
    btnSeguirOffcanvas.addEventListener("click", () => {
        setTimeout(() => {
            document.getElementById("catalogo").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 250);
    });
}

btnSeguir.addEventListener("click", () => {
    modal.style.display = "none";

    document.getElementById("catalogo").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

if (modalPago) {
    modalPago.addEventListener("click", (e) => {
        if (e.target === modalPago) {
            modalPago.style.display = "none";
        }
    });
}

mostrarProductos();
actualizarCarrito();