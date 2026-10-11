const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  
  // 💰 Product & Payment details
  PRODUCT: {
    title: process.env.PRODUCT_TITLE || "BUILD A SIDE HUSTLE BEFORE GRADUATION",
    price: Number(process.env.PRODUCT_PRICE) || 499,
    upiId: process.env.UPI_ID || "genxtdigital@okhdfcbank",
    merchantName: process.env.MERCHANT_NAME || "GENXT Builders",
    fileName: process.env.PRODUCT_FILE_NAME || "Build_A_Side_Hustle_Before_Graduation_GENXT.pdf",
    externalDownloadUrl: process.env.EXTERNAL_DOWNLOAD_URL || "",
  },

  // 💌 Admin Email for Order Notifications & Alerts
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "suvarnalathasivaramakrishnan@gmail.com",

  // 📧 Email Service (Nodemailer SMTP)
  SMTP: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || '"GENXT Digital Guides" <suvarnalathasivaramakrishnan@gmail.com>',
  },

  // 💬 Support Contact
  SUPPORT: {
    email: process.env.SUPPORT_EMAIL || "suvarnalathasivaramakrishnan@gmail.com",
    phone: process.env.SUPPORT_PHONE || "+91 9789734732",
    whatsapp: process.env.SUPPORT_WHATSAPP || "919789734732",
    instagram: "https://www.instagram.com/_genxt_?obrf=bHM1cHk0bXQxd21q"
  },

  DB_PATH: path.join(__dirname, 'database.sqlite'),
  DOWNLOADS_DIR: path.join(__dirname, 'downloads'),
};
