CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL,
    descripcion TEXT,
    categoria TEXT
);

INSERT INTO productos (nombre, precio, stock, descripcion, categoria) VALUES
('Members Selection Cafe Instantaneo Liofiolizado', 15.49, 50, 'Café intenso y puro.', 'Clásico'),
('Members Selection Cafe Premium Excelso Cafe tostado y molido', 10.29, 30, 'Café Tostado y molido.', 'Soluble'),
('Topeca Café Molido Gold 1kg', 10.29, 25, 'Cafe Tostado y molido.', 'Especialidad'),
('Nedecaza Cafe Tostado y Molido 2 kg', 16.79, 100, 'Café para herver en agua caliente.', 'Clásico'),
('Members Selection Café Frío Sabor MOCA 12 unidaes', 17.99, 20, 'Mezcla de café, leche y chocolate.', 'Especialidad'),
('Folgers Café Instantáneo 453 g / 16 oz', 18.69, 100, 'Café con caramelo y leche manchada.', 'Soluble');
('Cafe 1600 de Especialidad 1kg / 32 oz', 12.99,50, 'Cafe de muy buen gusto cultivado en El Salvador.',  'Especialidad');

