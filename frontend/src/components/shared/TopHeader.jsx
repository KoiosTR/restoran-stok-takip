import React from 'react';
import { Users } from 'lucide-react';

const TopHeader = ({ activeTab, isRightSidebarOpen, setIsRightSidebarOpen }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'stock': return 'Stok Yönetimi';
      case 'recipes': return 'Tarif Menüsü';
      case 'procurement': return 'Satın Alma';
      case 'costing': return 'Maliyet Analizi';
      default: return '';
    }
  };

  return (
    <div className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>{getTitle()}</h1>
      <button 
        className="btn btn-secondary" 
        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
      >
        <Users size={20} /> Ekip Yönetimi
      </button>
    </div>
  );
};

export default TopHeader;
