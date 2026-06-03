import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Utensils, Trash2 } from 'lucide-react';

const RecipeView = ({
  recipes,
  products,
  newRecipeName, setNewRecipeName,
  newRecipeDesc, setNewRecipeDesc,
  newRecipeIngredients, setNewRecipeIngredients,
  handleCreateRecipe,
  handleAddRecipeIngredient,
  handleCookRecipe,
  requestDelete
}) => {
  return (
    <motion.div key="recipes-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Promo Banner Recipes */}
      <div className="promo-banner" style={{ background: '#d6e4ff', border: '3px solid #111827', boxShadow: '6px 6px 0px #111827' }}>
        <div className="promo-banner-content">
          <h2 style={{ color: '#111827', fontWeight: '900' }}>Mükemmel Lezzetlerin Reçeteleri</h2>
          <p style={{ color: '#111827', fontWeight: '600', opacity: 0.85 }}>
            UARDAn. Her bir porsiyonun tam içeriğini belirleyerek maliyetleri gramı gramına eksiksiz hesaplayın.
          </p>
        </div>
        <div className="promo-banner-image bottom-aligned" style={{ borderLeft: 'none' }}>
          <img src="/4802466.jpg" alt="Decoration" style={{ objectFit: 'contain', width: '100%', height: '110%', padding: '0', maxHeight: '310px', transform: 'translateY(3px)' }} />
        </div>
      </div>

      <div className="grid">
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div className="card">
            <h2><Plus size={24} color="var(--primary)" /> Yeni Tarif Oluştur</h2>
            <form onSubmit={handleCreateRecipe}>
              <div className="form-group">
                <label>Tarif Adı</label>
                <input type="text" value={newRecipeName} onChange={e => setNewRecipeName(e.target.value)} placeholder="Örn: Domates Çorbası" required />
              </div>
              <div className="form-group">
                <label>Açıklama (Opsiyonel)</label>
                <input type="text" value={newRecipeDesc} onChange={e => setNewRecipeDesc(e.target.value)} placeholder="Örn: Akşam yemeği spesiyali" />
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>İçerikler</h3>
              {newRecipeIngredients.map((ing, idx) => (
                <div className="form-row" key={idx} style={{ marginBottom: '0.5rem' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <select value={ing.product_id} onChange={e => {
                      const newIngs = [...newRecipeIngredients];
                      newIngs[idx].product_id = e.target.value;
                      setNewRecipeIngredients(newIngs);
                    }} required>
                      <option value="">Ürün Seçin</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input type="number" step="0.01" value={ing.quantity} onChange={e => {
                      const newIngs = [...newRecipeIngredients];
                      newIngs[idx].quantity = e.target.value;
                      setNewRecipeIngredients(newIngs);
                    }} placeholder="Miktar" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <select value={ing.unit} onChange={e => {
                      const newIngs = [...newRecipeIngredients];
                      newIngs[idx].unit = e.target.value;
                      setNewRecipeIngredients(newIngs);
                    }} required>
                      <option value="kg">kg</option>
                      <option value="gram">g</option>
                      <option value="litre">l</option>
                      <option value="mililitre">ml</option>
                      <option value="adet">adet</option>
                      <option value="porsiyon">porsiyon</option>
                    </select>
                  </div>
                  <button type="button" className="btn-icon danger" onClick={() => {
                    setNewRecipeIngredients(newRecipeIngredients.filter((_, i) => i !== idx));
                  }}><Trash2 size={18} /></button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={handleAddRecipeIngredient} style={{ marginBottom: '1rem', width: '100%' }}>
                + İçerik Ekle
              </button>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Tarifi Kaydet</button>
            </form>
          </motion.div>
        </div>

        <div className="card">
          <h2><Utensils size={24} color="var(--primary)" /> Tarif Menüsü</h2>
          {recipes.length === 0 ? (
            <p className="empty-state">Henüz tarif eklenmemiş.</p>
          ) : (
            <div className="product-list">
              {recipes.map(recipe => (
                <div key={recipe.id} className="product-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>{recipe.name}</h3>
                      {recipe.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>{recipe.description}</p>}
                    </div>
                    <button onClick={() => requestDelete(recipe.id, 'recipe')} className="btn-icon danger"><Trash2 size={18} /></button>
                  </div>

                  <div className="list-group" style={{ width: '100%' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Gerekli Malzemeler:</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {recipe.ingredients.map(ing => {
                        const product = products.find(p => p.id === ing.product_id);
                        return (
                          <li key={ing.id}>{product ? product.name : 'Bilinmeyen Ürün'}: {ing.quantity} {ing.unit}</li>
                        );
                      })}
                    </ul>
                  </div>

                  <button onClick={() => handleCookRecipe(recipe)} className="btn btn-primary" style={{ width: '100%' }}>
                    👨‍🍳 Aşçıya Ver (Pişir)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeView;
