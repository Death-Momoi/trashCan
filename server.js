const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.json());
// 讓伺服器能讀取 public 資料夾內的網頁檔案
app.use(express.static(path.join(__dirname, 'public')));

// 暫存警報數據的陣列（注意：Render 免費版重啟時資料會重設，專案成熟後建議串接資料庫）
let alarmLog = [];

// ESP32 發送資料的 API 節點
app.post('/api/alarm', (req, res) => {
    const { location, bin_id } = req.body;
    
    if (!location || !bin_id) {
        return res.status(400).json({ error: 'Missing location or bin_id' });
    }

    const newAlarm = {
        location,
        bin_id: parseInt(bin_id),
        // 伺服器直接自動生成台灣時間（或 UTC，前端再轉換）
        timestamp: new Date().toISOString() 
    };

    alarmLog.push(newAlarm);
    console.log('收到新警報：', newAlarm);
    res.status(200).json({ message: 'Alarm recorded successfully!' });
});

// 前端網頁拿資料的 API 節點
app.get('/api/data', (req, res) => {
    res.json(alarmLog);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});