// Подключение роутера для корзины
// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
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

// Создать папку для фото товаров, если не существует
const uploadDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Отдача статики для фото товаров
app.use('/uploads/products', express.static(uploadDir));

// Создать папку для фото категорий, если не существует
const uploadCatDir = path.join(__dirname, 'uploads/categories');
if (!fs.existsSync(uploadCatDir)) {
  fs.mkdirSync(uploadCatDir, { recursive: true });
}
// Отдача статики для фото категорий
app.use('/uploads/categories', express.static(uploadCatDir));

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
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Ошибка при хэшировании пароля' });
    db.query(
      'INSERT INTO users (first_name, last_name, patronymic, role, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, patronymic, role, phone, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, first_name, last_name, patronymic, role, phone, email });
      }
    );
  });
});

// Обновить пользователя
app.put('/api/users/:id', checkAdmin, (req, res) => {
  const { first_name, last_name, patronymic, role, phone, email, password } = req.body;
  const { id } = req.params;
  let query, params;
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Ошибка при хэшировании пароля' });
      query = 'UPDATE users SET first_name=?, last_name=?, patronymic=?, role=?, phone=?, email=?, password=? WHERE id=?';
      params = [first_name, last_name, patronymic, role, phone, email, hashedPassword, id];
      db.query(query, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, first_name, last_name, patronymic, role, phone, email });
      });
    });
  } else {
    query = 'UPDATE users SET first_name=?, last_name=?, patronymic=?, role=?, phone=?, email=? WHERE id=?';
    params = [first_name, last_name, patronymic, role, phone, email, id];
    db.query(query, params, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, first_name, last_name, patronymic, role, phone, email });
    });
  }
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

// Эндпоинт для авторизации пользователя
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    res.json({ token: 'fake-token', role: user.role, userId: user.id });
  });
});

// Регистрация пользователя (публичная)
app.post('/api/register', (req, res) => {
  const { first_name, last_name, patronymic, phone, email, password } = req.body;
  if (!first_name || !last_name || !phone || !email || !password) {
    return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
  }
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Ошибка при хэшировании пароля' });
    db.query(
      'INSERT INTO users (first_name, last_name, patronymic, role, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, patronymic, 'user', phone, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, first_name, last_name, patronymic, role: 'user', phone, email });
      }
    );
  });
});

// Получить данные одного пользователя по id (без пароля)
app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, first_name, last_name, patronymic, role, phone, email FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(results[0]);
  });
});

// Получить данные пользователя по email (без пароля)
app.get('/api/user-by-email/:email', (req, res) => {
  const { email } = req.params;
  db.query('SELECT id, first_name, last_name, patronymic, role, phone, email FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(results[0]);
  });
});

// Обновить профиль пользователя (без смены роли, доступно для всех авторизованных)
app.put('/api/profile/:id', async (req, res) => {
  try {
    const { first_name, last_name, patronymic, phone, email, password } = req.body;
    const { id } = req.params;
    let query, params;
    if (password) {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Hash error:', err);
          return res.status(500).json({ error: 'Ошибка при хэшировании пароля' });
        }
        query = 'UPDATE users SET first_name=?, last_name=?, patronymic=?, phone=?, email=?, password=? WHERE id=?';
        params = [first_name, last_name, patronymic, phone, email, hashedPassword, id];
        db.query(query, params, (err) => {
          if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ id, first_name, last_name, patronymic, phone, email });
        });
      });
    } else {
      query = 'UPDATE users SET first_name=?, last_name=?, patronymic=?, phone=?, email=? WHERE id=?';
      params = [first_name, last_name, patronymic, phone, email, id];
      db.query(query, params, (err) => {
        if (err) {
          console.error('DB error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ id, first_name, last_name, patronymic, phone, email });
      });
    }
  } catch (e) {
    console.error('API error:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Подключение роутов для товаров
const productsRouter = require('./products')(db, checkAdmin);
app.use('/api/products', productsRouter);

// Подключение роутера для категорий
const categoriesRouter = require('./categories')(db, checkAdmin);
app.use('/api/categories', categoriesRouter);

// Подключение роутера для избранного
const favoritesRouter = require('./favorites')(db);
app.use('/api/favorites', (req, res, next) => {
  // userId из заголовка или localStorage (для тестов)
  req.headers['x-user-id'] = req.headers['x-user-id'] || req.query.user_id || req.body?.user_id || localStorageUserId(req);
  next();
}, favoritesRouter);


// Подключение роутера для корзины (после инициализации db и app)
const cartRouter = require('./cart')(db);
app.use('/api/cart', cartRouter);

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

function localStorageUserId(req) {
  // Можно доработать под вашу авторизацию
  return null;
}
