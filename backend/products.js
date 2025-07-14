const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Настройка хранилища для фотографий
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

module.exports = (db, checkAdmin) => {
  // Получить все товары
  router.get('/', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Получить товар по id
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length) return res.status(404).json({ error: 'Товар не найден' });
      res.json(results[0]);
    });
  });

  // Создать товар
  router.post('/', checkAdmin, upload.array('photos', 10), (req, res) => {
    const { name, category_id, description, user_price, master_price, quantity } = req.body;
    const photos = req.files ? req.files.map(f => '/uploads/products/' + f.filename).join(',') : '';
    if (!name || !user_price || !master_price || !quantity) {
      return res.status(400).json({ error: 'Обязательные поля: name, user_price, master_price, quantity' });
    }
    db.query(
      'INSERT INTO products (name, photos, category_id, description, user_price, master_price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, photos, category_id || null, description, user_price, master_price, quantity],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, photos, category_id, description, user_price, master_price, quantity });
      }
    );
  });

  // Обновить товар
  router.put('/:id', checkAdmin, upload.array('photos', 10), (req, res) => {
    const { name, category_id, description, user_price, master_price, quantity } = req.body;
    let photos = req.body.photos || '';
    if (req.files && req.files.length) {
      photos = req.files.map(f => '/uploads/products/' + f.filename).join(',');
    }
    db.query(
      'UPDATE products SET name=?, photos=?, category_id=?, description=?, user_price=?, master_price=?, quantity=? WHERE id=?',
      [name, photos, category_id || null, description, user_price, master_price, quantity, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, name, photos, category_id, description, user_price, master_price, quantity });
      }
    );
  });

  // Удалить товар
  router.delete('/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Товар не найден' });
      res.json({ success: true });
    });
  });

  return router;
};
