const db = require('../config/db');

const processCheckout = (req, res) => {
  const userId = req.user.id;
  const { selectedItems, deliveryMethod, address } = req.body;

  // 1. Validation
  if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
    return res.status(400).json({ message: 'No items selected for checkout' });
  }

  if (!deliveryMethod || !['pickup', 'delivery'].includes(deliveryMethod)) {
    return res.status(400).json({ message: 'Invalid or missing delivery method' });
  }

  if (deliveryMethod === 'delivery' && (!address || address.trim() === '')) {
    return res.status(400).json({ message: 'Address is required for delivery' });
  }

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 2. Insert into orders table
  const orderSql = `
    INSERT INTO orders (user_id, total_price, delivery_method, address)
    VALUES (?, ?, ?, ?)
  `;
  const orderValues = [userId, total, deliveryMethod, deliveryMethod === 'delivery' ? address.trim() : null];

  db.query(orderSql, orderValues, (err, orderResult) => {
    if (err) {
      console.error('Error inserting order:', err);
      return res.status(500).json({ message: 'Failed to create order' });
    }

    const orderId = orderResult.insertId;

    // 3. Insert each item into order_items table
    const itemsSql = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ?
    `;
    const itemsData = selectedItems.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      item.price,
    ]);

    db.query(itemsSql, [itemsData], (err) => {
      if (err) {
        console.error('Error inserting order items:', err);
        return res.status(500).json({ message: 'Failed to insert order items' });
      }

      // 4. Clean up cart (delete checked out items)
      const cartIds = selectedItems.map(item => item.cart_id);
      const deleteSql = `
        DELETE FROM cart_items
        WHERE user_id = ? AND id IN (${cartIds.map(() => '?').join(',')})
      `;
      const deleteParams = [userId, ...cartIds];

      db.query(deleteSql, deleteParams, (err) => {
        if (err) {
          console.error('Error deleting cart items:', err);
          return res.status(500).json({ message: 'Failed to clean up cart' });
        }

        // 5. Done
        res.status(200).json({
          message: 'Order placed successfully',
          order_id: orderId,
        });
      });
    });
  });
};

module.exports = {
  processCheckout,
};
