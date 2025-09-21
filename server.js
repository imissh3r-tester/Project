const express = require('express');
const path = require('path');
const sql = require('mssql');
const dbconfig = {
  user: 'your_username',
  password: 'your_password',
  server: 'localhost',
  database: 'HospitalDB',
  options: {
    trustServerCertificate: true
  }
};
const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/api/submit', async (req, res) => {
    const { name, age, gender, ID, phone, address, building, floor, room, bed } = req.body;
    try {
        await sql.connect(dbconfig);
        await sql.query`
            INSERT INTO [BệnhNhân] ([Tên], [Tuổi], [GiớiTính], [CMND_CCCD], [SĐT], [ĐịaChỉ], [TòaNhà], [Tầng], [Phòng], [Giường])
            VALUES (${name}, ${age}, ${gender}, ${ID}, ${phone}, ${address}, ${building}, ${floor}, ${room}, ${bed})
        `;
        res.json({ success: true, message: 'Đã lưu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lưu!' });
    } finally {
        sql.close();
    }
});
app.get('/api/patients', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let result = await pool.request().query("SELECT * FROM BệnhNhân");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bệnh nhân' });
  }
});
app.get('/api/find-patient', async (req, res) => {
  const { name, age, gender } = req.query;
  try {
    let pool = await sql.connect(dbconfig);
    let query = `
      SELECT TOP 1 *
      FROM [BệnhNhân]
      WHERE [Tên] = @name
      AND [NgàyXuấtViện] IS NULL
      ${age ? 'AND [Tuổi] = @age' : ''}
      ${gender ? 'AND [GiớiTính] = @gender' : ''}
    `;
    let request = pool.request().input('name', sql.NVarChar(100), decodeURIComponent(name));
    if (age) request.input('age', sql.Int, parseInt(age));
    if (gender) request.input('gender', sql.NVarChar(10), decodeURIComponent(gender));
    let result = await request.query(query);
    if (result.recordset.length === 0) {
      return res.json({ found: false });
    }
    res.json({ found: true, patient: result.recordset[0] });

  } catch (error) {
    console.error('Lỗi khi tìm bệnh nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tìm bệnh nhân.' });
  }
});
app.post('/api/toggle-light', async (req, res) => {
    const fetch = require('node-fetch');
    const { building, floor, room, bed } = req.body;
    console.log(`Yêu cầu bật/tắt đèn: ${building} - ${floor} - ${room} - ${bed}`);

    if (!esp32_ip) {
      return res.status(500).json({ message: 'ESP32 IP chưa được đăng ký.' });
    }

    await fetch(`http://${esp32_ip}/toggle`, { // IP của esp32
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building, floor, room, bed, action: "TOGGLE" })
    });
    res.json({ message: `Đã gửi lệnh bật/tắt đèn cho giường ${bed} tại phòng ${room}.` });
});
app.post('/api/discharge', async (req, res) => {
  const { id, discharge_datetime } = req.body;
  try {
    let pool = await sql.connect(dbconfig);
    await pool.request()
      .input('id', sql.Int, id)
      .input('discharge_datetime', sql.DateTime, new Date(discharge_datetime))
      .query(`UPDATE [BệnhNhân] SET [NgàyXuấtViện] = @discharge_datetime WHERE [id] = @id`);

    res.json({ message: 'Đã ghi nhận ngày xuất viện cho bệnh nhân.' });
  } catch (error) {
    console.error('Lỗi khi nhập ngày xuất viện:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi nhập ngày xuất viện.' });
  }
});
app.get('/control', (req, res) => {
    res.sendFile(path.join(__dirname, 'control.html'));
});
let esp32_ip = null; // Lưu IP của ESP32
app.post('/api/register-esp32', (req, res) => {
  esp32_ip = req.body.ip;
  console.log('ESP32 registered with IP:', esp32_ip);
  res.json({ success: true });
});
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:3000`); // IP của thiết bị host server
});
