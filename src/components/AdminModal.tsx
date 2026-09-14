import React, { useState, useEffect } from 'react';
import { Product, Order } from '../types';
import { X, RefreshCw, Save, CheckCircle, Package, Users, DollarSign, Database, AlertTriangle } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'orders'>('stock');
  const [stockEdits, setStockEdits] = useState<Record<string, { stock: number; price: number; originalPrice: number }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, { stock: number; price: number; originalPrice: number }> = {};
    products.forEach((p) => {
      initial[p.id] = {
        stock: p.stock,
        price: p.price,
        originalPrice: p.originalPrice,
      };
    });
    setStockEdits(initial);
    loadOrders();
  }, [isOpen, products]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (!isOpen) return null;

  const handleStockChange = (id: string, field: 'stock' | 'price' | 'originalPrice', value: number) => {
    setStockEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Math.max(0, value),
      },
    }));
  };

  const handleSaveStock = async (id: string) => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const edit = stockEdits[id];
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
        setSaveMessage('อัปเดตสต็อกลงฐานข้อมูลเรียลไทม์สำเร็จ');
        onRefreshProducts();
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      setSaveMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetStock = async () => {
    if (!confirm('ยืนยันรีเซ็ตสต็อกทั้งหมดเป็นค่าเริ่มต้นโรงงาน?')) return;
    try {
      const res = await fetch('/api/admin/reset-stock', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onRefreshProducts();
        setSaveMessage('รีเซ็ตสต็อกสำเร็จ');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      id="admin-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-white">ระบบจัดการสต็อกสินค้าแบบเรียลไทม์</h2>
            <p className="text-zinc-400 text-xs mt-0.5">
              เชื่อมต่อกับ API Server และฐานข้อมูลตัดสต็อกอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>จัดการสต็อกสินค้า</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>รายการคำสั่งซื้อ ({orders.length})</span>
          </button>

          <button
            onClick={handleResetStock}
            className="ml-auto text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
          >
            รีเซ็ตสต็อกเริ่มต้น
          </button>
        </div>

        {saveMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* TAB 1: Real-time Stock Manager */}
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
                          handleStockChange(product.id, 'stock', parseInt(e.target.value) || 0)
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
                          handleStockChange(product.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-[#00B900] font-bold text-center font-mono"
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSaveStock(product.id)}
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

        {/* TAB 2: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                กำลังโหลดรายการคำสั่งซื้อ...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                ยังไม่มีรายการคำสั่งซื้อในระบบ
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

                  {/* Status update */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">สถานะคำสั่งซื้อ:</span>
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
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
