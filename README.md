# 🚀 GENXT | The Next Generation Builders — Official Landing Page

A minimal, premium, mobile-first one-page website to sell **BUILD A SIDE HUSTLE BEFORE GRADUATION** directly to college students, creators, and beginners with zero platform commissions.

---

## 🎨 Brand Aesthetic & Rules
- **Colors**: Black (`#050508`), White (`#ffffff`), and Purple (`#6452f6` / `#8c7dff`).
- **Style**: Minimal, premium, and professional.
- **Copy**: Short, clear, and authentic. No fake claims, testimonials, or income promises.
- **Product Cover**: Official cover image from `public/images/genxt7.jpeg`.
- **Actual Price**: ₹499 (configurable in `productConfig.ts` & `server/.env`).

---

## 🧭 Page Sections (All On One Page)

1. **Main Section (Hero)**:
   - *BUILD A SIDE HUSTLE BEFORE GRADUATION*
   - *Want to start a side hustle while you're still in college?*
   - *This guide helps students and creators understand how to choose an idea, develop a digital product and plan their first steps.*
   - **Button**: `Get Your Copy` (triggers instant checkout).

2. **What You'll Learn**:
   - 01: Find a side-hustle idea.
   - 02: Identify your target audience.
   - 03: Explore digital products.
   - 04: Plan your product launch.
   - 05: Learn the basics of selling online.

3. **Who Is This For?**:
   - College students
   - Content creators
   - Freelancers
   - Beginners interested in business

4. **Product Section**:
   - Official Ebook Cover mockup.
   - Product name: *BUILD A SIDE HUSTLE BEFORE GRADUATION*.
   - Actual Price: **₹499**.
   - What's included checklist.
   - **Button**: `Buy Now` (connected to real UPI gateway).

5. **Important Notice & Legal**:
   - Exact legal copyright notice:
     ```text
     © 2026 Genxt. All rights reserved.
     This product is for personal use only. Copying, sharing, distributing or reselling this product without written permission from Genxt is prohibited. Purchasing the guide does not transfer ownership or copyright.
     ```
   - Terms of Use modal link.

6. **Contact Section**:
   - Brand: `GENXT | The Next Generation Builders`
   - Official Instagram: [https://www.instagram.com/_genxt_?obrf=bHM1cHk0bXQxd21q](https://www.instagram.com/_genxt_?obrf=bHM1cHk0bXQxd21q)
   - WhatsApp Number: `+91 9789734732`
   - WhatsApp Button: `Contact Us` (`https://wa.me/919789734732`)
   - Admin Email: `suvarnalathasivaramakrishnan@gmail.com`

7. **Footer**:
   - `GENXT | The Next Generation Builders`
   - `Discover. Build. Grow. Earn.`
   - Links: `Home | Contact | Terms of Use | Privacy Policy`
   - `© 2026 Genxt. All rights reserved.`

---

## ⚡ How This Website Works (Simple Explanation)

1. **Customer visits the website**: Reads the guide details, benefits, and price.
2. **Customer clicks "Buy Now"**:
   - **On Mobile**: Taps "Pay via GPay / PhonePe App" to directly launch Google Pay or PhonePe with your UPI ID and amount prefilled.
   - **On Laptop**: Scans the dynamic QR code with Google Pay, PhonePe, Paytm, or BHIM.
3. **Customer submits 12-digit UTR Number**:
   - After paying, the customer enters the 12-digit reference number from their payment receipt.
4. **Instant Automated Delivery**:
   - The server verifies the UTR, prevents duplicates, and saves the purchase in SQLite.
   - Automatically dispatches the download link to the **customer's email**.
   - Automatically sends a real-time order alert to the **admin email** (`suvarnalathasivaramakrishnan@gmail.com`).
   - Shows full-screen **confetti celebration** and an **instant backup download button** on screen!

---

## 📱 How to Run & View on Other Mobiles & Laptops

### Option 1: On Any Phone / Laptop on the Same Wi-Fi (Instant)
Your laptop is running the server at **IP `192.168.0.100`** on port **`5000`**.
1. Make sure your phone is connected to the **same Wi-Fi** as this PC.
2. Open your phone's browser (Chrome/Safari) and type:
   👉 **`http://192.168.0.100:5000`**
3. The website will load on your phone!

### Option 2: Share a Live Link with Customers Anywhere in the World (Free)
To send a link to customers on Instagram or WhatsApp without paying for hosting:
Run this simple command in PowerShell:
```powershell
npx.cmd localtunnel --port 5000
```
It gives you an instant public HTTPS link (e.g., `https://genxt-builders.loca.lt`) that anyone on mobile or laptop can open and purchase from!

### Option 3: Free Permanent Cloud Hosting (Vercel / Render / Railway)
- Push the repository to GitHub.
- Deploy the backend to **Render** or **Railway** (free tier).
- Set your environment variables in their dashboard.

---

## ⚙️ Configuration Files Reference
- **Frontend Configuration**: [`client/src/config/productConfig.ts`](file:///F:/genxt-digital-landing/client/src/config/productConfig.ts)
- **Backend Configuration**: [`server/config.js`](file:///F:/genxt-digital-landing/server/config.js) and [`server/.env`](file:///F:/genxt-digital-landing/server/.env)
- **Digital Guide File**: Place your final PDF in [`server/downloads/Build_A_Side_Hustle_Before_Graduation_GENXT.pdf`](file:///F:/genxt-digital-landing/server/downloads/Build_A_Side_Hustle_Before_Graduation_GENXT.pdf)
