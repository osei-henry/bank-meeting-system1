const express = require('express');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
const exportsDir = path.join(__dirname, 'exports');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

// Initialize CSV files if they don't exist
const csvFiles = {
    attendees: path.join(dataDir, 'attendees.csv'),
    meetings: path.join(dataDir, 'meetings.csv'),
    departments: path.join(dataDir, 'departments.csv')
};

// Create headers for each CSV
const csvHeaders = {
    attendees: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Full Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'account', title: 'Account Number' },
        { id: 'meetingId', title: 'Meeting ID' },
        { id: 'meetingTitle', title: 'Meeting Title' },
        { id: 'meetingDate', title: 'Meeting Date' },
        { id: 'department', title: 'Department' },
        { id: 'purpose', title: 'Purpose' },
        { id: 'registrationDate', title: 'Registration Date' },
        { id: 'notes', title: 'Notes' }
    ],
    meetings: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'date', title: 'Date' },
        { id: 'time', title: 'Time' },
        { id: 'department', title: 'Department' },
        { id: 'location', title: 'Location' },
        { id: 'duration', title: 'Duration' },
        { id: 'description', title: 'Description' },
        { id: 'maxAttendees', title: 'Max Attendees' },
        { id: 'status', title: 'Status' },
        { id: 'createdAt', title: 'Created At' }
    ],
    departments: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'head', title: 'Head' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'description', title: 'Description' },
        { id: 'createdAt', title: 'Created At' }
    ]
};

// Initialize CSV files with headers if empty
Object.keys(csvFiles).forEach(fileType => {
    if (!fs.existsSync(csvFiles[fileType]) || fs.readFileSync(csvFiles[fileType], 'utf8').trim() === '') {
        const csvWriter = createObjectCsvWriter({
            path: csvFiles[fileType],
            header: csvHeaders[fileType]
        });
        csvWriter.writeRecords([]); // Write empty array to create headers
    }
});

// API Endpoints

// 1. Save attendee to CSV
app.post('/api/attendees', async (req, res) => {
    try {
        const attendee = req.body;
        
        const csvWriter = createObjectCsvWriter({
            path: csvFiles.attendees,
            header: csvHeaders.attendees,
            append: true
        });
        
        await csvWriter.writeRecords([attendee]);
        
        res.json({ success: true, message: 'Attendee saved to CSV' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Save meeting to CSV
app.post('/api/meetings', async (req, res) => {
    try {
        const meeting = req.body;
        
        const csvWriter = createObjectCsvWriter({
            path: csvFiles.meetings,
            header: csvHeaders.meetings,
            append: true
        });
        
        await csvWriter.writeRecords([meeting]);
        
        res.json({ success: true, message: 'Meeting saved to CSV' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Read all attendees
app.get('/api/attendees', (req, res) => {
    try {
        const csvContent = fs.readFileSync(csvFiles.attendees, 'utf8');
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        const data = lines.slice(1)
            .filter(line => line.trim() !== '')
            .map(line => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index] || '';
                });
                return obj;
            });
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Export to downloadable CSV
app.get('/api/export/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'csv' } = req.query;
        
        if (!csvFiles[type]) {
            return res.status(400).json({ error: 'Invalid export type' });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportFilename = `${type}_export_${timestamp}.${format}`;
        const exportPath = path.join(exportsDir, exportFilename);
        
        // Copy the CSV file to exports directory
        fs.copyFileSync(csvFiles[type], exportPath);
        
        // Send file for download
        res.download(exportPath, exportFilename);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Backup all data
app.get('/api/backup', (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(exportsDir, `backup_${timestamp}`);
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Copy all CSV files to backup directory
        Object.keys(csvFiles).forEach(fileType => {
            const source = csvFiles[fileType];
            const dest = path.join(backupDir, `${fileType}.csv`);
            fs.copyFileSync(source, dest);
        });
        
        // Create a metadata file
        const metadata = {
            backupDate: new Date().toISOString(),
            files: Object.keys(csvFiles),
            totalRecords: {
                attendees: countRecords(csvFiles.attendees),
                meetings: countRecords(csvFiles.meetings),
                departments: countRecords(csvFiles.departments)
            }
        };
        
        fs.writeFileSync(
            path.join(backupDir, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );
        
        // Zip the backup directory (optional - requires archiver package)
        // For now, return backup directory info
        res.json({
            success: true,
            message: 'Backup created successfully',
            backupPath: backupDir,
            metadata
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to count records in CSV
function countRecords(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        return Math.max(0, lines.length - 1); // Subtract header
    } catch {
        return 0;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`CSV files stored in: ${dataDir}`);
    console.log(`Exports stored in: ${exportsDir}`);
});