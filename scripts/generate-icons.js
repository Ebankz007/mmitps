const fs = require('fs');
const path = require('path');

/**
 * Simple Icon Generator for PWA
 * Creates placeholder icons until proper branding is available
 */

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = './frontend/dashboard/assets/icons';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📱 MMITPS Icon Generator');
console.log('========================\n');

// Create SVG template
function createSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.15}"/>
  
  <!-- Letter M -->
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.5}" 
    font-weight="bold" 
    fill="#10b981" 
    text-anchor="middle" 
    dominant-baseline="central">M</text>
</svg>`;
}

// Generate icons
sizes.forEach(size => {
    const svg = createSVG(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, svg);
    console.log(`✅ Generated ${filename}`);
});

console.log('\n✨ Icon generation complete!');
console.log(`   Output: ${outputDir}`);
console.log('\n📝 Note: These are placeholder SVG icons.');
console.log('   For production, replace with PNG versions of your branded logo.\n');
