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

const USUARIO_ADMIN = "admin";
const PASSWORD_ADMIN = "12345678";

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

verificarSesion();