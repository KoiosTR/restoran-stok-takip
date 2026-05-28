import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EditProductModal = ({
  editingProduct,
  setEditingProduct,
  handleUpdateProduct,
  editName, setEditName,
  editCategory, setEditCategory,
  editThreshold, setEditThreshold,
  editQuantity, setEditQuantity,
  editUnit, setEditUnit
}) => {
  return (
    <AnimatePresence>
      {editingProduct && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
            <h2>Ürünü Düzenle</h2>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label>Ürün Adı</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                    <option value="Kuru Gıda">Kuru Gıda</option>
                    <option value="Et Ürünleri">Et Ürünleri</option>
                    <option value="İçecekler">İçecekler</option>
                    <option value="Temizlik Malzemeleri">Temizlik Malzemeleri</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Kritik Stok Uyarı Sınırı</label>
                  <input type="number" step="0.01" value={editThreshold} onChange={e => setEditThreshold(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Miktar</label>
                  <input type="number" step="0.01" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Birim</label>
                  <select value={editUnit} onChange={e => setEditUnit(e.target.value)}>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="litre">Litre (l)</option>
                    <option value="mililitre">Mililitre (ml)</option>
                    <option value="adet">Adet</option>
                    <option value="porsiyon">Porsiyon</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProductModal;
