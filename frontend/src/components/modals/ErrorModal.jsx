import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ErrorModal = ({
  errorModal,
  setErrorModal
}) => {
  return (
    <AnimatePresence>
      {errorModal.isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
            <h2><AlertTriangle size={24} color="var(--danger)" /> Hata</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {errorModal.message}
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setErrorModal({ isOpen: false, message: '' })}>Tamam</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
