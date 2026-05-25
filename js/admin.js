// admin.js

import { productos } from "./BD.js";

// ===============================
// LOGIN ADMIN
// ===============================
const loginAdmin = document.getElementById("login-admin");
const panelAdmin = document.getElementById("panel-admin");
const formLoginAdmin = document.getElementById("form-login-admin");
const mensajeLoginAdmin = document.getElementById("mensaje-login-admin");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
const btnDescargarVentas = document.getElementById("btn-descargar-ventas");
const btnDescargarInventario = document.getElementById("btn-descargar-inventario");
const btnDescargarInforme = document.getElementById("btn-descargar-informe");

const USUARIO_ADMIN = "admin";
const PASSWORD_ADMIN = "12345678";
function crearEncabezadoPDF(doc, titulo) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Amaretto Coffee Shop", 105, 18, { align: "center" });

    doc.setFontSize(13);
    doc.text(titulo, 105, 28, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha de generacion: ${new Date().toLocaleString("es-SV")}`, 15, 40);

    doc.line(15, 45, 195, 45);
}

function descargarVentasPDF() {
    const ventas = obtenerVentas();

    if (ventas.length === 0) {
        alert("No hay ventas registradas para descargar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    crearEncabezadoPDF(doc, "Informe de ventas");

    let y = 55;

    ventas.forEach((venta, index) => {
        if (y > 255) {
            doc.addPage();
            crearEncabezadoPDF(doc, "Informe de ventas");
            y = 55;
        }

        const productosTexto = venta.productos
            .map(producto => `${producto.nombre} x${producto.cantidad}`)
            .join(", ");

        doc.setFont("helvetica", "bold");
        doc.text(`Venta #${index + 1}`, 15, y);

        doc.setFont("helvetica", "normal");
        y += 6;
        doc.text(`Fecha: ${venta.fecha}`, 15, y);
        y += 6;
        doc.text(`Metodo de pago: ${venta.metodoPago || "N/A"}`, 15, y);
        y += 6;
        doc.text(`Autorizacion: ${venta.autorizacion || "N/A"}`, 15, y);
        y += 6;

        const productosLineas = doc.splitTextToSize(`Productos: ${productosTexto}`, 180);
        doc.text(productosLineas, 15, y);
        y += productosLineas.length * 6;

        doc.text(`Subtotal: $${venta.subtotal.toFixed(2)}`, 15, y);
        y += 6;
        doc.text(`IVA: $${venta.iva.toFixed(2)}`, 15, y);
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.text(`Total: $${venta.total.toFixed(2)}`, 15, y);

        y += 10;
        doc.line(15, y, 195, y);
        y += 8;
    });

    doc.save(`ventas-amaretto-${Date.now()}.pdf`);
}

function descargarInventarioPDF() {
    const resumen = obtenerVentasPorProducto();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    crearEncabezadoPDF(doc, "Informe de inventario");

    let y = 55;

    resumen.forEach(producto => {
        if (y > 255) {
            doc.addPage();
            crearEncabezadoPDF(doc, "Informe de inventario");
            y = 55;
        }

        const stockInicial = producto.stock;
        const stockRestante = stockInicial - producto.vendido;
        const estado = stockRestante <= 5 ? "Stock bajo" : "Disponible";

        doc.setFont("helvetica", "bold");
        doc.text(producto.nombre, 15, y);

        doc.setFont("helvetica", "normal");
        y += 6;
        doc.text(`Categoria: ${producto.categoria}`, 15, y);
        y += 6;
        doc.text(`Precio: $${producto.precio.toFixed(2)}`, 15, y);
        y += 6;
        doc.text(`Stock inicial: ${stockInicial}`, 15, y);
        y += 6;
        doc.text(`Vendido: ${producto.vendido}`, 15, y);
        y += 6;
        doc.text(`Stock restante: ${stockRestante}`, 15, y);
        y += 6;
        doc.text(`Estado: ${estado}`, 15, y);

        y += 10;
        doc.line(15, y, 195, y);
        y += 8;
    });

    doc.save(`inventario-amaretto-${Date.now()}.pdf`);
}
function dibujarTablaPDF(doc, encabezados, filas, x, y, anchos) {
    const altoFila = 8;
    let posicionY = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    // Encabezado
    doc.setFillColor(43, 22, 13);
    doc.setTextColor(255, 255, 255);

    let posicionX = x;

    encabezados.forEach((encabezado, index) => {
        doc.rect(posicionX, posicionY, anchos[index], altoFila, "F");
        doc.text(encabezado, posicionX + 2, posicionY + 5.5);
        posicionX += anchos[index];
    });

    posicionY += altoFila;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    filas.forEach(fila => {
        if (posicionY > 270) {
            doc.addPage();
            posicionY = 20;
        }

        posicionX = x;

        fila.forEach((dato, index) => {
            const texto = String(dato);
            const textoCortado = doc.splitTextToSize(texto, anchos[index] - 4);

            doc.rect(posicionX, posicionY, anchos[index], altoFila);
            doc.text(textoCortado[0] || "", posicionX + 2, posicionY + 5.5);

            posicionX += anchos[index];
        });

        posicionY += altoFila;
    });
}
function descargarInformeGeneralPDF() {
    const ventas = obtenerVentas();
    const resumenProductos = obtenerVentasPorProducto();

    const totalVendido = ventas.reduce((suma, venta) => suma + venta.total, 0);

    const cantidadProductosVendidos = ventas.reduce((suma, venta) => {
        return suma + venta.productos.reduce((sub, producto) => sub + producto.cantidad, 0);
    }, 0);

    const masVendidos = [...resumenProductos]
        .sort((a, b) => b.vendido - a.vendido)
        .slice(0, 5);

    const menosVendidos = [...resumenProductos]
        .sort((a, b) => a.vendido - b.vendido)
        .slice(0, 5);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    crearEncabezadoPDF(doc, "Informe general administrativo");

    let y = 55;

    // ===============================
    // RESUMEN GENERAL
    // ===============================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Resumen general", 15, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total vendido: $${totalVendido.toFixed(2)}`, 15, y);
    y += 6;
    doc.text(`Compras realizadas: ${ventas.length}`, 15, y);
    y += 6;
    doc.text(`Productos vendidos: ${cantidadProductosVendidos}`, 15, y);
    y += 6;
    doc.text(`Productos en inventario: ${productos.length}`, 15, y);

    // ===============================
    // MÁS VENDIDOS
    // ===============================
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Productos más vendidos", 15, y);

    y += 8;

    dibujarTablaPDF(
        doc,
        ["Producto", "Vendidos"],
        masVendidos.map(producto => [
            producto.nombre,
            producto.vendido.toString()
        ]),
        15,
        y,
        [130, 45]
    );

    y += 12 + masVendidos.length * 8;

    // ===============================
    // MENOS VENDIDOS
    // ===============================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Productos menos vendidos", 15, y);

    y += 8;

    dibujarTablaPDF(
        doc,
        ["Producto", "Vendidos"],
        menosVendidos.map(producto => [
            producto.nombre,
            producto.vendido.toString()
        ]),
        15,
        y,
        [130, 45]
    );

    y += 12 + menosVendidos.length * 8;

    // ===============================
    // NUEVA PÁGINA PARA INVENTARIO
    // ===============================
    doc.addPage();
    crearEncabezadoPDF(doc, "Informe general administrativo");

    y = 55;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Inventario resumido", 15, y);

    y += 8;

    const filasInventario = resumenProductos.map(producto => {
        const stockRestante = producto.stock - producto.vendido;
        const estado = stockRestante <= 5 ? "Stock bajo" : "Disponible";

        return [
            producto.nombre,
            producto.stock.toString(),
            producto.vendido.toString(),
            stockRestante.toString(),
            estado
        ];
    });

    dibujarTablaPDF(
        doc,
        ["Producto", "Stock", "Vendido", "Restante", "Estado"],
        filasInventario,
        10,
        y,
        [65, 25, 25, 30, 40]
    );

    // ===============================
    // HISTORIAL DE VENTAS
    // ===============================
    doc.addPage();
    crearEncabezadoPDF(doc, "Informe general administrativo");

    y = 55;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Historial de ventas", 15, y);

    y += 8;

    if (ventas.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("No hay ventas registradas.", 15, y);
    } else {
        const filasVentas = ventas.map(venta => {
            const productosTexto = venta.productos
                .map(producto => `${producto.nombre} x${producto.cantidad}`)
                .join(", ");

            return [
                venta.fecha,
                venta.metodoPago || "N/A",
                `$${venta.total.toFixed(2)}`,
                productosTexto
            ];
        });

        dibujarTablaPDF(
            doc,
            ["Fecha", "Método", "Total", "Productos"],
            filasVentas,
            10,
            y,
            [45, 30, 25, 85]
        );
    }

    doc.save(`informe-general-amaretto-${Date.now()}.pdf`);
}
function verificarSesion() {
    const sesionActiva = sessionStorage.getItem("adminAmarettoAuth");

    if (sesionActiva === "true") {
        loginAdmin.classList.add("d-none");
        panelAdmin.classList.remove("d-none");
        btnCerrarSesion.classList.remove("d-none");
        cargarPanel();
    } else {
        loginAdmin.classList.remove("d-none");
        panelAdmin.classList.add("d-none");
        btnCerrarSesion.classList.add("d-none");
    }
}

formLoginAdmin.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario-admin").value.trim();
    const password = document.getElementById("password-admin").value.trim();

    if (usuario === USUARIO_ADMIN && password === PASSWORD_ADMIN) {
        sessionStorage.setItem("adminAmarettoAuth", "true");
        mensajeLoginAdmin.textContent = "";
        verificarSesion();
    } else {
        mensajeLoginAdmin.textContent = "Usuario o contraseña incorrectos.";
        mensajeLoginAdmin.style.color = "#dc3545";
    }
});

btnCerrarSesion.addEventListener("click", () => {
    sessionStorage.removeItem("adminAmarettoAuth");
    location.reload();
});

// ===============================
// ELEMENTOS PANEL
// ===============================
const totalVentas = document.getElementById("total-ventas");
const cantidadVentas = document.getElementById("cantidad-ventas");
const productosVendidos = document.getElementById("productos-vendidos");
const productosInventario = document.getElementById("productos-inventario");

const tablaMasVendidos = document.getElementById("tabla-mas-vendidos");
const tablaMenosVendidos = document.getElementById("tabla-menos-vendidos");
const tablaInventario = document.getElementById("tabla-inventario");
const tablaHistorial = document.getElementById("tabla-historial");
const btnLimpiarVentas = document.getElementById("btn-limpiar-ventas");

function obtenerVentas() {
    return JSON.parse(localStorage.getItem("ventasAmaretto")) || [];
}

function obtenerVentasPorProducto() {
    const ventas = obtenerVentas();
    const resumen = {};

    productos.forEach(producto => {
        resumen[producto.id] = {
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: producto.precio,
            stock: producto.stock || 20,
            vendido: 0
        };
    });

    ventas.forEach(venta => {
        venta.productos.forEach(productoVendido => {
            if (resumen[productoVendido.id]) {
                resumen[productoVendido.id].vendido += productoVendido.cantidad;
            }
        });
    });

    return Object.values(resumen);
}

function mostrarResumenGeneral() {
    const ventas = obtenerVentas();

    const total = ventas.reduce((suma, venta) => suma + venta.total, 0);

    const cantidadProductos = ventas.reduce((suma, venta) => {
        return suma + venta.productos.reduce((sub, producto) => sub + producto.cantidad, 0);
    }, 0);

    totalVentas.textContent = total.toFixed(2);
    cantidadVentas.textContent = ventas.length;
    productosVendidos.textContent = cantidadProductos;
    productosInventario.textContent = productos.length;
}

function mostrarMasVendidos() {
    const resumen = obtenerVentasPorProducto()
        .sort((a, b) => b.vendido - a.vendido)
        .slice(0, 5);

    tablaMasVendidos.innerHTML = "";

    resumen.forEach(producto => {
        tablaMasVendidos.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.vendido}</td>
            </tr>
        `;
    });
}

function mostrarMenosVendidos() {
    const resumen = obtenerVentasPorProducto()
        .sort((a, b) => a.vendido - b.vendido)
        .slice(0, 5);

    tablaMenosVendidos.innerHTML = "";

    resumen.forEach(producto => {
        tablaMenosVendidos.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.vendido}</td>
            </tr>
        `;
    });
}

function mostrarInventario() {
    const resumen = obtenerVentasPorProducto();

    tablaInventario.innerHTML = "";

    resumen.forEach(producto => {
        const stockInicial = producto.stock;
        const stockRestante = stockInicial - producto.vendido;
        const estado = stockRestante <= 5 ? "Stock bajo" : "Disponible";
        const claseEstado = stockRestante <= 5 ? "estado-stock-bajo" : "estado-stock-ok";

        tablaInventario.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${stockInicial}</td>
                <td>${producto.vendido}</td>
                <td>${stockRestante}</td>
                <td class="${claseEstado}">${estado}</td>
            </tr>
        `;
    });
}

function mostrarHistorial() {
    const ventas = obtenerVentas();
    tablaHistorial.innerHTML = "";

    if (ventas.length === 0) {
        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No hay ventas registradas todavía.</td>
            </tr>
        `;
        return;
    }

    ventas.forEach(venta => {
        const productosTexto = venta.productos
            .map(producto => `${producto.nombre} x${producto.cantidad}`)
            .join(", ");

        tablaHistorial.innerHTML += `
            <tr>
                <td>${venta.fecha}</td>
                <td>${productosTexto}</td>
                <td>${venta.metodoPago || "N/A"}</td>
                <td>$${venta.total.toFixed(2)}</td>
            </tr>
        `;
    });
}

function cargarPanel() {
    mostrarResumenGeneral();
    mostrarMasVendidos();
    mostrarMenosVendidos();
    mostrarInventario();
    mostrarHistorial();
}

btnLimpiarVentas.addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que deseas limpiar el historial de ventas?");

    if (confirmar) {
        localStorage.removeItem("ventasAmaretto");
        location.reload();
    }
});
if (btnDescargarVentas) {
    btnDescargarVentas.addEventListener("click", descargarVentasPDF);
}

if (btnDescargarInventario) {
    btnDescargarInventario.addEventListener("click", descargarInventarioPDF);
}

if (btnDescargarInforme) {
    btnDescargarInforme.addEventListener("click", descargarInformeGeneralPDF);
}

verificarSesion();