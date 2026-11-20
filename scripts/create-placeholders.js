const fs = require('fs');
const path = require('path');

// Ensure directories exist
const imagesDir = path.join(__dirname, '..', 'public', 'images');
const musicDir = path.join(__dirname, '..', 'public', 'music');

fs.mkdirSync(imagesDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

// Minimal 1x1 valid JPEG binary buffer
const minimalJpgHex = 
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const jpgBuffer = Buffer.from(minimalJpgHex, 'base64');

const imageFiles = ['cover.jpg', 'photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg', 'photo-4.jpg'];
for (const file of imageFiles) {
  const filePath = path.join(imagesDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, jpgBuffer);
  }
}

// Minimal silent MP3 (empty audio frame)
const minimalMp3Base64 = '//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA==';
const mp3Buffer = Buffer.from(minimalMp3Base64, 'base64');
const musicPath = path.join(musicDir, 'bg-love.mp3');
if (!fs.existsSync(musicPath)) {
  fs.writeFileSync(musicPath, mp3Buffer);
}

console.log('Placeholders created successfully.');
