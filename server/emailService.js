const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = null;
let isEthereal = false;

async function getTransporter() {
  if (transporter) return transporter;

  // If live SMTP credentials are provided
  if (config.SMTP.host && config.SMTP.user && config.SMTP.pass) {
    transporter = nodemailer.createTransport({
      host: config.SMTP.host,
      port: config.SMTP.port,
      secure: config.SMTP.secure,
      auth: {
        user: config.SMTP.user,
        pass: config.SMTP.pass,
      },
    });
    isEthereal = false;
    console.log(`[Email Service] Configured live SMTP transport: ${config.SMTP.host}`);
    return transporter;
  }

  // If Gmail shortcut credentials are provided in .env
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    isEthereal = false;
    console.log(`[Email Service] Configured Gmail SMTP for ${process.env.GMAIL_USER}`);
    return transporter;
  }

  // Fallback: Test account via Ethereal for zero-friction testing
  console.log('[Email Service] Using Ethereal test inbox for instant fulfillment preview...');
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  isEthereal = true;
  console.log(`[Email Service] Test inbox ready: ${testAccount.user}`);
  return transporter;
}

/**
 * Customer fulfillment email template
 */
function generateCustomerEmailHtml(order, downloadUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Guide: ${order.productTitle}</title>
  <style>
    body {
      margin: 0; padding: 0;
      background-color: #07070a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e4e4e7;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #0d0d14;
      border: 1px solid #27273a;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      background: linear-gradient(180deg, #151525 0%, #0d0d14 100%);
      border-bottom: 1px solid #1f1f2e;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: rgba(100, 82, 246, 0.15);
      border: 1px solid rgba(100, 82, 246, 0.35);
      color: #8c7dff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 8px;
    }
    .content { padding: 32px; }
    .lead {
      color: #a1a1aa;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .cta-box {
      text-align: center;
      margin: 28px 0;
      padding: 24px;
      background-color: #12121e;
      border: 1px solid #2b2b45;
      border-radius: 12px;
    }
    .btn {
      display: inline-block;
      padding: 16px 36px;
      background-color: #6452f6;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 20px rgba(100, 82, 246, 0.5);
    }
    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 13px;
    }
    .receipt-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #1a1a27;
      color: #d4d4d8;
    }
    .receipt-table td.label {
      color: #71717a;
      width: 40%;
    }
    .receipt-table td.value {
      font-weight: 600;
      text-align: right;
    }
    .notice {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid #20202e;
      border-radius: 8px;
      padding: 14px;
      margin-top: 20px;
      font-size: 11px;
      color: #8c8c99;
      line-height: 1.6;
    }
    .footer {
      padding: 24px 32px;
      background-color: #08080c;
      border-top: 1px solid #181824;
      text-align: center;
      font-size: 12px;
      color: #71717a;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">GENXT DIGITAL DELIVERY</div>
      <h1 class="title">${order.productTitle}</h1>
      <p style="color: #a1a1aa; margin: 0; font-size: 14px;">The Next Generation Builders</p>
    </div>

    <div class="content">
      <p class="lead">
        Hi <strong>${order.fullName}</strong>,<br><br>
        Thank you for purchasing <strong>${order.productTitle}</strong>. Your payment of <strong>₹${order.amount}</strong> has been verified. You can now access and download your digital guide.
      </p>

      <div class="cta-box">
        <p style="margin: 0 0 16px; font-size: 13px; color: #a1a1aa;">Click the button below to download your copy:</p>
        <a href="${downloadUrl}" class="btn" target="_blank">
          Download Your Guide Now →
        </a>
        <p style="margin: 16px 0 0; font-size: 11px; color: #71717a;">
          Direct Access Link: <a href="${downloadUrl}" style="color: #8c7dff; word-break: break-all;">${downloadUrl}</a>
        </p>
      </div>

      <h3 style="color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px;">
        Order Details & Receipt
      </h3>

      <table class="receipt-table">
        <tr>
          <td class="label">Order ID</td>
          <td class="value" style="font-family: monospace; color: #8c7dff;">${order.id}</td>
        </tr>
        <tr>
          <td class="label">Guide</td>
          <td class="value">${order.productTitle}</td>
        </tr>
        <tr>
          <td class="label">Amount Paid</td>
          <td class="value" style="color: #34d399;">₹${order.amount}</td>
        </tr>
        <tr>
          <td class="label">12-Digit UTR No.</td>
          <td class="value" style="font-family: monospace;">${order.utrNumber}</td>
        </tr>
        <tr>
          <td class="label">Delivery Email</td>
          <td class="value">${order.email}</td>
        </tr>
        <tr>
          <td class="label">Date</td>
          <td class="value">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
      </table>

      <div class="notice">
        <strong>Important Notice:</strong><br>
        © 2026 Genxt. All rights reserved.<br>
        This product is for personal use only. Copying, sharing, distributing or reselling this product without written permission from Genxt is prohibited. Purchasing the guide does not transfer ownership or copyright.
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        GENXT | The Next Generation Builders<br>
        WhatsApp Support: <a href="https://wa.me/${config.SUPPORT.whatsapp}" style="color: #34d399;">+${config.SUPPORT.whatsapp}</a> | Instagram: <a href="${config.SUPPORT.instagram}" style="color: #8c7dff;">@_genxt_</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Admin Notification Email (dispatched to suvarnalathasivaramakrishnan@gmail.com)
 */
function generateAdminAlertHtml(order) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color: #f4f4f5; font-family: sans-serif; padding: 20px;">
  <div style="max-width: 550px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; border: 1px solid #e4e4e7;">
    <h2 style="color: #18181b; margin-top: 0;">🎉 New Order Received on GENXT!</h2>
    <p style="color: #52525b; font-size: 14px;">A customer has just completed payment for <strong>${order.productTitle}</strong>.</p>
    <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 16px 0;" />
    <table style="width: 100%; font-size: 14px; color: #27272a;">
      <tr><td style="padding: 6px 0; color: #71717a;">Order ID:</td><td style="font-weight: bold;">${order.id}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">Customer:</td><td style="font-weight: bold;">${order.fullName}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">Email:</td><td style="font-weight: bold;">${order.email}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">Phone:</td><td style="font-weight: bold;">${order.phone || 'Not provided'}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">Amount:</td><td style="font-weight: bold; color: #16a34a;">₹${order.amount}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">12-Digit UTR:</td><td style="font-family: monospace; font-weight: bold; color: #4f46e5;">${order.utrNumber}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">Timestamp:</td><td>${new Date(order.createdAt).toLocaleString()}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 16px 0;" />
    <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">
      GENXT Order Fulfillment Engine • Database record saved.
    </p>
  </div>
</body>
</html>
  `;
}

async function sendOrderDeliveryEmail(order, hostBaseUrl = 'http://localhost:5000') {
  try {
    const mailer = await getTransporter();
    const downloadUrl = config.PRODUCT.externalDownloadUrl || `${hostBaseUrl}/api/download/${order.downloadToken}`;

    // 1. Send customer fulfillment email
    const customerMailOptions = {
      from: config.SMTP.from,
      to: order.email,
      subject: `⚡ [Your Copy] ${order.productTitle} (Order #${order.id})`,
      text: `Hi ${order.fullName},\n\nThank you for purchasing ${order.productTitle}! Your payment of ₹${order.amount} (UTR: ${order.utrNumber}) has been verified.\n\nDownload your guide here: ${downloadUrl}\n\nSupport: ${config.SUPPORT.email}`,
      html: generateCustomerEmailHtml(order, downloadUrl),
    };

    const customerInfo = await mailer.sendMail(customerMailOptions);
    let previewUrl = '';

    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(customerInfo) || '';
      console.log(`[Email Service] Customer fulfillment email preview: ${previewUrl}`);
    } else {
      console.log(`[Email Service] Sent fulfillment email to ${order.email}. MessageId: ${customerInfo.messageId}`);
    }

    // 2. Dispatch real-time admin alert to suvarnalathasivaramakrishnan@gmail.com
    if (config.ADMIN_EMAIL) {
      try {
        const adminMailOptions = {
          from: config.SMTP.from,
          to: config.ADMIN_EMAIL,
          subject: `💰 [New Order ₹${order.amount}] ${order.fullName} - ${order.id}`,
          html: generateAdminAlertHtml(order),
        };
        const adminInfo = await mailer.sendMail(adminMailOptions);
        if (isEthereal) {
          const adminPreview = nodemailer.getTestMessageUrl(adminInfo);
          console.log(`[Email Service] Admin notification preview (${config.ADMIN_EMAIL}): ${adminPreview}`);
        }
      } catch (adminErr) {
        console.warn('[Email Service] Admin notification notice:', adminErr.message);
      }
    }

    return {
      success: true,
      messageId: customerInfo.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error('[Email Service] Error dispatching email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendOrderDeliveryEmail,
};
