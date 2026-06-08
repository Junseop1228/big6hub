require('dotenv').config();
const app = require('./app');
const { initDb } = require('./db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API docs at   http://localhost:${PORT}/api-docs`);
});
