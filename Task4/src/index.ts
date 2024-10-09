import express, { NextFunction, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import axios, { AxiosResponse } from 'axios'

const app = express();
// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Thay thế bằng nguồn gốc của bạn
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

async function fetchData(): Promise<any> {
    try {
      const response = await axios.get('https://test-share.shub.edu.vn/api/intern-test/input');
      return response.data ;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
async function calculateSegmentSum(array: number[], queries: { type: string, range: [number, number] }[]): Promise<number[]> {
        const previousSumType1 = new Array(array.length + 1).fill(0);
        const previousSumType2 = new Array(array.length + 1).fill(0);
        const output: number[] = [];
        for (let i = 0; i < array.length; i++) {
            previousSumType1[i + 1] = previousSumType1[i] + array[i];
            if(i%2==0)
            previousSumType2[i + 1] = previousSumType2[i] + array[i];
            else
            previousSumType2[i + 1] = previousSumType2[i] - array[i];
        }
        for (const query of queries) {
            const { type, range } = query;
            const [l, r] = range;
    
            let segmentSum: number;
    
            if (type === "1") {
                segmentSum = previousSumType1[r + 1] - previousSumType1[l];
            } else {
                segmentSum = previousSumType2[r + 1] - previousSumType2[l];
            }
    
            output.push(segmentSum); // Thêm kết quả vào output
        }
        return output;
}

async function sendOutputToAPI(output: number[], token: string): Promise<AxiosResponse> {
    const url = 'https://test-share.shub.edu.vn/api/intern-test/output';

    try {
        const response = await axios.post(url, output, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response; // Trả về phản hồi từ API
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios Error:', error.response?.data || error.message);
        } else {
            console.error('General Error:', error);
        }
        throw error; // Đảm bảo ném lỗi nếu có để có thể xử lý ở nơi gọi hàm
    }
}

// Hàm xử lý request để lấy dữ liệu và gửi lên API
const getProcessedDataHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        // Giả sử bạn có hàm fetchData() trả về dữ liệu dưới dạng { token, data, query }
        const data = await fetchData();
        const token = data.token;
        const array = data.data;
        const query = data.query;

        // Tiến hành tính toán mảng output
        let output = await calculateSegmentSum(array, query);

        // Gửi output lên API
        let response = await sendOutputToAPI(output, token);
        // Trả về phản hồi từ server (chỉ trích xuất data từ response)
        res.json(response.data); // Trả về chỉ phần dữ liệu trong response
    } catch (error) {
        console.error('Error during processing:', error);
        res.status(500).send('Error posting data');
    }
};

app.get('/getProcessedData',   getProcessedDataHandler);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});