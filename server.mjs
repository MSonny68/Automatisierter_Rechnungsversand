

import express from 'express';
import fileUpload from 'express-fileupload';
import pdfRoutes from './app/routes/pdfRoutes.js';
import cors from 'cors';
import { sendEmail } from './app/controllers/emailController.js';


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
// Middleware für JSON-Anfragenverarbeitung
app.use(express.json());
app.use(fileUpload());
app.use(pdfRoutes);
app.post('/send-email', sendEmail);


// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
