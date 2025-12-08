/**
 * Utility script to help identify and replace hardcoded API URLs
 * Run this in Node.js to find all remaining hardcoded URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OLD_URL = 'https://institute-backend-wro4.onrender.com';
const NEW_URL = 'http://localhost:5000';

function findHardcodedUrls(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      findHardcodedUrls(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(OLD_URL)) {
        fileList.push({
          path: filePath,
          lines: content.split('\n').map((line, index) => ({
            number: index + 1,
            content: line,
            hasUrl: line.includes(OLD_URL)
          })).filter(line => line.hasUrl)
        });
      }
    }
  });

  return fileList;
}

const srcDir = path.join(__dirname, '..');
const filesWithUrls = findHardcodedUrls(srcDir);

console.log(`\nFound ${filesWithUrls.length} files with hardcoded URLs:\n`);
filesWithUrls.forEach(({ path: filePath, lines }) => {
  console.log(`\n📄 ${filePath}`);
  lines.forEach(({ number, content }) => {
    console.log(`   Line ${number}: ${content.trim()}`);
  });
});

console.log(`\n\n✅ Use the API service from 'services/apiService.js' instead!\n`);

