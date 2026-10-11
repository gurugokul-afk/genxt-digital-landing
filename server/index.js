const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');
const db = require('./db');
const { sendOrderDeliveryEmail } = require('./emailService');
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay package not loaded:', e.message);
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Support base64 image uploads if needed

// Ensure downloads and uploads directory exist
if (!fs.existsSync(config.DOWNLOADS_DIR)) {
  fs.mkdirSync(config.DOWNLOADS_DIR, { recursive: true });
}
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Admin Auth Helper (Token based)
let currentAdminToken = crypto.createHash('sha256').update(Date.now() + '-genxt-session').digest('hex');

function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token && token === currentAdminToken) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Admin access required.' });
}

// -------------------------------------------------------------
// API: Admin Login (Dynamic Credentials from SQLite)
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const currentSettings = db.getAdminSettings();

  if (
    cleanEmail === currentSettings.email.toLowerCase() &&
    cleanPass === currentSettings.password
  ) {
    // Generate fresh session token
    currentAdminToken = crypto.createHash('sha256').update(Date.now() + '-genxt-' + cleanEmail).digest('hex');
    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token: currentAdminToken,
      adminEmail: currentSettings.email,
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin email or password.',
  });
});

// -------------------------------------------------------------
// API: Admin Change Credentials (Update Email & Password)
// -------------------------------------------------------------
app.post('/api/admin/change-credentials', verifyAdmin, (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    const settings = db.getAdminSettings();

    if (!currentPassword || currentPassword.trim() !== settings.password) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (!newEmail && !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide a new email or password.' });
    }

    if (newPassword && newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters.' });
    }

    const updated = db.updateAdminSettings(
      newEmail ? newEmail.trim().toLowerCase() : null,
      newPassword ? newPassword.trim() : null
    );

    // Refresh session token
    currentAdminToken = crypto.createHash('sha256').update(Date.now() + '-genxt-' + updated.email).digest('hex');

    return res.json({
      success: true,
      message: 'Admin email and password updated successfully!',
      token: currentAdminToken,
      adminEmail: updated.email,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// API: Payment & QR Code Management
// -------------------------------------------------------------
// 1. Get active payment config (Public)
app.get('/api/payment-config', (req, res) => {
  try {
    const payment = db.getPaymentSettings();
    const rzp = db.getRazorpaySettings();
    return res.json({
      success: true,
      ...payment,
      razorpayEnabled: rzp.enabled && !!rzp.keyId && !!rzp.keySecret,
      razorpayKeyId: rzp.enabled ? rzp.keyId : undefined,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 1b. Get Razorpay Settings (Admin Only)
app.get('/api/admin/razorpay-settings', verifyAdmin, (req, res) => {
  try {
    const rzp = db.getRazorpaySettings();
    return res.json({
      success: true,
      enabled: rzp.enabled,
      keyId: rzp.keyId,
      keySecret: rzp.keySecret ? '••••••••••••••••' : '',
      hasKeySecret: !!rzp.keySecret,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 1c. Update Razorpay Settings (Admin Only)
app.post('/api/admin/razorpay-settings', verifyAdmin, (req, res) => {
  try {
    const { enabled, keyId, keySecret } = req.body;
    const updated = db.updateRazorpaySettings({
      enabled: enabled !== undefined ? Boolean(enabled) : undefined,
      keyId: keyId !== undefined ? keyId.trim() : undefined,
      keySecret: (keySecret && !keySecret.includes('••••')) ? keySecret.trim() : undefined,
    });
    return res.json({
      success: true,
      message: 'Razorpay configuration updated successfully!',
      settings: {
        enabled: updated.enabled,
        keyId: updated.keyId,
        hasKeySecret: !!updated.keySecret,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 1d. Razorpay Create Order (Public/Checkout)
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const rzpSettings = db.getRazorpaySettings();
    if (!rzpSettings.enabled || !rzpSettings.keyId || !rzpSettings.keySecret) {
      return res.status(400).json({ success: false, message: 'Razorpay gateway is not configured or disabled.' });
    }

    if (!Razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay SDK is not initialized on server.' });
    }

    const { amount, productTitle } = req.body;
    const activeProduct = db.getActiveProduct();
    const finalAmount = Number(amount) || (activeProduct ? activeProduct.price : config.PRODUCT.price);
    const finalTitle = productTitle || (activeProduct ? activeProduct.name : config.PRODUCT.title);

    const instance = new Razorpay({
      key_id: rzpSettings.keyId,
      key_secret: rzpSettings.keySecret,
    });

    const receipt = `genxt_rcpt_${Date.now().toString(36)}`;
    const options = {
      amount: Math.round(finalAmount * 100), // in paise
      currency: 'INR',
      receipt,
      notes: {
        product: finalTitle,
      },
    };

    const order = await instance.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: rzpSettings.keyId,
      productTitle: finalTitle,
    });
  } catch (err) {
    console.error('[Razorpay Order Create Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Could not initiate Razorpay order.',
    });
  }
});

// 1e. Razorpay Verify Payment & Deliver (Public/Checkout)
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const rzpSettings = db.getRazorpaySettings();
    if (!rzpSettings.keySecret) {
      return res.status(400).json({ success: false, message: 'Razorpay secret key not found.' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      fullName,
      email,
      phone,
      amount,
      productTitle,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment signature verification data.' });
    }

    // Cryptographically verify signature using HMAC SHA256
    const bodyData = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', rzpSettings.keySecret)
      .update(bodyData)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn(`[Razorpay Fraud Detected] Invalid signature for payment ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid cryptographic signature.',
      });
    }

    // Determine product title & amount
    const activeProduct = db.getActiveProduct();
    const finalAmount = Number(amount) || (activeProduct ? activeProduct.price : config.PRODUCT.price);
    const finalTitle = productTitle || (activeProduct ? activeProduct.name : config.PRODUCT.title);

    // Create confirmed order
    const orderId = `GENXT-RZP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const downloadToken = crypto.randomBytes(16).toString('hex');
    const orderCreatedAt = new Date().toISOString();

    const newOrder = {
      id: orderId,
      fullName: (fullName || 'Customer').trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      utrNumber: razorpay_payment_id, // Store Razorpay Payment ID as payment proof
      amount: finalAmount,
      productTitle: finalTitle,
      status: 'CONFIRMED', // Instant Confirmed since Razorpay verified bank credit!
      downloadToken,
      emailSent: 0,
      emailPreviewUrl: '',
      createdAt: orderCreatedAt,
    };

    db.createOrder(newOrder);
    console.log(`[Razorpay] Payment verified! Order created: ${orderId} for ${newOrder.email} (${razorpay_payment_id})`);

    const hostBaseUrl = `${req.protocol}://${req.get('host')}`;

    // Respond immediately with confirmed order and download token
    res.status(201).json({
      success: true,
      message: 'Payment verified and confirmed by Razorpay!',
      order: newOrder,
    });

    // Send delivery email with the PDF in background
    sendOrderDeliveryEmail(newOrder, hostBaseUrl)
      .then((emailResult) => {
        if (emailResult && emailResult.success) {
          db.updateEmailStatus(orderId, 1, emailResult.previewUrl || '');
          console.log(`[Order] Delivery email sent to ${newOrder.email}`);
        }
      })
      .catch((err) => {
        console.error('[Order Email Error]', err.message);
      });

  } catch (err) {
    console.error('[Razorpay Verify Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Payment verification failed.' });
  }
});

// 2. Update payment details (Admin)
app.post('/api/admin/update-payment-config', verifyAdmin, (req, res) => {
  try {
    const { qrImageUrl, upiId, payeeName, upiUri } = req.body;
    const updated = db.updatePaymentSettings({
      qrImageUrl: qrImageUrl ? qrImageUrl.trim() : undefined,
      upiId: upiId ? upiId.trim() : undefined,
      payeeName: payeeName ? payeeName.trim() : undefined,
      upiUri: upiUri ? upiUri.trim() : undefined,
    });
    return res.json({
      success: true,
      message: 'Payment configuration updated successfully!',
      payment: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Upload new Payment QR code image (Admin)
app.post('/api/admin/upload-qr', verifyAdmin, (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No image data provided.' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');

    const ext = fileName && path.extname(fileName) ? path.extname(fileName) : '.jpg';
    const savedName = `qr_${Date.now()}${ext}`;
    const uploadPath = path.join(UPLOADS_DIR, savedName);
    fs.writeFileSync(uploadPath, buffer);

    // Also overwrite payment_qr.jpg so default route always works
    fs.writeFileSync(path.join(UPLOADS_DIR, 'payment_qr.jpg'), buffer);

    const clientPublicImg = path.join(__dirname, '../client/public/images');
    if (fs.existsSync(clientPublicImg)) {
      try {
        fs.writeFileSync(path.join(clientPublicImg, 'payment_qr.jpg'), buffer);
      } catch (e) {
        console.warn('Could not sync to client public:', e.message);
      }
    }

    const qrImageUrl = `/uploads/${savedName}`;
    let detectedUpiId = null;
    let detectedPayee = null;
    let detectedUri = null;

    // Try decoding the QR code
    try {
      let rawImageData = null;
      if (ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.jpeg') {
        const jpeg = require('jpeg-js');
        rawImageData = jpeg.decode(buffer, { useTArray: true });
      }
      if (rawImageData) {
        const jsQR = require('jsqr');
        const code = jsQR(rawImageData.data, rawImageData.width, rawImageData.height);
        if (code && code.data) {
          detectedUri = code.data;
          if (detectedUri.startsWith('upi://pay')) {
            const parsedUrl = new URL(detectedUri);
            detectedUpiId = parsedUrl.searchParams.get('pa') || null;
            detectedPayee = parsedUrl.searchParams.get('pn') || null;
          }
        }
      }
    } catch (decodeErr) {
      console.warn('QR auto-decode notice:', decodeErr.message);
    }

    const updated = db.updatePaymentSettings({
      qrImageUrl,
      upiId: detectedUpiId || undefined,
      payeeName: detectedPayee || undefined,
      upiUri: detectedUri || undefined,
    });

    return res.json({
      success: true,
      message: 'Payment QR code uploaded and activated successfully!',
      payment: updated,
      detected: {
        upiId: detectedUpiId,
        payeeName: detectedPayee,
        upiUri: detectedUri,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
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
      status: 'PENDING',
      downloadToken,
      emailSent: 0,
      emailPreviewUrl: '',
      createdAt: orderCreatedAt,
    };

    // Save order in SQLite database
    db.createOrder(newOrder);
    console.log(`[Order] New order pending verification: ${orderId} for ${newOrder.email} (UTR: ${cleanUtr})`);

    // ⚡ Respond to customer that payment was received for verification
    // Download token is kept private until admin verifies receipt of full amount
    return res.status(201).json({
      success: true,
      isPending: true,
      message: 'Payment details submitted successfully! Your order is being verified against our bank records. Digital access will be dispatched to your email once confirmed.',
      order: {
        ...newOrder,
        downloadToken: '', // Keep concealed until approved
      },
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
// API: Delete Order (Admin Customer Management)
// -------------------------------------------------------------
app.delete('/api/orders/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.deleteOrder(id);
    return res.json({ success: true, message: `Order ${id} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// API: Update Order Status (Admin Customer Management)
// -------------------------------------------------------------
app.patch('/api/orders/:id/status', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = db.updateOrderStatus(id, status);
    return res.json({ success: true, order: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// API: Clear Test Orders (Admin Quick Clean)
// -------------------------------------------------------------
app.post('/api/orders/clear-test-orders', verifyAdmin, (req, res) => {
  try {
    const all = db.getAllOrders();
    let deletedCount = 0;
    const testEmails = [
      'gurugokul.test@gmail.com',
      'priya.student@gmail.com',
      'rahul.test@example.com',
      'test@test.com'
    ];
    for (const ord of all) {
      if (testEmails.includes(ord.email.toLowerCase()) || ord.fullName.toLowerCase().includes('test')) {
        db.deleteOrder(ord.id);
        deletedCount++;
      }
    }
    return res.json({ success: true, message: `Cleared ${deletedCount} test order(s).`, deletedCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// API: Email Settings Management (Admin)
// -------------------------------------------------------------
app.get('/api/admin/email-settings', verifyAdmin, (req, res) => {
  try {
    const settings = db.getEmailSettings();
    return res.json({ success: true, ...settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/email-settings', verifyAdmin, (req, res) => {
  try {
    const { gmailUser, gmailAppPassword } = req.body;
    const updated = db.updateEmailSettings({ gmailUser, gmailAppPassword });
    return res.json({
      success: true,
      message: 'Email credentials updated successfully!',
      ...updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
        message: 'Failed to send email: ' + (emailResult.error || 'Check Gmail App Password'),
      });
    }
  } catch (error) {
    console.error('[Resend Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// API: Approve Order & Deliver Product (Admin Verification)
// -------------------------------------------------------------
app.post('/api/orders/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updated = db.updateOrderStatus(id, 'CONFIRMED');
    const hostBaseUrl = `${req.protocol}://${req.get('host')}`;

    // Send digital delivery email with product PDF
    const emailResult = await sendOrderDeliveryEmail(updated, hostBaseUrl);
    if (emailResult && emailResult.success) {
      db.updateEmailStatus(id, 1, emailResult.previewUrl || '');
    }

    return res.json({
      success: true,
      message: `Order ${id} approved successfully! Delivery email sent to ${updated.email}.`,
      order: updated,
      emailSent: !!emailResult?.success,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// API: Reject / Flag Order (Admin Verification)
// -------------------------------------------------------------
app.post('/api/orders/:id/reject', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateOrderStatus(id, 'FLAGGED');
    return res.json({
      success: true,
      message: `Order ${id} rejected and flagged. Access remains blocked.`,
      order: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
    if (order.status !== 'CONFIRMED') {
      return res.status(403).send('Your payment is currently pending verification. Download access is locked until approved by the administrator.');
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
  const payment = db.getPaymentSettings();
  return res.json({
    success: true,
    upiId: payment.upiId,
    merchantName: payment.payeeName,
    qrImageUrl: payment.qrImageUrl,
    upiUri: payment.upiUri,
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
