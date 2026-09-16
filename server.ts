import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface ProductData {
  id: string;
  name: string;
  subname: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  remainingAlert?: string;
  badge?: string;
  isBestSeller?: boolean;
  description: string;
  longDescription: string;
  image: string;
  galleryImages: string[];
  specs?: {
    scientificName?: string;
    thaiName?: string;
    origin?: string;
    size?: string;
    hornCount?: number;
    lifespan?: string;
    diet?: string;
    temperature?: string;
    humidity?: string;
  };
  inBoxIncludes?: string[];
}

interface OrderData {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  paymentMethod: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  slipImage?: string;
  status: 'pending_payment' | 'paid_verified' | 'preparing' | 'shipped';
  trackingNumber?: string;
}

// In-memory data store with file persistence
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const STOCK_FILE = path.join(DATA_DIR, "stock.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const STATS_FILE = path.join(DATA_DIR, "stats.json");

interface StatsData {
  visitorCount: number;
  lastUpdated?: string;
}

function loadStats(): StatsData {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
      if (typeof data.visitorCount === "number" && data.visitorCount >= 200) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error reading stats.json:", err);
  }
  const defaultStats: StatsData = { visitorCount: 200, lastUpdated: new Date().toISOString() };
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(defaultStats, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing default stats:", e);
  }
  return defaultStats;
}

function saveStats(stats: StatsData) {
  try {
    stats.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving stats.json:", err);
  }
}

let siteStats = loadStats();

const defaultProducts: ProductData[] = [
  {
    id: 'set-1',
    name: 'เซท 1: ด้วงเขาสั้น',
    subname: 'Premium Display Set',
    category: 'male_short',
    price: 399,
    originalPrice: 499,
    stock: 7,
    remainingAlert: 'เหลือน้อย • พร้อมจัดส่ง',
    badge: 'Ready To Display',
    isBestSeller: false,
    description: 'เซ็ตของขวัญพร้อมตั้งโชว์ (Ready-to-display) บรรจุในถุงกระดาษหน้าต่างใสผูกโบว์สีทองสุดหรู ภายในครบจบ: เปลือกไม้ ขี้เลื่อย อ้อย และเยลลี่ นำไปตั้งโชว์ประดับห้องได้ทันที ดูแลรักษาง่ายเพียงแค่คอยเปลี่ยนอาหาร',
    longDescription: 'กว่างซางเหนือเพศผู้ฟอร์มเขาสั้น (Minor Form) โครงสร้างบึกบึน แข็งแรง ว่องไว อายุยืนยาว จุดเด่นคือจัดมาเป็นเซ็ตของขวัญสำเร็จรูปพร้อมเคสใสโชว์และวัสดุรองพื้นครบชุด',
    image: '/images/user_upload_set1_1.jpg',
    galleryImages: [
      '/images/user_upload_set1_1.jpg',
      '/images/user_upload_set1_2.jpg',
      '/images/user_upload_set1_3.jpg',
      '/images/set1_short_1.jpg',
      '/images/set1_short_2.jpg',
      '/images/set1_short_3.jpg'
    ]
  },
  {
    id: 'set-2',
    name: 'เซท 2: เขายาว (ตัวท็อปประกวด)',
    subname: 'Premium Long Horn (Masterpiece)',
    category: 'male_long',
    price: 499,
    originalPrice: 690,
    stock: 2,
    remainingAlert: 'Only 2 Left • โควต้าพิเศษ',
    badge: 'Masterpiece',
    isBestSeller: true,
    description: 'เกรดคัดพิเศษ เขายาวเรียวสวยงาม ครบ 5 แฉกสมบูรณ์แบบ ไซส์ใหญ่ ฟอร์มประกวด โดดเด่นที่สุด สง่างามสมศักดิ์ศรีราชันย์แห่งขุนเขา',
    longDescription: 'กว่างซางเหนือเพศผู้ฟอร์มเขายาวพิเศษ (Major Form) สุดยอดความภูมิใจของนักสะสมแมลงปีกแข็งระดับประเทศ คัดเฉพาะตัวที่มีเขาหน้าผากยาวโค้งได้องศาได้สัดส่วนทองคำ',
    image: '/images/user_upload_set2_1.jpg',
    galleryImages: [
      '/images/user_upload_set2_1.jpg',
      '/images/user_upload_set2_2.jpg',
      '/images/user_upload_set2_3.jpg',
      '/images/user_upload_set2_4.jpg',
      '/images/สั้นยาว ใหญ่.jfif',
      '/images/Gemini_Generated_Image_9px4ih9px4ih9px4.jfif',
      '/images/ยาว3.jfif',
      '/images/ยาว4.jfif'
    ]
  },
  {
    id: 'set-3',
    name: 'เซท 3: ตัวเมีย (สายพันธุ์เพาะขยาย)',
    subname: 'Breeding Essential',
    category: 'female',
    price: 119,
    originalPrice: 199,
    stock: 5,
    remainingAlert: 'สายเลือดแท้ • พร้อมผสม',
    badge: 'Breeding Essential',
    isBestSeller: false,
    description: 'แข็งแรง ปราดเปรียว สายเลือดดีเยี่ยม เหมาะสำหรับนำไปเพาะพันธุ์เพื่อสร้างสายเลือดเกรดพรีเมียมในรุ่นต่อไป ผสมติดง่าย ไข่ดก',
    longDescription: 'เพศเมียกว่างซางเหนือคัดไซส์ใหญ่พิเศษ น้ำหนักตัวดี ลำตัวแน่น ผิวเปลือกปีกเรียบเงา ขาแข็งแรง เล็บเกาะเหนียวแน่น ผ่านการพักฟื้นและเสริมอาหารบำรุงไข่',
    image: '/images/set3.jpg',
    galleryImages: ['/images/set3.jpg', '/images/hero.jpg', '/images/set2.jpg', '/images/set1.jpg']
  }
];

function loadProducts(): ProductData[] {
  try {
    if (fs.existsSync(STOCK_FILE)) {
      const data = fs.readFileSync(STOCK_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading stock file:", err);
  }
  return defaultProducts;
}

function saveProducts(products: ProductData[]) {
  try {
    fs.writeFileSync(STOCK_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("Error saving stock file:", err);
  }
}

function loadOrders(): OrderData[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading orders file:", err);
  }
  return [];
}

function saveOrders(orders: OrderData[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("Error saving orders file:", err);
  }
}

let products = loadProducts();
let orders = loadOrders();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Static uploads directory with cache optimization
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const staticUploadOptions = { maxAge: "30d", etag: true };
  app.use("/uploads", express.static(UPLOADS_DIR, staticUploadOptions));
  app.use("/public/uploads", express.static(UPLOADS_DIR, staticUploadOptions));

  // Static images directory supporting all image formats including .jfif, .webp, .jpg, .png
  const IMAGES_DIR = path.join(process.cwd(), "public", "images");
  if (fs.existsSync(IMAGES_DIR)) {
    app.use(
      "/images",
      express.static(IMAGES_DIR, {
        maxAge: "30d",
        etag: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".jfif")) {
            res.setHeader("Content-Type", "image/jpeg");
          }
        },
      })
    );
  }

  // Helper for saving an image buffer to disk asynchronously
  async function saveBase64Image(image: string, name?: string): Promise<{ url: string; filename: string; size: number }> {
    if (!image || typeof image !== "string") {
      throw new Error("กรุณาเลือกไฟล์ภาพ");
    }

    // Already public URL
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/uploads/")) {
      return { url: image, filename: "", size: 0 };
    }

    if (image.startsWith("data:image/")) {
      const commaIndex = image.indexOf(",");
      if (commaIndex !== -1) {
        const metaPart = image.substring(5, commaIndex);
        const rawMime = metaPart.split(";")[0] || "image/jpeg";
        const rawExt = rawMime.split("/")[1] || "jpg";
        let cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanExt === "jpeg") cleanExt = "jpg";
        if (!cleanExt) cleanExt = "jpg";

        const base64Data = image.substring(commaIndex + 1);
        const buffer = Buffer.from(base64Data, "base64");
        if (buffer.length === 0) {
          throw new Error("ไฟล์รูปภาพว่างเปล่า");
        }

        const safeName = (name || "beetle").replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `${safeName}-${Date.now()}-${Math.floor(1000 + Math.random() * 90000)}.${cleanExt}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        await fs.promises.writeFile(filepath, buffer);
        console.log(`[Upload] Image saved: ${filename} (${buffer.length} bytes)`);

        return {
          url: `/uploads/${filename}`,
          filename,
          size: buffer.length,
        };
      }
    }

    // Raw base64 fallback
    const buffer = Buffer.from(image, "base64");
    if (buffer.length > 50) {
      const safeName = (name || "beetle").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${safeName}-${Date.now()}-${Math.floor(1000 + Math.random() * 90000)}.jpg`;
      const filepath = path.join(UPLOADS_DIR, filename);
      await fs.promises.writeFile(filepath, buffer);
      return { url: `/uploads/${filename}`, filename, size: buffer.length };
    }

    throw new Error("รูปแบบข้อมูลรูปภาพไม่ถูกต้อง");
  }

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Visitor Counter: starts at 200, increments to 201, 202...
  app.get("/api/visitor-count", (_req, res) => {
    res.json({ success: true, count: siteStats.visitorCount });
  });

  app.post("/api/visitor-count/increment", (_req, res) => {
    siteStats.visitorCount = Math.max(200, siteStats.visitorCount) + 1;
    saveStats(siteStats);
    res.json({ success: true, count: siteStats.visitorCount });
  });

  // High-Speed Single Image Upload (Async non-blocking)
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { image, name } = req.body;
      const result = await saveBase64Image(image, name);
      return res.json({
        success: true,
        url: result.url,
        filename: result.filename,
        size: result.size,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: err.message || "อัปโหลดภาพไม่สำเร็จ" });
    }
  });

  // High-Speed Batch Image Upload (Parallel multi-file processing)
  app.post("/api/upload-images", async (req, res) => {
    try {
      const { images } = req.body; // Array of { image: string, name?: string }
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ success: false, message: "ไม่มีรูปภาพที่ส่งมา" });
      }

      const results = await Promise.all(
        images.map(async (item: { image: string; name?: string }, idx: number) => {
          try {
            return await saveBase64Image(item.image, item.name || `img-${idx}`);
          } catch (err) {
            console.warn(`[BatchUpload] Item ${idx} failed:`, err);
            // Fallback to client data URL if saving fails so data is not lost
            return { url: item.image, filename: "", size: 0 };
          }
        })
      );

      return res.json({
        success: true,
        urls: results.map((r) => r.url),
        results,
      });
    } catch (err: any) {
      console.error("Batch upload error:", err);
      res.status(500).json({ success: false, message: err.message || "อัปโหลดรูปภาพไม่สำเร็จ" });
    }
  });

  // Get products with real-time stock
  app.get("/api/products", (_req, res) => {
    res.json({ success: true, products });
  });

  // Real-time stock counts only (lightweight polling)
  app.get("/api/stock", (_req, res) => {
    const stockMap: Record<string, number> = {};
    products.forEach((p) => {
      stockMap[p.id] = p.stock;
    });
    res.json({ success: true, stock: stockMap, lastUpdated: new Date().toISOString() });
  });

  // Admin update product stock, gallery images, details
  app.post("/api/products/update", async (req, res) => {
    const {
      id,
      stock,
      price,
      originalPrice,
      name,
      subname,
      badge,
      isBestSeller,
      description,
      longDescription,
      image,
      galleryImages,
      specs,
      inBoxIncludes,
    } = req.body;

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (stock !== undefined) products[index].stock = Math.max(0, parseInt(stock, 10));
    if (price !== undefined) products[index].price = parseFloat(price);
    if (originalPrice !== undefined) products[index].originalPrice = parseFloat(originalPrice);
    if (name !== undefined) products[index].name = name;
    if (subname !== undefined) products[index].subname = subname;
    if (badge !== undefined) products[index].badge = badge;
    if (isBestSeller !== undefined) products[index].isBestSeller = Boolean(isBestSeller);
    if (description !== undefined) products[index].description = description;
    if (longDescription !== undefined) products[index].longDescription = longDescription;
    
    // Auto-persist cover image to disk if sent as base64
    if (image !== undefined) {
      if (typeof image === "string" && image.startsWith("data:image/")) {
        try {
          const saved = await saveBase64Image(image, `${id}-cover`);
          products[index].image = saved.url;
        } catch (e) {
          products[index].image = image;
        }
      } else {
        products[index].image = image;
      }
    }

    // Auto-persist gallery images to disk if sent as base64
    if (galleryImages !== undefined && Array.isArray(galleryImages)) {
      const persistedGallery: string[] = [];
      for (let i = 0; i < galleryImages.length; i++) {
        const gImg = galleryImages[i];
        if (typeof gImg === "string" && gImg.startsWith("data:image/")) {
          try {
            const saved = await saveBase64Image(gImg, `${id}-gallery-${i}`);
            persistedGallery.push(saved.url);
          } catch (e) {
            persistedGallery.push(gImg);
          }
        } else {
          persistedGallery.push(gImg);
        }
      }
      products[index].galleryImages = persistedGallery;
    }

    if (specs !== undefined) products[index].specs = { ...products[index].specs, ...specs };
    if (inBoxIncludes !== undefined && Array.isArray(inBoxIncludes)) {
      products[index].inBoxIncludes = inBoxIncludes;
    }

    if (products[index].stock <= 2 && products[index].stock > 0) {
      products[index].remainingAlert = `Only ${products[index].stock} Left`;
    } else if (products[index].stock === 0) {
      products[index].remainingAlert = 'สินค้าหมดชั่วคราว';
    } else {
      products[index].remainingAlert = undefined;
    }

    saveProducts(products);
    res.json({ success: true, product: products[index] });
  });

  // Reset stock to default (Admin utility)
  app.post("/api/admin/reset-stock", (_req, res) => {
    products = defaultProducts.map((p) => ({ ...p }));
    saveProducts(products);
    res.json({ success: true, products });
  });

  // Place order & atomically decrement stock
  app.post("/api/orders", async (req, res) => {
    const {
      customerName,
      customerPhone,
      customerAddress,
      notes,
      paymentMethod,
      items,
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      couponCode,
      slipImage
    } = req.body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "ข้อมูลการสั่งซื้อไม่ครบถ้วน" });
    }

    // Check stock availability for all items first
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ success: false, message: `ไม่พบสินค้ารหัส ${item.productId}` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `ขออภัย สินค้า "${prod.name}" เหลือเพียง ${prod.stock} ชิ้น ไม่เพียงพอต่อคำสั่งซื้อ (${item.quantity} ชิ้น)`
        });
      }
    }

    // Decrement stock atomically
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId)!;
      prod.stock -= item.quantity;
      if (prod.stock <= 2 && prod.stock > 0) {
        prod.remainingAlert = `Only ${prod.stock} Left`;
      } else if (prod.stock === 0) {
        prod.remainingAlert = 'สินค้าหมดชั่วคราว';
      }
    }
    saveProducts(products);

    // Auto-save slip to permanent disk if provided as base64
    let savedSlipUrl = slipImage;
    if (slipImage && typeof slipImage === "string" && slipImage.startsWith("data:image/")) {
      try {
        const saved = await saveBase64Image(slipImage, `slip-${Date.now()}`);
        savedSlipUrl = saved.url;
      } catch (slipErr) {
        console.warn("[Orders] Slip image save error, keeping data as-is:", slipErr);
      }
    }

    // Create order record
    const newOrder: OrderData = {
      id: `EUP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      customerAddress: customerAddress || 'สั่งซื้อผ่าน LINE Official',
      notes,
      paymentMethod: paymentMethod || 'promptpay',
      items,
      subtotal: subtotal || 0,
      discountAmount: discountAmount || 0,
      shippingFee: shippingFee || 0,
      totalAmount: totalAmount || 0,
      couponCode,
      slipImage: savedSlipUrl,
      status: savedSlipUrl ? 'paid_verified' : (paymentMethod === 'line' ? 'pending_payment' : 'paid_verified')
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    res.json({
      success: true,
      message: "สั่งซื้อสำเร็จ ระบบตัดสต็อกสินค้าเรียบร้อยแล้ว",
      order: newOrder,
      updatedStock: products.map((p) => ({ id: p.id, stock: p.stock }))
    });
  });

  // Get orders list (Admin)
  app.get("/api/orders", (_req, res) => {
    res.json({ success: true, orders });
  });

  // Update order status (Admin)
  app.post("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    const order = orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    saveOrders(orders);
    res.json({ success: true, order });
  });

  // Delete single order (Admin)
  app.delete("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    orders = orders.filter((o) => o.id !== id);
    saveOrders(orders);
    res.json({ success: true, message: `ลบออเดอร์ ${id} สำเร็จ`, remainingCount: orders.length });
  });

  // Clear all orders (Admin)
  app.post("/api/orders/clear", (_req, res) => {
    orders = [];
    saveOrders(orders);
    res.json({ success: true, message: "ล้างรายการคำสั่งซื้อทั้งหมดสำเร็จ", remainingCount: 0 });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
