// pdfExtractText.js

import { promises as fs } from 'fs';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

export default async function extractTextFromPDF(pdfPath, pageIndex) {
    const data = new Uint8Array(await fs.readFile(pdfPath));
    const doc = await pdfjs.getDocument(data).promise;
    const pageCount = doc.numPages;
    let text = '';

    for (let i = 0; i < pageCount; i++) {
        const page = await doc.getPage(i + 1);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join('\n');
    }

    return text;
}

