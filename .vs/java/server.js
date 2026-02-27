const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Configuración de la conexión (Igual a tus datos de Railway)
const db = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: 'xlwXNAGamSGbDHSjYCYpKbIzHLPZusup',
    database: 'railway',
    port: 31516
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la DB:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos de Railway');
});

// Ruta para obtener los cafés
app.get('/api/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));