// server.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Пример GET-метода
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
