const express = require('express');
const router = express.Router();


module.exports = (db) => {
  // middleware для передачи db в req
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Получить корзину пользователя
  router.get('/:userId', (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const role = (req.headers['x-user-role'] || '').toLowerCase();
    let priceField = 'user_price';
    if (role === 'master') priceField = 'master_price';
    db.query(
      `SELECT carts.id, carts.product_id, carts.quantity, products.name, products.${priceField} AS price, products.photos, products.quantity AS product_quantity
       FROM carts 
       JOIN products ON carts.product_id = products.id 
       WHERE carts.user_id = ?`,
      [userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
      }
    );
  });


  // Добавить или обновить товар в корзине
  router.post('/', (req, res) => {
    const db = req.db;
    const { user_id, product_id, quantity } = req.body;
    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ error: 'user_id, product_id и quantity обязательны' });
    }
    // Получить остаток на складе
    db.query('SELECT quantity FROM products WHERE id = ?', [product_id], (err, prodRes) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!prodRes.length) return res.status(404).json({ error: 'Товар не найден' });
      const maxQty = prodRes[0].quantity;
      if (quantity > maxQty) {
        return res.status(400).json({ error: 'Превышено количество доступного товара' });
      }
      // Проверяем, есть ли уже такая запись
      db.query(
        'SELECT * FROM carts WHERE user_id = ? AND product_id = ?',
        [user_id, product_id],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          if (results.length > 0) {
            // Обновить количество
            db.query(
              'UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?',
              [quantity, user_id, product_id],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, updated: true });
              }
            );
          } else {
            // Вставить новую запись
            db.query(
              'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
              [user_id, product_id, quantity],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, created: true });
              }
            );
          }
        }
      );
    });
  });

  // Удалить товар из корзины
  router.delete('/', (req, res) => {
    const db = req.db;
    const { user_id, product_id } = req.query;
    if (!user_id || !product_id) {
      return res.status(400).json({ error: 'user_id и product_id обязательны' });
    }
    db.query(
      'DELETE FROM carts WHERE user_id = ? AND product_id = ?',
      [user_id, product_id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: result.affectedRows > 0 });
      }
    );
  });

  return router;
};
