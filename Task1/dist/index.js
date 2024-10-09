"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const xlsx = __importStar(require("xlsx"));
const date_fns_1 = require("date-fns");
const fs_1 = __importDefault(require("fs"));
// Định nghĩa interface cho request có file
// interface FileRequest extends Request {
//   file: Express.Multer.File;
// }
const app = (0, express_1.default)();
// Cấu hình filter cho file
const fileFilter = (req, file, cb) => {
    // Kiểm tra loại file được phép
    const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only .xlsx files are allowed.'));
    }
};
// Cấu hình multer
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'Uploads/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `file_${Date.now()}`;
            cb(null, uniqueSuffix);
        }
    }),
    fileFilter: fileFilter,
    // limits: {
    //   fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    // }
});
// Middleware xử lý lỗi cho multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
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
const handleIntervalError = (err, req, res, next) => {
    if (err instanceof Error) {
        res.status(400).json({
            error: err.message
        });
        return;
    }
    next(err);
};
// Handler upload file với kiểu dữ liệu rõ ràng
const fileUploadHandler = (req, res) => {
    const UploadRequest = req.query;
    if (!UploadRequest.file) {
        res.status(400).json({
            error: 'No file uploaded.'
        });
        return;
    }
    const fileExtension = path_1.default.extname(UploadRequest.file.originalname).toLowerCase();
    if (fileExtension != '.xlsx') {
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
const getTotalInIntervalHandler = (req, res) => {
    //const fileRequest = req as FileRequest;
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;
    const formattedStartTime = (0, date_fns_1.parse)(startTime, 'HH:mm:ss', new Date());
    const formattedEndTime = (0, date_fns_1.parse)(endTime, 'HH:mm:ss', new Date());
    if (!startTime || !endTime) {
        res.status(400).send('Start time and end time are required');
        return;
    }
    if (startTime > endTime) {
        res.status(400).send('Start time must to <= end time');
        return;
    }
    // Đọc file Excel
    const directoryPath = path_1.default.join(__dirname, 'Uploads');
    const files = fs_1.default.readdirSync(directoryPath);
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
    const filePath = path_1.default.join(directoryPath, latestFile);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    // Lọc và tính tổng giá trị dựa trên cột 3 và cột 9
    let total = 0;
    const filteredData = data.slice(7).filter((row) => {
        const date = (0, date_fns_1.parse)(row[2], 'HH:mm:ss', new Date()); // giả định cột 3 chứa dữ liệu giờ
        if (date >= formattedStartTime && date <= formattedEndTime) {
            total += parseFloat(row[8]) || 0; // cột 9 chứa giá trị cần tính tổng
        }
    });
    res.json({ total, filteredData });
};
// Đăng ký routes
app.post('/upload', upload.single('file'), handleMulterError, fileUploadHandler);
app.get('/getTotal', handleIntervalError, getTotalInIntervalHandler);
// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map