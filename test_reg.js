const req = fetch('http://localhost/api/v1/admin/auth/register-owner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Username: 'POI owner 1',
    Password: 'password123',
    BusinessName: 'Test1',
    Cccd: '12345',
    BusinessAddress: 'Vĩnh Khánh 1',
    Email: 'test1@gmail.com'
  })
}).then(async r => console.log(r.status, await r.text()));
