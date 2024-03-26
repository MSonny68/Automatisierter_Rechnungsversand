import { promises as fs } from 'fs';
import XLSX from 'xlsx';

const excelController = {
    async saveExcel(req, res) {
        try {
            if (!req.files || !req.files.file) {
                console.error('No file uploaded');
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const excelFile = req.files.file;
            const excelData = excelFile.data;

            // Speichern der Excel-Datei auf dem Server
            const excelDir = './excel/';
            await fs.mkdir(excelDir, { recursive: true }); // Erstellen Sie das Verzeichnis, falls es nicht existiert
            await clearDirectory(excelDir);
            const outputFilePath = `${excelDir}/${excelFile.name}`; // Pfad zum Speichern der Datei
            await fs.writeFile(outputFilePath, excelData); // Schreiben Sie die Datei

            res.status(200).json({ message: 'Excel file saved successfully' });
        } catch (error) {
            console.error('Error', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getExcel(req, res) {
        try {
            const excelDir = './excel/';
            const files = await fs.readdir(excelDir);
            if (files.length === 0) {
                return res.status(404).json({ error: 'No Excel files found' });
            }
            const excelFileName = files[0]; // Nehmen Sie die erste gefundene Excel-Datei
            const excelFilePath = `${excelDir}/${excelFileName}`;
            const workbook = XLSX.readFile(excelFilePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            res.status(200).json({ fileName: excelFileName, data: excelData });
        } catch (error) {
            console.error('Error', error);
            res.status(500).json({ error: error.message });
        }
    }
};

async function clearDirectory(directory) {
    const files = await fs.readdir(directory);
    for (const file of files) {
        await fs.unlink(`${directory}${file}`);
    }
}

export default excelController;
