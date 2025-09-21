const sql = require('mssql');

const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'localhost',
  database: 'HospitalDB',
  options: {
    trustServerCertificate: true
  }
};

const query = `
DELETE FROM [BệnhNhân]
WHERE [NgàyXuấtViện] IS NOT NULL
AND [NgàyXuấtViện] <= GETDATE()
`;

sql.connect(config)
  .then(pool => pool.request().query(query))
  .then(result => {
    console.log(`Đã xóa ${result.rowsAffected[0]} bệnh nhân đã ra viện`);
    sql.close();
  })
  .catch(err => {
    console.error(err);
    sql.close();
  });
