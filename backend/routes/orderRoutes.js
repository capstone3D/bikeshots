const express = require('express');
const router = express.Router();
const db = require('../config/db');
const {
  getOrderById,
  getAllOrders,
  getMyOrders,
  updateOrderStatusByAdmin,
  updateOrderStatusByStaff,
} = require('../controllers/orderController');
const { authenticateToken, isAdmin, isStaff } = require('../middleware/authMiddleware');

// Get all orders for the logged-in user
router.get('/my', authenticateToken, getMyOrders);

// User cancels their own Pending order
router.put('/:id/cancel', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  console.log(`[${new Date().toISOString()}] User ${userId} attempting to cancel order ${orderId}`);
  const checkQuery = 'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = "Pending"';
  db.query(checkQuery, [orderId, userId], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error checking order ${orderId}:`, err);
      return res.status(500).json({ error: 'Failed to cancel order' });
    }

    if (results.length === 0) {
      console.log(`[${new Date().toISOString()}] Order ${orderId} not found or not cancellable by user ${userId}`);
      return res.status(403).json({ error: 'Only pending orders can be cancelled.' });
    }

    const updateQuery = 'UPDATE orders SET status = "Cancelled" WHERE id = ?';
    console.log(`[${new Date().toISOString()}] Executing query: ${updateQuery} with params:`, [orderId]);
    db.query(updateQuery, [orderId], (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error cancelling order ${orderId}:`, err);
        return res.status(500).json({ error: 'Failed to cancel order' });
      }
      console.log(`[${new Date().toISOString()}] Order ${orderId} cancelled successfully`);
      res.json({ message: 'Order cancelled successfully' });
    });
  });
});

// Admin approves or denies order
router.put('/:id/status', authenticateToken, isAdmin, updateOrderStatusByAdmin);

// User deletes their Cancelled or Denied order
router.delete('/:id', authenticateToken, (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  console.log(`[${new Date().toISOString()}] User ${userId} attempting to delete order ${orderId}`);
  const checkQuery = 'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status IN ("Cancelled", "Denied")';
  db.query(checkQuery, [orderId, userId], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error checking order ${orderId}:`, err);
      return res.status(500).json({ error: 'Failed to delete order' });
    }

    if (results.length === 0) {
      console.log(`[${new Date().toISOString()}] Order ${orderId} not found or not deletable by user ${userId}`);
      return res.status(403).json({ error: 'Can only delete your own Cancelled or Denied orders' });
    }

    const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
    console.log(`[${new Date().toISOString()}] Executing query: ${deleteItemsQuery} with params:`, [orderId]);
    db.query(deleteItemsQuery, [orderId], (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error deleting order items for order ${orderId}:`, err);
        return res.status(500).json({ error: 'Failed to delete order' });
      }

      const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
      console.log(`[${new Date().toISOString()}] Executing query: ${deleteOrderQuery} with params:`, [orderId]);
      db.query(deleteOrderQuery, [orderId], (err) => {
        if (err) {
          console.error(`[${new Date().toISOString()}] Error deleting order ${orderId}:`, err);
          return res.status(500).json({ error: 'Failed to delete order' });
        }
        console.log(`[${new Date().toISOString()}] Order ${orderId} deleted successfully by user ${userId}`);
        res.json({ message: 'Order deleted' });
      });
    });
  });
});

// Admin deletes Cancelled orders older than 3 days
router.delete('/admin/:id', authenticateToken, isAdmin, (req, res) => {
  const orderId = req.params.id;

  console.log(`[${new Date().toISOString()}] Admin attempting to delete order ${orderId}`);
  const checkQuery = `
    SELECT * FROM orders 
    WHERE id = ? AND status = "Cancelled" 
    AND created_at <= DATE_SUB(NOW(), INTERVAL 3 DAY)
  `;
  db.query(checkQuery, [orderId], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error checking order ${orderId}:`, err);
      return res.status(500).json({ error: 'Failed to delete order' });
    }

    if (results.length === 0) {
      console.log(`[${new Date().toISOString()}] Order ${orderId} not found or not deletable (must be Cancelled and >3 days old)`);
      return res.status(403).json({ error: 'Order must be Cancelled and older than 3 days to delete' });
    }

    const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
    console.log(`[${new Date().toISOString()}] Executing query: ${deleteItemsQuery} with params:`, [orderId]);
    db.query(deleteItemsQuery, [orderId], (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error deleting order items for order ${orderId}:`, err);
        return res.status(500).json({ error: 'Failed to delete order' });
      }

      const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
      console.log(`[${new Date().toISOString()}] Executing query: ${deleteOrderQuery} with params:`, [orderId]);
      db.query(deleteOrderQuery, [orderId], (err) => {
        if (err) {
          console.error(`[${new Date().toISOString()}] Error deleting order ${orderId}:`, err);
          return res.status(500).json({ error: 'Failed to delete order' });
        }
        console.log(`[${new Date().toISOString()}] Order ${orderId} deleted successfully by admin`);
        res.json({ message: 'Order deleted by admin' });
      });
    });
  });
});

// Get one order
router.get('/:id', authenticateToken, getOrderById);

// Admin: get all orders
router.get('/admin/all', authenticateToken, isAdmin, getAllOrders);

// Get all Approved orders (visible to staff only)
router.get('/staff/approved', authenticateToken, isStaff, (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching approved orders for staff`);
  const approvedQuery = `
    SELECT 
      o.id, 
      o.user_id,
      o.total_price,
      o.delivery_method,
      o.address,
      o.status,
      o.created_at,
      u.username AS user_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'Approved'
    ORDER BY o.created_at DESC
  `;
  console.log(`[${new Date().toISOString()}] Executing query: ${approvedQuery}`);
  db.query(approvedQuery, (err, orders) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error fetching approved orders:`, err);
      return res.status(500).json({ error: 'Failed to get approved orders' });
    }
    console.log(`[${new Date().toISOString()}] Fetched ${orders.length} approved orders`);

    if (orders.length === 0) {
      console.log(`[${new Date().toISOString()}] No approved orders found`);
      return res.json([]);
    }

    const orderIds = orders.map(order => order.id);
    const itemPlaceholders = orderIds.map(() => '?').join(',');
    const itemQuery = `
      SELECT 
        oi.order_id, 
        oi.product_id, 
        oi.quantity, 
        oi.price, 
        p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${itemPlaceholders})
    `;
    console.log(`[${new Date().toISOString()}] Executing query: ${itemQuery} with params:`, orderIds);
    db.query(itemQuery, orderIds, (err, items) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error fetching order items:`, err);
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }

      console.log(`[${new Date().toISOString()}] Fetched ${items.length} items for orders:`, orderIds);
      const orderItemsMap = {};
      items.forEach(item => {
        if (!orderItemsMap[item.order_id]) {
          orderItemsMap[item.order_id] = [];
        }
        orderItemsMap[item.order_id].push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          name: item.product_name || 'Deleted Product',
        });
      });

      const ordersWithItems = orders.map(order => ({
        ...order,
        items: orderItemsMap[order.id] || [],
      }));

      console.log(`[${new Date().toISOString()}] Fetched ${ordersWithItems.length} approved orders with items`);
      res.json(ordersWithItems);
    });
  });
});

// Staff view all visible orders (Approved + Processing + Ready for Delivery + Ready for Pickup + Completed)
router.get('/staff/visible', authenticateToken, isStaff, (req, res) => {
  const visibleStatuses = [
    'Approved',
    'Processing',
    'Ready for Delivery',
    'Ready for Pickup',
    'Completed'
  ];
  const placeholders = visibleStatuses.map(() => '?').join(',');
  const query = `
    SELECT 
      o.id, 
      o.user_id,
      o.total_price,
      o.delivery_method,
      o.address,
      o.status,
      o.created_at,
      u.username AS user_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status IN (${placeholders}) AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC
  `;
  console.log(`[${new Date().toISOString()}] Fetching staff-visible orders`);
  console.log(`[${new Date().toISOString()}] Executing query: ${query} with params:`, visibleStatuses);
  db.query(query, visibleStatuses, (err, orders) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error fetching staff-visible orders:`, err);
      return res.status(500).json({ error: 'Failed to fetch staff-visible orders' });
    }
    console.log(`[${new Date().toISOString()}] Fetched ${orders.length} staff-visible orders`);

    if (orders.length === 0) {
      console.log(`[${new Date().toISOString()}] No staff-visible orders found`);
      return res.json([]);
    }

    const orderIds = orders.map(order => order.id);
    const itemPlaceholders = orderIds.map(() => '?').join(',');
    const itemQuery = `
      SELECT 
        oi.order_id, 
        oi.product_id, 
        oi.quantity, 
        oi.price, 
        p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${itemPlaceholders})
    `;
    console.log(`[${new Date().toISOString()}] Executing query: ${itemQuery} with params:`, orderIds);
    db.query(itemQuery, orderIds, (err, items) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error fetching order items:`, err);
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }

      console.log(`[${new Date().toISOString()}] Fetched ${items.length} items for orders:`, orderIds);
      const orderItemsMap = {};
      items.forEach(item => {
        if (!orderItemsMap[item.order_id]) {
          orderItemsMap[item.order_id] = [];
        }
        orderItemsMap[item.order_id].push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          name: item.product_name || 'Deleted Product',
        });
      });

      const ordersWithItems = orders.map(order => ({
        ...order,
        items: orderItemsMap[order.id] || [],
      }));

      console.log(`[${new Date().toISOString()}] Fetched ${ordersWithItems.length} staff-visible orders with items`);
      res.json(ordersWithItems);
    });
  });
});

// Staff updates status (Processing -> Ready for Pickup/Delivery -> Completed)
router.put('/staff/:id/status', authenticateToken, isStaff, updateOrderStatusByStaff);

module.exports = router;