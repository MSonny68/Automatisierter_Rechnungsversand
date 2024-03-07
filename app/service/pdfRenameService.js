// pdfRenameService.js


import { promises as fs } from 'fs';

const pdfRenameService = {
    
    
    async renamePDF(){
        const splitPDFs = [];
        const extendsTXT = [];
        const directoryPath = './temp';
        const endungPDF = '.pdf';
        const endungTXT = '.txt';
        let pdfFiles = await getFiles(directoryPath,endungPDF);
        const txtFiles = await getFiles(directoryPath,endungTXT);
        splitPDFs.push(...pdfFiles);
        extendsTXT.push(...txtFiles);
        console.log("splitPDFs :" + splitPDFs);
        console.log(splitPDFs.length);
        console.log("extendsTXT : " + extendsTXT);
        console.log(extendsTXT.length);

        for (let i = 0;i < splitPDFs.length;i++){
            await pdfRename(directoryPath,extendsTXT[i],splitPDFs[i])
        }
        console.log("rename erfolgreich");
        //const lineContent = await readFirma(extendsTXT[0],9);
          //  console.log("Firmenname : " +lineContent);

        pdfFiles = await getRenamedPDFs(directoryPath);
        for (const pdfFile of pdfFiles) {
            await copyPDF(directoryPath, pdfFile, './pdf');
        }

        console.log("PDFs erfolgreich umbenannt und kopiert");
    }
}
    async function getFiles(directoryPath,endung) {
        try {
            // Lese den Inhalt des Verzeichnisses
            const files = await fs.readdir(directoryPath);

            // Filtere die Dateien
            const pdfFiles = files.filter(file => file.endsWith(endung));

            return pdfFiles;
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }

    async function pdfRename(directoryPath,extTXT, splPDF) {
        try {
            const path = directoryPath +"/"+extTXT;
            // Lese den Inhalt der Textdatei
            const txtContent = (await fs.readFile(path)).toString();

            // Überprüfen, ob txtContent ein String ist
            if (typeof txtContent !== 'string') {
                console.log(path);
                throw new Error('Der Inhalt der Textdatei ist kein String.');
                
            }
            const firma = await readFirma(path,9);
            const firmaOhneSpace = firma.replace(/\s+/g, '-');
            let newFileName ;
            //console.log("Firma : " + firmaOhneSpace);
            // Extrahiere die Kundennummer aus dem Text
            const kundennummerRegex = /Kunden Nr.:\s*(\d+)/;
            const kundennummerMatch = txtContent.match(kundennummerRegex);
            const kundennummer = kundennummerMatch ? kundennummerMatch[1] : '';
    
            // Extrahiere die Rechnungsnummer aus dem Text
            const rechnungsnummerRegex = /Rechnung Nr. (\d+)/;
            const rechnungsnummerMatch = txtContent.match(rechnungsnummerRegex);
            const rechnungsnummer = rechnungsnummerMatch ? rechnungsnummerMatch[1] : '';

            const gutschriftnummerRegex = /Gutschrift Nr. (\d+)/;
            const gutschriftnummerMatch = txtContent.match(gutschriftnummerRegex);
            const gutschriftnummer = gutschriftnummerMatch ? gutschriftnummerMatch[1] : '';

            const stornonummerRegex = /Gutschrift Nr. (\d+)/;
            const stornonummerMatch = txtContent.match(stornonummerRegex);
            const stornonummer = stornonummerMatch ? stornonummerMatch[1] : '';
            
            const pdfType = await readPdfType(path)
            // Konstruiere den neuen Dateinamen
            if (pdfType === 'Rechnung'){
                newFileName = `${kundennummer}_RE${rechnungsnummer}_${firmaOhneSpace}.pdf`;
                //console.log("neuer Dateiname: "+ newFileName)
            }
            else if (pdfType === 'Gutschrift'){
                newFileName = `${kundennummer}_GS${stornonummer}_${firmaOhneSpace}.pdf`;
                //console.log("neuer Dateiname: "+ newFileName)
            }
            else if (pdfType === 'Storno'){
                newFileName = `${kundennummer}_ST${gutschriftnummer}_${firmaOhneSpace}.pdf`;
                //console.log("neuer Dateiname: "+ newFileName)
            }
            
            //console.log("neuer Dateiname: "+ newFileName)
            // Umbenennen der PDF-Datei
            await fs.rename(directoryPath+"/"+splPDF, directoryPath+"/"+newFileName);
        } catch (error) {
            console.error('Error renaming PDF:', error);
        }
    }

    async function readFirma(filePath, lineNumber) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            let specificLine = lines[lineNumber - 1]; // Zeilennummer ist 1-basiert

            //Wenn die Anrede keine Firma sondern Herr,Frau dann nächste Zeile abfragen
            if (/\bHerr\b|\bHerrn\b|\bFrau\b/.test(specificLine)){
                specificLine = lines[lineNumber];
            }
    
            return specificLine.trim(); // Zurückgeben der Zeile ohne führende oder nachfolgende Leerzeichen
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }

    async function readPdfType(filePath) {
        try {
            const text = await fs.readFile(filePath, 'utf-8');
            if (text.includes('Rechnung Nr')) {

                return 'Rechnung';
            } else if (text.includes('Gutschrift Nr')) {
                console.log("pfad : " + filePath + " Gutschrift")
                return 'Gutschrift';
            } else if (text.includes('Storno Nr')) {
                return 'Storno';
            }
        } catch (error) {
            console.error('Error reading PDF file:', error);
            return null;
        }
    }

    async function copyPDF(sourceDir, pdfFile, destinationDir) {
        try {
            await fs.copyFile(`${sourceDir}/${pdfFile}`, `${destinationDir}/${pdfFile}`);
        } catch (error) {
            console.error('Error copying PDF to destination:', error);
        }
    }

    async function getRenamedPDFs(directoryPath) {
        try {
            const files = await fs.readdir(directoryPath);
            return files.filter(file => file.endsWith('.pdf') && !file.startsWith('page_'));
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }
    
    
   
export default pdfRenameService;
