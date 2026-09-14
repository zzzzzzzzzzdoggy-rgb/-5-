import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, X, Shield, AlertCircle, Delete, KeyRound } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CORRECT_PIN = '9999';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      setIsShaking(false);
    }
  }, [isOpen]);

  const verifyPin = useCallback(
    (enteredPin: string) => {
      if (enteredPin === CORRECT_PIN) {
        setIsSuccess(true);
        setError(null);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 300);
      } else {
        setIsShaking(true);
        setError('รหัสผ่านไม่ถูกต้อง กรุณาระบุรหัสผ่าน 4 หลักที่ถูกต้อง');
        setTimeout(() => {
          setPin('');
          setIsShaking(false);
        }, 600);
      }
    },
    [onSuccess, onClose]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (pin.length >= 4 || isSuccess) return;
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    },
    [pin, isSuccess, verifyPin]
  );

  const handleBackspace = useCallback(() => {
    if (pin.length > 0 && !isSuccess) {
      setPin((prev) => prev.slice(0, -1));
      setError(null);
    }
  }, [pin, isSuccess]);

  const handleClear = useCallback(() => {
    if (!isSuccess) {
      setPin('');
      setError(null);
    }
  }, [isSuccess]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigitPress, handleBackspace, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="admin-pin-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="admin-pin-modal-card"
        className={`w-full max-w-sm rounded-[2rem] bg-zinc-950 border border-zinc-800/90 p-6 shadow-2xl relative transition-transform ${
          isShaking ? 'animate-bounce border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : ''
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
            }`}
          >
            {isSuccess ? (
              <Unlock className="w-7 h-7 text-emerald-400 animate-pulse" />
            ) : (
              <Lock className="w-7 h-7 text-emerald-400" />
            )}
          </div>

          <h3 className="text-lg font-serif text-white font-medium flex items-center gap-2">
            <span>เข้าสู่ระบบตั้งค่าร้านค้า</span>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            กรุณาใส่รหัสผ่าน 4 หลัก เพื่อจัดการข้อมูลและสินค้า
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-4 my-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isSuccess
                    ? 'bg-emerald-400 scale-110 shadow-[0_0_12px_#34d399]'
                    : isFilled
                    ? 'bg-[#00B900] scale-110 shadow-[0_0_8px_#00B900]'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Success Message */}
        <div className="min-h-[24px] text-center mb-4">
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {isSuccess && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span>รหัสผ่านถูกต้อง กำลังเปิดระบบ...</span>
            </div>
          )}
        </div>

        {/* Virtual Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              disabled={isSuccess}
              className="h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-white font-mono text-lg font-semibold border border-zinc-800/80 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || pin.length === 0}
            className="h-12 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium border border-zinc-800/80 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
          >
            ล้าง
          </button>
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            disabled={isSuccess}
            className="h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-white font-mono text-lg font-semibold border border-zinc-800/80 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isSuccess || pin.length === 0}
            className="h-12 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
            title="ลบตัวสุดท้าย"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-zinc-900">
          <p className="text-[11px] text-zinc-500 font-light">
            สำหรับเจ้าของร้านและผู้ดูแลระบบเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
};
