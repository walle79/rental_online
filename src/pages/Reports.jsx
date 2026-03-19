import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Receipt, CheckCircle2 } from 'lucide-react';

const MONTH_NAMES = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const fmtVND = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
};

const Reports = ({ bills = [] }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // ── Only count PAID bills ──────────────────────────────────────────────────
  const paidBills = useMemo(() => bills.filter(b => b.status === 'paid'), [bills]);

  // ── Monthly breakdown for current year (only months with data) ────────────
  const monthlyData = useMemo(() => {
    return MONTH_NAMES
      .map((name, idx) => {
        const m = idx + 1;
        const total = paidBills
          .filter(b => b.year === currentYear && b.month === m)
          .reduce((sum, b) => sum + b.total, 0);
        return { name, month: m, total };
      })
      .filter(d => d.total > 0); // only months with actual data
  }, [paidBills, currentYear]);

  // ── Yearly revenue (paid only) ────────────────────────────────────────────
  const yearlyRevenue = useMemo(() =>
    paidBills
      .filter(b => b.year === currentYear)
      .reduce((sum, b) => sum + b.total, 0),
    [paidBills, currentYear]);

  // ── Growth: (thisMonth - prevMonth) / prevMonth * 100 ────────────────────
  const { growthPct, thisMonthRevenue, prevMonthRevenue } = useMemo(() => {
    const thisMonth = paidBills
      .filter(b => b.year === currentYear && b.month === currentMonth)
      .reduce((sum, b) => sum + b.total, 0);

    const prevMonth = currentMonth === 1
      ? paidBills.filter(b => b.year === currentYear - 1 && b.month === 12).reduce((sum, b) => sum + b.total, 0)
      : paidBills.filter(b => b.year === currentYear && b.month === currentMonth - 1).reduce((sum, b) => sum + b.total, 0);

    const pct = prevMonth === 0 ? null : ((thisMonth - prevMonth) / prevMonth) * 100;
    return { growthPct: pct, thisMonthRevenue: thisMonth, prevMonthRevenue: prevMonth };
  }, [paidBills, currentYear, currentMonth]);

  // ── Best month ────────────────────────────────────────────────────────────
  const bestMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return monthlyData.reduce((a, b) => b.total > a.total ? b : a);
  }, [monthlyData]);

  const isPositive = growthPct !== null && growthPct >= 0;
  const growthColor = growthPct === null ? '#94a3b8' : isPositive ? '#22c55e' : '#f43f5e';

  const pendingTotal = useMemo(() =>
    bills
      .filter(b => b.status === 'pending' && b.year === currentYear)
      .reduce((sum, b) => sum + b.total, 0),
    [bills, currentYear]);

  const paidCount = paidBills.filter(b => b.year === currentYear).length;
  const pendingCount = bills.filter(b => b.status === 'pending' && b.year === currentYear).length;

  return (
    <div className="animate-slide-up pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gradient">Thống kê</h1>
        <p className="text-muted">Doanh thu thực thu — {currentYear}</p>
      </header>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Yearly Revenue */}
        <div className="glass-card !mb-0 p-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
            <DollarSign size={20} className="text-primary" />
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Doanh thu năm</p>
          <p className="text-[17px] font-black text-white">
            {yearlyRevenue > 0 ? `${(yearlyRevenue / 1_000_000).toFixed(1)}M` : '0đ'}
          </p>
          <p className="text-[10px] text-muted mt-1">{yearlyRevenue.toLocaleString()}đ</p>
        </div>

        {/* Growth */}
        <div className="glass-card !mb-0 p-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: growthPct === null ? 'rgba(255,255,255,0.05)' : isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)' }}>
            {growthPct === null
              ? <TrendingUp size={20} style={{ color: '#94a3b8' }} />
              : isPositive
                ? <TrendingUp size={20} style={{ color: '#22c55e' }} />
                : <TrendingDown size={20} style={{ color: '#f43f5e' }} />
            }
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Tăng trưởng</p>
          <p className="text-[17px] font-black" style={{ color: growthColor }}>
            {growthPct === null ? 'N/A' : `${growthPct >= 0 ? '+' : ''}${growthPct.toFixed(1)}%`}
          </p>
          <p className="text-[10px] text-muted mt-1">Th{currentMonth} vs Th{currentMonth === 1 ? 12 : currentMonth - 1}</p>
        </div>
      </div>

      {/* ── This month summary ────────────────────────────────────────────── */}
      <div className="glass-card !mb-6 p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Tháng {currentMonth}/{currentYear}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Đã thu ({paidCount})</span>
            </div>
            <p className="text-base font-black text-white">{thisMonthRevenue.toLocaleString()}đ</p>
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
      </div>

      {/* ── Bar Chart ─────────────────────────────────────────────────────── */}
      <div className="glass-card !mb-0">
        <div className="flex-between mb-6">
          <div>
            <h3 className="font-bold text-white text-sm">Xu hướng doanh thu</h3>
            <p className="text-[10px] text-muted mt-0.5">Chỉ tính hóa đơn đã thu</p>
          </div>
          {bestMonth && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <ArrowUpRight size={12} />
              CAO NHẤT: {bestMonth.name}
            </span>
          )}
        </div>

        {monthlyData.length === 0 ? (
          <div className="h-48 flex items-center justify-center opacity-40">
            <div className="text-center">
              <DollarSign size={32} className="mx-auto mb-2 text-muted" />
              <p className="text-sm font-bold text-muted">Chưa có dữ liệu hóa đơn đã thu</p>
            </div>
          </div>
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barCategoryGap="35%">
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 700 }}
                  labelStyle={{ color: '#f97316', fontWeight: 900, fontSize: 11, textTransform: 'uppercase' }}
                  formatter={(value) => [`${value.toLocaleString()}đ`, 'Đã thu']}
                />
                <Bar dataKey="total" radius={[10, 10, 4, 4]}>
                  {monthlyData.map((entry) => (
                    <Cell
                      key={`cell-${entry.month}`}
                      fill={entry === bestMonth ? '#f97316' : 'rgba(249,115,22,0.25)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
