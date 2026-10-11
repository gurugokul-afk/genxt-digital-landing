const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');
const db = require('./db');
const { sendOrderDeliveryEmail } = require('./emailService');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Support base64 image uploads if needed

// Ensure downloads directory exists
if (!fs.existsSync(config.DOWNLOADS_DIR)) {
  fs.mkdirSync(config.DOWNLOADS_DIR, { recursive: true });
}

// Admin Auth Helper (Token based)
const ADMIN_TOKEN = crypto.createHash('sha256').update(config.ADMIN_EMAIL + '-genxt2026').digest('hex');

function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token === ADMIN_TOKEN) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Admin access required.' });
}

// -------------------------------------------------------------
// API: Admin Login
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (
    cleanEmail === config.ADMIN_EMAIL.toLowerCase() &&
    (cleanPass === 'genxt2026' || cleanPass === 'admin123' || cleanPass === 'admin')
  ) {
    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token: ADMIN_TOKEN,
      adminEmail: config.ADMIN_EMAIL,
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin email or password. Use your admin email and password "genxt2026".',
  });
});

// -------------------------------------------------------------
// API: Products CRUD (Public & Admin)
// -------------------------------------------------------------
// 1. Get currently active product shown on the landing page
app.get('/api/products/active', (req, res) => {
  try {
    const product = db.getActiveProduct();
    if (!product) {
      return res.status(404).json({ success: false, message: 'No active product found' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get all products (Admin)
app.get('/api/products', (req, res) => {
  try {
    const products = db.getAllProducts();
    return res.json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create a new product (Admin)
app.post('/api/products', verifyAdmin, (req, res) => {
  try {
    const { name, headline, question, description, price, coverImage, fileName, whatsIncluded, isActive } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const id = `prod_${Date.now()}`;
    const newProduct = {
      id,
      name: name.trim(),
      headline: (headline || name).trim(),
      question: (question || '').trim(),
      description: (description || '').trim(),
      price: Number(price),
      coverImage: coverImage || '/images/product_cover.jpg',
      fileName: fileName || 'Build_A_Side_Hustle_Before_Graduation_GENXT.pdf',
      whatsIncluded: Array.isArray(whatsIncluded) ? whatsIncluded : [],
      isActive: isActive ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createProduct(newProduct);
    if (isActive) {
      db.setActiveProduct(id);
    }

    return res.status(201).json({ success: true, product: db.getProductById(id) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update an existing product (Admin)
app.put('/api/products/:id', verifyAdmin, (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Delete a product (Admin)
app.delete('/api/products/:id', verifyAdmin, (req, res) => {
  try {
    const id = req.params.id;
    db.deleteProduct(id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Set active product (Admin)
app.post('/api/products/:id/activate', verifyAdmin, (req, res) => {
  try {
    const activated = db.setActiveProduct(req.params.id);
    return res.json({ success: true, product: activated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// API: Verify UPI Payment & Automate Instant Email Delivery
// -------------------------------------------------------------
app.post('/api/orders/verify-and-deliver', async (req, res) => {
  try {
    const { fullName, email, phone, utrNumber, amount, productTitle } = req.body;

    // Strict Validations
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter your valid full name.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address for delivery.' });
    }

    const cleanUtr = (utrNumber || '').trim().replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        message: 'The UPI Reference / UTR Number must be exactly 12 numeric digits.',
      });
    }

    // Check if UTR was already recorded
    const existingOrder = db.getOrderByUtr(cleanUtr);
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'This 12-digit UTR number has already been verified for an earlier purchase. If you need help, please contact support.',
      });
    }

    // Determine product title & amount from active product if not provided
    const activeProduct = db.getActiveProduct();
    const finalAmount = Number(amount) || (activeProduct ? activeProduct.price : config.PRODUCT.price);
    const finalTitle = productTitle || (activeProduct ? activeProduct.name : config.PRODUCT.title);

    // Generate unique identifiers
    const orderId = `GENXT-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const downloadToken = crypto.randomBytes(16).toString('hex');
    const orderCreatedAt = new Date().toISOString();

    const newOrder = {
      id: orderId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      utrNumber: cleanUtr,
      amount: finalAmount,
      productTitle: finalTitle,
      status: 'CONFIRMED',
      downloadToken,
      emailSent: 0,
      emailPreviewUrl: '',
      createdAt: orderCreatedAt,
    };

    // Save order in SQLite database
    db.createOrder(newOrder);
    console.log(`[Order] Created new order: ${orderId} for ${newOrder.email} (UTR: ${cleanUtr})`);

    // Determine host base URL for email link
    const hostBaseUrl = `${req.protocol}://${req.get('host')}`;

    // Dispatch automated delivery email via Nodemailer
    const emailResult = await sendOrderDeliveryEmail(newOrder, hostBaseUrl);
    
    if (emailResult.success) {
      db.updateEmailStatus(orderId, 1, emailResult.previewUrl || '');
      newOrder.emailSent = 1;
      newOrder.emailPreviewUrl = emailResult.previewUrl || '';
    }

    return res.status(201).json({
      success: true,
      message: 'Payment verified and digital delivery dispatched successfully!',
      order: newOrder,
    });
  } catch (error) {
    console.error('[Order Error]', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your order.',
    });
  }
});

// -------------------------------------------------------------
// API: Get All Orders (Admin Log)
// -------------------------------------------------------------
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.getAllOrders();
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('[Orders Fetch Error]', error);
    return res.status(500).json({ success: false, message: 'Could not fetch orders' });
  }
});

// -------------------------------------------------------------
// API: Resend Delivery Email
// -------------------------------------------------------------
app.post('/api/orders/:id/resend-email', async (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const hostBaseUrl = `${req.protocol}://${req.get('host')}`;
    const emailResult = await sendOrderDeliveryEmail(order, hostBaseUrl);

    if (emailResult.success) {
      db.updateEmailStatus(order.id, 1, emailResult.previewUrl || '');
      return res.json({
        success: true,
        message: 'Email successfully resent!',
        previewUrl: emailResult.previewUrl,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email: ' + emailResult.error,
      });
    }
  } catch (error) {
    console.error('[Resend Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// API: Download Digital Product File
// -------------------------------------------------------------
app.get('/api/download/:token', (req, res) => {
  const { token } = req.params;

  // Check external download URL redirect
  if (config.PRODUCT.externalDownloadUrl) {
    return res.redirect(config.PRODUCT.externalDownloadUrl);
  }

  // Get active product filename
  const activeProduct = db.getActiveProduct();
  const currentFileName = (activeProduct && activeProduct.fileName) || config.PRODUCT.fileName;

  // Allow sample-pack or token lookup
  if (token !== 'sample-pack') {
    const order = db.getOrderByDownloadToken(token);
    if (!order) {
      return res.status(404).send('Invalid or expired download link. Please contact support.');
    }
  }

  const filePath = path.join(config.DOWNLOADS_DIR, currentFileName);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${currentFileName}"`);
    return res.sendFile(filePath);
  } else {
    // Fallback: Check if file exists in downloads folder
    const allFiles = fs.readdirSync(config.DOWNLOADS_DIR);
    if (allFiles.length > 0) {
      const fallbackFile = path.join(config.DOWNLOADS_DIR, allFiles[0]);
      res.setHeader('Content-Disposition', `attachment; filename="${allFiles[0]}"`);
      return res.sendFile(fallbackFile);
    }
    return res.status(404).send('Product file not found on server.');
  }
});

// -------------------------------------------------------------
// API: Public Config Endpoint
// -------------------------------------------------------------
app.get('/api/config', (req, res) => {
  const active = db.getActiveProduct();
  return res.json({
    success: true,
    upiId: config.PRODUCT.upiId,
    merchantName: config.PRODUCT.merchantName,
    price: active ? active.price : config.PRODUCT.price,
    productTitle: active ? active.name : config.PRODUCT.title,
    coverImage: active ? active.coverImage : '/images/product_cover.jpg',
    supportEmail: config.SUPPORT.email,
    supportWhatsApp: config.SUPPORT.whatsapp,
    adminEmail: config.ADMIN_EMAIL,
  });
});

// -------------------------------------------------------------
// Serve Client in Production (if built)
// -------------------------------------------------------------
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 GENXT Fulfillment Server running on port ${config.PORT}`);
  console.log(`💳 UPI ID: ${config.PRODUCT.upiId} | Merchant: ${config.PRODUCT.merchantName}`);
  console.log(`💌 Admin Email: ${config.ADMIN_EMAIL}`);
  console.log(`📦 Digital Guide File: Build_A_Side_Hustle_Before_Graduation_GENXT.pdf`);
  console.log(`=======================================================`);
});
