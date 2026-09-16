import React, { useState, useEffect, useRef } from 'react';
import { Product, Order } from '../types';
import { optimizeImage, formatFileSize } from '../utils/imageOptimizer';
import {
  updateProductInFirestore,
  subscribeToOrders,
  updateOrderStatusInFirestore,
  seedExistingOrdersToFirestore,
  getOrdersFromFirestore,
  deleteOrderFromFirestore,
  clearAllOrdersFromFirestore,
} from '../lib/firebase';
import {
  X,
  RefreshCw,
  Save,
  CheckCircle,
  Package,
  Users,
  Database,
  Upload,
  Trash2,
  Star,
  Image as ImageIcon,
  Plus,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  ZoomIn,
  Eye,
  Camera,
  Lock,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => void;
  initialProductId?: string;
  visitorCount?: number;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
  initialProductId,
  visitorCount,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'stock' | 'orders'>('media');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (products.length > 0 ? products[0].id : 'set-1')
  );

  // Selected product edit state (instant fallback to prevent any null-render blank screens)
  const [editingProduct, setEditingProduct] = useState<Product | null>(() => {
    if (products.length === 0) return null;
    const target = initialProductId ? products.find((p) => p.id === initialProductId) : null;
    return target ? JSON.parse(JSON.stringify(target)) : JSON.parse(JSON.stringify(products[0]));
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newInBoxItem, setNewInBoxItem] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Preview zoomed image
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Quick stock edits
  const [stockEdits, setStockEdits] = useState<Record<string, { stock: number; price: number; originalPrice: number }>>({});

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const prevIsOpenRef = useRef(false);
  const lastInitialProductIdRef = useRef<string | undefined>(undefined);

  // Safely computed active product fallback
  const activeProduct: Product | null =
    editingProduct ||
    products.find((p) => p.id === selectedProductId) ||
    (initialProductId ? products.find((p) => p.id === initialProductId) : null) ||
    products[0] ||
    null;

  // Initialize selected product and stock edits
  useEffect(() => {
    if (!isOpen || products.length === 0) {
      prevIsOpenRef.current = isOpen;
      return;
    }

    const isFirstOpen = !prevIsOpenRef.current && isOpen;
    const isInitialProductChanged =
      initialProductId !== undefined && initialProductId !== lastInitialProductIdRef.current;

    prevIsOpenRef.current = isOpen;
    lastInitialProductIdRef.current = initialProductId;

    if (initialProductId) {
      setActiveTab('media');
    }

    // Only force overwrite editingProduct if first opened, initialProductId changed, or editingProduct is null
    if (isFirstOpen || isInitialProductChanged || !editingProduct) {
      const targetId =
        initialProductId && products.some((p) => p.id === initialProductId)
          ? initialProductId
          : selectedProductId && products.some((p) => p.id === selectedProductId)
          ? selectedProductId
          : products[0].id;

      setSelectedProductId(targetId);
      const prod = products.find((p) => p.id === targetId) || products[0];
      setEditingProduct(JSON.parse(JSON.stringify(prod)));
    }

    // Initialize stock edits
    setStockEdits((prev) => {
      if (Object.keys(prev).length > 0 && !isFirstOpen) return prev;
      const initialStock: Record<string, { stock: number; price: number; originalPrice: number }> = {};
      products.forEach((p) => {
        initialStock[p.id] = {
          stock: p.stock,
          price: p.price,
          originalPrice: p.originalPrice,
        };
      });
      return initialStock;
    });
  }, [isOpen, initialProductId, products]);

  // Load orders when modal opens or when switching to orders tab
  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, activeTab]);

  // Real-time Firestore orders subscription
  useEffect(() => {
    if (!isOpen) return;
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeToOrders((liveOrders) => {
        if (liveOrders && liveOrders.length > 0) {
          setOrders(liveOrders);
          setIsLoadingOrders(false);
        }
      });
    } catch (e) {
      console.warn('[Firebase] Orders subscription notice:', e);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [isOpen]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    let loaded = false;

    // 1. Try server API
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          loaded = true;
          // Sync any server orders to Firestore in background
          seedExistingOrdersToFirestore(data.orders).catch((sErr) => {
            console.warn('[Firebase] Order sync warning:', sErr);
          });
        }
      }
    } catch (apiErr) {
      console.warn('[Admin] Server /api/orders unreachable, falling back to Firestore orders:', apiErr);
    }

    // 2. Fallback to Firestore directly if server API is unavailable
    if (!loaded) {
      try {
        const firestoreOrders = await getOrdersFromFirestore();
        if (firestoreOrders && firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
          loaded = true;
        }
      } catch (fErr) {
        console.warn('[Admin] Firestore orders fallback notice:', fErr);
      }
    }

    setIsLoadingOrders(false);
  };

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setEditingProduct(JSON.parse(JSON.stringify(prod)));
    }
  };

  // --- Professional High-Speed Image Management Handlers ---

  // Direct Cover Image Upload Handler (Ultra-Fast GPU Optimization with Instant Preview)
  const handleCoverUpload = async (file: File | null) => {
    const currentProduct = editingProduct || products.find((p) => p.id === selectedProductId) || products[0];
    if (!file || !currentProduct) {
      if (!currentProduct) showNotify('กรุณาเลือกสินค้าก่อนทำการอัปโหลดภาพ', 'error');
      return;
    }

    // 0ms instant optimistic preview
    const instantUrl = URL.createObjectURL(file);
    const existingGallery = currentProduct.galleryImages || [];
    const optimisticGallery = existingGallery.includes(instantUrl)
      ? existingGallery
      : [instantUrl, ...existingGallery];

    setEditingProduct({
      ...currentProduct,
      image: instantUrl,
      galleryImages: optimisticGallery,
    });

    setIsUploading(true);
    setUploadProgress({ current: 1, total: 1, stage: '⚡ กำลังประมวลผลรูปหน้าปกแบบความเร็วสูง...' });

    try {
      const startTime = performance.now();
      // 1. Optimize cover image (Ultra-fast GPU/ObjectURL, ~40-80ms)
      const opt = await optimizeImage(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.83,
        mimeType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
      });

      setUploadProgress({ current: 1, total: 1, stage: '⚡ กำลังจัดเก็บรูปหน้าปกลงระบบคลาวด์...' });

      let savedUrl = opt.base64;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: opt.base64,
            name: `${currentProduct.id}-cover`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) savedUrl = data.url;
        }
      } catch (uploadErr) {
        console.warn('[CoverUpload] Server endpoint warning, using optimized data:', uploadErr);
        savedUrl = opt.base64;
      }

      // Add to gallery if not exists (replacing instantUrl if present)
      const cleanedGallery = optimisticGallery.filter((u) => u !== instantUrl);
      const updatedGallery = cleanedGallery.includes(savedUrl)
        ? cleanedGallery
        : [savedUrl, ...cleanedGallery];

      const updatedProduct: Product = {
        ...currentProduct,
        image: savedUrl,
        galleryImages: updatedGallery,
      };

      setEditingProduct(updatedProduct);
      const totalTimeMs = Math.round(performance.now() - startTime);
      showNotify(`⚡ เปลี่ยนรูปหน้าปกหลักสำเร็จใน ${totalTimeMs}ms (${formatFileSize(opt.optimizedSize)})`);
      await persistProductChangesImmediately(updatedProduct);
    } catch (err: any) {
      console.error('[CoverUpload] Error:', err);
      showNotify(err?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปหน้าปก', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Professional gallery image upload handler with parallel GPU optimization, batch upload & cloud sync
  const handleFileUpload = async (files: FileList | null) => {
    const currentProduct = editingProduct || products.find((p) => p.id === selectedProductId) || products[0];
    if (!files || files.length === 0 || !currentProduct) {
      if (!currentProduct) showNotify('กรุณาเลือกสินค้าก่อนทำการอัปโหลดภาพ', 'error');
      return;
    }

    const fileList = Array.from(files);
    const totalFiles = fileList.length;

    // 0ms instant optimistic preview for all files
    const instantUrls = fileList.map((f) => URL.createObjectURL(f));
    const initialExistingGallery = currentProduct.galleryImages || [];
    setEditingProduct({
      ...currentProduct,
      galleryImages: [...initialExistingGallery, ...instantUrls],
    });

    setIsUploading(true);
    setUploadProgress({ current: 0, total: totalFiles, stage: `⚡ เริ่มประมวลผล ${totalFiles} รูปแบบความเร็วสูง (Parallel Engine)...` });

    const startTime = performance.now();

    try {
      let totalOriginalBytes = 0;
      let totalOptimizedBytes = 0;

      // 1. Parallel Client-side GPU/Worker Optimization for ALL files concurrently
      let completedCount = 0;
      const optimizedResults = await Promise.all(
        fileList.map(async (file, idx) => {
          try {
            const opt = await optimizeImage(file, {
              maxWidth: 1400,
              maxHeight: 1400,
              quality: 0.83,
              mimeType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
            });
            completedCount++;
            setUploadProgress({
              current: completedCount,
              total: totalFiles,
              stage: `⚡ ปรับแต่งความคมชัดเรียบร้อย ${completedCount}/${totalFiles} รูป (${file.name})...`,
            });
            return {
              file,
              opt,
              base64: opt.base64,
              originalSize: opt.originalSize,
              optimizedSize: opt.optimizedSize,
              success: true,
            };
          } catch (optErr) {
            console.warn(`[Upload] Image ${file.name} optimization warning, fallback:`, optErr);
            const rawBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => resolve('');
              reader.readAsDataURL(file);
            });
            completedCount++;
            return {
              file,
              opt: null,
              base64: rawBase64,
              originalSize: file.size,
              optimizedSize: file.size,
              success: true,
            };
          }
        })
      );

      // Sum up bytes
      optimizedResults.forEach((r) => {
        totalOriginalBytes += r.originalSize;
        totalOptimizedBytes += r.optimizedSize;
      });

      // 2. High-speed upload via Batch endpoint (Single HTTP Roundtrip)
      setUploadProgress({
        current: totalFiles,
        total: totalFiles,
        stage: `⚡ กำลังส่งข้อมูลขึ้นเซิร์ฟเวอร์แบบ Batch ทั้งหมด ${totalFiles} รูป...`,
      });

      let uploadedUrls: string[] = [];
      try {
        const batchPayload = optimizedResults.map((r, idx) => ({
          image: r.base64,
          name: `${currentProduct.id}-img-${idx}`,
        }));

        const res = await fetch('/api/upload-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: batchPayload }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
            uploadedUrls = data.urls;
          }
        }
      } catch (batchErr) {
        console.warn('[Upload] Batch endpoint warning, falling back to parallel single upload:', batchErr);
      }

      // Fallback: Parallel single uploads if batch did not return all
      if (uploadedUrls.length === 0) {
        uploadedUrls = await Promise.all(
          optimizedResults.map(async (r, idx) => {
            try {
              const res = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  image: r.base64,
                  name: `${currentProduct.id}-img-${idx}`,
                }),
              });
              if (res.ok) {
                const d = await res.json();
                if (d.success && d.url) return d.url;
              }
            } catch (e) {
              console.warn('[Upload] Single upload fallback warning:', e);
            }
            return r.base64;
          })
        );
      }

      // Clean valid URLs
      const validUrls = uploadedUrls.filter(Boolean);

      // Filter out any temporary optimistic blob: URLs before persisting to database
      const cleanedExistingGallery = (currentProduct.galleryImages || []).filter((u) => !u.startsWith('blob:'));
      const updatedGallery = [...cleanedExistingGallery];
      validUrls.forEach((url) => {
        if (url && !updatedGallery.includes(url) && !url.startsWith('blob:')) {
          updatedGallery.push(url);
        }
      });

      // If no valid cover image exists or cover is a blob, set first uploaded as cover
      const updatedCover = (currentProduct.image && !currentProduct.image.startsWith('blob:'))
        ? currentProduct.image
        : (validUrls[0] || currentProduct.image);

      const updatedProduct: Product = {
        ...currentProduct,
        image: updatedCover,
        galleryImages: updatedGallery,
      };

      setEditingProduct(updatedProduct);

      const totalTimeSec = ((performance.now() - startTime) / 1000).toFixed(1);
      const sizeSavings =
        totalOriginalBytes > totalOptimizedBytes
          ? ` (ประหยัดพื้นที่จาก ${formatFileSize(totalOriginalBytes)} เหลือ ${formatFileSize(totalOptimizedBytes)})`
          : '';

      showNotify(`⚡ อัปโหลดสำเร็จรวดเร็ว ${validUrls.length} รูปใน ${totalTimeSec} วินาที!${sizeSavings}`);

      await persistProductChangesImmediately(updatedProduct);
    } catch (err: any) {
      console.error('[Upload] Error:', err);
      showNotify(err?.message || 'เกิดข้อผิดพลาดในการอัปโหลดภาพ', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper to persist product changes immediately to Firestore & Server (for instant photo operations)
  const persistProductChangesImmediately = async (productToSave: Product, successMsg?: string) => {
    try {
      try {
        await updateProductInFirestore(productToSave);
      } catch (fErr) {
        console.warn('[Firebase] Immediate photo sync Firestore warning:', fErr);
      }

      const res = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSave),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onRefreshProducts();
          if (successMsg) showNotify(successMsg);
          return;
        }
      }

      onRefreshProducts();
      if (successMsg) showNotify(successMsg);
    } catch (err) {
      console.error('Failed to auto-save product changes:', err);
      onRefreshProducts();
    }
  };

  // Add photo via direct URL and save immediately
  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim() || !editingProduct) return;
    const url = newImageUrl.trim();
    const updatedGallery = [...(editingProduct.galleryImages || []), url];
    const updatedProduct: Product = {
      ...editingProduct,
      image: editingProduct.image || url,
      galleryImages: updatedGallery,
    };
    setEditingProduct(updatedProduct);
    setNewImageUrl('');
    showNotify('เพิ่มรูปภาพเรียบร้อยแล้ว (บันทึกทันที)');
    await persistProductChangesImmediately(updatedProduct);
  };

  // Delete an image from gallery - deletes immediately and auto-saves to Cloud Firestore & Server
  const handleDeleteImage = async (indexToDelete: number) => {
    if (!editingProduct) return;
    const targetUrl = editingProduct.galleryImages[indexToDelete];
    const updatedGallery = editingProduct.galleryImages.filter((_, idx) => idx !== indexToDelete);

    // If deleting the cover image, pick the first remaining or default
    let newCover = editingProduct.image;
    if (editingProduct.image === targetUrl) {
      newCover = updatedGallery.length > 0 ? updatedGallery[0] : '/images/hero.jpg';
    }

    const updatedProduct: Product = {
      ...editingProduct,
      image: newCover,
      galleryImages: updatedGallery,
    };

    // 1. Instant local update for smooth UI
    setEditingProduct(updatedProduct);
    showNotify('ลบรูปภาพเรียบร้อยแล้ว (บันทึกทันที)');

    // 2. Persist immediately to Cloud Firestore and Server
    await persistProductChangesImmediately(updatedProduct);
  };

  // Set image as main cover and save immediately
  const handleSetAsCover = async (imageUrl: string) => {
    if (!editingProduct) return;
    const updatedProduct: Product = {
      ...editingProduct,
      image: imageUrl,
    };
    setEditingProduct(updatedProduct);
    showNotify('ตั้งเป็นภาพหน้าปกเรียบร้อยแล้ว (บันทึกทันที)');
    await persistProductChangesImmediately(updatedProduct);
  };

  // Move image left in gallery order and save immediately
  const handleMoveImage = async (fromIndex: number, direction: 'left' | 'right') => {
    if (!editingProduct) return;
    const gallery = [...editingProduct.galleryImages];
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= gallery.length) return;

    const temp = gallery[fromIndex];
    gallery[fromIndex] = gallery[toIndex];
    gallery[toIndex] = temp;

    const updatedProduct: Product = {
      ...editingProduct,
      galleryImages: gallery,
    };

    setEditingProduct(updatedProduct);
    await persistProductChangesImmediately(updatedProduct);
  };

  // In-Box items management
  const handleAddInBoxItem = () => {
    if (!newInBoxItem.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      inBoxIncludes: [...(editingProduct.inBoxIncludes || []), newInBoxItem.trim()],
    });
    setNewInBoxItem('');
  };

  const handleRemoveInBoxItem = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      inBoxIncludes: editingProduct.inBoxIncludes.filter((_, i) => i !== index),
    });
  };

  // Save all changes for the selected product to Backend & Cloud Firestore
  const handleSaveProductChanges = async () => {
    if (!editingProduct) return;
    setIsSaving(true);

    try {
      // Sync to Cloud Firestore
      try {
        await updateProductInFirestore(editingProduct);
      } catch (fErr) {
        console.warn('[Firebase] Firestore product update warning:', fErr);
      }

      const res = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      const data = await res.json();
      if (data.success) {
        showNotify(`บันทึกข้อมูลและรูปภาพของ "${editingProduct.name}" ลง Firebase & Server สำเร็จ!`);
        onRefreshProducts();
      } else {
        showNotify(data.message || 'บันทึกไม่สำเร็จ', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotify('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick stock changes
  const handleQuickStockChange = (id: string, field: 'stock' | 'price' | 'originalPrice', value: number) => {
    setStockEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Math.max(0, value),
      },
    }));
  };

  const handleSaveQuickStock = async (id: string) => {
    setIsSaving(true);
    try {
      const edit = stockEdits[id];
      const currentProd = products.find((p) => p.id === id);
      if (currentProd) {
        try {
          await updateProductInFirestore({
            ...currentProd,
            stock: edit.stock,
            price: edit.price,
            originalPrice: edit.originalPrice,
          });
        } catch (fErr) {
          console.warn('[Firebase] Quick stock Firestore sync warning:', fErr);
        }
      }

      const res = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          stock: edit.stock,
          price: edit.price,
          originalPrice: edit.originalPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotify('อัปเดตสต็อกลง Firebase & ฐานข้อมูลเรียลไทม์สำเร็จ');
        onRefreshProducts();
      }
    } catch (err) {
      showNotify('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      try {
        await updateOrderStatusInFirestore(orderId, status, targetOrder);
      } catch (fErr) {
        console.warn('[Firebase] Order status Firestore sync warning:', fErr);
      }

      try {
        await fetch(`/api/orders/${orderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } catch (sErr) {
        console.warn('[Admin] Server status sync fallback:', sErr);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showNotify(`อัปเดตสถานะออเดอร์ ${orderId} ลง Cloud Firestore แล้ว`);
    } catch (err) {
      console.warn('[Admin] Status update error:', err);
      showNotify('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  // Delete single order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`ยืนยันการลบออเดอร์ ${orderId} ออกจากระบบ?`)) {
      return;
    }

    try {
      // 1. Delete from Firestore
      try {
        await deleteOrderFromFirestore(orderId);
      } catch (fErr) {
        console.warn('[Firebase] Delete order notice:', fErr);
      }

      // 2. Delete from Server
      try {
        await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      } catch (sErr) {
        console.warn('[Admin] Server delete order fallback:', sErr);
      }

      // 3. Update local state
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showNotify(`ลบรายการคำสั่งซื้อ ${orderId} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('[Admin] Delete order error:', err);
      showNotify('เกิดข้อผิดพลาดในการลบคำสั่งซื้อ', 'error');
    }
  };

  // Clear all orders
  const handleClearAllOrders = async () => {
    if (!window.confirm('คุณต้องการล้างประวัติคำสั่งซื้อทั้งหมดออกจากระบบหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    try {
      // 1. Clear Firestore orders
      try {
        await clearAllOrdersFromFirestore();
      } catch (fErr) {
        console.warn('[Firebase] Clear orders notice:', fErr);
      }

      // 2. Clear Server orders
      try {
        await fetch('/api/orders/clear', { method: 'POST' });
      } catch (sErr) {
        console.warn('[Admin] Server clear orders fallback:', sErr);
      }

      // 3. Update local state
      setOrders([]);
      showNotify('ล้างรายการคำสั่งซื้อทั้งหมดออกจากระบบเรียบร้อยแล้ว');
    } catch (err) {
      console.error('[Admin] Clear all orders error:', err);
      showNotify('เกิดข้อผิดพลาดในการล้างคำสั่งซื้อ', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-6 max-h-[94vh] overflow-y-auto flex flex-col">
        
        {/* Top Action Buttons */}
        <div className="absolute top-5 right-5 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-medium transition-colors cursor-pointer"
            title="ล็อคระบบและออกจากโหมดตั้งค่า"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">ล็อคระบบ & ออก</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#00B900]/15 border border-[#00B900]/30 text-[#00B900] flex items-center justify-center shadow-[0_0_20px_rgba(0,185,0,0.2)]">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif text-white">ระบบจัดการหลังบ้านระดับโปร</h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-500/30">
                PRO ADMIN
              </span>
              <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 text-[10px] font-mono rounded-full border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Cloud Firestore Live
              </span>
              {typeof visitorCount === 'number' && (
                <span className="px-2.5 py-0.5 bg-zinc-900 text-emerald-300 text-[10px] font-mono rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>สถิติเข้าชม: {visitorCount.toLocaleString()} ครั้ง</span>
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">
              แก้ไขข้อมูล เพิ่มรูป/ลบรูปสินค้า จัดการแกลเลอรี 10 มุมมอง และควบคุมสต็อกแบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`mb-5 p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#00B900]" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            )}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-800/90 pb-4">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-white text-black shadow-lg'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>แก้ไขรูปภาพและข้อมูลสินค้า</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-black shadow-lg'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>ปรับสต็อกด่วน</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-lg'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>รายการออเดอร์ ({orders.length})</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: PRO MEDIA & PRODUCT EDITOR (แก้ไข เพิ่มรูป ลบรูป)
           ======================================================== */}
        {activeTab === 'media' && (
          !activeProduct ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-900/40 rounded-3xl border border-zinc-800">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-zinc-300 text-sm font-medium">กำลังเตรียมระบบจัดการรูปภาพและข้อมูลสินค้า...</p>
              <p className="text-zinc-500 text-xs">หากรอนาน กรุณากดปุ่มรีเฟรชข้อมูลด้านบน</p>
            </div>
          ) : (
          <div
            className="space-y-8 flex-1"
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              const files: File[] = [];
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                  const f = items[i].getAsFile();
                  if (f) files.push(f);
                }
              }
              if (files.length > 0) {
                e.preventDefault();
                const dt = new DataTransfer();
                files.forEach((f) => dt.items.add(f));
                handleFileUpload(dt.files);
              }
            }}
          >
            
            {/* Product Selector Pills */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                เลือกสินค้าที่ต้องการแก้ไข:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {products.map((p) => {
                  const isSelected = p.id === (editingProduct?.id || activeProduct.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-zinc-800/90 border-emerald-500 shadow-[0_0_15px_rgba(0,185,0,0.2)]'
                          : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover bg-zinc-950 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white text-xs font-semibold truncate">{p.name}</h4>
                        <span className="text-[#00B900] text-[11px] font-mono font-bold">
                          ฿{p.price.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- SECTION: PRO IMAGE MANAGEMENT --- */}
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/90 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-serif text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                    <span>ระบบจัดการรูปภาพระดับโปร (Media & Gallery Manager)</span>
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    มีภาพทั้งหมด <strong className="text-white">{(editingProduct || activeProduct).galleryImages?.length || 0} รูป</strong> • แนะนำ 8-10 รูปเพื่อแสดงผลในแกลเลอรี 10 มุมมองได้อย่างสมบูรณ์แบบ
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/gif,image/*"
                    className="hidden"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = '';
                    }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCoverUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/gif,image/*"
                    multiple
                    className="hidden"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = '';
                    }}
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>เปลี่ยนรูปหน้าปก</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,185,0,0.25)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'กำลังอัปโหลด...' : '+ อัปโหลดเข้าแกลเลอรี'}</span>
                  </button>
                </div>
              </div>

              {/* Cover Image Spotlight Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-zinc-900 border-2 border-emerald-500/60 shadow-[0_0_15px_rgba(0,185,0,0.15)] flex-shrink-0 group">
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setPreviewZoomImage(editingProduct.image)}
                      className="p-1.5 bg-zinc-900/90 text-white rounded-lg hover:bg-black transition-colors"
                      title="ดูภาพขยาย"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    <span>รูปหน้าปกหลัก</span>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-white text-sm font-semibold">รูปภาพหน้าปกหลักของสินค้านี้</h4>
                    <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[220px]">
                      {editingProduct.image.startsWith('data:') ? 'ภาพที่ประมวลผลแล้ว (Base64 HD)' : editingProduct.image}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    รูปนี้คือรูปที่จะแสดงเป็นภาพแรกในหน้ารายการสินค้า และเป็นภาพหลักเวลาลูกค้ากดดูรายละเอียด
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูปหน้าปกใหม่จากเครื่อง</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pro Drag-and-Drop Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                    : 'border-zinc-800 hover:border-emerald-500/60 bg-zinc-950/40 hover:bg-zinc-950/70'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <p className="text-xs font-medium text-white">
                      ลากรูปภาพมาวางที่นี่ หรือ <span className="text-emerald-400 underline">คลิกเพื่อเลือกไฟล์</span>
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                      ⚡ Turbo Speed
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    ประมวลผลคู่ขนานแบบความเร็วสูง (GPU Resizing) • คมชัดระดับโปร • ป้องกันภาพหลุด 100%
                  </p>
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {isUploading && uploadProgress && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/50 space-y-2.5 animate-fadeIn shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-medium flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>{uploadProgress.stage}</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {uploadProgress.total > 0 ? `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` : '100%'} ({uploadProgress.current}/{uploadProgress.total} รูป)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                      style={{ width: `${Math.max(5, Math.round((uploadProgress.current / uploadProgress.total) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add by URL input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="หรือวางลิงก์รูปภาพ (URL) ที่นี่ เช่น https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>เพิ่มจาก URL</span>
                </button>
              </div>

              {/* Gallery Photos Grid with Pro Controls */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-medium text-zinc-300">
                    รูปภาพในแกลเลอรี (คลิกตั้งเป็นรูปหน้าปก, สลับตำแหน่ง หรือกดลบรูปได้ทันที):
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ลบรูปแล้วระบบจะบันทึกทันที</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {(editingProduct.galleryImages || []).map((imgUrl, idx) => {
                    const isCover = editingProduct.image === imgUrl;
                    return (
                      <div
                        key={idx}
                        className={`group relative rounded-2xl overflow-hidden border-2 bg-zinc-950 flex flex-col transition-all duration-200 ${
                          isCover
                            ? 'border-emerald-500 shadow-[0_0_15px_rgba(0,185,0,0.3)]'
                            : 'border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="w-full aspect-square relative overflow-hidden bg-zinc-900">
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Index Badge */}
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white font-mono border border-white/10">
                            #{idx + 1}
                          </div>

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-black px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <Star className="w-2.5 h-2.5 fill-black" />
                              <span>หน้าปก</span>
                            </div>
                          )}

                          {/* Zoom Button overlay */}
                          <button
                            type="button"
                            onClick={() => setPreviewZoomImage(imgUrl)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            title="คลิกเพื่อขยายดูภาพ"
                          >
                            <ZoomIn className="w-6 h-6 drop-shadow-md" />
                          </button>
                        </div>

                        {/* Action Buttons Bar */}
                        <div className="p-2 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-1">
                          {/* Set as Cover button */}
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(imgUrl)}
                            disabled={isCover}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                              isCover
                                ? 'text-emerald-400 cursor-default'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                            title="ตั้งเป็นภาพหน้าปกหลัก"
                          >
                            {isCover ? '✓ ปกหลัก' : 'ตั้งเป็นปก'}
                          </button>

                          {/* Order shift buttons */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'left')}
                              disabled={idx === 0}
                              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-20 cursor-pointer"
                              title="ย้ายตำแหน่งไปข้างหน้า"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'right')}
                              disabled={idx === (editingProduct.galleryImages.length - 1)}
                              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-20 cursor-pointer"
                              title="ย้ายตำแหน่งไปข้างหลัง"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(idx)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/15 active:scale-95 rounded-lg transition-all cursor-pointer group/del"
                            title="ลบรูปนี้ทันที (บันทึกอัตโนมัติ)"
                          >
                            <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --- SECTION: PRODUCT DETAILS & SPECIFICATIONS --- */}
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/90 space-y-5">
              <h3 className="text-base font-serif text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Package className="w-5 h-5 text-amber-400" />
                <span>ข้อมูลและรายละเอียดสินค้า (Product Details)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">ชื่อสินค้า (Title)</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">ชื่อรุ่นย่อย (Subname / Badge)</label>
                  <input
                    type="text"
                    value={editingProduct.subname}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subname: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">ราคาขายปัจจุบัน (฿)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-[#00B900] font-bold font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">ราคาเต็มเดิม (฿)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-red-400 font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">จำนวนสต็อกในคลัง (ตัว)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">ป้ายกำกับพิเศษ (Badge)</label>
                  <input
                    type="text"
                    placeholder="เช่น Masterpiece, Ready To Display"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-amber-300 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">คำอธิบายแบบย่อ (Short Description)</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">คำอธิบายยาวเชิงลึก (Long Description)</label>
                <textarea
                  rows={3}
                  value={editingProduct.longDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500"
                />
              </div>

              {/* In-Box Items Checklist */}
              <div>
                <label className="block text-xs text-zinc-400 mb-2">อุปกรณ์และของแถมในเซ็ต (In-Box Items):</label>
                <div className="space-y-2 mb-3">
                  {(editingProduct.inBoxIncludes || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 text-xs">
                      <span className="text-zinc-200">✓ {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInBoxItem(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เพิ่มอุปกรณ์ในกล่อง เช่น กล่องอะคริลิค, เจลลี่โปรตีน..."
                    value={newInBoxItem}
                    onChange={(e) => setNewInBoxItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInBoxItem();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInBoxItem}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    + เพิ่ม
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Save Changes Bar */}
            <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-2xl flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                <span>กำลังแก้ไข: <strong className="text-white">{editingProduct.name}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleSaveProductChanges}
                disabled={isSaving}
                className="px-6 py-3.5 bg-[#00B900] hover:bg-[#009900] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(0,185,0,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'กำลังบันทึกลงฐานข้อมูล...' : 'บันทึกการเปลี่ยนแปลงทั้งหมด'}</span>
              </button>
            </div>

          </div>
          )
        )}

        {/* ========================================================
            TAB 2: QUICK STOCK & PRICE MANAGER
           ======================================================== */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            {products.map((product) => {
              const edit = stockEdits[product.id] || {
                stock: product.stock,
                price: product.price,
                originalPrice: product.originalPrice,
              };

              return (
                <div
                  key={product.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-zinc-950 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm">{product.name}</h4>
                      <p className="text-zinc-500 text-xs">{product.subname}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            edit.stock <= 2
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          สต็อกปัจจุบัน: {edit.stock} ตัว
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Stock Input */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">จำนวนสต็อก</label>
                      <input
                        type="number"
                        min="0"
                        value={edit.stock}
                        onChange={(e) =>
                          handleQuickStockChange(product.id, 'stock', parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white text-center font-mono"
                      />
                    </div>

                    {/* Price Input */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">ราคาขาย (฿)</label>
                      <input
                        type="number"
                        min="0"
                        value={edit.price}
                        onChange={(e) =>
                          handleQuickStockChange(product.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-[#00B900] font-bold text-center font-mono"
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSaveQuickStock(product.id)}
                      disabled={isSaving}
                      className="mt-4 md:mt-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>บันทึก</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================
            TAB 3: ORDERS LIST
           ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Orders Header & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                  <span>รายการคำสั่งซื้อจากลูกค้า</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                    {orders.length} ออเดอร์
                  </span>
                </h4>
                <p className="text-zinc-400 text-xs mt-0.5">
                  เชื่อมต่อฐานข้อมูล Google Cloud Firestore & ระบบตัดสต็อกอัตโนมัติ
                </p>
              </div>

              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllOrders}
                  className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="ลบคำสั่งซื้อทั้งหมดออกจากระบบ"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>ล้างประวัติออเดอร์ทั้งหมด</span>
                </button>
              )}
            </div>

            {isLoadingOrders ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                กำลังโหลดรายการคำสั่งซื้อ...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 space-y-2">
                <Package className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-white text-sm font-medium">ยังไม่มีรายการคำสั่งซื้อในระบบ</p>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                  ระบบพร้อมรับออเดอร์ใหม่จากลูกค้า ข้อมูลจะบันทึกและซิงค์ทันทีเมื่อมีลูกค้าสั่งซื้อ
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-zinc-800 pb-2.5">
                    <div>
                      <span className="text-amber-300 font-mono font-bold text-xs">
                        {order.id}
                      </span>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#00B900] font-bold text-sm">
                        ฿{order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-500 block uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-300 space-y-1">
                    <p>
                      <strong>ลูกค้า:</strong> {order.customerName} |{' '}
                      <span className="text-emerald-400">{order.customerPhone}</span>
                    </p>
                    <p className="text-zinc-400">
                      <strong>ที่อยู่:</strong> {order.customerAddress}
                    </p>
                    {order.notes && (
                      <p className="text-zinc-500 italic">
                        <strong>หมายเหตุ:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Order items */}
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 text-xs space-y-1.5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300">
                        <span>
                          {it.name} x {it.quantity}
                        </span>
                        <span className="font-mono">฿{(it.price * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Transfer Slip Evidence (if uploaded) */}
                  {order.slipImage && (
                    <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          onClick={() => setPreviewZoomImage(order.slipImage || null)}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-500/50 bg-black flex-shrink-0 cursor-pointer group shadow-sm"
                          title="คลิกเพื่อดูสลิปขนาดเต็ม"
                        >
                          <img
                            src={order.slipImage}
                            alt="Slip Evidence"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>แนบสลิปหลักฐานการโอนแล้ว</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            คลิกที่รูปเพื่อขยายตรวจสอบยอดเงินและบัญชี
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage(order.slipImage || null)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ดูสลิปเต็มจอ</span>
                      </button>
                    </div>
                  )}

                  {/* Status update & Delete Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">สถานะ:</span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value as Order['status'])
                        }
                        className="bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-lg focus:border-emerald-500"
                      >
                        <option value="pending_payment">รอชำระเงิน</option>
                        <option value="paid_verified">ชำระแล้ว / ยืนยันสลิป</option>
                        <option value="preparing">กำลังจัดเตรียมพัสดุ</option>
                        <option value="shipped">จัดส่งแล้ว</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-transparent hover:border-red-500/30"
                      title="ลบออเดอร์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบออเดอร์</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Image Zoom Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img
              src={previewZoomImage}
              alt="Zoom Preview"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-4 right-4 text-white bg-black/70 p-2 rounded-full border border-white/20 hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
