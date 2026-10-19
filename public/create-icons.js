const fs = require('fs');
const { createCanvas } = require('canvas');

// Crear icono 192x192
const canvas192 = createCanvas(192, 192);
const ctx192 = canvas192.getContext('2d');

// Fondo negro
ctx192.fillStyle = '#000000';
ctx192.fillRect(0, 0, 192, 192);

// Texto AR
ctx192.fillStyle = '#3B82F6';
ctx192.font = 'bold 80px Arial';
ctx192.textAlign = 'center';
ctx192.textBaseline = 'middle';
ctx192.fillText('AR', 96, 96);

const buffer192 = canvas192.toBuffer('image/png');
fs.writeFileSync('public/icon-192.png', buffer192);

// Crear icono 512x512
const canvas512 = createCanvas(512, 512);
const ctx512 = canvas512.getContext('2d');

// Fondo negro
ctx512.fillStyle = '#000000';
ctx512.fillRect(0, 0, 512, 512);

// Texto AR
ctx512.fillStyle = '#3B82F6';
ctx512.font = 'bold 200px Arial';
ctx512.textAlign = 'center';
ctx512.textBaseline = 'middle';
ctx512.fillText('AR', 256, 256);

const buffer512 = canvas512.toBuffer('image/png');
fs.writeFileSync('public/icon-512.png', buffer512);

console.log('Iconos creados exitosamente');
