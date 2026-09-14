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

const STOCK_FILE = path.join(DATA_DIR, "stock.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

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
    image: '/images/set1.jpg',
    galleryImages: ['/images/set1.jpg', '/images/hero.jpg', '/images/set2.jpg', '/images/set3.jpg']
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
    image: '/images/set2.jpg',
    galleryImages: ['/images/set2.jpg', '/images/hero.jpg', '/images/set1.jpg', '/images/set3.jpg']
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

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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

  // Admin update product stock or details
  app.post("/api/products/update", (req, res) => {
    const { id, stock, price, originalPrice, name, description, image } = req.body;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (stock !== undefined) products[index].stock = Math.max(0, parseInt(stock, 10));
    if (price !== undefined) products[index].price = parseFloat(price);
    if (originalPrice !== undefined) products[index].originalPrice = parseFloat(originalPrice);
    if (name !== undefined) products[index].name = name;
    if (description !== undefined) products[index].description = description;
    if (image !== undefined) products[index].image = image;

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
  app.post("/api/orders", (req, res) => {
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
      slipImage,
      status: slipImage ? 'paid_verified' : (paymentMethod === 'line' ? 'pending_payment' : 'paid_verified')
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
