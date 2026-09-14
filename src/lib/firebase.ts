import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with custom databaseId from firebaseConfig
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as required by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore connection test successful.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or database initializing.');
      return false;
    }
    // Test doc missing is normal and means server responded
    console.log('[Firebase] Firestore connected and active.');
    return true;
  }
}

// Initial default products to seed Firestore if empty
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'set-1',
    name: 'เซท 1: ด้วงเขาสั้น',
    subname: 'Premium Display Set',
    category: 'male_short',
    price: 399,
    originalPrice: 499,
    stock: 5,
    badge: 'Ready To Display',
    isBestSeller: false,
    description: 'เซ็ตของขวัญพร้อมตั้งโชว์ (Ready-to-display) บรรจุในถุงกระดาษหน้าต่างใสผูกโบว์สีทองสุดหรู ภายในครบจบ: เปลือกไม้ ขี้เลื่อย อ้อย และเยลลี่ นำไปตั้งโชว์ประดับห้องได้ทันที ดูแลรักษาง่ายเพียงแค่คอยเปลี่ยนอาหาร',
    longDescription: 'กว่างซางเหนือเพศผู้ฟอร์มเขาสั้น (Minor Form) โครงสร้างบึกบึน แข็งแรง ว่องไว อายุยืนยาว จุดเด่นคือจัดมาเป็นเซ็ตของขวัญสำเร็จรูปพร้อมเคสใสโชว์และวัสดุรองพื้นครบชุด',
    image: '/images/set1.jpg',
    galleryImages: [
      '/images/set1.jpg',
      '/images/hero.jpg',
      '/images/set2.jpg',
      '/images/set3.jpg',
    ],
    remainingAlert: undefined,
    specs: {
      scientificName: 'Eupatorus gracilicornis (Minor)',
      thaiName: 'กว่างซางเหนือ (ตัวผู้เขาสั้น)',
      origin: 'ป่าดิบเขาภาคเหนือ ประเทศไทย (เชียงใหม่ / น่าน)',
      size: '50 - 65 mm (บอดี้หนากำยำ)',
      hornCount: 5,
      lifespan: '2 - 4 เดือนในสภาพเลี้ยงดูที่เหมาะสม',
      diet: 'เยลลี่โปรตีนพรีเมียม / อ้อยสดสะอาด',
      temperature: '22 - 27 °C',
      humidity: '65 - 75 %',
    },
    inBoxIncludes: [
      'ตัวด้วงกว่างซางเหนือเพศผู้เขาสั้น (แข็งแรงสมบูรณ์ 100%)',
      'กล่องเคสอะคริลิคใสระบายอากาศอย่างดีสำหรับตั้งโชว์',
      'ขอนไม้และเปลือกไม้ธรรมชาติสำหรับปีนป่ายและเกาะพักผ่อน',
      'วัสดุรองพื้นขี้เลื่อยหมักสูตรธรรมชาติ (Substrate)',
      'อ้อยสดเกรดสะอาดพร้อมรับประทาน',
      'เยลลี่โปรตีนนำเข้าสูตรพิเศษ 2 ถ้วย',
      'คู่มือการดูแลและรับประกันการเดินทาง 100%',
    ],
  },
  {
    id: 'set-2',
    name: 'เซท 2: เขายาว (ตัวท็อปประกวด)',
    subname: 'Premium Long Horn (Masterpiece)',
    category: 'male_long',
    price: 499,
    originalPrice: 690,
    stock: 7,
    badge: 'Masterpiece',
    isBestSeller: true,
    description: 'เกรดคัดพิเศษ เขายาวเรียวสวยงาม ครบ 5 แฉกสมบูรณ์แบบ ไซส์ใหญ่ ฟอร์มประกวด โดดเด่นที่สุด สง่างามสมศักดิ์ศรีราชันย์แห่งขุนเขา',
    longDescription: 'กว่างซางเหนือเพศผู้ฟอร์มเขายาวพิเศษ (Major Form) สุดยอดความภูมิใจของนักสะสมแมลงปีกแข็งระดับประเทศ คัดเฉพาะตัวที่มีเขาหน้าผากยาวโค้งได้องศาได้สัดส่วนทองคำ',
    image: '/images/set2.jpg',
    galleryImages: [
      '/images/set2.jpg',
      '/images/hero.jpg',
      '/images/set1.jpg',
      '/images/set3.jpg',
    ],
    remainingAlert: undefined,
    specs: {
      scientificName: 'Eupatorus gracilicornis (Major)',
      thaiName: 'กว่างซางเหนือ (ตัวผู้เขายาวคัดประกวด)',
      origin: 'ดอยสะเก็ด / แม่แตง เชียงใหม่ (ระดับความสูง 800+ ม.)',
      size: '72 - 85+ mm (เกรด Masterpiece)',
      hornCount: 5,
      lifespan: '3 - 5 เดือน',
      diet: 'เยลลี่โปรตีนสูง / กล้วยน้ำว้าสุก / อ้อย',
      temperature: '20 - 26 °C',
      humidity: '70 - 80 %',
    },
    inBoxIncludes: [
      'กว่างซางเหนือเพศผู้ตัวท็อปเขายาว 5 แฉกสมบูรณ์แบบ',
      'เคสใสโชว์ระดับพรีเมียมกันรอยขีดข่วน',
      'ขอนไม้เนื้อแข็งธรรมชาติจัดทรงสวยงาม',
      'ใบไม้แห้งและเปลือกสนสำหรับตกแต่งระบบนิเวศจำลอง',
      'เยลลี่โปรตีนสูตรเร่งพลังงาน 3 ถ้วย',
      'เซ็ตอ้อยสดตัดชิ้นพอดีคำ',
      'ใบ Certificate รับรองสายพันธุ์แท้',
    ],
  },
  {
    id: 'set-3',
    name: 'เซท 3: ตัวเมีย (สายพันธุ์เพาะขยาย)',
    subname: 'Breeding Essential',
    category: 'female',
    price: 119,
    originalPrice: 199,
    stock: 4,
    badge: 'Breeding Essential',
    isBestSeller: false,
    description: 'แข็งแรง ปราดเปรียว สายเลือดดีเยี่ยม เหมาะสำหรับนำไปเพาะพันธุ์เพื่อสร้างสายเลือดเกรดพรีเมียมในรุ่นต่อไป ผสมติดง่าย ไข่ดก',
    longDescription: 'เพศเมียกว่างซางเหนือคัดไซส์ใหญ่พิเศษ น้ำหนักตัวดี ลำตัวแน่น ผิวเปลือกปีกเรียบเงา ขาแข็งแรง เล็บเกาะเหนียวแน่น ผ่านการพักฟื้นและเสริมอาหารบำรุงไข่',
    image: '/images/set3.jpg',
    galleryImages: [
      '/images/set3.jpg',
      '/images/hero.jpg',
      '/images/set2.jpg',
      '/images/set1.jpg',
    ],
    remainingAlert: undefined,
    specs: {
      scientificName: 'Eupatorus gracilicornis (Female)',
      thaiName: 'กว่างซางเหนือ (เพศเมียเพาะพันธุ์)',
      origin: 'ป่าสนธรรมชาติ ดอยอินทนนท์ เชียงใหม่',
      size: '45 - 55 mm (แม่พันธุ์เกรด A+)',
      hornCount: 0,
      lifespan: '3 - 6 เดือน',
      diet: 'เยลลี่โปรตีนบำรุงไข่ / ผลไม้หวาน',
      temperature: '22 - 27 °C',
      humidity: '70 - 85 %',
    },
    inBoxIncludes: [
      'ด้วงกว่างซางเหนือเพศเมียไซส์บิ๊ก แข็งแรงมาก 1 ตัว',
      'กล่องระบายอากาศพร้อมวัสดุปูรองชุ่มชื้น',
      'เยลลี่โปรตีนสูตรบำรุงไข่สำหรับแม่พันธุ์ 2 ถ้วย',
      'แผ่นคำแนะนำสูตรการผสมพันธุ์และเตรียมตู้เพาะไข่',
    ],
  },
];

// Seed initial products into Firestore if not exists
export async function seedFirestoreIfEmpty(): Promise<Product[]> {
  const collectionPath = 'products';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    if (snap.empty) {
      console.log('[Firebase] Seeding initial products into Firestore...');
      for (const prod of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, collectionPath, prod.id), prod);
      }
      return DEFAULT_PRODUCTS;
    } else {
      const prods: Product[] = [];
      snap.forEach((d) => {
        prods.push(d.data() as Product);
      });
      return prods;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionPath);
    return DEFAULT_PRODUCTS;
  }
}

// Subscribe to real-time products updates from Firestore
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const items: Product[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as Product);
      });
      // Sort by predetermined order or set-1, set-2, set-3
      const order = ['set-1', 'set-2', 'set-3'];
      items.sort((a, b) => {
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.name.localeCompare(b.name);
      });
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      if (onError) onError(err);
    }
  );
}

// Update a product document in Firestore
export async function updateProductInFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product, { merge: true });
    console.log(`[Firebase] Product ${product.id} updated in Firestore`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save order to Firestore
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
    console.log(`[Firebase] Order ${order.id} saved in Firestore`);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Subscribe to orders in Firestore
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const items: Order[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      if (onError) onError(err);
    }
  );
}

// Update order status in Firestore
export async function updateOrderStatusInFirestore(orderId: string, status: Order['status']): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
    console.log(`[Firebase] Order ${orderId} status changed to ${status}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
