require('dotenv').config();
const express = require('express');
const path = require('path');
const sql = require('mssql');
const dbconfig = {
  server: 'DESKTOP-8RI0V8D',
  database: 'HospitalDB',
  user: 'sa',
  password: '123456',
  options: {
    trustServerCertificate: true,
    encrypt: false
  },
};
const poolPromise = sql.connect(dbconfig)
  .then(pool => {
    console.log('Kết nối SQL thành công');
    return pool;
  })
  .catch(err => {
    console.error('Kết nối SQL thất bại:', err);
    process.exit(1);
  });
const app = express();
app.use('/static', express.static(path.join(__dirname, 'static')));
const cors = require('cors');
app.use(cors());
const PORT = 3000;
app.get('/submit', (req, res) => {
  res.sendFile(path.join(__dirname, 'submit.html'));
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/api/submit', async (req, res) => {
  console.log('Data nhận được:', req.body);
  const { name, age, gender, ID, phone, address, building, floor, room, bed } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
    .input('name', sql.NVarChar(100), name)
    .input('age', sql.Int, age ? parseInt(age, 10) : null)
    .input('gender', sql.NVarChar(10), gender)
    .input('idcard', sql.NVarChar(50), ID)
    .input('phone', sql.NVarChar(50), phone)
    .input('address', sql.NVarChar(255), address)
    .input('building', sql.NVarChar(10), building)
    .input('floor', sql.NVarChar(10), floor)
    .input('room', sql.NVarChar(10), room)
    .input('bed', sql.NVarChar(50), bed)
    .query(`
      INSERT INTO [BệnhNhân] ([Tên], [Tuổi], [GiớiTính], [CMND_CCCD], [SĐT], [ĐịaChỉ], [TòaNhà], [Tầng], [Phòng], [Giường])
      VALUES (@name, @age, @gender, @idcard, @phone, @address, @building, @floor, @room, @bed)
    `);
      res.json({ success: true, message: 'Đã lưu thành công!' });
  } catch (error) {
    console.error('Lỗi khi lưu:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu!' });
  }
});
app.get('/api/patients', async (req, res) => {
  try {
    let pool = await poolPromise;
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
    let pool = await poolPromise;
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
app.delete('/api/delete-patient/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id, 10))
      .query('DELETE FROM [BệnhNhân] WHERE [ID] = @id');
    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Đã xóa thành công bệnh nhân.' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy bệnh nhân.' });
    }
  } catch (error) {
        console.error('Lỗi khi xóa bệnh nhân:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa bệnh nhân.' });
  }
});
const lightStatus = {};
app.post('/api/toggle-light', async (req, res) => { 
  const fetch = require('node-fetch');
  const { building, floor, room, bed } = req.body;
  console.log(`Yêu cầu bật/tắt đèn: ${building} - ${floor} - ${room} - ${bed}`);
  if (!esp32_ip) {
    console.error('ESP32 IP chưa được đăng ký.');
    return res.status(500).json({ message: 'ESP32 IP chưa được đăng ký.' });
  }
    const key = `${req.body.building}-${req.body.floor}-${req.body.room}-${req.body.bed}`;
    if (!lightStatus[key]) lightStatus[key] = "OFF";
    try {
      const response = await fetch(`http://192.168.55.107/toggle`, { // IP của esp32
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building, floor, room, bed, action: "TOGGLE" }),
        timeout: 5000
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Lỗi từ ESP32:', text);
        return res.status(500).json({ message: 'Lỗi khi liên lạc với ESP32.' });
      }
      await response.json();
      lightStatus[key] = lightStatus[key] === "OFF" ? "ON" : "OFF";
      res.json({ message: `Đã gửi lệnh bật/tắt đèn cho giường ${bed} tại phòng ${room}.` });
    } catch (err) {
        console.error('Lỗi khi liên lạc với ESP32:', err);
        res.status(500).json({ message: 'Lỗi khi liên lạc với ESP32.' });
      }
    });
app.post('/api/discharge', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'ID bệnh nhân không hợp lệ.' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM [BệnhNhân]
        WHERE [ID] = @id
      `);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân với ID đã cho.' });
    }
    res.json({ message: 'Bệnh nhân đã xuất viện.' });
  } catch (error) {
    console.error('Lỗi khi xuất viện:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xuất viện bệnh nhân.' });
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
// search.html chỉ cho phép mở từ localhost
app.get('/search', (req, res) => {
  const clientIp = req.socket.remoteAddress;
  console.log('Client IP:', clientIp);
  if (clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('::ffff:192.168.')) {
    res.sendFile(path.join(__dirname, 'search.html'));
  } else {
    res.status(403).send('Bạn không có quyền truy cập trang này.');
  }
});
process.on('SIGINT', async () => {
  console.log('Đóng kết nối SQL...');
  await sql.close();
  process.exit(0);
});
app.listen(3000, '0.0.0.0', () => {
  console.log(`Server chạy tại http://192.168.55.106:3000`);
});






