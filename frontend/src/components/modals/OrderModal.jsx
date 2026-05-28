import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat } from 'lucide-react';

const OrderModal = ({
  orderModal,
  setOrderModal,
  handleConfirmOrder
}) => {
  return (
    <AnimatePresence>
      {orderModal.isOpen && orderModal.product && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
            <h2><ChefHat size={24} color="var(--primary)" /> Kazana At</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <strong>{orderModal.product.name}</strong> ürününden mutfakta ne kadar kullanacaksınız?
            </p>
            <form onSubmit={handleConfirmOrder}>
              <div className="form-group">
                <label>Kullanılacak Miktar ({orderModal.product.unit})</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderModal.qty}
                  onChange={e => setOrderModal({ ...orderModal, qty: e.target.value })}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOrderModal({ isOpen: false, product: null, qty: '' })}>İptal</button>
                <button type="submit" className="btn btn-primary">Kazana At</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;
