import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const colorMap = {
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: 'text-red-600',
      btn: 'bg-red-600 hover:bg-red-700 text-white',
      border: 'border-red-100'
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      border: 'border-amber-100'
    },
    info: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      icon: 'text-indigo-600',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      border: 'border-indigo-100'
    }
  };

  const colors = colorMap[type] || colorMap.danger;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${colors.bg}`}>
                <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8 font-medium">
              {message}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${colors.btn}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
