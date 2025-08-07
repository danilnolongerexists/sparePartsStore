
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
  // Получить список товаров по массиву id
  router.post('/by-ids', (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || !ids.length) {
      return res.json([]);
    }
    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      SELECT p.*, 
        GROUP_CONCAT(pc.category_id) AS category_ids,
        GROUP_CONCAT(c.name) AS category_names
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id IN (${placeholders})
      GROUP BY p.id
    `;
    db.query(sql, ids, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const products = results.map(row => ({
        ...row,
        category_ids: row.category_ids ? row.category_ids.split(',').map(Number) : [],
        category_names: row.category_names ? row.category_names.split(',') : []
      }));
      res.json(products);
    });
  });
  // Получить все товары с категориями или по категории
  router.get('/', (req, res) => {
    const { category_id } = req.query;
    let sql = `
      SELECT p.*, 
        GROUP_CONCAT(pc.category_id) AS category_ids,
        GROUP_CONCAT(c.name) AS category_names
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
    `;
    const params = [];
    if (category_id) {
      sql += ' WHERE pc.category_id = ?';
      params.push(category_id);
    }
    sql += ' GROUP BY p.id';
    db.query(sql, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const products = results.map(row => ({
        ...row,
        category_ids: row.category_ids ? row.category_ids.split(',').map(Number) : [],
        category_names: row.category_names ? row.category_names.split(',') : []
      }));
      res.json(products);
    });
  });

  // Получить товар по id с категориями
  router.get('/:id', (req, res) => {
    const sql = `
      SELECT p.*, 
        GROUP_CONCAT(pc.category_id) AS category_ids,
        GROUP_CONCAT(c.name) AS category_names
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    db.query(sql, [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length) return res.status(404).json({ error: 'Товар не найден' });
      const row = results[0];
      row.category_ids = row.category_ids ? row.category_ids.split(',').map(Number) : [];
      row.category_names = row.category_names ? row.category_names.split(',') : [];
      res.json(row);
    });
  });

  // Создать товар с категориями
  router.post('/', checkAdmin, upload.array('photos', 10), (req, res) => {
    const { name, category_ids, description, user_price, master_price, quantity } = req.body;
    const photos = req.files ? req.files.map(f => '/uploads/products/' + f.filename).join(',') : '';
    if (!name || !user_price || !master_price || !quantity) {
      return res.status(400).json({ error: 'Обязательные поля: name, user_price, master_price, quantity' });
    }
    db.query(
      'INSERT INTO products (name, photos, description, user_price, master_price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, photos, description, user_price, master_price, quantity],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const productId = result.insertId;
        let cats = [];
        try {
          cats = JSON.parse(category_ids || '[]');
        } catch { cats = []; }
        if (cats.length) {
          const values = cats.map(cid => [productId, cid]);
          db.query('INSERT INTO product_categories (product_id, category_id) VALUES ?', [values], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ id: productId, name, photos, category_ids: cats, description, user_price, master_price, quantity });
          });
        } else {
          res.json({ id: productId, name, photos, category_ids: [], description, user_price, master_price, quantity });
        }
      }
    );
  });

  // Обновить товар с категориями
  router.put('/:id', checkAdmin, upload.array('photos', 10), (req, res) => {
    const { name, category_ids, description, user_price, master_price, quantity } = req.body;
    let photos = req.body.photos || '';
    if (req.files && req.files.length) {
      photos = req.files.map(f => '/uploads/products/' + f.filename).join(',');
    }
    db.query(
      'UPDATE products SET name=?, photos=?, description=?, user_price=?, master_price=?, quantity=? WHERE id=?',
      [name, photos, description, user_price, master_price, quantity, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        let cats = [];
        try {
          cats = JSON.parse(category_ids || '[]');
        } catch { cats = []; }
        // Удаляем старые связи и добавляем новые
        db.query('DELETE FROM product_categories WHERE product_id=?', [req.params.id], (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          if (cats.length) {
            const values = cats.map(cid => [req.params.id, cid]);
            db.query('INSERT INTO product_categories (product_id, category_id) VALUES ?', [values], (err3) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({ id: req.params.id, name, photos, category_ids: cats, description, user_price, master_price, quantity });
            });
          } else {
            res.json({ id: req.params.id, name, photos, category_ids: [], description, user_price, master_price, quantity });
          }
        });
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
