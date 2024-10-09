import axios, { AxiosResponse } from 'axios';

// Fetch data from API
export async function fetchData(): Promise<any> {
    try {
      const response = await axios.get('https://test-share.shub.edu.vn/api/intern-test/input');
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
}

// Calculation sums of each segment
export async function calculateSegmentSum(array: number[], queries: { type: string, range: [number, number] }[]): Promise<number[]> {
    const previousSumType1 = new Array(array.length + 1).fill(0);
    const previousSumType2 = new Array(array.length + 1).fill(0);
    const output: number[] = [];

    for (let i = 0; i < array.length; i++) {
        previousSumType1[i + 1] = previousSumType1[i] + array[i];
        if(i % 2 === 0) {
            previousSumType2[i + 1] = previousSumType2[i] + array[i];
        } else {
            previousSumType2[i + 1] = previousSumType2[i] - array[i];
        }
    }

    for (const query of queries) {
        const { type, range } = query;
        const [l, r] = range;
        let segmentSum: number;

        if (type == "1") {
            segmentSum = previousSumType1[r + 1] - previousSumType1[l];
        } else {
            if(l%2!=0) {//l%2!=0 => arr[l] before process by previousSumType2 is negative
                //but we need arr[l] > 0
                segmentSum = -(previousSumType2[r + 1] - previousSumType2[l]);
            }else{//arr[l] after process by previousSumType2 is positive
                segmentSum = previousSumType2[r + 1] - previousSumType2[l];
            }
        }
        output.push(segmentSum);
    }
    return output;
}

// send output to Server SHUB
export async function sendOutputToAPI(output: number[], token: string): Promise<AxiosResponse> {
    const url = 'https://test-share.shub.edu.vn/api/intern-test/output';

    try {
        const response = await axios.post(url, output, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios Error:', error.response?.data || error.message);
        } else {
            console.error('General Error:', error);
        }
        throw error;
    }
}
