'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_FEES, INITIAL_STOCKS } from '../../data/stocks';

const formatNaira = (val) =>
  '₦' +
  Number(val || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminPortal() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(false);

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [pricelistMsg, setPricelistMsg] = useState(
    `Loaded ${INITIAL_STOCKS.length} NGX & NASD equities. Upload daily CSV anytime to update prices.`
  );
  const [mandates, setMandates] = useState([]);
  const [deliveryEmail, setDeliveryEmail] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    try {
      const f = localStorage.getItem('ngx_mandate_fees_v1');
      if (f) setFees(JSON.parse(f));
      const m = localStorage.getItem('ngx_mandates_v1');
      if (m) setMandates(JSON.parse(m));
      const e = localStorage.getItem('ngx_delivery_email_v1');
      if (e) setDeliveryEmail(e);
      if (sessionStorage.getItem('ngx_admin_auth') === '1') setIsAdminAuth(true);
    } catch (_) {}

    const onStorage = (ev) => {
      if (ev.key === 'ngx_mandates_v1' && ev.newValue) {
        setMandates(JSON.parse(ev.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const attemptLogin = () => {
    const expected = localStorage.getItem('ngx_admin_pass_v1') || 'regency2026';
    if (loginPass === expected) {
      sessionStorage.setItem('ngx_admin_auth', '1');
      setIsAdminAuth(true);
      setLoginErr(false);
      setLoginPass('');
    } else {
      setLoginErr(true);
    }
  };

  const syncLivePrices = async () => {
    try {
      const res = await fetch('/api/live-prices');
      const data = await res.json();
      if (data?.ok && data.count > 0) {
        const saved = localStorage.getItem('ngx_pricelist_v1');
        const current = saved ? JSON.parse(saved) : INITIAL_STOCKS;
        const updated = current.map((item) =>
          data.prices[item.symbol] ? { ...item, price: data.prices[item.symbol] } : item
        );
        localStorage.setItem('ngx_pricelist_v1', JSON.stringify(updated));
        setPricelistMsg(
          `Synced ${data.count} NGX prices at ${new Date(data.updatedAt).toLocaleTimeString()}.`
        );
      }
    } catch (_) {}
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = String(ev.target?.result || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map((h) => h.toLowerCase().trim());
      let symIdx = headers.findIndex((h) =>
        ['symbol', 'ticker', 'stock', 'security', 'code'].some((k) => h.includes(k))
      );
      let nameIdx = headers.findIndex((h) =>
        ['name', 'description', 'issuer'].some((k) => h.includes(k))
      );
      const companyIdx = headers.indexOf('company');
      if (symIdx === -1 && companyIdx !== -1) symIdx = companyIdx;
      else if (nameIdx === -1 && companyIdx !== -1) nameIdx = companyIdx;

      const boardIdx = headers.indexOf('board');
      const closeIdx = headers.indexOf('close_price');
      const refIdx = headers.indexOf('ref_price');
      const priceIdx =
        closeIdx !== -1
          ? closeIdx
          : headers.findIndex((h) => ['close', 'price', 'last', 'current', 'vwap'].some((k) => h.includes(k)));

      if (symIdx === -1 || priceIdx === -1) {
        setPricelistMsg(`Could not find Symbol/COMPANY & CLOSE_PRICE columns in "${file.name}".`);
        return;
      }
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const symbol = (cols[symIdx] || '').replace(/"/g, '').trim().toUpperCase();
        let price = parseFloat((cols[priceIdx] || '').replace(/[₦,"\s]/g, ''));
        if ((!Number.isFinite(price) || price <= 0) && refIdx !== -1) {
          price = parseFloat((cols[refIdx] || '').replace(/[₦,"\s]/g, ''));
        }
        if (!symbol || !Number.isFinite(price) || price <= 0) continue;
        const known = INITIAL_STOCKS.find((s) => s.symbol === symbol);
        const board = boardIdx !== -1 && cols[boardIdx] ? cols[boardIdx].replace(/"/g, '').trim() : '';
        const name =
          nameIdx !== -1 && cols[nameIdx]
            ? cols[nameIdx].replace(/"/g, '').trim()
            : known?.name || (board ? `${symbol} (${board})` : symbol);
        parsed.push({ symbol, name, price });
      }
      if (parsed.length > 0) {
        localStorage.setItem('ngx_pricelist_v1', JSON.stringify(parsed));
        setPricelistMsg(`Loaded ${parsed.length} equities from "${file.name}".`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredMandates = mandates.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && m.rawType !== typeFilter) return false;
    if (dateFrom && m.date < dateFrom) return false;
    if (dateTo && m.date > dateTo) return false;
    if (search.trim()) {
      const hay = `${m.ref} ${m.clientName} ${m.cscsNumber}`.toLowerCase();
      if (!hay.includes(search.toLowerCase().trim())) return false;
    }
    return true;
  });

  const exportExecutedExcel = () => {
    const executed = mandates.filter((m) => {
      if (m.status !== 'EXECUTED') return false;
      if (dateFrom && m.date < dateFrom) return false;
      if (dateTo && m.date > dateTo) return false;
      return true;
    });
    if (executed.length === 0) {
      alert('No EXECUTED trades found for the selected date range.');
      return;
    }
    const totalGross = executed.reduce((s, m) => s + (m.gross || 0), 0);
    const totalCharges = executed.reduce((s, m) => s + (m.totalCharges || 0), 0);
    const totalNet = executed.reduce((s, m) => s + (m.netAmount || 0), 0);
    const rowsHtml = executed
      .map((m) => {
        const stocks = (m.items || []).map((it) => `${it.symbol} (${it.qty} @ ${it.price})`).join('; ');
        return `<tr><td>${m.ref}</td><td>${m.date}</td><td>${m.clientName}</td><td>${m.cscsNumber || '-'}</td><td>${m.rawType}</td><td>${stocks}</td><td align="right">${Number(m.gross || 0).toFixed(2)}</td><td align="right">${Number(m.totalCharges || 0).toFixed(2)}</td><td align="right">${Number(m.netAmount || 0).toFixed(2)}</td></tr>`;
      })
      .join('');
    const rangeLabel = `${dateFrom || 'Start'} to ${dateTo || 'Present'}`;
    const html = `<html><head><meta charset="UTF-8"/></head><body><table border="1" cellspacing="0" cellpadding="5"><tr><th colspan="9" style="background:#0052cc;color:#fff;font-size:13pt;">REGENCY ASSETS MANAGEMENT LIMITED — EXECUTED TRADES REPORT (${rangeLabel})</th></tr><tr style="background:#f1f5f9;font-weight:bold;"><th>Mandate Ref</th><th>Date</th><th>Client Name</th><th>CSCS No.</th><th>Type</th><th>Securities</th><th>Gross (NGN)</th><th>Total Charges (NGN)</th><th>Net Amount (NGN)</th></tr>${rowsHtml}<tr style="background:#e2e8f0;font-weight:bold;"><td colspan="6">GRAND TOTAL (${executed.length} Executed Trades)</td><td align="right">${totalGross.toFixed(2)}</td><td align="right">${totalCharges.toFixed(2)}</td><td align="right">${totalNet.toFixed(2)}</td></tr></table></body></html>`;
    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executed_Trades_${dateFrom || 'all'}_${dateTo || 'all'}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdminAuth) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Regency Logo" className="w-11 h-11 object-contain" />
            <div>
              <h1 className="text-base font-extrabold text-slate-900">Admin Dashboard Login</h1>
              <p className="text-xs text-slate-500">Regency Assets Management Limited</p>
            </div>
          </div>
          <input
            type="password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && attemptLogin()}
            placeholder="Enter admin password"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mb-2"
          />
          {loginErr && <p className="text-xs text-red-600 mb-2">Incorrect password.</p>}
          <button
            type="button"
            onClick={attemptLogin}
            className="w-full mt-2 py-2 text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-md cursor-pointer"
          >
            Unlock Admin Portal
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = mandates.filter((m) => m.status === 'PENDING').length;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Regency Assets Management Limited"
            className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md object-contain"
          />
          <div>
            <h1 className="text-lg font-extrabold text-white">
              Regency Assets Management — Admin Portal
            </h1>
            <p className="text-xs text-amber-100">
              Mandate Operations, NGX/NASD Pricelist &amp; Executed Trades Reporting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-800 hover:bg-slate-100"
          >
            Open Client Portal
          </a>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('ngx_admin_auth');
              setIsAdminAuth(false);
            }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
          >
            Lock Admin
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-slate-500">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Mandates</div>
          <div className="text-2xl font-extrabold mt-1">{mandates.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-amber-500">
          <div className="text-xs font-bold text-slate-500 uppercase">Pending Review</div>
          <div className="text-2xl font-extrabold mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-emerald-600">
          <div className="text-xs font-bold text-slate-500 uppercase">Approved / Executed</div>
          <div className="text-2xl font-extrabold mt-1">
            {mandates.filter((m) => m.status === 'APPROVED' || m.status === 'EXECUTED').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-blue-700">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Gross Volume</div>
          <div className="text-2xl font-extrabold mt-1">
            {formatNaira(mandates.reduce((s, m) => s + (m.gross || 0), 0))}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-base font-bold">NGX/NASD Pricelist &amp; Delivery Settings</h2>
            <p className="text-xs text-slate-500">{pricelistMsg}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={deliveryEmail}
              onChange={(e) => {
                setDeliveryEmail(e.target.value);
                localStorage.setItem('ngx_delivery_email_v1', e.target.value.trim());
              }}
              placeholder="Dealing Desk Email"
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs w-56"
            />
            <button
              type="button"
              onClick={syncLivePrices}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            >
              Sync Live Prices
            </button>
            <label className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 hover:bg-slate-50 cursor-pointer">
              Upload Pricelist CSV
              <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} hidden />
            </label>
            <button
              type="button"
              onClick={() => setShowFeeModal(true)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
            >
              Fee Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-base font-bold">Submitted Client Mandates</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, CSCS, ref..."
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="EXECUTED">Executed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs"
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Purchase</option>
              <option value="SELL">Sale</option>
            </select>
            <button
              type="button"
              onClick={exportExecutedExcel}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            >
              Export Executed (Excel)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5 text-left">Ref</th>
                <th className="p-2.5 text-left">Date</th>
                <th className="p-2.5 text-left">Client</th>
                <th className="p-2.5 text-left">Type</th>
                <th className="p-2.5 text-right">Gross (₦)</th>
                <th className="p-2.5 text-right">Net (₦)</th>
                <th className="p-2.5 text-left">Status</th>
                <th className="p-2.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMandates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No mandates found.
                  </td>
                </tr>
              ) : (
                filteredMandates.map((m) => (
                  <tr key={m.ref} className="border-b border-slate-100 last:border-none">
                    <td className="p-2.5 font-bold">{m.ref}</td>
                    <td className="p-2.5">{m.date}</td>
                    <td className="p-2.5">{m.clientName}</td>
                    <td className="p-2.5">{m.rawType}</td>
                    <td className="p-2.5 text-right">{formatNaira(m.gross)}</td>
                    <td className="p-2.5 text-right font-bold">{formatNaira(m.netAmount)}</td>
                    <td className="p-2.5 font-bold">{m.status}</td>
                    <td className="p-2.5 flex gap-1">
                      {['APPROVED', 'EXECUTED', 'REJECTED'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            const next = mandates.map((x) =>
                              x.ref === m.ref ? { ...x, status: st } : x
                            );
                            setMandates(next);
                            localStorage.setItem('ngx_mandates_v1', JSON.stringify(next));
                          }}
                          className="px-2 py-1 border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          {st.slice(0, 4)}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFeeModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl">
            <h3 className="text-base font-bold mb-3">Statutory &amp; Brokerage Fee Schedule (%)</h3>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-500 mb-2">
              <div>Component</div>
              <div>Buy (%)</div>
              <div>Sell (%)</div>
            </div>
            {['brokerage', 'sec', 'ngx', 'cscs', 'stamp', 'vat'].map((k) => (
              <div key={k} className="grid grid-cols-3 gap-2 items-center mb-2 text-xs">
                <span className="capitalize font-semibold">{k}</span>
                <input
                  type="number"
                  step="0.01"
                  value={fees.BUY[k]}
                  onChange={(e) =>
                    setFees((f) => ({
                      ...f,
                      BUY: { ...f.BUY, [k]: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className="px-2 py-1 border border-slate-300 rounded"
                />
                <input
                  type="number"
                  step="0.01"
                  value={fees.SELL[k]}
                  onChange={(e) =>
                    setFees((f) => ({
                      ...f,
                      SELL: { ...f.SELL, [k]: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className="px-2 py-1 border border-slate-300 rounded"
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('ngx_mandate_fees_v1', JSON.stringify(fees));
                  setShowFeeModal(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-md cursor-pointer"
              >
                Save Rates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
