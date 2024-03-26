// pdfRoutes.js

import express from 'express';
import pdfController from '../controllers/pdfController.js';
import excelController from '../controllers/excelController.js'
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { sendEmail } from '../controllers/emailController.js';
const __filename = fileURLToPath(import.meta.url);
// Verzeichnispfad zur aktuellen Datei
const __dirname = path.dirname(__filename);

const router = express.Router();


router.post('/split', pdfController.splitPdf);
router.post('/excel',excelController.saveExcel);

// routes
router.get('/', (req, res)=> {
    res.json({ message: "Welcome to Rechnungsautomat"});

});
router.get('/split',(req,res)=> {
    res.json({ message: "Jetzt splitten wir"})
});

router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../pdf', filename);

    res.setHeader('Content-Disposition', `inline; filename=${filename}`);
    
    // Senden Sie die Datei als Antwort
    res.sendFile(filePath, filename, (err) => {
        if (err) {
            console.error('Fehler beim Herunterladen der Datei:', err);
            res.status(500).send('Interner Serverfehler');
        }
    });
});

router.get('/excel/:filename', excelController.getExcel);






export default router;
