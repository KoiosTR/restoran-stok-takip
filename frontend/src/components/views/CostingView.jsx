import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend } from 'recharts';

const CostingView = ({ products, recipes }) => {
  return (
    <motion.div key="costing-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Dashboard Grafikleri */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Grafik 1: Kategori Bazlı Depo Maliyet Dağılımı */}
        <div className="card" style={{ background: '#fdfbf7' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '900' }}><PieChartIcon width={20} height={20} /> Depo Maliyet Dağılımı</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <RePieChart>
                <defs>
                  <filter id="retro-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="5" dy="5" stdDeviation="0" floodColor="#111827" floodOpacity="1" />
                  </filter>
                </defs>
                <Pie data={(() => {
                  const categoryValues = products.reduce((acc, p) => {
                    const value = p.quantity * (p.last_unit_price || 0);
                    if (value > 0) acc[p.category] = (acc[p.category] || 0) + value;
                    return acc;
                  }, {});
                  return Object.keys(categoryValues).map(key => ({ name: key, value: categoryValues[key] }));
                })()} cx="50%" cy="50%" innerRadius={40} outerRadius={100} paddingAngle={0} dataKey="value" stroke="#111827" strokeWidth={3} filter="url(#retro-shadow)">
                  {
                    (() => {
                      const categoryValues = products.reduce((acc, p) => {
                        const value = p.quantity * (p.last_unit_price || 0);
                        if (value > 0) acc[p.category] = (acc[p.category] || 0) + value;
                        return acc;
                      }, {});
                      return Object.keys(categoryValues).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#F4A261'][index % 6]} />
                      ))
                    })()
                  }
                </Pie>
                <RechartsTooltip formatter={(value) => `${value.toFixed(2)} TL`} contentStyle={{ borderRadius: '0', border: '3px solid #111827', background: '#fff', fontWeight: 'bold', boxShadow: '4px 4px 0px #111827' }} />
                <Legend wrapperStyle={{ fontWeight: '800' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: En Maliyetli 5 Tarif */}
        <div className="card" style={{ background: '#fdfbf7' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '900' }}><Utensils size={20} color="var(--primary)" /> En Yüksek Maliyetli 5 Tarif</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={(() => {
                return recipes.map(recipe => {
                  let cost = 0;
                  recipe.ingredients.forEach(ing => {
                    const p = products.find(p => p.id === ing.product_id);
                    if (p && p.last_unit_price) {
                      let multiplier = 1;
                      if (p.unit === 'kg' && ing.unit === 'gram') multiplier = 0.001;
                      if (p.unit === 'litre' && ing.unit === 'mililitre') multiplier = 0.001;
                      if (p.unit === 'gram' && ing.unit === 'kg') multiplier = 1000;
                      cost += (ing.quantity * multiplier) * p.last_unit_price;
                    }
                  });
                  return { name: recipe.name, Maliyet: parseFloat(cost.toFixed(2)) };
                }).sort((a, b) => b.Maliyet - a.Maliyet).slice(0, 5);
              })()}>
                <defs>
                  <filter id="retro-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="5" dy="5" stdDeviation="0" floodColor="#111827" floodOpacity="1" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111827" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="#111827" fontSize={12} fontWeight="bold" tickLine={false} axisLine={{ strokeWidth: 3 }} />
                <YAxis stroke="#111827" fontSize={12} fontWeight="bold" tickLine={false} axisLine={{ strokeWidth: 3 }} tickFormatter={(val) => `₺${val}`} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '0', border: '3px solid #111827', background: '#fff', fontWeight: 'bold', boxShadow: '4px 4px 0px #111827' }} formatter={(value) => `${value} TL`} />
                <Bar dataKey="Maliyet" stroke="#111827" strokeWidth={3} filter="url(#retro-shadow)">
                  {
                    (() => {
                      const cColors = ['#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF595E'];
                      return [...Array(5)].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={cColors[index % 5]} />
                      ))
                    })()
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grafik 3: Stok Durumu Area Chart */}
      <div className="card" style={{ background: '#fdfbf7' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '900' }}><AlertTriangle size={20} color="#FF595E" /> Stok Uyarı Grafiği</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={(() => {
              return products
                .filter(p => p.quantity <= p.critical_threshold * 2)
                .sort((a, b) => a.quantity - b.quantity)
                .slice(0, 10)
                .map(p => ({
                  name: p.name,
                  Miktar: p.quantity,
                  Kritik_Sinir: p.critical_threshold
                }));
            })()}>
              <defs>
                <filter id="retro-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="5" dy="5" stdDeviation="0" floodColor="#111827" floodOpacity="1" />
                </filter>
                <linearGradient id="colorMiktarRetro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1982C4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1982C4" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#111827" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#111827" fontSize={12} fontWeight="bold" tickLine={false} axisLine={{ strokeWidth: 3 }} />
              <YAxis stroke="#111827" fontSize={12} fontWeight="bold" tickLine={false} axisLine={{ strokeWidth: 3 }} />
              <RechartsTooltip cursor={{ stroke: '#111827', strokeWidth: 3 }} contentStyle={{ borderRadius: '0', border: '3px solid #111827', background: '#fff', fontWeight: 'bold', boxShadow: '4px 4px 0px #111827' }} />
              <Legend wrapperStyle={{ fontWeight: '800' }} />
              <Area type="step" dataKey="Kritik_Sinir" stroke="#FF595E" strokeWidth={3} fill="transparent" strokeDasharray="5 5" name="Kritik Sınır" />
              <Area type="step" dataKey="Miktar" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorMiktarRetro)" filter="url(#retro-shadow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2><PieChartIcon size={24} color="var(--primary)" /> Tarif Birim Porsiyon Maliyetleri (Detaylı Liste)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Aşağıdaki listede tariflerinizin, ürünlerin en son satın alma fiyatlarına göre hesaplanmış anlık birim porsiyon maliyetlerini görebilirsiniz.
        </p>

        {recipes.length === 0 ? (
          <p className="empty-state">Henüz tarif eklenmemiş.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recipes.map(recipe => {
              let totalCost = 0;
              recipe.ingredients.forEach(ing => {
                const product = products.find(p => p.id === ing.product_id);
                if (product && product.last_unit_price) {
                  let multiplier = 1;
                  if (product.unit === 'kg' && ing.unit === 'gram') multiplier = 0.001;
                  if (product.unit === 'litre' && ing.unit === 'mililitre') multiplier = 0.001;
                  if (product.unit === 'gram' && ing.unit === 'kg') multiplier = 1000;

                  totalCost += (ing.quantity * multiplier) * product.last_unit_price;
                }
              });

              return (
                <div key={recipe.id} className="list-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                  <div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{recipe.name}</strong>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>İçerik: {recipe.ingredients.length} malzeme</div>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>
                    ₺{totalCost.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CostingView;
