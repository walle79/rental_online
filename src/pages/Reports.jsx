import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Receipt, CheckCircle2, Check, X, Edit3, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const fmtVND = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
};

const Reports = ({ bills = [] }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [paidElectricity, setPaidElectricity] = useState('');
  const [paidWater, setPaidWater] = useState('');
  const [extraExpenses, setExtraExpenses] = useState([]);
  
  const [isEditingElectricity, setIsEditingElectricity] = useState(false);
  const [isEditingWater, setIsEditingWater] = useState(false);
  const [tempElectricity, setTempElectricity] = useState('');
  const [tempWater, setTempWater] = useState('');

  const [yearlyExpensesMap, setYearlyExpensesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // ── Sync with Firestore (Entire Year) ──────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    // Fetch all for current year using prefix range if no 'year' field or better yet, query by ID range
    const colRef = collection(db, 'monthly_expenses');
    // IDs are like "2026_3". Lexicographically "2026_" to "2026_\uf8ff" works.
    const yearPrefix = `${selectedYear}_`;
    const q = query(
      colRef, 
      where('__name__', '>=', yearPrefix),
      where('__name__', '<=', yearPrefix + '\uf8ff')
    );

    const unsubscribe = onSnapshot(q, (querySnap) => {
      const map = {};
      querySnap.forEach(doc => {
        const [y, m] = doc.id.split('_');
        if (parseInt(y) === selectedYear) {
          map[parseInt(m)] = doc.data();
        }
      });
      setYearlyExpensesMap(map);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedYear]);

  // Derived state for selected month - Sync to local state for editing
  useEffect(() => {
    const currentMonthData = yearlyExpensesMap[selectedMonth] || {};
    setPaidElectricity(currentMonthData.electricity || '');
    setPaidWater(currentMonthData.water || '');
    setExtraExpenses(currentMonthData.extraExpenses || []);
  }, [yearlyExpensesMap, selectedMonth]);

  const saveToDB = async (updates) => {
    const docId = `${selectedYear}_${selectedMonth}`;
    const docRef = doc(db, 'monthly_expenses', docId);
    
    // Get latest state values safely
    // Since we are calling this from inside onClick, we should be careful about state staleness
    // but here we are usually passing the 'new' value in updates.
    
    setDoc(docRef, {
      electricity: updates.electricity !== undefined ? updates.electricity : paidElectricity,
      water: updates.water !== undefined ? updates.water : paidWater,
      extraExpenses: updates.extraExpenses !== undefined ? updates.extraExpenses : extraExpenses
    }, { merge: true }).catch(err => console.error('Error saving:', err));
  };
  
  const numElectricity = parseInt(String(paidElectricity).replace(/\D/g, '')) || 0;
  const numWater = parseInt(String(paidWater).replace(/\D/g, '')) || 0;
  
  const validExtraExpenses = extraExpenses
    .filter(s => s.name.trim() !== '' && (Number(s.cost) || 0) > 0)
    .map(s => ({ ...s, name: s.name, cost: Math.abs(parseInt(String(s.cost).replace(/\D/g, '')) || 0) }));
  const extraExpensesTotal = validExtraExpenses.reduce((sum, s) => sum + s.cost, 0);

  const totalExpenses = numElectricity + numWater + extraExpensesTotal;

  // ── Only count PAID bills ──────────────────────────────────────────────────
  const paidBills = useMemo(() => bills.filter(b => b.status === 'paid'), [bills]);

  // ── Monthly breakdown for trend ──────────────────────────────────────────
  const monthlyTrendData = useMemo(() => {
    return MONTH_NAMES.map((name, idx) => {
      const m = idx + 1;
      const revenue = paidBills
        .filter(b => b.year === selectedYear && b.month === m)
        .reduce((sum, b) => sum + b.total, 0);
      return { name, revenue, month: m };
    });
  }, [paidBills, selectedYear]);

  // ── Stats for selected period ──────────────────────────────────────────────
  const { growthPct, thisMonthRevenue, prevM, prevY } = useMemo(() => {
    const thisMonth = paidBills
      .filter(b => b.year === selectedYear && b.month === selectedMonth)
      .reduce((sum, b) => sum + b.total, 0);

    const pm = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const py = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

    const prevMonth = paidBills
      .filter(b => b.year === py && b.month === pm)
      .reduce((sum, b) => sum + b.total, 0);

    const pct = prevMonth === 0 ? null : ((thisMonth - prevMonth) / prevMonth) * 100;
    return { growthPct: pct, thisMonthRevenue: thisMonth, prevM: pm, prevY: py };
  }, [paidBills, selectedYear, selectedMonth]);

  const yearlyRevenue = useMemo(() =>
    paidBills
      .filter(b => b.year === selectedYear)
      .reduce((sum, b) => sum + b.total, 0),
    [paidBills, selectedYear]);

  // Aggregate yearly expenses
  const yearlyExpensesTotal = useMemo(() => {
    return Object.values(yearlyExpensesMap).reduce((sum, monthData) => {
      const elec = parseInt(String(monthData.electricity || '').replace(/\D/g, '')) || 0;
      const water = parseInt(String(monthData.water || '').replace(/\D/g, '')) || 0;
      const extras = (monthData.extraExpenses || [])
        .filter(s => s.name.trim() !== '' && (Number(s.cost) || 0) > 0)
        .reduce((sSum, s) => sSum + (parseInt(String(s.cost).replace(/\D/g, '')) || 0), 0);
      return sum + elec + water + extras;
    }, 0);
  }, [yearlyExpensesMap]);

  const yearlyProfit = yearlyRevenue - yearlyExpensesTotal;

  const isPositive = growthPct !== null && growthPct >= 0;
  const growthColor = growthPct === null ? '#94a3b8' : isPositive ? '#22c55e' : '#f43f5e';

  const pendingTotal = useMemo(() =>
    bills
      .filter(b => b.status === 'pending' && b.year === selectedYear && b.month === selectedMonth)
      .reduce((sum, b) => sum + b.total, 0),
    [bills, selectedYear, selectedMonth]);

  const paidCount = paidBills.filter(b => b.year === selectedYear && b.month === selectedMonth).length;
  const pendingCount = bills.filter(b => b.status === 'pending' && b.year === selectedYear && b.month === selectedMonth).length;

  const currentMonthName = MONTH_NAMES[selectedMonth - 1];

  // ── Expense Breakdown Data ────────────────────────────────────────────────
  const expenseBreakdown = [
    { name: 'Tiền điện', value: numElectricity, color: '#fb7185' },
    { name: 'Tiền nước', value: numWater, color: '#60a5fa' },
    ...validExtraExpenses.map((ex, i) => ({
      name: ex.name,
      value: ex.cost,
      color: [`#f472b6`, `#fbbf24`, `#a78bfa`, `#4ade80`, `#2dd4bf`][i % 5]
    }))
  ].filter(d => d.value > 0);

  const profit = thisMonthRevenue - totalExpenses;

  return (
    <div className="animate-slide-up pb-32">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-black text-gradient">Thống kê</h1>
        
        <div className="flex gap-2">
          {/* Month Select */}
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#f97316',
              fontSize: '11px', fontWeight: 700,
              padding: '6px 10px',
              outline: 'none', cursor: 'pointer',
              minWidth: '85px'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m} className="bg-[#1e293b]">Tháng {m}</option>
            ))}
          </select>

          {/* Year Select */}
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#f97316',
              fontSize: '11px', fontWeight: 700,
              padding: '6px 10px',
              outline: 'none', cursor: 'pointer',
              minWidth: '70px'
            }}
          >
            {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036].map(y => (
              <option key={y} value={y} className="bg-[#1e293b]">{y}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Simplified Yearly Overview (3 Rows) */}
      <div className="glass-card mb-6 p-5">
        <div className="mb-2">
          <p className="text-[18px] font-black uppercase tracking-[0.05em] text-primary">NĂM {selectedYear}</p>
        </div>
        <div className="h-px bg-white/10 mb-6" />

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-black text-muted uppercase tracking-widest">TỔNG THU</span>
            <span className="text-[17px] font-black" style={{ color: '#22c55e' }}>{yearlyRevenue.toLocaleString()}đ</span>
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-4 px-1">
            <span className="text-[11px] font-black text-muted uppercase tracking-widest">TỔNG CHI</span>
            <span className="text-[17px] font-black" style={{ color: '#f43f5e' }}>{yearlyExpensesTotal.toLocaleString()}đ</span>
          </div>

          <div className="flex justify-between items-center bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5 mt-4">
            <p className="text-[12px] font-black text-primary uppercase tracking-widest">Lợi Nhuận</p>
            <p className="text-xl font-black" style={{ color: yearlyProfit >= 0 ? '#34d399' : '#fb7185' }}>
              {(yearlyProfit >= 0 ? '+' : '') + yearlyProfit.toLocaleString()}đ
            </p>
          </div>
        </div>
      </div>



      <div className="glass-card !mb-6 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Dữ liệu Tháng {selectedMonth}/{selectedYear}</p>
          {loading && <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full"></div>}
        </div>        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Đã thu ({paidCount})</span>
            </div>
            <p className="text-base font-black" style={{ color: '#22c55e' }}>{thisMonthRevenue.toLocaleString()}đ</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={13} className="text-amber-400" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Chờ thu ({pendingCount})</span>
            </div>
            <p className="text-base font-black" style={{ color: pendingTotal > 0 ? '#f59e0b' : 'white' }}>
              {pendingTotal.toLocaleString()}đ
            </p>
          </div>
        </div>



        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">Chi phí thực tế (Đã trả)</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '32px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>Tiền điện</span>
            {isEditingElectricity ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text"
                  value={tempElectricity}
                  onChange={(e) => {
                    const val = String(e.target.value).replace(/\D/g, '');
                    setTempElectricity(val ? Number(val).toLocaleString() : '');
                  }}
                  autoFocus
                  placeholder="0"
                  style={{ width: '90px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', textAlign: 'right', outline: 'none' }}
                />
                <button 
                  onClick={async () => { 
                    setPaidElectricity(tempElectricity); 
                    setIsEditingElectricity(false); 
                    await saveToDB({ electricity: tempElectricity });
                  }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
                <button 
                  onClick={() => setIsEditingElectricity(false)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{paidElectricity ? `${paidElectricity}đ` : '0đ'}</span>
                <button 
                  onClick={() => { setTempElectricity(paidElectricity); setIsEditingElectricity(true); }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '32px', marginTop: '12px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>Tiền nước</span>
            {isEditingWater ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text"
                  value={tempWater}
                  onChange={(e) => {
                    const val = String(e.target.value).replace(/\D/g, '');
                    setTempWater(val ? Number(val).toLocaleString() : '');
                  }}
                  autoFocus
                  placeholder="0"
                  style={{ width: '90px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', textAlign: 'right', outline: 'none' }}
                />
                <button 
                  onClick={async () => { 
                    setPaidWater(tempWater); 
                    setIsEditingWater(false); 
                    await saveToDB({ water: tempWater });
                  }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
                <button 
                  onClick={() => setIsEditingWater(false)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{paidWater ? `${paidWater}đ` : '0đ'}</span>
                <button 
                  onClick={() => { setTempWater(paidWater); setIsEditingWater(true); }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>

          {extraExpenses.map((expense, index) => (
            <div key={expense.id} style={{ display: 'flex', alignItems: 'center', minHeight: '32px', gap: '8px', marginTop: '12px' }} className="animate-slide-up">
              {expense.isSaved ? (
                <>
                  <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{Number(expense.cost).toLocaleString()}đ</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newExps = [...extraExpenses];
                      newExps[index].isSaved = false;
                      setExtraExpenses(newExps);
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraExpenses(extraExpenses.filter(s => s.id !== expense.id))}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Tên phí..."
                    value={expense.name}
                    onChange={e => {
                      const newExps = [...extraExpenses];
                      newExps[index].name = e.target.value;
                      setExtraExpenses(newExps);
                    }}
                    style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Phí (đ)"
                    value={expense.cost ? Number(expense.cost).toLocaleString() : ''}
                    onChange={e => {
                      const rawValue = String(e.target.value).replace(/\D/g, '');
                      const newExps = [...extraExpenses];
                      newExps[index].cost = rawValue;
                      setExtraExpenses(newExps);
                    }}
                    style={{ width: '90px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', textAlign: 'right', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!expense.name.trim() || !expense.cost) return alert('Vui lòng nhập tên và phí!');
                      const newExps = [...extraExpenses];
                      newExps[index].isSaved = true;
                      setExtraExpenses(newExps);
                      saveToDB({ extraExpenses: newExps });
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newExps = extraExpenses.filter(s => s.id !== expense.id);
                      setExtraExpenses(newExps);
                      saveToDB({ extraExpenses: newExps });
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0 0 0', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Chi phí bổ sung</span>
            <button
              onClick={() => setExtraExpenses([...extraExpenses, { id: Date.now() + Math.random(), name: '', cost: '', isSaved: false }])}
              style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.05em' }}
            >
              + Thêm chi phí
            </button>
          </div>

          <div className="mt-6 h-px bg-white/10" />

          {/* Redesigned Summary Bar: Vertical stack for mobile to prevent overlap */}
          <div className="mt-2 bg-white/5 -mx-5 px-6 pb-6 rounded-b-3xl space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[11px] font-black text-muted uppercase tracking-wider">Tổng Thu</p>
              <p className="text-base font-black" style={{ color: '#22c55e' }}>{thisMonthRevenue.toLocaleString()}đ</p>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[11px] font-black text-muted uppercase tracking-wider">Tổng Chi</p>
              <p className="text-base font-black" style={{ color: '#f43f5e' }}>{totalExpenses.toLocaleString()}đ</p>
            </div>
            
            <div className="h-px bg-white/10 my-2" />

            <div className="flex justify-between items-center bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
              <p className="text-[12px] font-black text-primary uppercase tracking-widest">Lợi Nhuận</p>
              <p className="text-xl font-black" style={{ color: profit >= 0 ? '#34d399' : '#fb7185' }}>
                {(profit >= 0 ? '+' : '') + profit.toLocaleString()}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pie Chart: Expense Breakdown ─────────────────────────────────── */}
      <div className="glass-card !mb-6 p-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-white text-sm">Cơ cấu Chi phí</h3>
            <p className="text-[10px] text-muted mt-0.5 font-bold uppercase tracking-widest">Tỉ lệ các khoản chi trong tháng</p>
          </div>
        </div>

        {totalExpenses === 0 ? (
          <div className="h-48 flex items-center justify-center opacity-40">
            <div className="text-center">
              <DollarSign size={32} className="mx-auto mb-2 text-muted" />
              <p className="text-sm font-bold text-muted">Chưa có dữ liệu chi phí</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={false}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()}đ`]}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2.5 bg-white/5 p-4 rounded-2xl border border-white/5">
              {expenseBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {/* Explicitly styled color marker dot */}
                    <div 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: item.color,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${item.color}60`
                      }} 
                    />
                    <span className="text-xs text-white/80 font-bold tracking-tight">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[13px] font-black text-white">{item.value.toLocaleString()}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default Reports;
