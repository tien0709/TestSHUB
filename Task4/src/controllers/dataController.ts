import { Request, Response } from 'express';
import { fetchData, calculateSegmentSum, sendOutputToAPI } from '../models/dataModel';

export const getProcessedDataHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        // fetch data from API
        const data = await fetchData();
        const token = data.token;
        const array = data.data;
        const query = data.query;


        // calculate Segment Sum
        const output = await calculateSegmentSum(array, query);

        // send output to Server
        const response = await sendOutputToAPI(output, token);
        // send response to client
        res.json(response.data);
    } catch (error) {
        console.error('Error during processing:', error);
        res.status(500).send('Error processing data');
    }
};
