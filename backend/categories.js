const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/categories'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

module.exports = (db, checkAdmin) => {
  // Получить все категории
  router.get('/', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Получить категорию по id
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length) return res.status(404).json({ error: 'Категория не найдена' });
      res.json(results[0]);
    });
  });

  // Создать категорию
  router.post('/', checkAdmin, upload.array('photos', 5), (req, res) => {
    const { name } = req.body;
    const photos = req.files ? req.files.map(f => '/uploads/categories/' + f.filename).join(',') : '';
    if (!name) {
      return res.status(400).json({ error: 'Обязательное поле: name' });
    }
    db.query(
      'INSERT INTO categories (name, photos) VALUES (?, ?)',
      [name, photos],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, photos });
      }
    );
  });

  // Обновить категорию
  router.put('/:id', checkAdmin, upload.array('photos', 5), (req, res) => {
    const { name } = req.body;
    let photos = req.body.photos || '';
    if (req.files && req.files.length) {
      photos = req.files.map(f => '/uploads/categories/' + f.filename).join(',');
    }
    db.query(
      'UPDATE categories SET name=?, photos=? WHERE id=?',
      [name, photos, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, name, photos });
      }
    );
  });

  // Удалить категорию
  router.delete('/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM categories WHERE id=?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Категория не найдена' });
      res.json({ success: true });
    });
  });

  return router;
};
