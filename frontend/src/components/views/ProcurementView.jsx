import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart } from 'lucide-react';

const ProcurementView = ({
  suppliers,
  products,
  purchaseOrders,
  newSupplierName, setNewSupplierName,
  newSupplierContact, setNewSupplierContact,
  handleAddSupplier,
  handleCreatePO,
  selectedSupplierId, setSelectedSupplierId,
  newPOItems, setNewPOItems,
  handleCompletePO
}) => {
  return (
    <motion.div key="procurement-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid">
      <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card">
          <h2><Plus size={24} color="var(--primary)" /> Tedarikçi Ekle</h2>
          <form onSubmit={handleAddSupplier}>
            <div className="form-group">
              <label>Firma Adı</label>
              <input type="text" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>İletişim Bilgisi / Notlar</label>
              <input type="text" value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Tedarikçi Kaydet</button>
          </form>
        </div>

        <div className="card">
          <h2>Tedarikçi Listesi</h2>
          {suppliers.length === 0 ? (
            <p className="empty-state">Henüz kayıtlı firma yok.</p>
          ) : (
            <div className="product-list">
              {suppliers.map(sup => (
                <div key={sup.id} className="product-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{sup.name}</div>
                  {sup.contact_info && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{sup.contact_info}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <motion.div className="card" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <h2><ShoppingCart size={24} color="var(--primary)" /> Satın Alma ve İrsaliyeler</h2>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fcfcfc', borderRadius: '16px', border: '2px dashed var(--border)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Yeni Sipariş / İrsaliye Gir</h3>
          <form onSubmit={handleCreatePO}>
            <div className="form-group">
              <label>Tedarikçi Seç</label>
              <select value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} required>
                <option value="">Firma Seçiniz...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="list-group">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Ürün</label>
                  <select id="po_product" defaultValue="">
                    <option value="">Seç...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Miktar</label>
                  <input type="number" step="0.01" id="po_qty" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Birim Fiyat</label>
                  <input type="number" step="0.01" id="po_unit_price" placeholder="Opsiyonel" />
                </div>
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label>&nbsp;</label>
                  <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => {
                    const pId = document.getElementById('po_product').value;
                    const qty = document.getElementById('po_qty').value;
                    const price = document.getElementById('po_unit_price').value;
                    if (pId && qty) {
                      const product = products.find(p => p.id === parseInt(pId));
                      setNewPOItems([...newPOItems, {
                        product_id: product.id,
                        quantity: parseFloat(qty),
                        name: product.name,
                        unit: product.unit,
                        unit_price: price ? parseFloat(price) : null
                      }]);
                      document.getElementById('po_product').value = '';
                      document.getElementById('po_qty').value = '';
                      document.getElementById('po_unit_price').value = '';
                    }
                  }}>+</button>
                </div>
              </div>

              {newPOItems.length > 0 && (
                <ul style={{ margin: '1rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {newPOItems.map((item, idx) => (
                    <li key={idx}>
                      {item.name}: {item.quantity} {item.unit} {item.unit_price ? `(@ ${item.unit_price} TL)` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Siparişi (İrsaliyeyi) Kaydet</button>
          </form>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Sipariş Geçmişi</h3>
          {purchaseOrders.length === 0 ? (
            <p className="empty-state">Kayıt bulunamadı.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {purchaseOrders.map(po => {
                const supplier = suppliers.find(s => s.id === po.supplier_id);
                return (
                  <div key={po.id} className="list-group" style={{ backgroundColor: po.status === 'Tamamlandı' ? '#f0fdf4' : '#fcfcfc', margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{supplier ? supplier.name : 'Bilinmeyen'}</strong>
                      <span style={{ fontSize: '0.85rem', color: po.status === 'Tamamlandı' ? '#166534' : '#b45309', fontWeight: '800' }}>{po.status}</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                      {po.items.map(item => {
                        const product = products.find(p => p.id === item.product_id);
                        return <li key={item.id}>{product ? product.name : 'Ürün'}: {item.quantity} {item.unit}</li>
                      })}
                    </ul>
                    {po.status !== 'Tamamlandı' && (
                      <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleCompletePO(po.id)}>
                        Teslim Alındı (Stoğa Ekle)
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProcurementView;
