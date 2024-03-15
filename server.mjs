

import express from 'express';
import fileUpload from 'express-fileupload';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import pdfRoutes from './app/routes/pdfRoutes.js';

import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 8080;
// Pfad zur aktuellen Datei (ES-Modul)
const __filename = fileURLToPath(import.meta.url);
// Verzeichnispfad zur aktuellen Datei
const __dirname = path.dirname(__filename);
app.use(cors());
// Middleware für JSON-Anfragenverarbeitung
app.use(express.json());
app.use(fileUpload());
app.use(pdfRoutes);




// routes
app.get('/', (req, res)=> {
    res.json({ message: "Welcome to Rechnungsautomat"});

});
app.get('/split',(req,res)=> {
    res.json({ message: "Jetzt splitten wir"})
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'pdf', filename);

    res.setHeader('Content-Disposition', `inline; filename=${filename}`);
    
    // Senden Sie die Datei als Antwort
    res.sendFile(filePath, filename, (err) => {
        if (err) {
            console.error('Fehler beim Herunterladen der Datei:', err);
            res.status(500).send('Interner Serverfehler');
        }
    });
});







// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
