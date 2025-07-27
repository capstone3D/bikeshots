const db = require('../config/db');
const { decreaseProductQuantity } = require('../models/productModel');

// Get a specific order by ID for the logged-in user
const getOrderById = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const getOrderQuery = `
    SELECT * FROM orders 
    WHERE id = ? AND user_id = ? 
    LIMIT 1
  `;

  console.log(`[${new Date().toISOString()}] Executing query: ${getOrderQuery} with params:`, [orderId, userId]);
  db.query(getOrderQuery, [orderId, userId], (err, orderResults) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Database error (order):`, err);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }

    if (orderResults.length === 0) {
      console.error(`[${new Date().toISOString()}] Order ${orderId} not found for user ${userId}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResults[0];

    const getItemsQuery = `
      SELECT 
        oi.product_id, 
        oi.quantity, 
        oi.price, 
        p.name AS product_name 
      FROM order_items oi 
      LEFT JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `;

    console.log(`[${new Date().toISOString()}] Executing query: ${getItemsQuery} with params:`, [orderId]);
    db.query(getItemsQuery, [orderId], (err, itemResults) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Database error (order items):`, err);
        return res.status(500).json({ message: 'Failed to fetch order items' });
      }

      return res.json({
        ...order,
        items: itemResults,
      });
    });
  });
};

// Admin/Staff: Get all orders with items
const getAllOrders = (req, res) => {
  const orderQuery = `
    SELECT 
      o.id, 
      o.user_id,
      o.total_price,          
      o.delivery_method,      
      o.address,
      o.status,
      o.created_at,
      o.denial_reason,
      o.deleted_at,
      u.username AS user_name 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.deleted_at IS NULL
    ORDER BY o.created_at DESC
  `;

  console.log(`[${new Date().toISOString()}] Executing query: ${orderQuery}`);
  db.query(orderQuery, (err, orders) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Database error (getAllOrders):`, err);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(order => order.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const itemQuery = `
      SELECT 
        oi.order_id, 
        oi.product_id, 
        oi.quantity, 
        oi.price, 
        p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${placeholders})
    `;

    console.log(`[${new Date().toISOString()}] Executing query: ${itemQuery} with params:`, orderIds);
    db.query(itemQuery, orderIds, (err, items) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Database error (order items):`, err);
        return res.status(500).json({ message: 'Failed to fetch order items' });
      }

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

      res.json(ordersWithItems);
    });
  });
};

// Get all orders for the logged-in user
const getMyOrders = (req, res) => {
  const userId = req.user.id;

  const ordersQuery = `
    SELECT 
      o.id, 
      o.total_price, 
      o.delivery_method, 
      o.address, 
      o.status, 
      o.created_at
    FROM orders o
    WHERE o.user_id = ? AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC
  `;

  console.log(`[${new Date().toISOString()}] Executing query: ${ordersQuery} with params:`, [userId]);
  db.query(ordersQuery, [userId], (err, orders) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Database error (getMyOrders):`, err);
      return res.status(500).json({ message: 'Failed to fetch your orders' });
    }

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map(order => order.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const itemsQuery = `
      SELECT 
        oi.order_id, 
        oi.product_id, 
        oi.quantity, 
        oi.price, 
        p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${placeholders})
    `;

    console.log(`[${new Date().toISOString()}] Executing query: ${itemsQuery} with params:`, orderIds);
    db.query(itemsQuery, orderIds, (err, items) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Database error (getMyOrders items):`, err);
        return res.status(500).json({ message: 'Failed to fetch order items' });
      }

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

      res.json(ordersWithItems);
    });
  });
};

// Admin: Update order status to Approved or Denied
const updateOrderStatusByAdmin = (req, res) => {
  const orderId = req.params.id;
  const { status, denial_reason } = req.body;

  if (!['Approved', 'Denied'].includes(status)) {
    console.error(`[${new Date().toISOString()}] Invalid status update attempt: ${status}`);
    return res.status(400).json({ message: 'Invalid status update' });
  }

  if (status === 'Approved') {
    console.log(`[${new Date().toISOString()}] Starting transaction for order ${orderId}`);
    db.query('START TRANSACTION', (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Transaction start error:`, err);
        return res.status(500).json({ message: 'Transaction start failed' });
      }

      const getItemsQuery = `SELECT product_id, quantity FROM order_items WHERE order_id = ?`;
      console.log(`[${new Date().toISOString()}] Executing query: ${getItemsQuery} with params:`, [orderId]);
      db.query(getItemsQuery, [orderId], (err, items) => {
        if (err) {
          console.error(`[${new Date().toISOString()}] Error fetching order items for order ${orderId}:`, err);
          return db.query('ROLLBACK', () => {
            res.status(500).json({ message: 'Failed to fetch order items' });
          });
        }

        if (items.length === 0) {
          console.error(`[${new Date().toISOString()}] No items found for order ${orderId}`);
          return db.query('ROLLBACK', () => {
            res.status(400).json({ message: 'No items found for order' });
          });
        }

        console.log(`[${new Date().toISOString()}] Order ${orderId} items:`, JSON.stringify(items));

        const outOfStockProducts = [];

        // Check stock availability
        let stockCheckIndex = 0;
        const checkStock = () => {
          if (stockCheckIndex >= items.length) {
            updateInventory();
            return;
          }

          const item = items[stockCheckIndex];
          const stockQuery = 'SELECT quantity, name FROM products WHERE id = ?';
          console.log(`[${new Date().toISOString()}] Executing query: ${stockQuery} with params:`, [item.product_id]);
          db.query(stockQuery, [item.product_id], (err, productResults) => {
            if (err || productResults.length === 0) {
              console.error(`[${new Date().toISOString()}] Error fetching product ${item.product_id}:`, err);
              return db.query('ROLLBACK', () => {
                res.status(400).json({ message: `Product ID ${item.product_id} not found` });
              });
            }

            const currentQty = productResults[0].quantity;
            const productName = productResults[0].name;
            console.log(`[${new Date().toISOString()}] Checking stock for product ${item.product_id} (${productName}): Current=${currentQty}, Requested=${item.quantity}`);

            if (currentQty < item.quantity) {
              console.warn(`[${new Date().toISOString()}] Insufficient stock for product ${item.product_id} (${productName}): Available=${currentQty}, Requested=${item.quantity}`);
              return db.query('ROLLBACK', () => {
                res.status(400).json({ message: `Insufficient stock for product ${productName}` });
              });
            }

            stockCheckIndex++;
            checkStock();
          });
        };

        // Update inventory
        const updateInventory = () => {
          let updateIndex = 0;
          const updateStock = () => {
            if (updateIndex >= items.length) {
              updateOrderStatus();
              return;
            }

            const item = items[updateIndex];
            decreaseProductQuantity(item.product_id, item.quantity, db, (err, result) => {
              if (err) {
                console.error(`[${new Date().toISOString()}] Error decreasing stock for product ${item.product_id}:`, err);
                return db.query('ROLLBACK', () => {
                  res.status(400).json({ message: err.message });
                });
              }

              // Check if product is now out of stock
              const stockQuery = 'SELECT quantity, name FROM products WHERE id = ?';
              console.log(`[${new Date().toISOString()}] Executing query: ${stockQuery} with params:`, [item.product_id]);
              db.query(stockQuery, [item.product_id], (err, productResults) => {
                if (err) {
                  console.error(`[${new Date().toISOString()}] Error checking post-update stock for product ${item.product_id}:`, err);
                  return db.query('ROLLBACK', () => {
                    res.status(400).json({ message: `Failed to verify stock for product ID ${item.product_id}` });
                  });
                }

                const newQty = productResults[0].quantity;
                const productName = productResults[0].name;
                if (newQty === 0) {
                  outOfStockProducts.push({ product_id: item.product_id, name: productName });
                }

                console.log(`[${new Date().toISOString()}] Updated product ${item.product_id} (${productName}): New quantity=${newQty}`);
                updateIndex++;
                updateStock();
              });
            });
          };

          // Update order status
          const updateOrderStatus = () => {
            const updateOrderQuery = `
              UPDATE orders 
              SET status = ?, denial_reason = NULL 
              WHERE id = ?
            `;
            console.log(`[${new Date().toISOString()}] Executing query: ${updateOrderQuery} with params:`, [status, orderId]);
            db.query(updateOrderQuery, [status, orderId], (err, orderResult) => {
              if (err) {
                console.error(`[${new Date().toISOString()}] Error updating order ${orderId} status:`, err);
                return db.query('ROLLBACK', () => {
                  res.status(500).json({ message: 'Failed to update order status' });
                });
              }
              if (orderResult.affectedRows === 0) {
                console.error(`[${new Date().toISOString()}] Order ${orderId} not found for status update`);
                return db.query('ROLLBACK', () => {
                  res.status(404).json({ message: 'Order not found' });
                });
              }

              db.query('COMMIT', (err) => {
                if (err) {
                  console.error(`[${new Date().toISOString()}] Commit failed for order ${orderId}:`, err);
                  return db.query('ROLLBACK', () => {
                    res.status(500).json({ message: 'Failed to commit transaction' });
                  });
                }
                console.log(`[${new Date().toISOString()}] Order ${orderId} approved successfully. Out of stock products:`, JSON.stringify(outOfStockProducts));
                res.json({
                  message: 'Order approved and inventory updated successfully',
                  outOfStockProducts: outOfStockProducts.length > 0 ? outOfStockProducts : null
                });
              });
            });
          };

          updateStock();
        };

        checkStock();
      });
    });
  } else {
    const updateQuery = `
      UPDATE orders 
      SET status = ?, denial_reason = ? 
      WHERE id = ?
    `;
    console.log(`[${new Date().toISOString()}] Executing query: ${updateQuery} with params:`, [status, denial_reason || null, orderId]);
    db.query(updateQuery, [status, denial_reason || null, orderId], (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error updating denied order status:`, err);
        return res.status(500).json({ message: 'Failed to update order status' });
      }

      res.json({ message: `Order ${status.toLowerCase()}` });
    });
  }
};

// Staff: Update order status (Processing -> Ready for Pickup/Delivery -> Completed)
const updateOrderStatusByStaff = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['Processing', 'Ready for Pickup', 'Ready for Delivery', 'Completed'];
  if (!validStatuses.includes(status)) {
    console.error(`[${new Date().toISOString()}] Invalid status provided: ${status}`);
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  const getOrderQuery = `
    SELECT status, delivery_method 
    FROM orders 
    WHERE id = ? AND deleted_at IS NULL
  `;
  console.log(`[${new Date().toISOString()}] Executing query: ${getOrderQuery} with params:`, [orderId]);
  db.query(getOrderQuery, [orderId], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Database error (fetch order):`, err);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }

    if (results.length === 0) {
      console.error(`[${new Date().toISOString()}] Order ${orderId} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = results[0].status;
    const deliveryMethod = results[0].delivery_method;

    const validTransitions = {
      Approved: ['Processing'],
      Processing: deliveryMethod === 'pickup' ? ['Ready for Pickup'] : ['Ready for Delivery'],
      'Ready for Pickup': ['Completed'],
      'Ready for Delivery': ['Completed'],
      Completed: [],
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      console.error(`[${new Date().toISOString()}] Invalid transition from ${currentStatus} to ${status} for order ${orderId}`);
      return res.status(400).json({ message: `Invalid transition from ${currentStatus} to ${status}` });
    }

    const updateQuery = `
      UPDATE orders 
      SET status = ? 
      WHERE id = ?
    `;
    console.log(`[${new Date().toISOString()}] Executing query: ${updateQuery} with params:`, [status, orderId]);
    db.query(updateQuery, [status, orderId], (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error updating order status for order ${orderId}:`, err);
        return res.status(500).json({ message: 'Failed to update order status' });
      }

      res.json({ message: `Order updated to ${status}` });
    });
  });
};

// Soft Delete Order (Admin/User Logic)
const deleteOrderByAdminOrUser = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const orderId = req.params.id;

  const getOrderQuery = `SELECT * FROM orders WHERE id = ?`;
  console.log(`[${new Date().toISOString()}] Executing query: ${getOrderQuery} with params:`, [orderId]);
  db.query(getOrderQuery, [orderId], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Database error (fetch order):`, err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      console.error(`[${new Date().toISOString()}] Order ${orderId} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = results[0];

    if (userRole === 'admin') {
      const threeDaysPassed =
        new Date() - new Date(order.created_at) > 3 * 24 * 60 * 60 * 1000;

      if (!['Denied', 'Cancelled'].includes(order.status) || !threeDaysPassed) {
        console.error(`[${new Date().toISOString()}] Admin delete denied for order ${orderId}: Status=${order.status}, Days passed=${(new Date() - new Date(order.created_at)) / (24 * 60 * 60 * 1000)}`);
        return res.status(403).json({
          message: 'Admins can delete only Denied/Cancelled orders after 3 days',
        });
      }
    }

    if (userRole === 'user' && (order.user_id !== userId || order.status !== 'Denied')) {
      console.error(`[${new Date().toISOString()}] User ${userId} delete denied for order ${orderId}: User_id=${order.user_id}, Status=${order.status}`);
      return res.status(403).json({ message: 'You can only delete your Denied orders' });
    }

    const softDeleteQuery = `UPDATE orders SET deleted_at = NOW() WHERE id = ?`;
    console.log(`[${new Date().toISOString()}] Executing query: ${softDeleteQuery} with params:`, [orderId]);
    db.query(softDeleteQuery, [orderId], (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Delete failed for order ${orderId}:`, err);
        return res.status(500).json({ message: 'Delete failed' });
      }
      res.json({ message: 'Order deleted successfully' });
    });
  });
};

module.exports = {
  getOrderById,
  getAllOrders,
  getMyOrders,
  updateOrderStatusByAdmin,
  updateOrderStatusByStaff,
  deleteOrderByAdminOrUser,
};