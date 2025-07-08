// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Настройка подключения к MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'spare_parts_store',
});

// Проверка подключения
db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к MySQL:', err.message);
  } else {
    console.log('Подключено к MySQL!');
  }
});

// Пример GET-метода
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Пример запроса к базе данных
app.get('/test-db', (req, res) => {
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Middleware для проверки роли admin (заглушка, для реального проекта используйте JWT)
function checkAdmin(req, res, next) {
  const role = req.headers['x-user-role']; // Ожидаем роль в заголовке
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для admin' });
  }
  next();
}

// CRUD для пользователей
// Получить всех пользователей
app.get('/api/users', checkAdmin, (req, res) => {
  db.query('SELECT id, first_name, last_name, patronymic, role, phone, email FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Создать пользователя
app.post('/api/users', checkAdmin, (req, res) => {
  const { first_name, last_name, patronymic, role, phone, email, password } = req.body;
  if (!first_name || !last_name || !role || !phone || !email || !password) {
    return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
  }
  db.query(
    'INSERT INTO users (first_name, last_name, patronymic, role, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [first_name, last_name, patronymic, role, phone, email, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, first_name, last_name, patronymic, role, phone, email });
    }
  );
});

// Обновить пользователя
app.put('/api/users/:id', checkAdmin, (req, res) => {
  const { first_name, last_name, patronymic, role, phone, email, password } = req.body;
  const { id } = req.params;
  let query, params;
  if (password) {
    query = 'UPDATE users SET first_name=?, last_name=?, patronymic=?, role=?, phone=?, email=?, password=? WHERE id=?';
    params = [first_name, last_name, patronymic, role, phone, email, password, id];
  } else {
    query = 'UPDATE users SET first_name=?, last_name=?, patronymic=?, role=?, phone=?, email=? WHERE id=?';
    params = [first_name, last_name, patronymic, role, phone, email, id];
  }
  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, first_name, last_name, patronymic, role, phone, email });
  });
});

// Удалить пользователя
app.delete('/api/users/:id', checkAdmin, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id=?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
