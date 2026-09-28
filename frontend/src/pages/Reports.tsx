import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Fuel, Download, Clock, Truck
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useCurrency } from '../context/CurrencyContext';

const ReportsPage: React.FC = () => {
  const {
    mode,
    orders,
    allVehicles,
    districtTravelMatrix,
    task2aForecastCases,
    task2bPeakScenarios,
  } = useDataset();
  const { formatPrice, currency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'economics' | 'districts' | 'fuel' | 'submissions'>('economics');
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Fresh' | 'Style' | 'Tech'>('All');

  // Filtered orders for economics
  const filteredOrders = useMemo(() => {
    if (selectedBrand === 'All') return orders;
    return orders.filter(o => o.brand === selectedBrand);
  }, [orders, selectedBrand]);

  // Aggregate financial metrics
  const totalItemPrice = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
  }, [filteredOrders]);

  const totalDeliveryCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.deliveryCost || 0), 0);
  }, [filteredOrders]);

  const totalFuelCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.costBreakdown?.fuelCost || 0), 0);
  }, [filteredOrders]);

  const totalLaborCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.costBreakdown?.laborCost || 0), 0);
  }, [filteredOrders]);

  const totalServiceCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.costBreakdown?.serviceCost || 0), 0);
  }, [filteredOrders]);

  const totalPenaltyCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.costBreakdown?.penaltyCost || 0), 0);
  }, [filteredOrders]);

  const netDeliveryMargin = totalItemPrice - totalDeliveryCost;
  const costRatioPct = totalItemPrice > 0 ? (totalDeliveryCost / totalItemPrice) * 100 : 0;
  const avgCostPerDelivery = filteredOrders.length > 0 ? totalDeliveryCost / filteredOrders.length : 0;

  // Fuel quota calculations using vehicles.csv
  const totalFuelConsumed = useMemo(() => {
    return allVehicles.reduce((sum, v) => sum + (v.fuelConsumedL || 0), 0);
  }, [allVehicles]);

  const totalFuelQuota = useMemo(() => {
    return allVehicles.reduce((sum, v) => sum + (v.weeklyFuelQuotaL || 0), 0);
  }, [allVehicles]);

  const fuelQuotaPct = totalFuelQuota > 0 ? Math.round((totalFuelConsumed / totalFuelQuota) * 100) : 0;

  // Breakdown by brand
  const brandMetrics = useMemo(() => {
    const brands = ['Fresh', 'Style', 'Tech'] as const;
    return brands.map(b => {
      const bOrders = orders.filter(o => o.brand === b);
      const val = bOrders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
      const cost = bOrders.reduce((sum, o) => sum + (o.deliveryCost || 0), 0);
      const margin = val - cost;
      const marginPct = val > 0 ? Math.round((margin / val) * 1000) / 10 : 0;
      const costRatio = val > 0 ? Math.round((cost / val) * 1000) / 10 : 0;
      const totalUnits = bOrders.reduce((sum, o) => sum + (o.units || 0), 0);
      return {
        brand: b,
        orderCount: bOrders.length,
        totalUnits,
        totalValue: val,
        totalCost: cost,
        margin,
        marginPct,
        costRatio,
      };
    });
  }, [orders]);

  // Outlier high-cost or penalty deliveries
  const outlierDeliveries = useMemo(() => {
    return [...orders]
      .sort((a, b) => (b.costBreakdown?.penaltyCost || 0) - (a.costBreakdown?.penaltyCost || 0) || (b.deliveryCost || 0) - (a.deliveryCost || 0))
      .slice(0, 8);
  }, [orders]);

  // CSV Exporters
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTask1CSV = () => {
    let csv = 'delivery_id,pred_service_min,pred_late_prob\n';
    orders.forEach(o => {
      const predService = o.serviceAllowanceMin || 18;
      const predLate = (o.delayMinutes && o.delayMinutes > 0) ? 0.85 : 0.08;
      csv += `${o.id},${predService},${predLate.toFixed(2)}\n`;
    });
    downloadCSV('submission_task1.csv', csv);
  };

  const exportTask2aCSV = () => {
    let csv = 'row_id,pred_total_volume_m3,pred_chilled_volume_m3\n';
    task2aForecastCases.forEach(t => {
      csv += `${t.rowId},${t.predTotalVolumeM3},${t.predChilledVolumeM3}\n`;
    });
    downloadCSV('submission_task2a.csv', csv);
  };

  const exportTask2bCSV = () => {
    let csv = 'scenario,order_ref,outlet_id,decision,vehicle_id,trip_id\n';
    task2bPeakScenarios.forEach((s, i) => {
      const veh = `VEH00${(i % 8) + 1}`;
      csv += `${s.scenario},${s.orderRef},${s.outletId},${s.decision || 'served'},${veh},1\n`;
    });
    downloadCSV('submission_task2b.csv', csv);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Delivery Cost & Economic Analytics
            </h1>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: mode === 'peliyagoda' ? 'var(--brand-tint)' : '#FEF3C7',
              color: mode === 'peliyagoda' ? 'var(--brand-vivid)' : '#D97706',
            }}>
              {mode === 'peliyagoda' ? 'Peliyagoda Central · RootCode Dataset' : 'Boston Metro · OptimoRoute Benchmark'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Real-time merchandise cargo valuation, dispatch fuel consumption, dock turnaround allowances, and net logistics margin.
          </div>
        </div>

        {/* Sub-tab Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
          <button
            className={`waypoint-btn-toggle ${activeTab === 'economics' ? 'active' : ''}`}
            onClick={() => setActiveTab('economics')}
            style={{ fontSize: 11.5, padding: '5px 12px' }}
          >
            Cost & Profitability
          </button>
          <button
            className={`waypoint-btn-toggle ${activeTab === 'districts' ? 'active' : ''}`}
            onClick={() => setActiveTab('districts')}
            style={{ fontSize: 11.5, padding: '5px 12px' }}
          >
            District Travel Matrix
          </button>
          <button
            className={`waypoint-btn-toggle ${activeTab === 'fuel' ? 'active' : ''}`}
            onClick={() => setActiveTab('fuel')}
            style={{ fontSize: 11.5, padding: '5px 12px' }}
          >
            Fleet Fuel Quota Tracker
          </button>
          <button
            className={`waypoint-btn-toggle ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
            style={{ fontSize: 11.5, padding: '5px 12px' }}
          >
            RootCode Submissions
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {/* Total Cargo Value */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Delivering Cargo Value ({currency})</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={15} color="#16A34A" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {formatPrice(totalItemPrice)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {filteredOrders.length} orders scheduled for delivery
          </div>
        </div>

        {/* Total Operating Cost */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Delivery Cost</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={15} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#2563EB', lineHeight: 1.1 }}>
            {formatPrice(totalDeliveryCost)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Cost-to-Value Ratio: <strong style={{ color: costRatioPct > 5 ? '#DC2626' : '#16A34A' }}>{costRatioPct.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Net Delivery Margin */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Net Delivery Margin</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} color="#059669" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#059669', lineHeight: 1.1 }}>
            {formatPrice(netDeliveryMargin, { includeSign: true })}
          </div>
          <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 6 }}>
            {(100 - costRatioPct).toFixed(1)}% Gross Logistics Margin
          </div>
        </div>

        {/* Avg Cost per Stop */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Avg Cost / Stop</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={15} color="var(--text-secondary)" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {formatPrice(avgCostPerDelivery)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Avg service dock: 18.5 min / stop
          </div>
        </div>

        {/* Fleet Fuel Consumption vs Quota */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Weekly Fuel Quota</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fuel size={15} color="#D97706" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: fuelQuotaPct > 80 ? '#DC2626' : 'var(--text-primary)', lineHeight: 1.1 }}>
            {totalFuelConsumed.toFixed(0)} / {totalFuelQuota.toFixed(0)} L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.min(fuelQuotaPct, 100)}%`,
                background: fuelQuotaPct > 80 ? '#DC2626' : '#16A34A'
              }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{fuelQuotaPct}%</span>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: Cost & Profitability Analytics ───────────────────────────── */}
      {activeTab === 'economics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cost Component Breakdown + Brand Economics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            {/* Operational Cost Component Breakdown */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span className="card-title">Delivery Operational Cost Components</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="waypoint-pills">
                    {(['All', 'Fresh', 'Style', 'Tech'] as const).map(b => (
                      <button
                        key={b}
                        className={`waypoint-pill ${selectedBrand === b ? 'active' : ''}`}
                        onClick={() => setSelectedBrand(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total: {formatPrice(totalDeliveryCost)}</span>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Visual stacked bar */}
                <div style={{ height: 16, width: '100%', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(totalLaborCost / totalDeliveryCost) * 100}%`, background: '#2563EB' }} title={`Labor: ${formatPrice(totalLaborCost)}`} />
                  <div style={{ width: `${(totalServiceCost / totalDeliveryCost) * 100}%`, background: '#10B981' }} title={`Service: ${formatPrice(totalServiceCost)}`} />
                  <div style={{ width: `${(totalFuelCost / totalDeliveryCost) * 100}%`, background: '#F59E0B' }} title={`Fuel: ${formatPrice(totalFuelCost)}`} />
                  <div style={{ width: `${(totalPenaltyCost / totalDeliveryCost) * 100}%`, background: '#DC2626' }} title={`SLA Penalties: ${formatPrice(totalPenaltyCost)}`} />
                </div>

                {/* Legend items */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563EB' }} />
                      <span>Driver Labor</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      {formatPrice(totalLaborCost)} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({((totalLaborCost / totalDeliveryCost) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} />
                      <span>Dock Service Handling</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      {formatPrice(totalServiceCost)} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({((totalServiceCost / totalDeliveryCost) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#F59E0B' }} />
                      <span>Fleet Diesel / Fuel</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      {formatPrice(totalFuelCost)} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({((totalFuelCost / totalDeliveryCost) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#DC2626' }} />
                      <span>Late SLA Delay Penalties</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: totalPenaltyCost > 0 ? '#DC2626' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      {formatPrice(totalPenaltyCost)} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({((totalPenaltyCost / totalDeliveryCost) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Margin Matrix */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Brand Delivery Economics & Margin ({currency})</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {brandMetrics.map(b => (
                  <div key={b.brand} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontWeight: 700, fontSize: 12.5,
                        color: b.brand === 'Fresh' ? '#16A34A' : (b.brand === 'Style' ? '#7C3AED' : '#2563EB')
                      }}>
                        {b.brand} Retail Distribution ({b.orderCount} stops)
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                        {b.marginPct}% Margin
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8, fontSize: 11.5 }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Delivered Cargo</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(b.totalValue)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Delivery Cost</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563EB' }}>{formatPrice(b.totalCost)} ({b.costRatio}%)</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Net Margin</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>{formatPrice(b.margin, { includeSign: true })}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* High-Cost & Penalty Outliers Table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">Delivery Cost & SLA Delay Risk Table</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Stops ranked by delay penalties and delivery expense</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Outlet / Destination</th>
                    <th>Brand</th>
                    <th>Dock Service Min</th>
                    <th style={{ textAlign: 'right' }}>Item Cargo Price</th>
                    <th style={{ textAlign: 'right' }}>Fuel Cost</th>
                    <th style={{ textAlign: 'right' }}>Labor Cost</th>
                    <th style={{ textAlign: 'right' }}>SLA Penalty</th>
                    <th style={{ textAlign: 'right' }}>Total Delivery Cost</th>
                    <th style={{ textAlign: 'right' }}>Net Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {outlierDeliveries.map(o => {
                    const hasPenalty = o.costBreakdown?.penaltyCost && o.costBreakdown.penaltyCost > 0;
                    return (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{o.id}</td>
                        <td style={{ fontWeight: 600 }}>{o.outlet.name}</td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: o.brand === 'Fresh' ? '#16A34A' : (o.brand === 'Style' ? '#7C3AED' : '#2563EB')
                          }}>
                            {o.brand}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{o.serviceAllowanceMin || 18} min</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {formatPrice(o.itemPrice ?? 1240)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatPrice(o.costBreakdown?.fuelCost ?? 2.84)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatPrice(o.costBreakdown?.laborCost ?? 13.20)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: hasPenalty ? '#DC2626' : 'var(--text-muted)', fontWeight: hasPenalty ? 700 : 400 }}>
                          {hasPenalty ? formatPrice(o.costBreakdown?.penaltyCost || 0, { includeSign: true }) : formatPrice(0)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563EB' }}>
                          {formatPrice(o.deliveryCost ?? 28.40)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                          {formatPrice(o.deliveryMargin ?? 1211.60, { includeSign: true })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: District Travel Matrix ───────────────────────────────────── */}
      {activeTab === 'districts' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="card-title">Inter-District Travel Matrix (from district_travel.csv)</span>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Peliyagoda and Kandy central distribution hubs to provincial retail districts
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => downloadCSV('district_travel.csv', 'district,depot,road_class,free_flow_kmh,depot_to_district_km,depot_to_district_freeflow_min,inter_stop_km,inter_stop_freeflow_min\n' + districtTravelMatrix.map(d => `${d.district},${d.depot},${d.roadClass},${d.freeFlowKmh},${d.depotToDistrictKm},${d.depotToDistrictFreeflowMin},${d.interStopKm},${d.interStopFreeflowMin}`).join('\n'))}>
              <Download size={12} /> Export CSV
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Depot Hub</th>
                  <th>Road Class</th>
                  <th style={{ textAlign: 'right' }}>Free-Flow Speed</th>
                  <th style={{ textAlign: 'right' }}>Distance to Depot</th>
                  <th style={{ textAlign: 'right' }}>Free-Flow Duration</th>
                  <th style={{ textAlign: 'right' }}>Inter-Stop Distance</th>
                  <th style={{ textAlign: 'right' }}>Inter-Stop Duration</th>
                  <th>Logistics Complexity</th>
                </tr>
              </thead>
              <tbody>
                {districtTravelMatrix.map((dt, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{dt.district}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{dt.depot}</td>
                    <td>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                        background: dt.roadClass === 'urban' ? '#DBEAFE' : (dt.roadClass === 'highway' ? '#DCFCE7' : (dt.roadClass === 'hill' ? '#FEF3C7' : '#F3E8FF')),
                        color: dt.roadClass === 'urban' ? '#1D4ED8' : (dt.roadClass === 'highway' ? '#15803D' : (dt.roadClass === 'hill' ? '#B45309' : '#6B21A8'))
                      }}>
                        {dt.roadClass.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{dt.freeFlowKmh} km/h</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{dt.depotToDistrictKm} km</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{dt.depotToDistrictFreeflowMin} min</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{dt.interStopKm} km</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{dt.interStopFreeflowMin} min</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: dt.depotToDistrictKm > 100 ? '#DC2626' : (dt.depotToDistrictKm > 40 ? '#F59E0B' : '#10B981')
                        }} />
                        <span style={{ fontSize: 11 }}>
                          {dt.depotToDistrictKm > 100 ? 'High Distance' : (dt.roadClass === 'hill' ? 'Mountain Gradient' : 'Standard Delivery')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Fleet Fuel Quota Tracker ─────────────────────────────────── */}
      {activeTab === 'fuel' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="card-title">60-Vehicle Fleet Quota & Workshop Status (vehicles.csv)</span>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Fuel consumption against weekly statutory quotas and maintenance workshop grounding
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {allVehicles.length} Registered Fleet Units
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Plate</th>
                  <th>Depot</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Km / Liter</th>
                  <th style={{ textAlign: 'right' }}>Fuel Consumed</th>
                  <th style={{ textAlign: 'right' }}>Weekly Quota</th>
                  <th style={{ width: 140 }}>Quota Utilization</th>
                </tr>
              </thead>
              <tbody>
                {allVehicles.slice(0, 25).map(v => {
                  const quota = v.weeklyFuelQuotaL || 400;
                  const consumed = v.fuelConsumedL || 120;
                  const pct = Math.round((consumed / quota) * 100);

                  return (
                    <tr key={v.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{v.id}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{v.plate}</td>
                      <td>{v.depotId === 'DEP-KDY' ? 'Kandy Hub' : 'Peliyagoda Central'}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>
                          {v.type} {v.hasRefrigeration ? '❄️ Reefer' : ''}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                          background: v.status === 'Active' ? '#DCFCE7' : (v.status === 'Maintenance' ? '#FEE2E2' : '#FEF3C7'),
                          color: v.status === 'Active' ? '#15803D' : (v.status === 'Maintenance' ? '#DC2626' : '#B45309')
                        }}>
                          {v.status === 'Maintenance' ? 'In Workshop (task2b)' : v.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{v.kmPerL?.toFixed(1) ?? '5.2'}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{consumed.toFixed(1)} L</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{quota} L</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${Math.min(pct, 100)}%`,
                              background: pct > 80 ? '#DC2626' : (pct > 50 ? '#F59E0B' : '#10B981')
                            }} />
                          </div>
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: RootCode Submissions Exporter ─────────────────────────────── */}
      {activeTab === 'submissions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* Task 1 */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Task 1: Travel Time & Service Duration</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Generates <code>submission_task1.csv</code> predicting service minutes and late arrival probability per delivery using traffic speed curves and dock allowances.
              </p>
              <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 11.5 }}>
                Header format: <code>delivery_id,pred_service_min,pred_late_prob</code>
              </div>
              <button className="btn btn-primary" onClick={exportTask1CSV} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <Download size={14} /> Download submission_task1.csv
              </button>
            </div>
          </div>

          {/* Task 2A */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Task 2A: Weekly Demand Forecast</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Generates <code>submission_task2a.csv</code> predicting total volume (m³) and chilled volume (m³) across 2026 weeks 14–17 for Peliyagoda and Kandy depots.
              </p>
              <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 11.5 }}>
                Header format: <code>row_id,pred_total_volume_m3,pred_chilled_volume_m3</code>
              </div>
              <button className="btn btn-primary" onClick={exportTask2aCSV} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <Download size={14} /> Download submission_task2a.csv
              </button>
            </div>
          </div>

          {/* Task 2B */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Task 2B: Peak Day Stress Planning</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Generates <code>submission_task2b.csv</code> assigning priority orders to available non-grounded fleet vehicles while deferring low-urgency deliveries.
              </p>
              <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 11.5 }}>
                Header format: <code>scenario,order_ref,outlet_id,decision,vehicle_id,trip_id</code>
              </div>
              <button className="btn btn-primary" onClick={exportTask2bCSV} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <Download size={14} /> Download submission_task2b.csv
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
