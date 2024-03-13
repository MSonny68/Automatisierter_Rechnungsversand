

import express from 'express';
import fileUpload from 'express-fileupload';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import pdfRoutes from './app/routes/pdfRoutes.js';

import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
// Middleware für JSON-Anfragenverarbeitung
app.use(express.json());
app.use(fileUpload());
app.use(pdfRoutes);



// Endpoint für das PDF-Splitting
/* app.get('/split-pdf', async (req, res) => {
    try {
        const pdfPath = './rechnung.pdf'; // Pfad zur PDF-Datei
        const keywords = ['Gesamtbetrag']; // Schlüsselwörter für Rechnungsende
        //const invoiceBoundaries = await findInvoiceBoundaries(pdfPath, keywords);
        const existingPdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pageCount = pdfDoc.getPageCount();
        console.log('Seiten: ' + pageCount);
        const splitPDFs = [];
        const extractedTexts = [];

        for (let i = 0; i < pageCount; i++) {
            const newPdfDoc = await PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);

            const outputPDFBytes = await newPdfDoc.save();
            const pageNumber = i + 1;
            const outputFilePath = `./pdf/page_${pageNumber}.pdf`;
            await fs.writeFile(outputFilePath, outputPDFBytes);
            splitPDFs.push(outputFilePath);

            const text = await extractTextFromPDF(outputFilePath, i);
            extractedTexts.push(text);
            const textFilePath = `./pdf/page_${pageNumber}.txt`;
            await fs.writeFile(textFilePath, text);
        }

        res.status(200).json({ splitPDFs });
    } catch (error) {
        console.error('Error splitting PDF:', error);
        res.status(500).json({ error: error.message });
    }
}); */

// Endpoint zum Senden von E-Mails
/* app.post('/send-email', async (req, res) => {
    try {
        const { recipient, subject, body } = req.body;

        // Konfiguration des E-Mail-Versanddienstes
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        // E-Mail-Optionen
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: recipient,
            subject: subject,
            text: body
        };

        // E-Mail senden
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'An error occurred while sending email' });
    }
}); */

// routes
app.get('/', (req, res)=> {
    res.json({ message: "Welcome to Rechnungsautomat"});

});
app.get('/split',(req,res)=> {
    res.json({message: "Jetzt splitten wir"})
});
// Funktion zum Extrahieren des Texts aus einer PDF-Datei
async function extractTextFromPDF(pdfPath,pageIndex) {
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







// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
