const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ADODB = require('node-adodb');
require('dotenv').config();
const multer = require('multer');
const sendEmail = require('./sendEmail'); // Adjust the path as necessary
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML files
app.use(express.static('public'));

// Connect to Access database
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.16.0;Data Source=C:\\Users\\ERAZER\\Desktop\\MyDatabase1.accdb;',process.arch.includes('64'));


// Login API endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `SELECT * FROM Users WHERE Username = '${username}' AND Password = '${password}'`;
        const users = await connection.query(query);

        if (users.length > 0) {
            res.json({ success: true, message: 'Login successful' });


        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// ... other routes ...
// Email sending route
app.post('/sendemail', upload.array('file'), (req, res) => {
    const attachments = req.files.map(file => ({
        path: file.path,
        filename: file.originalname
    }));

    sendEmail(req.body.email, req.body.name, req.body.message, attachments);

    res.status(200).send('Email sent successfully');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
app.post('/api/addEmployee', async (req, res) => {
    const { name, position, specialization, email, phone, photoUrl } = req.body;

    try {
        const query = `INSERT INTO Employees (Name, [Position], Specialization, Email, Phone, Imagepath)VALUES ('${name}', '${position}', '${specialization}', '${email}', '${phone}','${photoUrl}')`;
        await connection.execute(query);

        res.json({ success: true, message: 'Employee added successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
app.get('/api/getEmployees', async (req, res) => {
    try {
        const query = `SELECT * FROM Employees`;
        const employees = await connection.query(query);
        console.log("Employees:", employees); // Log the result to see what's returned

        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.post('/api/addAlcoholReport', async (req, res) => {
    // Destructuring the alcohol report fields from the request body
    const { date, sampleSize, testingFrequency, testResults, calibrationPoints, dilutionsPreparations, instrumentReadings, replicateMeasurements, correctiveActions, verificationChecks } = req.body;

    try {
        const query = `INSERT INTO DailyReport ([Date], SampleSize, TestingFreq, TestRes, CaliPoints, DilPrep, InstrRead, RepMeasure, CorrActTak, VerCheck) VALUES ('${date}', '${sampleSize}', '${testingFrequency}', '${testResults}', '${calibrationPoints}',  '${dilutionsPreparations}',  '${instrumentReadings}', '${replicateMeasurements}', '${correctiveActions}', '${verificationChecks}')`;

        await connection.execute(query);
        res.json({ success: true, message: 'Alcohol report added successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
app.get('/execute-query', (req, res) => {
    const sqlQuery = `
        SELECT 
            SUM(CAST(SampleSize AS INT)) AS TotalSampleSize,
            AVG(CAST(TestingFreq AS INT)) AS AverageTestingFrequency,
            SUM(CAST(CaliPoints AS INT)) AS TotalCalibrationPoints,
            SUM(CAST(DilPrep AS INT)) AS TotalDilutionsPreparations,
            SUM(CAST(InstrRead AS INT)) AS TotalInstrumentReadings,
            SUM(CAST(RepMeasure AS INT)) AS TotalReplicateMeasurements,
            SUM(CAST(CorrActTak AS INT)) AS TotalCorrectiveActions,
            SUM(CAST(VerCheck AS INT)) AS TotalVerificationChecks
        FROM 
            DailyReport
        WHERE 
            MONTH(Date) = 2 AND YEAR(Date) = 2024`;

    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            res.status(500).send('Error executing SQL query');
            return;
        }

        // Send the results as JSON
        res.json(results);
    });
});


