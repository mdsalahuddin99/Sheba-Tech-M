const fs = require('fs');

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': 'next-auth.session-token=mock' }, // Wait, API is authenticated!
      body: JSON.stringify({ salesPersons: ['TestSalesman'] })
    });
    const text = await res.text();
    fs.writeFileSync('g:/CLIENT PROJECT/tech baria/apps/dashboard/test_output.json', JSON.stringify({ status: res.status, body: text }, null, 2));
  } catch (e) {
    fs.writeFileSync('g:/CLIENT PROJECT/tech baria/apps/dashboard/test_output.json', JSON.stringify({ error: e.message }, null, 2));
  }
}
test();
