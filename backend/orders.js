const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Создание заказа
  router.post('/', async (req, res) => {

    let {
      user_id,
      name,
      phone,
      email,
      status = 'В обработке',
      total_price,
      order_type,
      address,
      items = []
    } = req.body;

    // Если пользователь авторизован, подставляем пустые строки вместо null для name, phone, email
    if (user_id) {
      name = name || '';
      phone = phone || '';
      email = email || '';
    }

    if (!items.length || !total_price || !order_type) {
      return res.status(400).json({ error: 'Недостаточно данных для заказа' });
    }

    try {
      // 1. Создать заказ
      const [orderResult] = await db.promise().query(
        'INSERT INTO orders (user_id, name, phone, email, status, total_price, order_type, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, name, phone, email, status, total_price, order_type, address]
      );
      const orderId = orderResult.insertId;

      // 2. Добавить товары заказа по одному
      for (const item of items) {
        await db.promise().query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      res.json({ success: true, order_id: orderId });
    } catch (e) {
      console.error('Ошибка создания заказа:', e);
      res.status(500).json({ error: 'Ошибка создания заказа' });
    }
  });

  return router;
};
