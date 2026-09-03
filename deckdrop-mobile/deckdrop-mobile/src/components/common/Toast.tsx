import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div
            id="toast-notification"
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold pointer-events-auto backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-[#E23B2E] text-white border-red-700 shadow-red-500/20'
                : toast.type === 'info'
                ? 'bg-[#35322E] text-[#FFFDF8] border-stone-700 shadow-stone-900/30'
                : 'bg-[#2A5C3D] text-white border-emerald-700 shadow-emerald-900/30'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : toast.type === 'info' ? (
              <Info size={16} className="shrink-0 text-amber-300" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
