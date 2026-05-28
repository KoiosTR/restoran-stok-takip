import React from 'react';
import { Utensils, Package, BookOpen, ShoppingCart, PieChart } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, employees }) => {
  return (
    <nav className="sidebar">
      <div className="logo">
        <Utensils size={32} /> <span>Softnet</span>
      </div>
      <button className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>
        <Package size={24} /> <span>Stok Yönetimi</span>
      </button>
      <button className={`nav-item ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>
        <BookOpen size={24} /> <span>Tarif Menüsü</span>
      </button>
      <button className={`nav-item ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')}>
        <ShoppingCart size={24} /> <span>Satın Alma</span>
      </button>
      <button className={`nav-item ${activeTab === 'costing' ? 'active' : ''}`} onClick={() => setActiveTab('costing')}>
        <PieChart size={24} /> <span>Maliyet Analizi</span>
      </button>

      <div style={{ flex: 1 }}></div>

      {(() => {
        const activeEmployees = employees.filter(emp => emp.is_active);
        const currentWorker = activeEmployees.length > 0 ? activeEmployees[activeEmployees.length - 1] : null;
        if (!currentWorker) return null;

        return (
          <div className="active-user-info">
            <div className="user-avatar">
              <div className="online-indicator"></div>
              {currentWorker.name.charAt(0)}
            </div>
            <div className="user-details">
              <div className="user-name">{currentWorker.name} ({currentWorker.role})</div>
              <div className="user-time">Giriş: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        );
      })()}
    </nav>
  );
};

export default Sidebar;
