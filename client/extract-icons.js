import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractIcons() {
  try {
    console.log('Starting icon extraction...');
    
    // Read the zip file
    const zipData = fs.readFileSync('../website_icons.zip');
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipData);
    
    // Create icons directory
    const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // Extract each file
    const iconList = [];
    for (const filename of Object.keys(contents.files)) {
      const file = contents.files[filename];
      
      if (!file.dir && (filename.endsWith('.png') || filename.endsWith('.svg') || filename.endsWith('.jpg'))) {
        console.log(`Extracting: ${filename}`);
        
        const content = await file.async('nodebuffer');
        const outputPath = path.join(iconsDir, filename);
        
        // Create subdirectories if needed
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, content);
        iconList.push({
          filename: filename,
          path: outputPath,
          size: content.length
        });
      }
    }
    
    console.log(`✅ Extracted ${iconList.length} icons successfully!`);
    console.log('Icons:', iconList.map(i => i.filename));
    
    // Write icon manifest
    fs.writeFileSync(
      path.join(iconsDir, 'manifest.json'),
      JSON.stringify(iconList, null, 2)
    );
    
    return iconList;
    
  } catch (error) {
    console.error('❌ Error extracting icons:', error);
    throw error;
  }
}

extractIcons()
  .then(() => {
    console.log('🎉 Icon extraction completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Icon extraction failed:', error);
    process.exit(1);
  });