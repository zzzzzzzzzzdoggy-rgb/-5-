import { Product, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
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
    longDescription: 'กว่างซางเหนือเพศผู้ฟอร์มเขาสั้น (Minor Form) โครงสร้างบึกบึน แข็งแรง ว่องไว อายุยืนยาว จุดเด่นคือจัดมาเป็นเซ็ตของขวัญสำเร็จรูปพร้อมเคสใสโชว์และวัสดุรองพื้นครบชุด เหมาะสำหรับมอบเป็นของขวัญสุดพิเศษหรือตั้งโต๊ะทำงาน เสริมฮวงจุ้ยบารมี',
    image: '/images/set1_short_1.jpg',
    galleryImages: [
      '/images/set1_short_1.jpg',
      '/images/set1_short_2.jpg',
      '/images/set1_short_3.jpg'
    ],
    specs: {
      scientificName: 'Eupatorus gracilicornis',
      thaiName: 'กว่างซางเหนือ (ด้วง 5 เขา)',
      origin: 'ดอยสูงภาคเหนือ (เชียงใหม่/แม่ฮ่องสอน) 1,400m+ ASL',
      size: '55 - 65 mm (Medium Size)',
      hornCount: 5,
      lifespan: '2 - 4 เดือน ในวัยตัวเต็มวัย',
      diet: 'เยลลี่โปรตีนสำหรับด้วง, อ้อยหวาน, กล้วยน้ำว้า',
      temperature: '22°C - 26°C (ชอบอากาศเย็นโปร่ง)',
      humidity: '65% - 75%'
    },
    inBoxIncludes: [
      'ด้วงกว่างซางเหนือเพศผู้ (เขาสั้น) 1 ตัว สมบูรณ์ 100%',
      'กล่องอะคริลิคใสระบายอากาศเกรดพรีเมียม',
      'ถุงของขวัญหน้าต่างใสผูกโบว์ซาตินสีทองหรูหรา',
      'ท่อนไม้ธรรมชาติขัดเสี้ยน & เปลือกไม้รองนอน',
      'ขี้เลื่อยหมักสูตรธรรมชาติ (Substrate) ปลอดสารเคมี',
      'ท่อนอ้อยสดตัดแต่ง + เยลลี่โปรตีนพรีเมียม 2 ถ้วย',
      'คู่มือการเลี้ยงแบบเร่งรัด & บัตรรับประกัน Live Arrival'
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
    longDescription: 'กว่างซางเหนือเพศผู้ฟอร์มเขายาวพิเศษ (Major Form) สุดยอดความภูมิใจของนักสะสมแมลงปีกแข็งระดับประเทศ คัดเฉพาะตัวที่มีเขาหน้าผากยาวโค้งได้องศาได้สัดส่วนทองคำ เขาอกทั้ง 4 แหลมคม ปีกสีเหลืองอำพันเงางามสะท้อนแสงไฟดุจทองคำบริสุทธิ์ ตัวใหญ่ กล้ามเนื้อทรงพลัง',
    image: '/images/สั้นยาว ใหญ่.jfif',
    galleryImages: [
      '/images/สั้นยาว ใหญ่.jfif',
      '/images/Gemini_Generated_Image_9px4ih9px4ih9px4.jfif',
      '/images/ยาว3.jfif',
      '/images/ยาว4.jfif'
    ],
    specs: {
      scientificName: 'Eupatorus gracilicornis',
      thaiName: 'กว่างซางเหนือ (ด้วง 5 เขา เกรดประกวด)',
      origin: 'ดอยสูงแนวเทือกเขาถนนธงชัย แม่ฮ่องสอน 1,600m+ ASL',
      size: '78 - 85+ mm (Jumbo Contest Class)',
      hornCount: 5,
      lifespan: '2 - 4 เดือน ในวัยตัวเต็มวัย',
      diet: 'เยลลี่เสริมกรดอะมิโนและโปรตีนสูง, ผลไม้รสหวาน',
      temperature: '20°C - 24°C (สภาพอากาศเย็นสดชื่น)',
      humidity: '70% - 80%'
    },
    inBoxIncludes: [
      'ด้วงกว่างซางเหนือเพศผู้ (เขายาวพิเศษ ไซส์ประกวด) 1 ตัว สมบูรณ์ 100% ไร้ตำหนิ',
      'เคสจัดแสดงกระจกอะคริลิคใส Magnetic Lock พร้อมช่องระบายอากาศนาโน',
      'ขอนไม้ป่าธรรมชาติเคลือบผิวกันเชื้อรา',
      'ขี้เลื่อยโอ๊คหมักพรีเมียมนำเข้า',
      'เยลลี่สูตรโปรตีนเข้มข้นพิเศษ 4 ถ้วย',
      'ใบ Certificate รับรองสายพันธุ์ & ขนาดวัดจริงจากเวอร์เนียร์คาลิปเปอร์',
      'ประกันการขนส่ง Live Arrival 100% จัดส่งด่วนพิเศษคุมอุณหภูมิ'
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
    longDescription: 'เพศเมียกว่างซางเหนือคัดไซส์ใหญ่พิเศษ น้ำหนักตัวดี ลำตัวแน่น ผิวเปลือกปีกเรียบเงา ขาแข็งแรง เล็บเกาะเหนียวแน่น ผ่านการพักฟื้นและเสริมอาหารบำรุงไข่พร้อมจับคู่ผสมพันธุ์กับพ่อพันธุ์เขายาว ให้ลูกดกและโครงสร้างพันธุกรรมเสถียร',
    image: '/images/set3.jpg',
    galleryImages: [
      '/images/set3.jpg',
      '/images/hero.jpg',
      '/images/set2.jpg',
      '/images/set1.jpg',
      'https://images.unsplash.com/photo-1588691515518-8f8185c63d59?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
    ],
    specs: {
      scientificName: 'Eupatorus gracilicornis (Female)',
      thaiName: 'กว่างซางเหนือ (ตัวเมีย)',
      origin: 'ดอยเชียงใหม่ 1,400m+ ASL',
      size: '50 - 58 mm (Large Female)',
      hornCount: 0,
      lifespan: '3 - 6 เดือน',
      diet: 'เยลลี่โปรตีนสูงสูตรเร่งไข่, กล้วยน้ำว้าสุก',
      temperature: '22°C - 26°C',
      humidity: '70% - 80%'
    },
    inBoxIncludes: [
      'ด้วงกว่างซางเหนือเพศเมียสมบูรณ์พันธุ์ 1 ตัว',
      'กล่องเดินทางระบายอากาศพร้อมวัสดุชุ่มชื้น',
      'เยลลี่โปรตีนเสริมวิตามินผสมพันธุ์ 2 ถ้วย',
      'สูตรและวิธีตั้งตู้เพาะพันธุ์วางไข่ (Breeding Setup Guide)',
      'รับประกันการรอดชีวิต 100%'
    ]
  }
];

export const COUPONS: Coupon[] = [
  {
    code: 'EUPATORUS10',
    discountType: 'percentage',
    value: 10,
    minSpend: 300,
    description: 'ส่วนลด 10% เมื่อซื้อขั้นต่ำ ฿300'
  },
  {
    code: 'VIP50',
    discountType: 'fixed',
    value: 50,
    minSpend: 400,
    description: 'ส่วนลดเงินสด ฿50 เมื่อช้อปครบ ฿400'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    value: 60,
    minSpend: 350,
    description: 'ฟรีค่าจัดส่งด่วนพิเศษ (มูลค่า ฿60)'
  }
];

export const STORY_CONTENT = {
  heritageTitle: 'ศิลปะแห่งธรรมชาติ',
  heritageSubtitle: 'The Heritage & Living Jewel of Northern Forests',
  storyP1: 'กว่างซางเหนือ หรือกว่าง 5 เขา (Eupatorus gracilicornis) เป็นหนึ่งในแมลงปีกแข็งที่สง่างามและมีเสน่ห์ลึกลับที่สุดในโลก พบได้ตามป่าดิบเขาทางภาคเหนือของประเทศไทยที่ระดับความสูงกว่า 1,000 เมตรขึ้นไป เช่น ดอยอินทนนท์ ดอยสุเทพ ดอยเชียงดาว และเทือกเขาแดนลาว',
  storyP2: 'จุดเด่นทางกายวิภาคอันน่าอัศจรรย์คือ "เขา 5 แฉก" ของตัวผู้ ประกอบด้วยเขาหน้าผาก (Cephalic horn) ที่โค้งยาวสง่างาม และเขาอก (Thoracic horns) แหลมคมอีก 4 แฉก ชี้พุ่งไปข้างหน้าดั่งมงกุฎแห่งราชันย์ ผสานกับปีกคู่หน้า (Elytra) สีเหลืองอำพันสุกปลั่งตัดกับอกสีดำเงาดุจหินออบซิเดียน ทำให้เป็นที่หมายปองของนักสะสมทั่วโลก',
  storyP3: 'การได้ครอบครองกว่างซางเหนือที่มีสัดส่วนสมบูรณ์ ไร้รอยแหว่ง และมีความแวววาว ถือเป็นความภาคภูมิใจสูงสุด เราจึงคัดสรรและอนุบาลอย่างพิถีพิถันด้วยมาตรฐานฟาร์มระดับสากล พร้อมรับประกันความมีชีวิตและความสมบูรณ์แบบ 100%'
};

export const CONTACT_INFO = {
  phone: '093-928-0599',
  phoneClean: '0939280599',
  lineId: 'Art0599',
  lineUrl: 'https://line.me/ti/p/42_8FMgHxD',
  facebookName: 'Wonder art',
  facebookUrl: 'https://www.facebook.com/share/1BtaGEdpLq/?mibextid=wwXIfr',
  instagramHandle: '@art_norway_',
  instagramUrl: 'https://www.instagram.com/art_norway_?stkn=MXMxbmV1c2pvcnoxNQ%3D%3D&utm_source=qr'
};
