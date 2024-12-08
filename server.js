const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const pdf = require('html-pdf');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // URL of your frontend
}));


dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // For JSON bodies from React frontend
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    const { fullNameColumn, courseColumn, percentageColumn, emailColumn } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    generateCertificatesAndSendEmails(excelData, { fullNameColumn, courseColumn, percentageColumn, emailColumn });

    res.json({ message: 'Certificates are being generated and sent!' });
});

function generateCertificatesAndSendEmails(excelData, columns) {
    excelData.forEach((data) => {
        const fullNameValue = data[columns.fullNameColumn];
        const courseValue = data[columns.courseColumn];
        const percentageValue = data[columns.percentageColumn];
        const emailValue = data[columns.emailColumn];

        if (fullNameValue && courseValue && percentageValue && emailValue) {
            const certificateContent = `
            <html>
                <head>
                    <style>
                       body {
                                font-family: 'Arial', sans-serif;
                                background-color: #f0f0f0;
                                text-align: center;
                                padding: 20px;
                            }
                            .certificate {
                                background-color: #fff;
                                border: 2px solid #333;
                                padding: 20px;
                                max-width: 600px;
                                margin: 0 auto;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                color: #333;
                                font-size: 24px;
                                margin-bottom: 10px;
                            }
                            p {
                                margin: 10px 0;
                                line-height: 1.5;
                            }
                            .header {
                                background-color: #4caf50;
                                color: white;
                                padding: 10px;
                                border-radius: 5px 5px 0 0;
                            }
                            .content {
                                padding: 20px;
                            }
                            .footer {
                                background-color: #4caf50;
                                color: white;
                                padding: 10px;
                                border-radius: 0 0 5px 5px;
                            }
                            strong {
                                font-weight: bold;
                            } 
                    </style>
                </head>
                <body>
                     <div class="certificate">
                            <div class="header">
                <h1>Certificate of Completion</h1>
                <p>This is to certify that</p>
                <p><strong>${fullNameValue}</strong></p>
                <p>has successfully completed the course</p>
                <p><strong>${courseValue}</strong></p>
                <p>with a percentage of</p>
                <p><strong>${percentageValue}%</strong></p>
            
                </body>
            </html>
            `;

            const pdfOptions = { format: 'Letter' };
            pdf.create(certificateContent, pdfOptions).toFile(`certificates/certificate_${fullNameValue}.pdf`, (err, result) => {
                if (err) {
                    console.error('Error generating PDF:', err);
                } else {
                    sendEmail(emailValue, `Certificate for ${fullNameValue}`, 'Please find your certificate attached.', result.filename);
                }
            });
        } else {
            console.error('Incomplete data for generating certificate:', data);
        }
    });
}

function sendEmail(to, subject, text, attachmentPath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'khushboog7008@gmail.com',
            pass: 'zhwlrlrnkqtjkpro',
        },
    });

    const mailOptions = {
        from: 'khushboog7008@gmail.com',
        to: to,
        subject: subject,
        text: text,
        attachments: [
            {
                filename: 'certificate.pdf',
                path: attachmentPath,
                contentType: 'application/pdf',
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
