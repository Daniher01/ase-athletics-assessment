// src/components/common/DeleteConfirmationModal.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  message: string;
  itemName: string;
  type?: 'danger' | 'warning';
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  message,
  itemName,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200',
          background: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-200',
          background: 'bg-yellow-50'
        };
      default:
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200',
          background: 'bg-red-50'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${styles.background}`}>
              <AlertTriangle size={24} className={styles.icon} />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-secondary-400 hover:text-secondary-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-secondary-600 mb-2">
            {message}
          </p>
          <div className={`p-3 rounded-lg ${styles.background} ${styles.border} border`}>
            <p className="font-medium text-secondary-900">
              {itemName}
            </p>
          </div>
          <p className="text-sm text-secondary-500 mt-3">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-secondary-50 border-t border-secondary-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-secondary-600 hover:text-secondary-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;