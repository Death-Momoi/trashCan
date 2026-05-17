const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.json());
// 讓伺服器能讀取 public 資料夾內的網頁檔案
app.use(express.static(path.join(__dirname, 'public')));

// 暫存警報數據的陣列
let alarmLog = [];

// ESP32 發送資料的 API 節點
app.post('/api/alarm', (req, res) => {
    // 🌟 1. 新增接收 count 參數
    const { location, bin_id, count } = req.body;
    
    // 注意：count 可能是 0，所以不能用 !count 判斷，要明確檢查 undefined
    if (!location || !bin_id || count === undefined) {
        return res.status(400).json({ error: 'Missing location, bin_id, or count' });
    }

    const newAlarm = {
        location,
        bin_id: parseInt(bin_id),
        count: parseInt(count), // 🌟 2. 將這一分鐘的次數存起來
        timestamp: new Date().toISOString() 
    };

    alarmLog.push(newAlarm);
    console.log('收到新警報統計：', newAlarm);
    res.status(200).json({ message: 'Alarm recorded successfully!' });
});

// 前端網頁拿資料的 API 節點
app.get('/api/data', (req, res) => {
    // 🌟 3. 處理「本日」的邏輯（使用台灣時區）
    // 取得台灣時間的今天日期，格式為 YYYY-MM-DD
    const todayDate = new Date().toLocaleString('en-CA', { timeZone: 'Asia/Taipei' }).split(',')[0];

    // 過濾出只有今天的資料
    const todayAlarms = alarmLog.filter(alarm => {
        // 把每一筆資料的時間也轉成台灣時區的 YYYY-MM-DD 來比對
        const alarmDate = new Date(alarm.timestamp).toLocaleString('en-CA', { timeZone: 'Asia/Taipei' }).split(',')[0];
        return alarmDate === todayDate;
    });

    // 🌟 4. 只回傳今天的資料給前端畫圖
    res.json(todayAlarms);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});