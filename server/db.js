const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

const db = new DatabaseSync(config.DB_PATH);

// 1. Initialize Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    utrNumber TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    productTitle TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    downloadToken TEXT NOT NULL UNIQUE,
    emailSent INTEGER NOT NULL DEFAULT 0,
    emailPreviewUrl TEXT,
    createdAt TEXT NOT NULL
  )
`);

// 2. Initialize Products table (for Admin CRUD)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    headline TEXT NOT NULL,
    question TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    coverImage TEXT NOT NULL,
    fileName TEXT NOT NULL,
    whatsIncluded TEXT NOT NULL,
    isActive INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

// 3. Initialize Admin Settings table (for dynamic Email & Password updates)
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

// Seed default settings if empty or missing
const ensureSetting = db.prepare(`
  INSERT INTO admin_settings (key, value)
  VALUES (?, ?)
  ON CONFLICT(key) DO NOTHING
`);

ensureSetting.run('admin_email', config.ADMIN_EMAIL);
ensureSetting.run('admin_password', 'genxt2026');
ensureSetting.run('payment_qr_image', config.PRODUCT.qrImageUrl || '/images/payment_qr.jpg');
ensureSetting.run('upi_id', config.PRODUCT.upiId || 'suvarnalathasivaramakrishnan07@okhdfcbank');
ensureSetting.run('payee_name', config.PRODUCT.merchantName || 'Suvarnalatha S');
ensureSetting.run('upi_uri', config.PRODUCT.upiUri || 'upi://pay?pa=suvarnalathasivaramakrishnan07@okhdfcbank&pn=Suvarnalatha%20S&aid=uGICAgKCTsM-pNQ');

// Seed default product if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM products');
const productCount = countStmt.get().count;

if (productCount === 0) {
  const seedStmt = db.prepare(`
    INSERT INTO products (
      id, name, headline, question, description, price, coverImage, fileName, whatsIncluded, isActive, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const defaultIncluded = JSON.stringify([
    "The Complete 'Build A Side Hustle Before Graduation' 17-Page Blueprint",
    "Step 1: Identifying Your Niche & Market Demand",
    "Step 2: What Problem To Solve & Frameworks",
    "Step 3: Developing Your Business Name & Brand",
    "Step 4: Crafting Your Product (Ebooks, Planners, Notion Systems)",
    "Step 5: Naming & Pricing Strategy That Attracts Buyers",
    "Step 7-14: Website, Marketing Tips, Email Automation & Scaling",
    "Instant Automated Email Delivery & Direct Backup Download",
    "Lifetime Personal License For College Students & Creators"
  ]);

  seedStmt.run(
    'prod_side_hustle_v1',
    'BUILD A SIDE HUSTLE BEFORE GRADUATION',
    'BUILD A SIDE HUSTLE BEFORE GRADUATION',
    "Want to start a side hustle while you're still in college?",
    'This guide helps students and creators understand how to choose an idea, develop a digital product and plan their first steps.',
    499,
    '/images/product_cover.jpg',
    'Build_A_Side_Hustle_Before_Graduation_GENXT.pdf',
    defaultIncluded,
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );
  console.log('[Database] Seeded default product: BUILD A SIDE HUSTLE BEFORE GRADUATION');
}

const dbService = {
  // Orders methods
  createOrder: (order) => {
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, fullName, email, phone, utrNumber, amount, productTitle, status, downloadToken, emailSent, emailPreviewUrl, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id,
      order.fullName,
      order.email,
      order.phone || '',
      order.utrNumber,
      order.amount,
      order.productTitle,
      order.status || 'CONFIRMED',
      order.downloadToken,
      order.emailSent ? 1 : 0,
      order.emailPreviewUrl || '',
      order.createdAt
    );
    return order;
  },

  getOrderByUtr: (utrNumber) => {
    const stmt = db.prepare(`SELECT * FROM orders WHERE utrNumber = ?`);
    return stmt.get(utrNumber);
  },

  getOrderById: (id) => {
    const stmt = db.prepare(`SELECT * FROM orders WHERE id = ?`);
    return stmt.get(id);
  },

  getOrderByDownloadToken: (token) => {
    const stmt = db.prepare(`SELECT * FROM orders WHERE downloadToken = ?`);
    return stmt.get(token);
  },

  getAllOrders: () => {
    const stmt = db.prepare(`SELECT * FROM orders ORDER BY createdAt DESC`);
    return stmt.all();
  },

  updateEmailStatus: (id, emailSent, emailPreviewUrl = '') => {
    const stmt = db.prepare(`
      UPDATE orders
      SET emailSent = ?, emailPreviewUrl = ?
      WHERE id = ?
    `);
    stmt.run(emailSent ? 1 : 0, emailPreviewUrl, id);
  },

  // Products CRUD methods
  getActiveProduct: () => {
    const stmt = db.prepare(`SELECT * FROM products WHERE isActive = 1 LIMIT 1`);
    const prod = stmt.get();
    if (prod) {
      try {
        prod.whatsIncluded = JSON.parse(prod.whatsIncluded);
      } catch (e) {
        prod.whatsIncluded = [];
      }
    }
    return prod;
  },

  getAllProducts: () => {
    const stmt = db.prepare(`SELECT * FROM products ORDER BY updatedAt DESC`);
    const list = stmt.all();
    return list.map(p => {
      try {
        p.whatsIncluded = JSON.parse(p.whatsIncluded);
      } catch (e) {
        p.whatsIncluded = [];
      }
      return p;
    });
  },

  getProductById: (id) => {
    const stmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
    const prod = stmt.get(id);
    if (prod) {
      try {
        prod.whatsIncluded = JSON.parse(prod.whatsIncluded);
      } catch (e) {
        prod.whatsIncluded = [];
      }
    }
    return prod;
  },

  createProduct: (product) => {
    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, headline, question, description, price, coverImage, fileName, whatsIncluded, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const includedStr = Array.isArray(product.whatsIncluded)
      ? JSON.stringify(product.whatsIncluded)
      : JSON.stringify([]);
      
    stmt.run(
      product.id,
      product.name,
      product.headline || product.name,
      product.question || '',
      product.description || '',
      Number(product.price) || 499,
      product.coverImage || '/images/product_cover.jpg',
      product.fileName || 'Build_A_Side_Hustle_Before_Graduation_GENXT.pdf',
      includedStr,
      product.isActive ? 1 : 0,
      product.createdAt,
      product.updatedAt
    );
    return product;
  },

  updateProduct: (id, updates) => {
    const current = dbService.getProductById(id);
    if (!current) return null;

    const name = updates.name !== undefined ? updates.name : current.name;
    const headline = updates.headline !== undefined ? updates.headline : current.headline;
    const question = updates.question !== undefined ? updates.question : current.question;
    const description = updates.description !== undefined ? updates.description : current.description;
    const price = updates.price !== undefined ? Number(updates.price) : current.price;
    const coverImage = updates.coverImage !== undefined ? updates.coverImage : current.coverImage;
    const fileName = updates.fileName !== undefined ? updates.fileName : current.fileName;
    const whatsIncluded = updates.whatsIncluded !== undefined
      ? JSON.stringify(updates.whatsIncluded)
      : JSON.stringify(current.whatsIncluded);
    const updatedAt = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, headline = ?, question = ?, description = ?, price = ?, coverImage = ?, fileName = ?, whatsIncluded = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(name, headline, question, description, price, coverImage, fileName, whatsIncluded, updatedAt, id);
    return dbService.getProductById(id);
  },

  deleteProduct: (id) => {
    const stmt = db.prepare(`DELETE FROM products WHERE id = ?`);
    stmt.run(id);
    const active = dbService.getActiveProduct();
    if (!active) {
      const remaining = dbService.getAllProducts();
      if (remaining.length > 0) {
        dbService.setActiveProduct(remaining[0].id);
      }
    }
    return true;
  },

  setActiveProduct: (id) => {
    db.exec(`UPDATE products SET isActive = 0`);
    const stmt = db.prepare(`UPDATE products SET isActive = 1 WHERE id = ?`);
    stmt.run(id);
    return dbService.getActiveProduct();
  },

  // Admin Credentials Management
  getAdminSettings: () => {
    const emailStmt = db.prepare(`SELECT value FROM admin_settings WHERE key = 'admin_email'`);
    const passStmt = db.prepare(`SELECT value FROM admin_settings WHERE key = 'admin_password'`);
    const emailRow = emailStmt.get();
    const passRow = passStmt.get();
    return {
      email: emailRow ? emailRow.value : config.ADMIN_EMAIL,
      password: passRow ? passRow.value : 'genxt2026',
    };
  },

  updateAdminSettings: (newEmail, newPassword) => {
    if (newEmail) {
      const stmt = db.prepare(`
        INSERT INTO admin_settings (key, value)
        VALUES ('admin_email', ?)
        ON CONFLICT(key) DO UPDATE SET value = ?
      `);
      stmt.run(newEmail, newEmail);
    }
    if (newPassword) {
      const stmt = db.prepare(`
        INSERT INTO admin_settings (key, value)
        VALUES ('admin_password', ?)
        ON CONFLICT(key) DO UPDATE SET value = ?
      `);
      stmt.run(newPassword, newPassword);
    }
    return dbService.getAdminSettings();
  },

  // Payment & QR Code Settings Management
  getPaymentSettings: () => {
    const getVal = (key, fallback) => {
      const row = db.prepare(`SELECT value FROM admin_settings WHERE key = ?`).get(key);
      return row ? row.value : fallback;
    };
    return {
      qrImageUrl: getVal('payment_qr_image', config.PRODUCT.qrImageUrl || '/images/payment_qr.jpg'),
      upiId: getVal('upi_id', config.PRODUCT.upiId || 'suvarnalathasivaramakrishnan07@okhdfcbank'),
      payeeName: getVal('payee_name', config.PRODUCT.merchantName || 'Suvarnalatha S'),
      upiUri: getVal('upi_uri', config.PRODUCT.upiUri || 'upi://pay?pa=suvarnalathasivaramakrishnan07@okhdfcbank&pn=Suvarnalatha%20S&aid=uGICAgKCTsM-pNQ'),
    };
  },

  updatePaymentSettings: ({ qrImageUrl, upiId, payeeName, upiUri }) => {
    const upsert = db.prepare(`
      INSERT INTO admin_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    if (qrImageUrl) upsert.run('payment_qr_image', qrImageUrl);
    if (upiId) upsert.run('upi_id', upiId);
    if (payeeName) upsert.run('payee_name', payeeName);
    if (upiUri) upsert.run('upi_uri', upiUri);
    return dbService.getPaymentSettings();
  }
};

module.exports = dbService;
