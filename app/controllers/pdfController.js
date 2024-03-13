import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import extractTextFromPDF from '../service/pdfExtractText.js';
import renamePDF from '../service/pdfRenameService.js';
import { isArrayBufferView } from 'util/types';
import pdfRenameService from '../service/pdfRenameService.js';

const pdfController = {
    async splitPdf(req, res) {
        try {
            if (!req.files || !req.files.file) {
                console.error('No file uploaded');
                return res.status(400).json({ error: 'No file uploaded' });
            }
            //const pdfPath = './rechnung.pdf'; // Pfad zur PDF-Datei
            const pdfFile =req.files.file;
            //const pdfPath = pdfFile.path;
            //console.log("Path: " +JSON.stringify(req.files));

            // nehmen wenn nicht im req
            //const existingPdfBytes = await fs.readFile(pdfPath);
            const existingPdfBytes = pdfFile.data;
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            //Ausgabe zur Kontrolle wieviel Seiten die PDF hat
            const pageCount = pdfDoc.getPageCount();
            console.log('Seiten: ' + pageCount);

             // Verzeichnis für temporäre Dateien
             const tempDir = './temp/';
             await fs.mkdir(tempDir, { recursive: true });

             // Vor dem Schreiben sicherstellen, dass das Verzeichnis leer ist
             await clearDirectory(tempDir);

            const splitPDFs = [];
            const extractedTexts = [];

            // Durchlaufen der Seiten und Aufteilen in separate PDFs
            for (let i = 0; i < pageCount; i++) {
                const newPdfDoc = await PDFDocument.create();
                const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
                newPdfDoc.addPage(copiedPage);

                const outputPDFBytes = await newPdfDoc.save();
                const pageNumber = i + 1;
                const outputFilePath = `./temp/${pageNumber}.pdf`;
                await fs.writeFile(outputFilePath, outputPDFBytes);
                splitPDFs.push(outputFilePath);

                const text = await extractTextFromPDF(outputFilePath, i);
                extractedTexts.push(text);
                const textFilePath = `./temp/${pageNumber}.txt`;
                await fs.writeFile(textFilePath, text);
                
            }
            console.log("PDFs erfolgreich erstellt");

            // Zusammenführen von PDFs basierend auf bestimmten Kriterien
            let mergedPDFs = [];
            let mergedPDF = null;
            let mergeRequired = false;
            let startIndex = 0; // Startindex für das Zusammenführen
            let pageIndices = [];

            for (let i = 0; i < extractedTexts.length; i++) {
                const text = extractedTexts[i];

                // Prüfen, ob Schlüsselwort für Zusammenführung vorhanden ist
                if (text.includes('Zwischensumme') ) {
                    mergeRequired = true;
                    startIndex = i; // Aktualisieren des Startindex
                    // console.log("Startindex" + startIndex);
                    pageIndices.push(i);
                    //console.log("pageIndices : " + pageIndices); 
                }

                // Zusammenführen der PDFs, wenn erforderlich
                if (mergeRequired) {
                    if (!mergedPDF) {
                        mergedPDF = await PDFDocument.create();
                    }
                    const pdfPath = splitPDFs[i];
                    try {
                        const pdfToMergeBytes = await fs.readFile(pdfPath);
                        const pdfToMerge = await PDFDocument.load(pdfToMergeBytes);
                        const copiedPages = await mergedPDF.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                        copiedPages.forEach((page) => mergedPDF.addPage(page));
                        
                    } catch (error) {
                        console.error('Error loading PDF to merge:', error);
                        continue; // Continue with next PDF if loading fails
                    }
                }
            // Wenn das Ende erreicht ist oder das Schlüsselwort 'Gesamtbetrag' gefunden wurde, fügen Sie das zusammengeführte PDF hinzu
            if (i === extractedTexts.length - 1 || text.includes('Gesamtbetrag')) {
                

                if (mergedPDF) {
                    const mergedPDFBytes = await mergedPDF.save();
                    let mergedPDFName;
                    let mergedTxtName;
                    
                        mergedPDFName = `./temp/${pageIndices[0] + 1}_${i + 1}.pdf`;
                    
                    await fs.writeFile(mergedPDFName, mergedPDFBytes);
                    mergedPDFs.push(mergedPDFName);

                    // Löschen der Ausgangs-PDFs
                    for (let j = pageIndices [0]; j <= i; j++) {
                        const pdfToDelete = splitPDFs[j];
                        await fs.unlink(pdfToDelete);
                        //splitPDFs.splice(j,1);
                    
                    }

                    
                    for (let j = pageIndices[0] + 1; j <= i; j++) {
                        const txtToDelete = `./temp/${j + 1}.txt`; 
                        try {
                            await fs.unlink(txtToDelete);
                            
                        } catch (error) {
                            console.error(`Fehler beim Löschen der Textdatei ${txtToDelete}:`, error);
                        }
                    
                        mergedTxtName = `./temp/${pageIndices[0] + 1}_${i + 1}.txt`;
                        try {
                            await fs.rename(`./temp/${j}.txt`, mergedTxtName);
                        } catch (error) {
                            //console.error(`Fehler beim Umbenennen der Textdatei ${j}.txt zu ${mergedTxtName}:`, error);
                        }
                    }

                
                    
                    pageIndices.length = 0;
                    

                }
                mergeRequired = false;
                mergedPDF = null;
                
                
                   
                
            }


                
            }
            
            console.log("PDFs erfolgreich gemerged");
            //console.log("splitPDFs"+splitPDFs);
            const renamedPDF = await pdfRenameService.renamePDF();
            res.status(200).json({ renamedPDF });
            //await pdfRenameService.renamePDF();
        } catch (error) {
            console.error('Error splitting and merging PDF:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
};

// Funktion zum Löschen aller Dateien in einem Verzeichnis
async function clearDirectory(directory) {
    const files = await fs.readdir(directory);
    for (const file of files) {
        await fs.unlink(`${directory}${file}`);
    }
}

export default pdfController;
