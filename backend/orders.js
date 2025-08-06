const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Получить заказы пользователя (и гостей по телефону/email)
  router.get('/', async (req, res) => {
    const { user_id, phone, email } = req.query;
    let where = '';
    let params = [];
    if (user_id) {
      where = 'user_id = ?';
      params = [user_id];
    } else if (phone && email) {
      where = 'phone = ? AND email = ?';
      params = [phone, email];
    } else {
      return res.status(400).json({ error: 'user_id или phone+email обязательны' });
    }
    try {
      // Получаем заказы
      const [orders] = await db.promise().query(
        `SELECT * FROM orders WHERE ${where} ORDER BY id DESC`,
        params
      );
      if (!orders.length) return res.json([]);
      // Получаем все order_items для этих заказов
      const orderIds = orders.map(o => o.id);
      const [items] = await db.promise().query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
      // Группируем товары по заказу
      const itemsByOrder = {};
      for (const item of items) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }
      // Добавляем товары к заказам
      const result = orders.map(order => ({
        ...order,
        items: itemsByOrder[order.id] || []
      }));
      res.json(result);
    } catch (e) {
      console.error('Ошибка получения заказов:', e);
      res.status(500).json({ error: 'Ошибка получения заказов' });
    }
  });
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
