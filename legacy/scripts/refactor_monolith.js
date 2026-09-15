const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = './frontend/dashboard/index.html';
const outputDir = './frontend/dashboard';
const backupFile = './frontend/dashboard/index.html.backup';

console.log('🚀 MMITPS Monolith Refactoring Script');
console.log('=====================================\n');

// Validate input file exists
if (!fs.existsSync(inputFile)) {
    console.error('❌ Input file not found:', inputFile);
    process.exit(1);
}

// Create backup
console.log('📦 Creating backup...');
fs.copyFileSync(inputFile, backupFile);
console.log('✅ Backup created:', backupFile);

// Ensure output directories exist
['styles', 'scripts'].forEach(dir => {
    const fullPath = path.join(outputDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

const content = fs.readFileSync(inputFile, 'utf8');
const fileSizeMB = (content.length / 1024 / 1024).toFixed(2);
const lineCount = content.split('\n').length;

console.log(`\n📊 Input File Stats:`);
console.log(`   Size: ${fileSizeMB} MB`);
console.log(`   Lines: ${lineCount.toLocaleString()}`);

// Extract CSS (all inline <style> blocks)
console.log('\n🎨 Extracting CSS...');
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let cssContent = '';
let styleCount = 0;
let match;

while ((match = styleRegex.exec(content)) !== null) {
    cssContent += match[1] + '\n';
    styleCount++;
}

console.log(`   Found ${styleCount} <style> blocks`);

// Extract inline JS (excluding external scripts with src attribute)
console.log('\n⚡ Extracting JavaScript...');
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let jsContent = '';
let scriptCount = 0;

while ((match = scriptRegex.exec(content)) !== null) {
    jsContent += match[1] + '\n';
    scriptCount++;
}

console.log(`   Found ${scriptCount} inline <script> blocks`);

// Create cleaned HTML
console.log('\n🧹 Cleaning HTML...');
let htmlContent = content
    .replace(styleRegex, '')
    .replace(scriptRegex, '');

// Inject references to extracted files
// Add CSS link before </head>
if (cssContent.trim()) {
    htmlContent = htmlContent.replace('</head>', '    <link rel="stylesheet" href="styles/extracted.css">\n</head>');
}

// Add JS script before </body>
if (jsContent.trim()) {
    htmlContent = htmlContent.replace('</body>', '    <script src="scripts/extracted-inline.js"></script>\n</body>');
}

// Write extracted files
console.log('\n💾 Writing output files...');

if (cssContent.trim()) {
    fs.writeFileSync(path.join(outputDir, 'styles/extracted.css'), cssContent);
    const cssSizeKB = (cssContent.length / 1024).toFixed(2);
    console.log(`   ✅ styles/extracted.css (${cssSizeKB} KB)`);
}

if (jsContent.trim()) {
    fs.writeFileSync(path.join(outputDir, 'scripts/extracted-inline.js'), jsContent);
    const jsSizeKB = (jsContent.length / 1024).toFixed(2);
    console.log(`   ✅ scripts/extracted-inline.js (${jsSizeKB} KB)`);
}

fs.writeFileSync(inputFile, htmlContent);
const newSizeMB = (htmlContent.length / 1024 / 1024).toFixed(2);
const newLineCount = htmlContent.split('\n').length;
const reduction = ((1 - htmlContent.length / content.length) * 100).toFixed(1);

console.log(`   ✅ index.html (${newSizeMB} MB, ${newLineCount.toLocaleString()} lines)`);

console.log('\n📈 Results:');
console.log(`   Original: ${fileSizeMB} MB, ${lineCount.toLocaleString()} lines`);
console.log(`   New: ${newSizeMB} MB, ${newLineCount.toLocaleString()} lines`);
console.log(`   Reduction: ${reduction}%`);

console.log('\n✨ Refactoring complete!');
console.log('   Backup: index.html.backup');
console.log('   To rollback: mv index.html.backup index.html\n');
