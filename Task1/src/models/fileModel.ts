import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

export class FileModel {
  static getLatestFileData() {
    const directoryPath = path.join(__dirname, '../..', 'uploads');
    const files = fs.readdirSync(directoryPath);

    if (files.length === 0) {
      return null;
    }

    const latestFile = files.reduce((latest, current) => {
      const latestTimestamp = parseInt(latest.split('_')[1]);
      const currentTimestamp = parseInt(current.split('_')[1]);
      return latestTimestamp > currentTimestamp ? latest : current;
    });

    const filePath = path.join(directoryPath, latestFile);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to CSV starting from the 9th row
    const csvData = xlsx.utils.sheet_to_csv(sheet, { RS: '\n', FS: '|' });
    const rows = csvData.split('\n').slice(8);
    return rows.map(row => row.split('|'));
  }
}
