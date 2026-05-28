import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import './index.css'

import Sidebar from './components/shared/Sidebar'
import TopHeader from './components/shared/TopHeader'
import RightSidebar from './components/shared/RightSidebar'

import EditProductModal from './components/modals/EditProductModal'
import OrderModal from './components/modals/OrderModal'
import DeleteConfirmModal from './components/modals/DeleteConfirmModal'
import ErrorModal from './components/modals/ErrorModal'

import StockView from './components/views/StockView'
import RecipeView from './components/views/RecipeView'
import ProcurementView from './components/views/ProcurementView'
import CostingView from './components/views/CostingView'

function App() {
  const [products, setProducts] = useState([])
  const [newProductName, setNewProductName] = useState('')
  const [newProductQuantity, setNewProductQuantity] = useState('')
  const [newProductUnit, setNewProductUnit] = useState('kg')
  const [newProductCategory, setNewProductCategory] = useState('Diğer')
  const [newProductThreshold, setNewProductThreshold] = useState('5')
  const [alerts, setAlerts] = useState([])

  const quickItems = [
    { emoji: '🌾', name: 'Un', category: 'Kuru Gıda', unit: 'kg' },
    { emoji: '🥩', name: 'Et', category: 'Et Ürünleri', unit: 'kg' },
    { emoji: '🍔', name: 'Kıyma', category: 'Et Ürünleri', unit: 'kg' },
    { emoji: '🍞', name: 'Ekmek', category: 'Kuru Gıda', unit: 'adet' },
    { emoji: '🧅', name: 'Soğan', category: 'Kuru Gıda', unit: 'kg' },
    { emoji: '🍅', name: 'Domates', category: 'Kuru Gıda', unit: 'kg' },
    { emoji: '🥔', name: 'Patates', category: 'Kuru Gıda', unit: 'kg' },
    { emoji: '🧀', name: 'Peynir', category: 'Diğer', unit: 'kg' },
    { emoji: '🥬', name: 'Marul', category: 'Kuru Gıda', unit: 'adet' },
    { emoji: '🍾', name: 'Sıvı Yağ', category: 'Kuru Gıda', unit: 'litre' },
    { emoji: '🧴', name: 'Deterjan', category: 'Temizlik Malzemeleri', unit: 'adet' },
    { emoji: '🥤', name: 'Kola', category: 'İçecekler', unit: 'adet' },
    { emoji: '💧', name: 'Su', category: 'İçecekler', unit: 'litre' },
    { emoji: '🍗', name: 'Tavuk', category: 'Et Ürünleri', unit: 'kg' },
    { emoji: '🥚', name: 'Yumurta', category: 'Kuru Gıda', unit: 'adet' }
  ];

  const handleQuickSelect = (item) => {
    setNewProductName(item.name);
    setNewProductCategory(item.category);
    setNewProductUnit(item.unit);
  }

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editThreshold, setEditThreshold] = useState('')

  // Order/Use Modal State
  const [orderModal, setOrderModal] = useState({ isOpen: false, product: null, qty: '' })

  // Custom Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: 'product' }) // type can be 'product' or 'recipe'

  // Custom Error Modal State
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' })
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  // Tabs & Recipes State
  const [activeTab, setActiveTab] = useState('stock') // 'stock', 'recipes', or 'pos'
  const [recipes, setRecipes] = useState([])

  // Procurement State
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])

  // Personnel State
  const [employees, setEmployees] = useState([])
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const [newEmployeeRole, setNewEmployeeRole] = useState('Garson')
  const [newEmployeePhone, setNewEmployeePhone] = useState('')

  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierContact, setNewSupplierContact] = useState('')

  const [newPOItems, setNewPOItems] = useState([])
  const [selectedSupplierId, setSelectedSupplierId] = useState('')

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName) return;
    try {
      await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName, contact_info: newSupplierContact })
      });
      setNewSupplierName('');
      setNewSupplierContact('');
      fetchSuppliers();
    } catch (err) {
      console.error(err);
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeName || !newEmployeeRole) return;
    try {
      await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEmployeeName, role: newEmployeeRole, phone: newEmployeePhone })
      });
      setNewEmployeeName('');
      setNewEmployeePhone('');
      setNewEmployeeRole('Garson');
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  }

  const handleToggleActive = async (employee) => {
    try {
      await fetch(`${API_URL}/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !employee.is_active })
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  }

  const handleCompletePO = async (po_id) => {
    try {
      await fetch(`${API_URL}/purchase_orders/${po_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Tamamlandı' })
      });
      fetchPurchaseOrders();
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  }

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId || newPOItems.length === 0) return;
    try {
      await fetch(`${API_URL}/purchase_orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: parseInt(selectedSupplierId),
          status: 'Bekliyor',
          items: newPOItems
        })
      });
      setNewPOItems([]);
      fetchPurchaseOrders();
    } catch (err) {
      console.error(err);
    }
  }

  // New Recipe Form State
  const [newRecipeName, setNewRecipeName] = useState('')
  const [newRecipeDesc, setNewRecipeDesc] = useState('')
  const [newRecipeIngredients, setNewRecipeIngredients] = useState([]) // {product_id, quantity, unit}

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      const data = await res.json()
      // Sort by ID to keep order consistent
      setProducts(data.sort((a, b) => a.id - b.id))
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`)
      const data = await res.json()
      setRecipes(data.sort((a, b) => a.id - b.id))
    } catch (error) {
      console.error('Error fetching recipes:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/suppliers`)
      const data = await res.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/purchase_orders`)
      const data = await res.json()
      // Show newest first
      setPurchaseOrders(data.sort((a, b) => b.id - a.id))
    } catch (error) {
      console.error('Error fetching POs:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employees`)
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchRecipes()
    fetchSuppliers()
    fetchPurchaseOrders()
    fetchEmployees()
    const interval = setInterval(() => {
      fetchProducts()
      fetchRecipes()
      fetchSuppliers()
      fetchPurchaseOrders()
      fetchEmployees()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProductName || !newProductQuantity) return

    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          quantity: parseFloat(newProductQuantity),
          unit: newProductUnit,
          category: newProductCategory,
          critical_threshold: parseFloat(newProductThreshold) || 5.0
        })
      })
      setNewProductName('')
      setNewProductQuantity('')
      setNewProductCategory('Diğer')
      setNewProductThreshold('5')
      fetchProducts()
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const requestDelete = (id, type = 'product') => {
    setDeleteModal({ isOpen: true, id, type })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      if (deleteModal.type === 'product') {
        await fetch(`${API_URL}/products/${deleteModal.id}`, { method: 'DELETE' })
        fetchProducts()
      } else if (deleteModal.type === 'recipe') {
        await fetch(`${API_URL}/recipes/${deleteModal.id}`, { method: 'DELETE' })
        fetchRecipes()
      } else if (deleteModal.type === 'employee') {
        await fetch(`${API_URL}/employees/${deleteModal.id}`, { method: 'DELETE' })
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
    setDeleteModal({ isOpen: false, id: null, type: 'product' })
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setEditName(product.name)
    setEditQuantity(product.quantity)
    setEditUnit(product.unit)
    setEditCategory(product.category || 'Diğer')
    setEditThreshold(product.critical_threshold || 5.0)
  }

  const handleQuickAdjustStock = async (product, delta) => {
    const newQty = product.quantity + delta;
    if (newQty < 0) return;
    try {
      if (newQty === 0) {
        await fetch(`${API_URL}/products/${product.id}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_URL}/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: product.name,
            quantity: newQty,
            unit: product.unit,
            category: product.category,
            critical_threshold: product.critical_threshold
          })
        });
      }
      fetchProducts();
    } catch (error) {
      console.error('Error updating:', error);
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      const qty = parseFloat(editQuantity);
      if (qty <= 0) {
        await fetch(`${API_URL}/products/${editingProduct.id}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editName,
            quantity: qty,
            unit: editUnit,
            category: editCategory,
            critical_threshold: parseFloat(editThreshold) || 5.0
          })
        });
      }
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  const handleOrder = async (productId, qty) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product_id: productId, quantity: qty }]
        })
      })
      const data = await res.json()
      if (res.status !== 200) throw new Error(data.detail || "Yeterli stok yok!")

      if (data.alerts && data.alerts.length > 0) {
        setAlerts(prev => [...prev, ...data.alerts])
        setTimeout(() => setAlerts([]), 10000)
      }
      fetchProducts()
    } catch (error) {
      setErrorModal({ isOpen: true, message: error.message || "Yeterli stok yok!" })
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    // Eğer ürün mutfak alanına (kitchen-zone) sürüklendiyse
    if (source.droppableId === 'stock-list' && destination.droppableId === 'kitchen-zone') {
      const product = products.find(p => p.id.toString() === draggableId)
      if (!product) return;

      setOrderModal({ isOpen: true, product, qty: '1' })
    }
  }

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    const qty = parseFloat(orderModal.qty);
    if (qty > 0 && !isNaN(qty)) {
      handleOrder(orderModal.product.id, qty);
    }
    setOrderModal({ isOpen: false, product: null, qty: '' });
  }

  const handleAddRecipeIngredient = () => {
    setNewRecipeIngredients([...newRecipeIngredients, { product_id: products[0]?.id || '', quantity: '', unit: 'kg' }])
  }

  const handleCreateRecipe = async (e) => {
    e.preventDefault()
    if (!newRecipeName || newRecipeIngredients.length === 0) {
      setErrorModal({ isOpen: true, message: "Lütfen tarif adını ve en az bir içerik girin." })
      return
    }

    try {
      await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRecipeName,
          description: newRecipeDesc,
          ingredients: newRecipeIngredients.map(ing => ({
            product_id: parseInt(ing.product_id),
            quantity: parseFloat(ing.quantity),
            unit: ing.unit
          }))
        })
      })
      setNewRecipeName('')
      setNewRecipeDesc('')
      setNewRecipeIngredients([])
      fetchRecipes()
    } catch (error) {
      console.error('Error creating recipe:', error)
    }
  }

  const handleCookRecipe = async (recipe) => {
    try {
      const res = await fetch(`${API_URL}/recipes/${recipe.id}/cook`, { method: 'POST' })
      const data = await res.json()
      if (res.status === 400) {
        setErrorModal({ isOpen: true, message: data.detail })
      } else if (res.status === 200) {
        // Success
        fetchProducts()
      }
    } catch (error) {
      console.error('Error cooking recipe:', error)
    }
  }

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} employees={employees} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopHeader activeTab={activeTab} isRightSidebarOpen={isRightSidebarOpen} setIsRightSidebarOpen={setIsRightSidebarOpen} />
          
          <DragDropContext onDragEnd={onDragEnd}>
            <main className="main-panel" style={{ position: 'relative' }}>
              <AnimatePresence>
                {alerts.length > 0 && (
                  <motion.div
                    className="alerts-container"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {alerts.map((alert, idx) => (
                      <div key={idx} className="alert-notification">
                        <AlertTriangle size={20} color="var(--danger)" />
                        <div className="alert-text">{alert}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                {activeTab === 'stock' && (
                  <StockView 
                    products={products}
                    newProductName={newProductName} setNewProductName={setNewProductName}
                    newProductQuantity={newProductQuantity} setNewProductQuantity={setNewProductQuantity}
                    newProductUnit={newProductUnit} setNewProductUnit={setNewProductUnit}
                    newProductCategory={newProductCategory} setNewProductCategory={setNewProductCategory}
                    newProductThreshold={newProductThreshold} setNewProductThreshold={setNewProductThreshold}
                    handleAddProduct={handleAddProduct}
                    quickItems={quickItems}
                    handleQuickSelect={handleQuickSelect}
                    openEditModal={openEditModal}
                    handleQuickAdjustStock={handleQuickAdjustStock}
                    requestDelete={requestDelete}
                    orderModal={orderModal}
                  />
                )}

                {activeTab === 'recipes' && (
                  <RecipeView
                    recipes={recipes}
                    products={products}
                    newRecipeName={newRecipeName} setNewRecipeName={setNewRecipeName}
                    newRecipeDesc={newRecipeDesc} setNewRecipeDesc={setNewRecipeDesc}
                    newRecipeIngredients={newRecipeIngredients} setNewRecipeIngredients={setNewRecipeIngredients}
                    handleCreateRecipe={handleCreateRecipe}
                    handleAddRecipeIngredient={handleAddRecipeIngredient}
                    handleCookRecipe={handleCookRecipe}
                    requestDelete={requestDelete}
                  />
                )}

                {activeTab === 'procurement' && (
                  <ProcurementView
                    suppliers={suppliers}
                    products={products}
                    purchaseOrders={purchaseOrders}
                    newSupplierName={newSupplierName} setNewSupplierName={setNewSupplierName}
                    newSupplierContact={newSupplierContact} setNewSupplierContact={setNewSupplierContact}
                    handleAddSupplier={handleAddSupplier}
                    handleCreatePO={handleCreatePO}
                    selectedSupplierId={selectedSupplierId} setSelectedSupplierId={setSelectedSupplierId}
                    newPOItems={newPOItems} setNewPOItems={setNewPOItems}
                    handleCompletePO={handleCompletePO}
                  />
                )}

                {activeTab === 'costing' && (
                  <CostingView products={products} recipes={recipes} />
                )}
              </AnimatePresence>
            </main>


          </DragDropContext>
        </div>

        {/* Right Sidebar for Personnel */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 450, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                height: '100%',
                background: '#fdfbf7',
                borderLeft: '4px solid #111827',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <div style={{ width: '446px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '4px solid #111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FF595E' }}>
                  <h2 style={{ margin: 0, color: '#111827', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}><Users size={24} /> Personel Yönetimi</h2>
                  <button onClick={() => setIsRightSidebarOpen(false)} className="btn-icon" style={{ background: '#111827', color: '#fff', borderRadius: '50%' }}>✖</button>
                </div>

                <div className="sidebar-scrollable" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Promo Banner Personnel (decoration.png at bottom) */}
                  <div style={{
                    background: '#ffffff',
                    border: '3px solid #111827',
                    boxShadow: '4px 4px 0px #111827',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                  }}>
                    <div style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
                      <h3 style={{ color: '#111827', fontWeight: '900', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Güçlü Ekip!</h3>
                      <p style={{ color: '#111827', fontWeight: '600', opacity: 0.85, fontSize: '0.9rem', margin: 0 }}>
                        Ekibinizin mesai durumunu ve performansını yönetin.
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '140px', overflow: 'hidden' }}>
                      <img src="/decoration.png" alt="Decoration" style={{ objectFit: 'contain', width: '100%', height: '110%', padding: '0', display: 'block', transform: 'translateY(3px)' }} />
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={20} color="var(--primary)" /> Yeni Personel Ekle</h3>
                    <form onSubmit={handleAddEmployee}>
                      <div className="form-group">
                        <label>Ad Soyad</label>
                        <input type="text" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Görev</label>
                        <select value={newEmployeeRole} onChange={e => setNewEmployeeRole(e.target.value)}>
                          <option value="Garson">Garson</option>
                          <option value="Aşçı">Aşçı</option>
                          <option value="Kasiyer">Kasiyer</option>
                          <option value="Müdür">Müdür</option>
                          <option value="Bulaşıkçı">Bulaşıkçı</option>
                          <option value="Kurye">Kurye</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Telefon</label>
                        <input type="text" value={newEmployeePhone} onChange={e => setNewEmployeePhone(e.target.value)} placeholder="05XX XXX XX XX" />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Ekle</button>
                    </form>
                  </div>

                  <div className="card" style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} color="var(--primary)" /> Personeller</h3>
                    {employees.length === 0 ? (
                      <p className="empty-state" style={{ padding: '1rem' }}>Personel bulunamadı.</p>
                    ) : (
                      <div className="product-list">
                        {employees.map(emp => (
                          <div key={emp.id} className="product-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                            <div>
                              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'block' }}>{emp.name}</strong>
                              <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>{emp.role}</span>
                              <div style={{ marginTop: '0.5rem' }}>
                                <button
                                  onClick={() => handleToggleActive(emp)}
                                  className="btn"
                                  style={{
                                    backgroundColor: emp.is_active ? '#10b981' : '#6b7280',
                                    color: 'white',
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    borderRadius: '12px'
                                  }}>
                                  {emp.is_active ? '✅ Mesaide' : '❌ Çıktı'}
                                </button>
                              </div>
                            </div>
                            <button onClick={() => requestDelete(emp.id, 'employee')} className="btn-icon danger"><Trash2 size={18} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
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
      {/* Order / Use Modal */}
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
      {/* Delete Confirmation Modal */}
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
      {/* Error Modal */}
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
    </div>
  )
}

export default App
