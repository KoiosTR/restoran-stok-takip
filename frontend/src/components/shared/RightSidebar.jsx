import React from 'react';
import { Users, X, Plus, Trash2, UserCheck, UserX } from 'lucide-react';

const RightSidebar = ({
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  employees,
  newEmployeeName,
  setNewEmployeeName,
  newEmployeeRole,
  setNewEmployeeRole,
  newEmployeePhone,
  setNewEmployeePhone,
  handleAddEmployee,
  handleToggleActive,
  requestDelete
}) => {
  return (
    <div className={`right-sidebar ${isRightSidebarOpen ? 'open' : ''}`}>
      <div className="right-sidebar-header">
        <h2><Users size={24} /> Ekip Yönetimi</h2>
        <button className="btn-icon" onClick={() => setIsRightSidebarOpen(false)}><X size={24} /></button>
      </div>
      <div className="right-sidebar-content">
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', boxShadow: 'none', border: '2px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Yeni Personel Ekle</h3>
          <form onSubmit={handleAddEmployee}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <input type="text" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Ad Soyad" required />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <select value={newEmployeeRole} onChange={e => setNewEmployeeRole(e.target.value)} required>
                <option value="Garson">Garson</option>
                <option value="Aşçı">Aşçı</option>
                <option value="Kasiyer">Kasiyer</option>
                <option value="Yönetici">Yönetici</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <input type="text" value={newEmployeePhone} onChange={e => setNewEmployeePhone(e.target.value)} placeholder="Telefon (Opsiyonel)" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Ekle
            </button>
          </form>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Mevcut Personel</h3>
        <div className="list-group">
          {employees.length === 0 ? (
            <p className="empty-state" style={{ padding: '1rem 0' }}>Kayıtlı personel yok.</p>
          ) : (
            employees.map(emp => (
              <div key={emp.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{emp.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({emp.role})</span>
                  </div>
                  <button onClick={() => requestDelete(emp.id, 'employee')} className="btn-icon danger"><Trash2 size={16} /></button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: emp.is_active ? '#38a169' : '#718096', fontWeight: '600' }}>
                    {emp.is_active ? '🟢 Mesaide' : '⚪ Çevrimdışı'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(emp)}
                    className={`btn ${emp.is_active ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {emp.is_active ? <><UserX size={14} /> Çıkış Yap</> : <><UserCheck size={14} /> Giriş Yap</>}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
