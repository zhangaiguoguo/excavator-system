const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'apps/mini-program/static/swiper');

const images = [
  { name: 'excavator.svg', color: '#FFD700', text: '挖掘机', emoji: '🚜' }, // Gold
  { name: 'bucket.svg', color: '#FFA500', text: '挖斗', emoji: '🪣' },    // Orange
  { name: 'breaker.svg', color: '#FF6347', text: '破碎锤', emoji: '🔨' },  // Tomato
  { name: 'earthwork.svg', color: '#8B4513', text: '土方工程', emoji: '⛰️' }, // SaddleBrown
  { name: 'transport.svg', color: '#4682B4', text: '运输车', emoji: '🚛' },  // SteelBlue
  { name: 'crane.svg', color: '#2E8B57', text: '吊装设备', emoji: '🏗️' },    // SeaGreen
];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

images.forEach((img) => {
  const svgContent = `<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${img.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${img.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#333;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${img.color}" />
  <rect width="100%" height="100%" fill="url(#grad-${img.name})" opacity="0.3" />
  
  <circle cx="400" cy="200" r="100" fill="white" opacity="0.2" />
  
  <text x="50%" y="45%" font-size="120" text-anchor="middle" dominant-baseline="middle">${img.emoji}</text>
  <text x="50%" y="75%" font-size="60" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" fill="white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${img.text}</text>
</svg>`;

  fs.writeFileSync(path.join(targetDir, img.name), svgContent.trim());
  console.log(`Generated ${img.name}`);
});
