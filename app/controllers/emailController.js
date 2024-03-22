// emailController.js
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

export const sendEmail = (req, res) => {
  const { to, subject, message} = req.body;
  const attachments = req.files;
  console.log("Request body:", req.body);
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Text:", message);
  //console.log("Anhang:",attachments.name)

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'maik.sonnenberg68@gmail.com',
      pass: 'pleb fzvy zekt sdno',
    },
  });

  const mailOptions = {
    from: 'maik.sonnenberg68@gmail.com',
    to: to,
    subject: subject,
    text: message,
    
  };
  if (attachments) {
    mailOptions.attachments = Object.values(attachments).map(file => ({
      filename: file.name,
      content: file.data, // Binärdaten der Datei
    }))
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      res.status(500).json({ error: 'Interner Serverfehler beim Senden der E-Mail' });
    } else {
      console.log('E-Mail erfolgreich gesendet:', info.response);
      res.status(200).json({ message: 'E-Mail erfolgreich gesendet' });
    }
  });
};
