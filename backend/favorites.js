const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Получить id всех избранных товаров пользователя
  router.get('/', (req, res) => {
    const userId = req.headers['x-user-id'] || req.query.user_id || req.user?.id || localStorageUserId(req);
    if (!userId) return res.status(401).json({ error: 'Нет userId' });
    db.query('SELECT product_id FROM favorite_products WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results.map(r => r.product_id));
    });
  });

  // Добавить товар в избранное
  router.post('/', (req, res) => {
    const userId = req.headers['x-user-id'] || req.body.user_id || req.user?.id || localStorageUserId(req);
    const { product_id } = req.body;
    if (!userId || !product_id) return res.status(400).json({ error: 'user_id и product_id обязательны' });
    db.query('INSERT IGNORE INTO favorite_products (user_id, product_id) VALUES (?, ?)', [userId, product_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // Удалить товар из избранного
  router.delete('/:productId', (req, res) => {
    const userId = req.headers['x-user-id'] || req.query.user_id || req.user?.id || localStorageUserId(req);
    const productId = req.params.productId;
    if (!userId || !productId) return res.status(400).json({ error: 'user_id и productId обязательны' });
    db.query('DELETE FROM favorite_products WHERE user_id = ? AND product_id = ?', [userId, productId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // Получить все товары, которые в избранном у пользователя
  router.get('/products', (req, res) => {
    const userId = req.headers['x-user-id'] || req.query.user_id || req.user?.id || localStorageUserId(req);
    if (!userId) return res.status(401).json({ error: 'Нет userId' });
    // Получаем id товаров из избранного
    db.query('SELECT product_id FROM favorite_products WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const ids = results.map(r => r.product_id);
      if (!ids.length) return res.json([]);
      // Получаем товары по этим id
      db.query('SELECT * FROM products WHERE id IN (?)', [ids], (err2, products) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(products);
      });
    });
  });

  return router;
};

// Вспомогательная функция для тестов/локального режима
function localStorageUserId(req) {
  // Можно доработать под вашу авторизацию
  return null;
}
