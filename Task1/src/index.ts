import express, { NextFunction, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as xlsx from 'xlsx';
import { parse} from 'date-fns';
import fs from 'fs';
import cors from 'cors';
import numeral from 'numeral';

// Định nghĩa interface cho request có file
// interface FileRequest extends Request {
//   file: Express.Multer.File;
// }

const app = express();
// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Thay thế bằng nguồn gốc của bạn
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));
// Cấu hình filter cho file
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Kiểm tra loại file được phép
  const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .xlsx files are allowed.'));
  }
};

// Cấu hình multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'Uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `file_${Date.now()}.xlsx`;
      cb(null, uniqueSuffix);
    }
  }),
  fileFilter: fileFilter,
  // limits: {
  //   fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  // }
});

// Middleware xử lý lỗi cho multer
const handleMulterError: express.ErrorRequestHandler = (err, req, res, next): void => {
  if (err instanceof multer.MulterError) {
    // if (err.code === 'LIMIT_FILE_SIZE') {
    //   return res.status(400).json({
    //     error: 'File size is too large. Maximum size is 5MB.'
    //   });
    // }
    res.status(400).json({
      error: err.message
    });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({
      error: err.message
    });
    return;
  }
  next(err);
};

const handleIntervalError: express.ErrorRequestHandler = (err, req, res, next): void => {

  if (err instanceof Error) {
    res.status(400).json({
      error: err.message
    });
    return;
  }
  next(err);
};

// Handler upload file với kiểu dữ liệu rõ ràng
const fileUploadHandler : RequestHandler =(
  req: Request,
  res: Response
): void => {

  const UploadRequest = (req as any);
  if (!UploadRequest.file) {
    res.status(400).json({
      error: 'No file uploaded.'
    });
    return ;
  }

  const fileExtension = path.extname(UploadRequest.file.originalname).toLowerCase();
  if (fileExtension!='.xlsx') {
    res.status(400).json({
      error: 'Invalid file extension. Only .xlsx files are allowed.'
    });
    return;
  }

  res.status(200).json({
    message: 'Excel file uploaded successfully',
    file: {
      originalName: UploadRequest.file.originalname,
      filename: UploadRequest.file.filename,
      size: UploadRequest.file.size,
      mimetype: UploadRequest.file.mimetype
    }
  });
};


const getTotalInIntervalHandler : RequestHandler =(
  req: Request,
  res: Response
): void => {
  //const fileRequest = req as FileRequest;
  const startTime = req.query.startTime as string;
  const endTime = req.query.endTime as string;
  const formattedStartTime  = parse(startTime ,'HH:mm:ss', new Date());
  const formattedEndTime  = parse(endTime , 'HH:mm:ss', new Date());
  if (!startTime || !endTime) {
    res.status(400).send('Start time and end time are required');
      return ;
  }

  if (startTime > endTime) {
      res.status(400).send('Start time must to <= end time');
      return ;
  }

    // Đọc file Excel

  const directoryPath = path.join(__dirname, '..', 'Uploads');
  const files = fs.readdirSync(directoryPath);

  if (files.length === 0) {
    res.status(400).send('No files available.');
    return;
  }

  // Lấy file mới nhất dựa trên thời gian từ tên file
  const latestFile = files.reduce((latest, current) => {
    const latestTimestamp = parseInt(latest.split('_')[1]);
    const currentTimestamp = parseInt(current.split('_')[1]);
    return latestTimestamp > currentTimestamp ? latest : current;
  });


  const filePath = path.join(directoryPath, latestFile);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Chỉ lấy dữ liệu từ dòng thứ 6 (từ dòng 6 trở đi, tức là index 5 trong mảng)
// Convert sheet to CSV starting from the 6th row
const csvData = xlsx.utils.sheet_to_csv(sheet, { RS: '\n', FS: '|' });// using FS: ',' will create fault, because cell have value like 1,243,900
const rows = csvData.split('\n').slice(8); // Bỏ qua 5 hàng đầu
  const data = rows.map(row => row.split('|'));
  //const data = rows.map(row => row.split(',')); // Chuyển đổi lại thành mảng các mảng\
  let total = 0;
  const filteredData = data.filter((row: any) => {
    const date = parse(row[2], 'HH:mm:ss', new Date()); // giả định cột 3 chứa dữ liệu giờ
    if (date >= formattedStartTime && date <= formattedEndTime) {
      total += parseFloat(row[8].replace(/,/g, '')) || 0; // cột 9 chứa giá trị cần tính tổng
      return true;
    }
    return false;
  });

  let totalResponse = numeral(total).format('0,0.00');
  res.json({ totalResponse , filteredData });
};

// Đăng ký routes
app.post('/upload', upload.single('file'), handleMulterError, fileUploadHandler);
app.get('/getTotal',  handleIntervalError, getTotalInIntervalHandler);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});