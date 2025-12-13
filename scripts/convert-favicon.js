const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function convertToIco() {
  const pngPath = path.join(__dirname, '../src/app/NPHC-Official-Logo-sq.png');
  const icoPath = path.join(__dirname, '../src/app/favicon.ico');
  
  try {
    // Create multiple sizes for ICO (16, 32, 48, 256)
    const sizes = [16, 32, 48, 256];
    const buffers = await Promise.all(
      sizes.map(size =>
        sharp(pngPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toBuffer()
      )
    );
    
    // Convert to ICO format
    const ico = await toIco(buffers);
    fs.writeFileSync(icoPath, ico);
    
    console.log('Successfully converted PNG to ICO favicon with multiple sizes!');
  } catch (error) {
    console.error('Error converting PNG to ICO:', error);
    process.exit(1);
  }
}

convertToIco();

