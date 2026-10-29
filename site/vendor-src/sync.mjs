// npm ci --ignore-scripts --omit=optional && node sync.mjs (run in this directory)
import {copyFileSync} from 'node:fs';
for(const [from,to] of [
 ['pdfjs-dist/build/pdf.min.mjs','pdf.min.mjs'],
 ['pdfjs-dist/build/pdf.worker.min.mjs','pdf.worker.min.mjs'],
 ['pdfjs-dist/LICENSE','pdfjs-LICENSE.txt'],
 ['fflate/esm/browser.js','fflate.mjs'],
 ['fflate/LICENSE','fflate-LICENSE.txt']
])copyFileSync(new URL('node_modules/'+from,import.meta.url),new URL('../static/'+to,import.meta.url));
