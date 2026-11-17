'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_FEES, INITIAL_STOCKS } from '../data/stocks';

const formatNaira = (val) =>
  '₦' +
  Number(val || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const makeRef = () => {
  const ymd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `MND-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export default function MandatePortal() {
  const [view, setView] = useState('client');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(false);

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [pricelist, setPricelist] = useState(INITIAL_STOCKS);
  const [pricelistMsg, setPricelistMsg] = useState(
    `Loaded ${INITIAL_STOCKS.length} NGX & NASD equities. Upload daily CSV anytime to update prices.`
  );
  const [mandates, setMandates] = useState([]);
  const [deliveryEmail, setDeliveryEmail] = useState('');

  // Form state
  const [ref, setRef] = useState('');
  const [date, setDate] = useState('');
  const [txType, setTxType] = useState('');
  const [orderType, setOrderType] = useState('');
  const [validity, setValidity] = useState('DAY');
  const [expiryDate, setExpiryDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [cscsNumber, setCscsNumber] = useState('');
  const [chnNumber, setChnNumber] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [indemnity, setIndemnity] = useState('');
  const [rows, setRows] = useState([{ symbol: '', name: '', qty: '', price: '' }]);
  const [buyRows, setBuyRows] = useState([{ symbol: '', name: '', qty: '', price: '' }]);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const syncLivePrices = async () => {
    try {
      const res = await fetch('/api/live-prices');
      const data = await res.json();
      if (data?.ok && data.count > 0) {
        setPricelist((prev) => {
          const updated = prev.map((item) =>
            data.prices[item.symbol] ? { ...item, price: data.prices[item.symbol] } : item
          );
          localStorage.setItem('ngx_pricelist_v1', JSON.stringify(updated));
          return updated;
        });
        setPricelistMsg(
          `Synced ${data.count} live NGX prices at ${new Date(data.updatedAt).toLocaleTimeString()}.`
        );
      }
    } catch (_) {
      // keep existing pricelist on network error
    }
  };

  useEffect(() => {
    setRef(makeRef());
    setDate(new Date().toISOString().slice(0, 10));
    try {
      const f = localStorage.getItem('ngx_mandate_fees_v1');
      if (f) setFees(JSON.parse(f));
      const p = localStorage.getItem('ngx_pricelist_v1');
      if (p) setPricelist(JSON.parse(p));
      const m = localStorage.getItem('ngx_mandates_v1');
      if (m) setMandates(JSON.parse(m));
      const e = localStorage.getItem('ngx_delivery_email_v1');
      if (e) setDeliveryEmail(e);
      if (sessionStorage.getItem('ngx_admin_auth') === '1') setIsAdminAuth(true);
    } catch (_) {}
    syncLivePrices();
  }, []);

  const rate = fees[txType || 'BUY'];
  const calc = useMemo(() => {
    const gross = rows.reduce(
      (s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0),
      0
    );
    const brokerage = gross * (rate.brokerage / 100);
    const sec = gross * (rate.sec / 100);
    const ngx = gross * (rate.ngx / 100);
    const cscs = gross * (rate.cscs / 100);
    const stamp = gross * (rate.stamp / 100);
    const vat = brokerage * (rate.vat / 100);
    const totalCharges = brokerage + sec + ngx + cscs + stamp + vat;
    const netAmount = txType === 'BUY' ? gross + totalCharges : Math.max(0, gross - totalCharges);
    return { gross, brokerage, sec, ngx, cscs, stamp, vat, totalCharges, netAmount };
  }, [rows, rate, txType]);

  const reinvestCalc = useMemo(() => {
    const gross = buyRows.reduce(
      (s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0),
      0
    );
    const bRate = fees.BUY;
    const brokerage = gross * (bRate.brokerage / 100);
    const totalCharges =
      brokerage +
      gross * (bRate.sec / 100) +
      gross * (bRate.ngx / 100) +
      gross * (bRate.cscs / 100) +
      gross * (bRate.stamp / 100) +
      brokerage * (bRate.vat / 100);
    const totalCost = gross + totalCharges;
    const balance = calc.netAmount - totalCost;
    return { gross, totalCharges, totalCost, balance };
  }, [buyRows, fees, calc.netAmount]);

  const handleRowChange = (idx, field, val) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'symbol') {
        const match = pricelist.find((p) => p.symbol.toUpperCase() === val.trim().toUpperCase());
        if (match) {
          next[idx].symbol = match.symbol;
          next[idx].name = match.name;
          next[idx].price = match.price.toFixed(2);
        }
      }
      return next;
    });
  };

  const handleBuyRowChange = (idx, field, val) => {
    setBuyRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'symbol') {
        const match = pricelist.find((p) => p.symbol.toUpperCase() === val.trim().toUpperCase());
        if (match) {
          next[idx].symbol = match.symbol;
          next[idx].name = match.name;
          next[idx].price = match.price.toFixed(2);
        }
      }
      return next;
    });
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
      if (symIdx === -1 && companyIdx !== -1) {
        symIdx = companyIdx;
      } else if (nameIdx === -1 && companyIdx !== -1) {
        nameIdx = companyIdx;
      }
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
        setPricelist(parsed);
        localStorage.setItem('ngx_pricelist_v1', JSON.stringify(parsed));
        setPricelistMsg(`Loaded ${parsed.length} equities from "${file.name}".`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const buildSnapshot = () => {
    const items = rows
      .filter((r) => r.symbol || r.name || parseFloat(r.qty) > 0)
      .map((r, i) => {
        const qty = parseFloat(r.qty) || 0;
        const price = parseFloat(r.price) || 0;
        return { index: i + 1, symbol: r.symbol, name: r.name, qty, price, consideration: qty * price };
      });
    return {
      ref,
      date,
      rawType: txType,
      txType: txType === 'BUY' ? 'Purchase (Buy)' : 'Sale (Sell)',
      orderType,
      validity,
      expiryDate,
      clientName,
      cscsNumber,
      chnNumber,
      clientPhone,
      clientEmail,
      bankAccount,
      notes,
      indemnityAgreed: indemnity === 'YES',
      items,
      rate,
      ...calc,
      netLabel: txType === 'BUY' ? 'Net Amount Payable' : 'Net Proceeds Receivable',
    };
  };

  const exportExcel = () => {
    const d = buildSnapshot();
    const itemRows = d.items
      .map(
        (it) =>
          `<tr><td>${it.index}</td><td>${it.symbol}</td><td>${it.name}</td><td align="right">${it.qty}</td><td align="right">${it.price.toFixed(2)}</td><td align="right">${it.consideration.toFixed(2)}</td></tr>`
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8"/></head><body><table border="1" cellspacing="0" cellpadding="5"><tr><th colspan="6" style="background:#0052cc;color:#fff">REGENCY ASSETS MANAGEMENT LIMITED — MANDATE</th></tr><tr><td><b>Ref</b></td><td>${d.ref}</td><td><b>Date</b></td><td colspan="3">${d.date}</td></tr><tr><td><b>Client</b></td><td colspan="2">${d.clientName}</td><td><b>Phone</b></td><td colspan="2">${d.clientPhone}</td></tr><tr><td><b>Email</b></td><td colspan="2">${d.clientEmail}</td><td><b>CSCS</b></td><td colspan="2">${d.cscsNumber}</td></tr><tr><th>#</th><th>Symbol</th><th>Security</th><th>Qty</th><th>Price</th><th>Consideration</th></tr>${itemRows}<tr><td colspan="4"><b>Gross Consideration</b></td><td></td><td align="right"><b>${d.gross.toFixed(2)}</b></td></tr><tr><td colspan="4"><b>Total Charges</b></td><td></td><td align="right"><b>${d.totalCharges.toFixed(2)}</b></td></tr><tr style="background:#0052cc;color:#fff"><td colspan="4"><b>${d.netLabel}</b></td><td></td><td align="right"><b>${d.netAmount.toFixed(2)}</b></td></tr></table></body></html>`;
    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.ref}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitMandate = async () => {
    if (!txType) return alert('Please select a Transaction Type (Purchase or Sale).');
    if (!orderType) return alert('Please select an Order Type.');
    if (!expiryDate) return alert('Please select an Expiry Date.');
    if (!clientName.trim()) return alert('Please enter your Client Full Name.');
    if (!clientPhone.trim()) return alert('Please enter your Phone Number.');
    if (!clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      return alert('Please enter a valid Email Address.');
    }
    const d = buildSnapshot();
    if (d.items.length === 0 || d.gross <= 0) {
      return alert('Please add at least one security with a valid quantity and price.');
    }
    if (indemnity !== 'YES') {
      return alert('Please select "Yes, I Agree" on the Client Agreement & Indemnity.');
    }

    setSubmitting(true);
    const record = { ...d, status: 'PENDING', submittedAt: new Date().toISOString() };
    const updated = [record, ...mandates];
    setMandates(updated);
    localStorage.setItem('ngx_mandates_v1', JSON.stringify(updated));

    let emailMsg = '';
    try {
      const res = await fetch('/api/submit-mandate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandate: record, deliveryEmail }),
      });
      const json = await res.json();
      emailMsg = json.emailed
        ? ` Excel mandate emailed to ${json.recipient}.`
        : ' Excel downloaded (configure .env.local SMTP for automatic background email).';
    } catch (_) {
      emailMsg = ' Saved to Admin Dashboard.';
    }

    exportExcel();
    setSubmitting(false);
    setToast(`Mandate ${record.ref} submitted successfully!${emailMsg}`);
    setRef(makeRef());
    setTimeout(() => setToast(''), 7000);
  };

  const pendingCount = mandates.filter((m) => m.status === 'PENDING').length;
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
        return `<tr>
          <td>${m.ref}</td>
          <td>${m.date}</td>
          <td>${m.clientName}</td>
          <td>${m.cscsNumber || '-'}</td>
          <td>${m.rawType}</td>
          <td>${stocks}</td>
          <td align="right">${Number(m.gross || 0).toFixed(2)}</td>
          <td align="right">${Number(m.totalCharges || 0).toFixed(2)}</td>
          <td align="right">${Number(m.netAmount || 0).toFixed(2)}</td>
        </tr>`;
      })
      .join('');

    const rangeLabel = `${dateFrom || 'Start'} to ${dateTo || 'Present'}`;
    const html = `<html><head><meta charset="UTF-8"/></head><body>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr><th colspan="9" style="background:#0052cc;color:#fff;font-size:13pt;">REGENCY ASSETS MANAGEMENT LIMITED — EXECUTED TRADES REPORT (${rangeLabel})</th></tr>
        <tr style="background:#f1f5f9;font-weight:bold;">
          <th>Mandate Ref</th><th>Date</th><th>Client Name</th><th>CSCS No.</th><th>Type</th><th>Securities</th><th>Gross (NGN)</th><th>Total Charges (NGN)</th><th>Net Amount (NGN)</th>
        </tr>
        ${rowsHtml}
        <tr style="background:#e2e8f0;font-weight:bold;">
          <td colspan="6">GRAND TOTAL (${executed.length} Executed Trades)</td>
          <td align="right">${totalGross.toFixed(2)}</td>
          <td align="right">${totalCharges.toFixed(2)}</td>
          <td align="right">${totalNet.toFixed(2)}</td>
        </tr>
      </table>
    </body></html>`;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executed_Trades_${dateFrom || 'all'}_${dateTo || 'all'}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <header className="no-print flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Regency Assets Management Limited"
            className="w-13 h-13 rounded-full bg-white p-0.5 shadow-md object-contain"
          />
          <div>
            <h1 className="text-lg font-extrabold text-white drop-shadow-xs">
              Regency Assets Management Limited
            </h1>
            <p className="text-xs text-sky-100">
              NGX &amp; NASD Stockbroking Mandate Portal — Sales &amp; Purchase
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-200 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setView('client')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${
                view === 'client' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Client Portal
            </button>
            <button
              type="button"
              onClick={() => (isAdminAuth ? setView('admin') : setShowLoginModal(true))}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 ${
                view === 'admin' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Admin Dashboard
              <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportExcel}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
          >
            Print / Save PDF
          </button>
        </div>
      </header>

      {/* CLIENT PORTAL */}
      {view === 'client' && (
        <div>
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-700 to-sky-600 text-white px-5 py-3.5 rounded-xl mb-4 shadow-sm">
            <p className="text-sm">
              <strong>Client Order Portal:</strong> Fill in your details, select NGX/NASD securities,
              and submit your mandate directly to Regency Assets Management Limited.
            </p>
            <button
              type="button"
              disabled={submitting || indemnity !== 'YES'}
              onClick={handleSubmitMandate}
              title={indemnity !== 'YES' ? 'Please select "Yes, I Agree" on the Indemnity section first' : ''}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Mandate'}
            </button>
          </div>

          {toast && (
            <div className="no-print mb-4 px-4 py-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm font-semibold">
              {toast}
            </div>
          )}

          <main className="print-clean bg-white/95 backdrop-blur border border-blue-200 border-t-4 border-t-amber-500 rounded-2xl p-7 shadow-lg">
            {/* Document Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 pb-4 mb-5 border-b-2 border-blue-700">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Regency Logo" className="w-14 h-14 object-contain" />
                <div>
                  <div className="text-sm font-extrabold text-blue-700 tracking-wide">
                    REGENCY ASSETS MANAGEMENT LIMITED
                  </div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-500">
                    CLIENT EXECUTION MANDATE
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    STOCKBROKING{' '}
                    <span
                      className={`px-2 py-0.5 rounded text-sm ${
                        txType === 'BUY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {txType === 'BUY' ? 'PURCHASE' : 'SALE'}
                    </span>{' '}
                    MANDATE FORM
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold text-slate-500">Mandate Ref:</span>
                  <input
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    className="w-36 px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold text-slate-500">Date:</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-36 px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Transaction & Order Details */}
            <section className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                Transaction &amp; Order Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="">-- Select Transaction Type --</option>
                    <option value="BUY">Purchase (Buy)</option>
                    <option value="SELL">Sale (Sell)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="">-- Select Order Type --</option>
                    <option value="MARKET">Market Order (At Best)</option>
                    <option value="LIMIT">Limit Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Validity
                  </label>
                  <select
                    value={validity}
                    onChange={(e) => setValidity(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="DAY">Good for Day</option>
                    <option value="GTC">Good Till Cancelled (GTC)</option>
                    <option value="GTD">Good Till Date</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Client Information */}
            <section className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                Client Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Full Name / Corporate Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Adebayo Oluwaseun"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CSCS Account Number
                  </label>
                  <input
                    value={cscsNumber}
                    onChange={(e) => setCscsNumber(e.target.value)}
                    placeholder="e.g. 1029384756"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CHN (Clearing House No.)
                  </label>
                  <input
                    value={chnNumber}
                    onChange={(e) => setChnNumber(e.target.value)}
                    placeholder="e.g. C1234567"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. +234 803 000 0000"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Settlement Bank / Account No.
                  </label>
                  <input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Bank Name - 0123456789"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Securities Table */}
            <section className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Securities / Order Schedule (NGX &amp; NASD)
                </div>
                <button
                  type="button"
                  onClick={() => setRows((r) => [...r, { symbol: '', name: '', qty: '', price: '' }])}
                  className="no-print px-2.5 py-1 rounded text-xs font-semibold border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  + Add Security
                </button>
              </div>
              <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-xs">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-700 to-sky-600 text-xs font-bold text-white">
                    <tr>
                      <th className="p-2.5 text-left w-10">#</th>
                      <th className="p-2.5 text-left w-40">Symbol</th>
                      <th className="p-2.5 text-left">Security Name</th>
                      <th className="p-2.5 text-right w-32">Quantity</th>
                      <th className="p-2.5 text-right w-32">Price (₦)</th>
                      <th className="p-2.5 text-right w-40">Consideration (₦)</th>
                      <th className="p-2.5 w-10 no-print"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => {
                      const cons = (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0);
                      return (
                        <tr key={idx} className="border-b border-slate-100 last:border-none">
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              list="stocksList"
                              value={r.symbol}
                              onChange={(e) => handleRowChange(idx, 'symbol', e.target.value)}
                              placeholder="e.g. GTCO"
                              className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              value={r.name}
                              onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                              placeholder="Company Name"
                              className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={r.qty}
                              onChange={(e) => handleRowChange(idx, 'qty', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={r.price}
                              onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-semibold">{formatNaira(cons)}</td>
                          <td className="p-2 text-center no-print">
                            <button
                              type="button"
                              onClick={() =>
                                setRows((prev) =>
                                  prev.length === 1
                                    ? [{ symbol: '', name: '', qty: '', price: '' }]
                                    : prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-red-600 font-bold px-1.5 hover:bg-red-50 rounded cursor-pointer"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Reinvest Sale Proceeds (Sell & Buy) */}
            {txType === 'SELL' && (
              <section className="mb-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Reinvest Sale Proceeds — Stocks to Buy (Optional)
                    </div>
                    <p className="text-xs text-slate-500">
                      Use proceeds from your sale above to purchase another NGX/NASD stock.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBuyRows((r) => [...r, { symbol: '', name: '', qty: '', price: '' }])
                    }
                    className="no-print px-2.5 py-1 rounded text-xs font-semibold border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                  >
                    + Add Stock to Buy
                  </button>
                </div>
                <div className="overflow-x-auto border border-emerald-200 rounded-lg bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-emerald-700 text-xs font-bold text-white">
                      <tr>
                        <th className="p-2 text-left w-10">#</th>
                        <th className="p-2 text-left w-40">Symbol</th>
                        <th className="p-2 text-left">Security Name</th>
                        <th className="p-2 text-right w-32">Quantity</th>
                        <th className="p-2 text-right w-32">Price (₦)</th>
                        <th className="p-2 text-right w-40">Consideration (₦)</th>
                        <th className="p-2 w-10 no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyRows.map((r, idx) => {
                        const cons = (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0);
                        return (
                          <tr key={idx} className="border-b border-slate-100 last:border-none">
                            <td className="p-2">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                list="stocksList"
                                value={r.symbol}
                                onChange={(e) => handleBuyRowChange(idx, 'symbol', e.target.value)}
                                placeholder="e.g. DANGCEM"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={r.name}
                                onChange={(e) => handleBuyRowChange(idx, 'name', e.target.value)}
                                placeholder="Company Name"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={r.qty}
                                onChange={(e) => handleBuyRowChange(idx, 'qty', e.target.value)}
                                placeholder="0"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={r.price}
                                onChange={(e) => handleBuyRowChange(idx, 'price', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right"
                              />
                            </td>
                            <td className="p-2 text-right font-semibold">{formatNaira(cons)}</td>
                            <td className="p-2 text-center no-print">
                              <button
                                type="button"
                                onClick={() =>
                                  setBuyRows((prev) =>
                                    prev.length === 1
                                      ? [{ symbol: '', name: '', qty: '', price: '' }]
                                      : prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-red-600 font-bold px-1.5 hover:bg-red-50 rounded cursor-pointer"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {reinvestCalc.gross > 0 && (
                  <div className="mt-3 flex flex-wrap justify-between items-center gap-3 text-xs bg-white p-3 rounded-lg border border-emerald-200">
                    <span>
                      Purchase Gross: <strong>{formatNaira(reinvestCalc.gross)}</strong>
                    </span>
                    <span>
                      Est. Purchase Charges: <strong>{formatNaira(reinvestCalc.totalCharges)}</strong>
                    </span>
                    <span>
                      Total Purchase Cost: <strong>{formatNaira(reinvestCalc.totalCost)}</strong>
                    </span>
                    <span
                      className={`font-bold px-2.5 py-1 rounded ${
                        reinvestCalc.balance >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {reinvestCalc.balance >= 0
                        ? `Remaining Sale Proceeds: ${formatNaira(reinvestCalc.balance)}`
                        : `Additional Cash Needed: ${formatNaira(Math.abs(reinvestCalc.balance))}`}
                    </span>
                  </div>
                )}
              </section>
            )}

            {/* Summary & Charges */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Instructions / Remarks
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any specific execution instructions or settlement notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div className="border border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50/80 to-amber-50/50">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-2 mb-2 border-b border-slate-200">
                  Consideration &amp; Statutory Charges
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>Gross Consideration</span>
                    <strong>{formatNaira(calc.gross)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Brokerage Commission ({rate.brokerage.toFixed(2)}%)</span>
                    <span>{formatNaira(calc.brokerage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEC Fee ({rate.sec.toFixed(2)}%)</span>
                    <span>{formatNaira(calc.sec)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NGX Transaction Fee ({rate.ngx.toFixed(2)}%)</span>
                    <span>{formatNaira(calc.ngx)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CSCS Fee ({rate.cscs.toFixed(2)}%)</span>
                    <span>{formatNaira(calc.cscs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stamp Duty ({rate.stamp.toFixed(2)}%)</span>
                    <span>{formatNaira(calc.stamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT on Brokerage ({rate.vat.toFixed(2)}%)</span>
                    <span>{formatNaira(calc.vat)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-slate-300">
                    <span>Total Charges &amp; Deductions</span>
                    <strong>{formatNaira(calc.totalCharges)}</strong>
                  </div>
                  <div className="flex justify-between p-2.5 mt-2 rounded-md bg-blue-700 text-white font-bold">
                    <span>{txType === 'BUY' ? 'Net Amount Payable' : 'Net Proceeds Receivable'}</span>
                    <span>{formatNaira(calc.netAmount)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Client Agreement & Indemnity */}
            <section className="p-4 border border-slate-200 border-l-4 border-l-blue-700 rounded-lg bg-slate-50">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                Client Agreement &amp; Indemnity
              </div>
              <p className="text-xs text-slate-600 mb-3">
                I/We hereby confirm that the above order is authorized by me/us, and I/we agree to
                indemnify and hold <strong>Regency Assets Management Limited</strong> harmless against
                any losses, claims, or liabilities arising from executing this mandate in accordance
                with NGX, NASD, SEC, and CSCS rules.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Do you agree to the terms &amp; indemnity above? <span className="text-red-600">*</span>
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="indemnity"
                    checked={indemnity === 'YES'}
                    onChange={() => setIndemnity('YES')}
                    className="accent-blue-700"
                  />
                  Yes, I Agree
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="indemnity"
                    checked={indemnity === 'NO'}
                    onChange={() => setIndemnity('NO')}
                    className="accent-blue-700"
                  />
                  No, I Do Not Agree
                </label>
              </div>
            </section>

            <footer className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] font-bold tracking-wide text-slate-600 uppercase">
              REGENCY ASSETS MANAGEMENT LIMITED IS LICENSED AND REGULATED BY SECURITIES AND EXCHANGE COMMISSION (SEC) NIGERIA
            </footer>
          </main>
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {view === 'admin' && (
        <div className="no-print space-y-4">
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
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('ngx_admin_auth');
                    setIsAdminAuth(false);
                    setView('client');
                  }}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Lock Admin
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
                  title="From Date"
                  className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  title="To Date"
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
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl">
            <h3 className="text-base font-bold mb-1">Admin Dashboard Login</h3>
            <p className="text-xs text-slate-500 mb-3">
              Enter the Regency Assets Management Limited admin password.
            </p>
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const expected = localStorage.getItem('ngx_admin_pass_v1') || 'regency2026';
                  if (loginPass === expected) {
                    sessionStorage.setItem('ngx_admin_auth', '1');
                    setIsAdminAuth(true);
                    setShowLoginModal(false);
                    setLoginErr(false);
                    setView('admin');
                  } else {
                    setLoginErr(true);
                  }
                }
              }}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mb-2"
            />
            {loginErr && <p className="text-xs text-red-600 mb-2">Incorrect password.</p>}
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const expected = localStorage.getItem('ngx_admin_pass_v1') || 'regency2026';
                  if (loginPass === expected) {
                    sessionStorage.setItem('ngx_admin_auth', '1');
                    setIsAdminAuth(true);
                    setShowLoginModal(false);
                    setLoginErr(false);
                    setView('admin');
                  } else {
                    setLoginErr(true);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-md cursor-pointer"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Schedule Modal */}
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

      <datalist id="stocksList">
        {pricelist.map((s) => (
          <option key={s.symbol} value={s.symbol} label={`${s.name} (₦${s.price.toFixed(2)})`} />
        ))}
      </datalist>
    </div>
  );
}
