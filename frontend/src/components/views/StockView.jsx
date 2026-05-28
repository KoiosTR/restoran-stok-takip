import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Package, ChefHat, Pencil, Trash2, Minus } from 'lucide-react';

const StockView = ({
  products,
  newProductName, setNewProductName,
  newProductQuantity, setNewProductQuantity,
  newProductUnit, setNewProductUnit,
  newProductCategory, setNewProductCategory,
  newProductThreshold, setNewProductThreshold,
  handleAddProduct,
  quickItems,
  handleQuickSelect,
  openEditModal,
  handleQuickAdjustStock,
  requestDelete,
  orderModal
}) => {
  return (
    <motion.div key="stock-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Promo Banner Stock */}
      <div className="promo-banner" style={{ background: '#fdb000', border: '3px solid #111827', boxShadow: '6px 6px 0px #111827' }}>
        <div className="promo-banner-content">
          <h2 style={{ color: '#111827', fontWeight: '900' }}>Deponuz Tam Kontrolünüz Altında!</h2>
          <p style={{ color: '#111827', fontWeight: '600', opacity: 0.85 }}>
            Stoklarınızı anlık olarak takip edin, kritik seviyelere düşen ürünleri erkenden fark edin ve israfı önleyin. Akıllı envanter yönetimiyle işinizi daha da büyütün.
          </p>
        </div>
        <div className="promo-banner-image bottom-aligned" style={{ borderLeft: 'none' }}>
          <img src="/Adsız.png" alt="Decoration" style={{ objectFit: 'contain', width: '100%', height: '110%', padding: '0', maxHeight: '310px', transform: 'translateY(3px)' }} />
        </div>
      </div>

      <div className="grid">
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div className="card" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2><Plus size={24} color="var(--primary)" /> Yeni Ürün Ekle</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Hızlı Seçim:</label>
                <div className="quick-menu" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {quickItems.map(item => (
                    <button type="button" key={item.name} title={item.name} className="quick-btn" onClick={() => handleQuickSelect(item)} style={{ flexShrink: 0, width: '40px', height: '40px', fontSize: '1.2rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleAddProduct} style={{ flex: 1 }}>
                <div className="form-group">
                  <label>Ürün Adı</label>
                  <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="Örn: Un" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kategori</label>
                    <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)}>
                      <option value="Kuru Gıda">Kuru Gıda</option>
                      <option value="Et Ürünleri">Et Ürünleri</option>
                      <option value="İçecekler">İçecekler</option>
                      <option value="Temizlik Malzemeleri">Temizlik Malzemeleri</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Kritik Stok Uyarı Sınırı</label>
                    <input type="number" step="0.01" value={newProductThreshold} onChange={e => setNewProductThreshold(e.target.value)} placeholder="5.0" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Miktar</label>
                    <input type="number" step="0.01" value={newProductQuantity} onChange={e => setNewProductQuantity(e.target.value)} placeholder="0.00" required />
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {[1, 5, 10, 50].map(val => (
                        <button type="button" key={val} className="btn-icon" style={{ fontSize: '0.8rem', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: '8px' }} onClick={() => setNewProductQuantity(val)}>
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Birim</label>
                    <select value={newProductUnit} onChange={e => setNewProductUnit(e.target.value)}>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram (g)</option>
                      <option value="litre">Litre (l)</option>
                      <option value="mililitre">Mililitre (ml)</option>
                      <option value="adet">Adet</option>
                      <option value="porsiyon">Porsiyon</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Stoka Ekle</button>
              </form>
            </div>
          </motion.div>

          <motion.div className="card" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <h2><Package size={24} color="var(--primary)" /> Depo</h2>
            <Droppable droppableId="stock-list" isDropDisabled={true}>
              {(provided) => (
                <div className="product-list" ref={provided.innerRef} {...provided.droppableProps}>
                  {products.length === 0 ? (
                    <p className="empty-state">Kiler boş, hemen bir şeyler ekleyin!</p>
                  ) : (
                    <AnimatePresence>
                      {products.map((product, index) => (
                        <Draggable key={product.id.toString()} draggableId={product.id.toString()} index={index}>
                          {(provided, snapshot) => {
                            const style = {
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging ? "0 15px 30px rgba(214, 112, 89, 0.2)" : "",
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform || ''} rotate(-2deg)`
                                : provided.draggableProps.style?.transform,
                              opacity: snapshot.isDragging ? 0.95 : 1,
                              zIndex: snapshot.isDragging ? 999 : 'auto',
                              backgroundColor: snapshot.isDragging ? '#ffffff' : '#ffffff',
                              border: snapshot.isDragging ? '2px solid var(--primary)' : '1px solid var(--border)',
                            };
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`product-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                style={style}
                              >
                                <div className="product-info">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <span className="category-badge">{product.category || 'Diğer'}</span>
                                    <div className="product-name">{product.name}</div>
                                  </div>
                                  <div className={`product-stock ${product.quantity < (product.critical_threshold || 5) ? 'low-stock' : ''}`}>
                                    {product.quantity} {product.unit}
                                    {product.quantity < (product.critical_threshold || 5) && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#e53e3e' }}>Kritik Seviye!</span>}
                                  </div>
                                </div>
                                <div className="product-actions">
                                  <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginRight: '0.5rem' }}>
                                    <button type="button" onClick={() => handleQuickAdjustStock(product, -1)} className="btn-icon" style={{ borderRadius: 0, padding: '4px 8px' }}><Minus size={14} /></button>
                                    <button type="button" onClick={() => handleQuickAdjustStock(product, 1)} className="btn-icon" style={{ borderRadius: 0, padding: '4px 8px' }}><Plus size={14} /></button>
                                  </div>
                                  <button onClick={() => openEditModal(product)} className="btn-icon"><Pencil size={18} /></button>
                                  <button onClick={() => requestDelete(product.id, 'product')} className="btn-icon danger"><Trash2 size={18} /></button>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </motion.div>
        </div>

        {/* Right Side: Kitchen Area (Drop Zone) */}
        <motion.div className="card" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}><ChefHat size={28} color="var(--primary)" /> Mutfak</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ürünleri kullanmak için depodan buraya sürükleyin.</p>

          <Droppable droppableId="kitchen-zone">
            {(provided, snapshot) => (
              <div
                className={`kitchen-zone ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className="icon">🍲</div>
                {orderModal.isOpen && orderModal.product ? (
                  <>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{orderModal.product.name} Kazana Atılıyor...</h3>
                    <p style={{ fontSize: '0.9rem' }}>Miktar bekleniyor ⏳</p>
                  </>
                ) : snapshot.isDraggingOver ? (
                  <h3>Kullanmak için Bırakın!</h3>
                ) : (
                  <h3>Kazan Kaynıyor...</h3>
                )}
                <div style={{ display: 'none' }}>
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StockView;
