import { Request, Response } from 'express';
import { FileModel } from '../models/fileModel';
import { parse } from 'date-fns';
import numeral from 'numeral';

export const getTotalInIntervalHandler = (req: Request, res: Response): void => {
  const startTime = req.query.startTime as string;
  const endTime = req.query.endTime as string;
  if (!startTime || !endTime) {
    res.status(400).send('Start time and end time are required');
    return;
  }
  const formattedStartTime = parse(startTime, 'HH:mm:ss', new Date());
  const formattedEndTime = parse(endTime, 'HH:mm:ss', new Date());


  if (startTime > endTime) {
    res.status(400).send('Start time must be <= end time');
    return;
  }

  // Read file Excel
  const fileData = FileModel.getLatestFileData();
  if (!fileData) {
    res.status(400).send('No files available.');
    return;
  }
  let total = 0;
  const filteredData = fileData.filter((row: any) => {
    const date = parse(row[2], 'HH:mm:ss', new Date());
    if (date >= formattedStartTime && date <= formattedEndTime) {
      total += parseFloat(row[8].replace(/,/g, '')) || 0;
      return true;
    }
    return false;
  });

  let totalResponse = numeral(total).format('0,0.00');
  res.json({ totalResponse, filteredData });
};
