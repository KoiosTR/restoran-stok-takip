import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({
  deleteModal,
  setDeleteModal,
  confirmDelete
}) => {
  return (
    <AnimatePresence>
      {deleteModal.isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
            <h2><Trash2 size={24} color="#e53e3e" /> Silme Onayı</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Bu {deleteModal.type === 'product' ? 'ürünü' : deleteModal.type === 'recipe' ? 'tarifi' : 'personeli'} silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ isOpen: false, id: null, type: 'product' })}>İptal</button>
              <button className="btn btn-primary" style={{ backgroundColor: '#e53e3e' }} onClick={confirmDelete}>Evet, Sil</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
