(() => {
  'use strict';

  const DEFAULT_FEES = {
    BUY: {
      brokerage: 1.35,
      sec: 0.30,
      ngx: 0.00,
      cscs: 0.00,
      stamp: 0.08,
      vat: 7.50,
    },
    SELL: {
      brokerage: 1.35,
      sec: 0.00,
      ngx: 0.30,
      cscs: 0.30,
      stamp: 0.08,
      vat: 7.50,
    },
  };

  const SAMPLE_PRICELIST = [
    // Banking & Financial Services
    { symbol: 'ACCESSCORP', name: 'Access Holdings Plc', price: 24.10 },
    { symbol: 'ETI', name: 'Ecobank Transnational Incorporated', price: 26.50 },
    { symbol: 'FBNH', name: 'FBN Holdings Plc', price: 28.50 },
    { symbol: 'FCMB', name: 'FCMB Group Plc', price: 9.40 },
    { symbol: 'FIDELITYBK', name: 'Fidelity Bank Plc', price: 16.20 },
    { symbol: 'GTCO', name: 'Guaranty Trust Holding Co Plc', price: 58.25 },
    { symbol: 'JAIZBANK', name: 'Jaiz Bank Plc', price: 2.85 },
    { symbol: 'STANBIC', name: 'Stanbic IBTC Holdings Plc', price: 62.00 },
    { symbol: 'STERLINGNG', name: 'Sterling Financial Holdings Co Plc', price: 5.10 },
    { symbol: 'UBA', name: 'United Bank for Africa Plc', price: 33.40 },
    { symbol: 'UNITYBNK', name: 'Unity Bank Plc', price: 1.51 },
    { symbol: 'WEMABANK', name: 'Wema Bank Plc', price: 8.95 },
    { symbol: 'ZENITHBANK', name: 'Zenith Bank Plc', price: 46.80 },
    { symbol: 'NGXGROUP', name: 'Nigerian Exchange Group Plc', price: 26.00 },
    { symbol: 'UCAP', name: 'United Capital Plc', price: 18.50 },
    { symbol: 'AFRIPRUD', name: 'Africa Prudential Plc', price: 11.20 },
    { symbol: 'VFDGROUP', name: 'VFD Group Plc', price: 44.50 },
    // Industrial Goods
    { symbol: 'BUACEMENT', name: 'BUA Cement Plc', price: 95.00 },
    { symbol: 'DANGCEM', name: 'Dangote Cement Plc', price: 478.80 },
    { symbol: 'WAPCO', name: 'Lafarge Africa Plc', price: 68.50 },
    { symbol: 'BERGER', name: 'Berger Paints Nigeria Plc', price: 20.50 },
    { symbol: 'CAP', name: 'Chemical and Allied Products Plc', price: 38.00 },
    { symbol: 'CUTIX', name: 'Cutix Plc', price: 2.65 },
    { symbol: 'MEYER', name: 'Meyer Plc', price: 8.45 },
    { symbol: 'BETAGLAS', name: 'Beta Glass Plc', price: 64.00 },
    // Consumer Goods
    { symbol: 'BUAFOODS', name: 'BUA Foods Plc', price: 394.90 },
    { symbol: 'CADBURY', name: 'Cadbury Nigeria Plc', price: 21.50 },
    { symbol: 'CHAMPION', name: 'Champion Breweries Plc', price: 3.90 },
    { symbol: 'DANGSUGAR', name: 'Dangote Sugar Refinery Plc', price: 35.00 },
    { symbol: 'FLOURMILL', name: 'Flour Mills of Nigeria Plc', price: 68.00 },
    { symbol: 'GUINNESS', name: 'Guinness Nigeria Plc', price: 67.50 },
    { symbol: 'HONYFLOUR', name: 'Honeywell Flour Mill Plc', price: 5.80 },
    { symbol: 'INTBREW', name: 'International Breweries Plc', price: 4.50 },
    { symbol: 'NASCON', name: 'NASCON Allied Industries Plc', price: 36.00 },
    { symbol: 'NB', name: 'Nigerian Breweries Plc', price: 32.00 },
    { symbol: 'NESTLE', name: 'Nestle Nigeria Plc', price: 910.00 },
    { symbol: 'NNFM', name: 'Northern Nigeria Flour Mills Plc', price: 41.00 },
    { symbol: 'PZ', name: 'PZ Cussons Nigeria Plc', price: 24.00 },
    { symbol: 'UNILEVER', name: 'Unilever Nigeria Plc', price: 29.50 },
    { symbol: 'VITAFOAM', name: 'Vitafoam Nigeria Plc', price: 23.00 },
    // Oil & Gas
    { symbol: 'ARADEL', name: 'Aradel Holdings Plc', price: 590.00 },
    { symbol: 'CONOIL', name: 'Conoil Plc', price: 387.00 },
    { symbol: 'ETERNA', name: 'Eterna Plc', price: 26.50 },
    { symbol: 'JAPAULGOLD', name: 'Japaul Gold & Ventures Plc', price: 2.15 },
    { symbol: 'MRS', name: 'MRS Oil Nigeria Plc', price: 180.00 },
    { symbol: 'OANDO', name: 'Oando Plc', price: 65.00 },
    { symbol: 'SEPLAT', name: 'Seplat Energy Plc', price: 5700.00 },
    { symbol: 'TOTAL', name: 'TotalEnergies Marketing Nigeria Plc', price: 670.00 },
    // ICT & Telecoms
    { symbol: 'AIRTELAFRI', name: 'Airtel Africa Plc', price: 2156.90 },
    { symbol: 'MTNN', name: 'MTN Nigeria Communications Plc', price: 242.50 },
    { symbol: 'CHAMS', name: 'Chams Holding Company Plc', price: 2.10 },
    { symbol: 'CWG', name: 'CWG Plc', price: 7.45 },
    { symbol: 'ETRANZACT', name: 'eTranzact International Plc', price: 6.75 },
    // Agriculture
    { symbol: 'ELLAHLAKES', name: 'Ellah Lakes Plc', price: 3.30 },
    { symbol: 'FTNCOCOA', name: 'FTN Cocoa Processors Plc', price: 1.85 },
    { symbol: 'LIVESTOCK', name: 'Livestock Feeds Plc', price: 4.10 },
    { symbol: 'OKOMUOIL', name: 'Okomu Oil Palm Company Plc', price: 444.00 },
    { symbol: 'PRESCO', name: 'Presco Plc', price: 495.00 },
    // Healthcare
    { symbol: 'FIDSON', name: 'Fidson Healthcare Plc', price: 16.50 },
    { symbol: 'MAYBAKER', name: 'May & Baker Nigeria Plc', price: 8.20 },
    { symbol: 'MECURE', name: 'MeCure Industries Plc', price: 12.40 },
    { symbol: 'NEIMETH', name: 'Neimeth International Pharmaceuticals Plc', price: 2.35 },
    // Conglomerates & Utilities
    { symbol: 'GEREGU', name: 'Geregu Power Plc', price: 1150.00 },
    { symbol: 'TRANSCORP', name: 'Transnational Corporation Plc', price: 46.50 },
    { symbol: 'TRANSPOWER', name: 'Transcorp Power Plc', price: 359.90 },
    { symbol: 'UACN', name: 'UAC of Nigeria Plc', price: 28.00 },
    { symbol: 'JOHNHOLT', name: 'John Holt Plc', price: 7.20 },
    { symbol: 'SCOA', name: 'SCOA Nigeria Plc', price: 2.05 },
    // Construction, Real Estate & Services
    { symbol: 'JBERGER', name: 'Julius Berger Nigeria Plc', price: 155.00 },
    { symbol: 'UPDC', name: 'UPDC Plc', price: 1.65 },
    { symbol: 'NAHCO', name: 'Nigerian Aviation Handling Co Plc', price: 43.00 },
    { symbol: 'SKYAVN', name: 'Skyway Aviation Handling Co Plc', price: 31.00 },
    { symbol: 'CAVERTON', name: 'Caverton Offshore Support Grp Plc', price: 2.15 },
    { symbol: 'REDSTAREX', name: 'Red Star Express Plc', price: 4.50 },
    { symbol: 'RTBRISCOE', name: 'R.T. Briscoe (Nigeria) Plc', price: 2.60 },
    // Insurance
    { symbol: 'AIICO', name: 'AIICO Insurance Plc', price: 1.45 },
    { symbol: 'AXAMANSARD', name: 'AXA Mansard Insurance Plc', price: 7.80 },
    { symbol: 'CORNERST', name: 'Cornerstone Insurance Plc', price: 3.10 },
    { symbol: 'CUSTODIAN', name: 'Custodian Investment Plc', price: 15.50 },
    { symbol: 'LINKASSURE', name: 'Linkage Assurance Plc', price: 1.05 },
    { symbol: 'NEM', name: 'NEM Insurance Plc', price: 10.20 },
    { symbol: 'SOVRENINS', name: 'Sovereign Trust Insurance Plc', price: 0.78 },
    { symbol: 'WAPIC', name: 'Coronation Insurance Plc', price: 1.40 },
    // NASD OTC Securities Exchange
    { symbol: 'SD11PLC', name: '11 Plc (NASD)', price: 225.00 },
    { symbol: 'SDACORN', name: 'Acorn Petroleum Plc (NASD)', price: 1.35 },
    { symbol: 'SDCAPHOTEL', name: 'Capital Hotel Plc (NASD)', price: 3.10 },
    { symbol: 'SDCSCSPLC', name: 'Central Securities Clearing System Plc (NASD)', price: 24.50 },
    { symbol: 'SDFCWAMCO', name: 'FrieslandCampina WAMCO Nigeria Plc (NASD)', price: 42.00 },
    { symbol: 'SDGEOFLUID', name: 'Geo-Fluids Plc (NASD)', price: 4.50 },
    { symbol: 'SDMIXTA', name: 'Mixta Real Estate Plc (NASD)', price: 2.15 },
    { symbol: 'SDNASDPLC', name: 'NASD Plc (NASD)', price: 18.50 },
    { symbol: 'SDNIPCOPLC', name: 'Nipco Plc (NASD)', price: 145.00 },
    { symbol: 'SDUBNPROP', name: 'UBN Property Company Plc (NASD)', price: 1.85 },
    { symbol: 'SDFOODCON', name: 'Food Concepts Plc (NASD)', price: 2.10 },
    { symbol: 'SDTRUSTBOND', name: 'TrustBond Mortgage Bank Plc (NASD)', price: 0.90 },
    { symbol: 'SDCITITRUST', name: 'Cititrust Holdings Plc (NASD)', price: 12.00 },
    { symbol: 'SDCENTRAL', name: 'Central Securities Clearing System (NASD)', price: 24.50 },
  ];

  let fees = loadFees();
  let pricelist = loadPricelist();
  let mandates = loadMandates();
  let rows = [{ symbol: '', name: '', qty: '', price: '' }];

  // DOM Elements
  const txTypeEl = document.getElementById('txType');
  const mandateTypeBadge = document.getElementById('mandateTypeBadge');
  const mandateRefEl = document.getElementById('mandateRef');
  const mandateDateEl = document.getElementById('mandateDate');
  const orderBody = document.getElementById('orderBody');
  const ngxSymbolsList = document.getElementById('ngxSymbolsList');
  const pricelistFileEl = document.getElementById('pricelistFile');
  const pricelistStatusText = document.getElementById('pricelistStatusText');

  // Initialize
  init();

  function init() {
    mandateDateEl.value = new Date().toISOString().slice(0, 10);
    mandateRefEl.value = generateRef();
    populateDatalist();
    renderRows();
    recalculate();
    renderAdminDashboard();
    bindEvents();
  }

  function generateRef() {
    const now = new Date();
    const ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `MND-${ymd}-${rand}`;
  }

  function loadFees() {
    try {
      const saved = localStorage.getItem('ngx_mandate_fees_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {
      // ignore storage errors
    }
    return JSON.parse(JSON.stringify(DEFAULT_FEES));
  }

  function saveFees() {
    try {
      localStorage.setItem('ngx_mandate_fees_v1', JSON.stringify(fees));
    } catch (_) {
      // ignore storage errors
    }
  }

  function bindEvents() {
    txTypeEl.addEventListener('change', () => {
      const isBuy = txTypeEl.value === 'BUY';
      mandateTypeBadge.textContent = isBuy ? 'PURCHASE' : 'SALE';
      mandateTypeBadge.className = `type-badge ${isBuy ? 'buy' : 'sell'}`;
      recalculate();
    });

    document.getElementById('btnAddRow').addEventListener('click', () => {
      rows.push({ symbol: '', name: '', qty: '', price: '' });
      renderRows();
    });

    document.getElementById('btnPrint').addEventListener('click', () => {
      window.print();
    });
    document.getElementById('btnExportCsv').addEventListener('click', exportCsv);
    document.getElementById('btnExportExcel').addEventListener('click', exportExcel);
    document.getElementById('btnSubmitMandate').addEventListener('click', submitMandate);

    document.getElementById('btnViewClient').addEventListener('click', () => switchView('client'));
    document.getElementById('btnViewAdmin').addEventListener('click', () => {
      if (isAdminAuthenticated()) {
        switchView('admin');
      } else {
        openAdminLogin();
      }
    });

    document.getElementById('btnCloseLoginModal').addEventListener('click', closeAdminLogin);
    document.getElementById('btnCancelLogin').addEventListener('click', closeAdminLogin);
    document.getElementById('btnSubmitLogin').addEventListener('click', attemptAdminLogin);
    document.getElementById('adminPasswordInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptAdminLogin();
    });

    document.getElementById('btnLockAdmin').addEventListener('click', () => {
      sessionStorage.removeItem('ngx_admin_auth');
      switchView('client');
    });

    document.getElementById('btnChangeAdminPass').addEventListener('click', () => {
      const next = prompt('Enter new Admin Dashboard password (min 4 characters):');
      if (!next) return;
      if (next.trim().length < 4) {
        alert('Password must be at least 4 characters.');
        return;
      }
      localStorage.setItem('ngx_admin_pass_v1', next.trim());
      alert('Admin password updated successfully.');
    });

    document.getElementById('adminSearch').addEventListener('input', renderAdminDashboard);
    document.getElementById('adminStatusFilter').addEventListener('change', renderAdminDashboard);
    document.getElementById('adminTypeFilter').addEventListener('change', renderAdminDashboard);

    const deliveryEmailEl = document.getElementById('adminDeliveryEmail');
    deliveryEmailEl.value = localStorage.getItem('ngx_delivery_email_v1') || '';
    deliveryEmailEl.addEventListener('change', () => {
      localStorage.setItem('ngx_delivery_email_v1', deliveryEmailEl.value.trim());
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'ngx_mandates_v1') {
        mandates = loadMandates();
        renderAdminDashboard();
      } else if (e.key === 'ngx_pricelist_v1') {
        pricelist = loadPricelist();
        populateDatalist();
      } else if (e.key === 'ngx_mandate_fees_v1') {
        fees = loadFees();
        recalculate();
      }
    });

    document.getElementById('btnResetForm').addEventListener('click', () => {
      if (!confirm('Clear all client details and order rows?')) return;
      ['clientName', 'cscsNumber', 'chnNumber', 'clientPhone', 'clientEmail', 'bankAccount', 'mandateNotes', 'expiryDate'].forEach(
        (id) => {
          document.getElementById(id).value = '';
        }
      );
      mandateRefEl.value = generateRef();
      rows = [{ symbol: '', name: '', qty: '', price: '' }];
      renderRows();
      recalculate();
    });

    pricelistFileEl.addEventListener('change', handlePricelistUpload);
    document.getElementById('btnDownloadSample').addEventListener('click', downloadSampleCsv);

    // Fee Modal
    const feeModal = document.getElementById('feeModal');
    document.getElementById('btnFeeSettings').addEventListener('click', () => {
      openFeeModal();
      feeModal.classList.remove('hidden');
    });
    document.getElementById('btnCloseFeeModal').addEventListener('click', () => {
      feeModal.classList.add('hidden');
    });
    document.getElementById('btnResetFees').addEventListener('click', () => {
      fees = JSON.parse(JSON.stringify(DEFAULT_FEES));
      saveFees();
      openFeeModal();
      recalculate();
    });
    document.getElementById('btnSaveFees').addEventListener('click', () => {
      fees.BUY.brokerage = numVal('feeBuyBrokerage');
      fees.BUY.sec = numVal('feeBuySec');
      fees.BUY.ngx = numVal('feeBuyNgx');
      fees.BUY.cscs = numVal('feeBuyCscs');
      fees.BUY.stamp = numVal('feeBuyStamp');
      fees.BUY.vat = numVal('feeBuyVat');

      fees.SELL.brokerage = numVal('feeSellBrokerage');
      fees.SELL.sec = numVal('feeSellSec');
      fees.SELL.ngx = numVal('feeSellNgx');
      fees.SELL.cscs = numVal('feeSellCscs');
      fees.SELL.stamp = numVal('feeSellStamp');
      fees.SELL.vat = numVal('feeSellVat');

      saveFees();
      feeModal.classList.add('hidden');
      recalculate();
    });
  }

  function numVal(id) {
    const v = parseFloat(document.getElementById(id).value);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }

  function openFeeModal() {
    document.getElementById('feeBuyBrokerage').value = fees.BUY.brokerage;
    document.getElementById('feeBuySec').value = fees.BUY.sec;
    document.getElementById('feeBuyNgx').value = fees.BUY.ngx;
    document.getElementById('feeBuyCscs').value = fees.BUY.cscs;
    document.getElementById('feeBuyStamp').value = fees.BUY.stamp;
    document.getElementById('feeBuyVat').value = fees.BUY.vat;

    document.getElementById('feeSellBrokerage').value = fees.SELL.brokerage;
    document.getElementById('feeSellSec').value = fees.SELL.sec;
    document.getElementById('feeSellNgx').value = fees.SELL.ngx;
    document.getElementById('feeSellCscs').value = fees.SELL.cscs;
    document.getElementById('feeSellStamp').value = fees.SELL.stamp;
    document.getElementById('feeSellVat').value = fees.SELL.vat;
  }

  function populateDatalist() {
    ngxSymbolsList.innerHTML = '';
    pricelist.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item.symbol;
      opt.label = `${item.name} (₦${item.price.toFixed(2)})`;
      ngxSymbolsList.appendChild(opt);
    });
  }

  function renderRows() {
    orderBody.innerHTML = '';
    rows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      const consideration = (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0);

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <input type="text" class="table-input" list="ngxSymbolsList" data-idx="${idx}" data-field="symbol"
            value="${escapeHtml(row.symbol)}" placeholder="e.g. GTCO" />
        </td>
        <td>
          <input type="text" class="table-input" data-idx="${idx}" data-field="name"
            value="${escapeHtml(row.name)}" placeholder="Company Name" />
        </td>
        <td class="num">
          <input type="number" min="0" step="1" class="table-input num" data-idx="${idx}" data-field="qty"
            value="${escapeHtml(row.qty)}" placeholder="0" />
        </td>
        <td class="num">
          <input type="number" min="0" step="0.01" class="table-input num" data-idx="${idx}" data-field="price"
            value="${escapeHtml(row.price)}" placeholder="0.00" />
        </td>
        <td class="num consideration-cell" id="cons-${idx}">${formatNaira(consideration)}</td>
        <td class="no-print">
          <button type="button" class="btn-icon" data-remove="${idx}" title="Remove row">&times;</button>
        </td>
      `;
      orderBody.appendChild(tr);
    });

    orderBody.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', handleRowInput);
    });

    orderBody.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-remove'), 10);
        if (rows.length === 1) {
          rows[0] = { symbol: '', name: '', qty: '', price: '' };
        } else {
          rows.splice(idx, 1);
        }
        renderRows();
        recalculate();
      });
    });
  }

  function handleRowInput(e) {
    const idx = parseInt(e.target.getAttribute('data-idx'), 10);
    const field = e.target.getAttribute('data-field');
    const val = e.target.value;

    rows[idx][field] = val;

    if (field === 'symbol') {
      const match = pricelist.find(
        (p) => p.symbol.toUpperCase() === val.trim().toUpperCase()
      );
      if (match) {
        rows[idx].symbol = match.symbol;
        rows[idx].name = match.name;
        rows[idx].price = match.price.toFixed(2);
        const nameInput = orderBody.querySelector(`input[data-idx="${idx}"][data-field="name"]`);
        const priceInput = orderBody.querySelector(`input[data-idx="${idx}"][data-field="price"]`);
        if (nameInput) nameInput.value = match.name;
        if (priceInput) priceInput.value = match.price.toFixed(2);
      }
    }

    const rowCons = (parseFloat(rows[idx].qty) || 0) * (parseFloat(rows[idx].price) || 0);
    const consCell = document.getElementById(`cons-${idx}`);
    if (consCell) consCell.textContent = formatNaira(rowCons);

    recalculate();
  }

  function recalculate() {
    const type = txTypeEl.value;
    const rate = fees[type];

    const gross = rows.reduce((sum, r) => {
      return sum + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0);
    }, 0);

    const brokerage = gross * (rate.brokerage / 100);
    const sec = gross * (rate.sec / 100);
    const ngx = gross * (rate.ngx / 100);
    const cscs = gross * (rate.cscs / 100);
    const stamp = gross * (rate.stamp / 100);
    const vat = brokerage * (rate.vat / 100);

    const totalCharges = brokerage + sec + ngx + cscs + stamp + vat;
    const netAmount = type === 'BUY' ? gross + totalCharges : Math.max(0, gross - totalCharges);

    document.getElementById('lblBrokerageRate').textContent = rate.brokerage.toFixed(2);
    document.getElementById('lblSecRate').textContent = rate.sec.toFixed(2);
    document.getElementById('lblNgxRate').textContent = rate.ngx.toFixed(2);
    document.getElementById('lblCscsRate').textContent = rate.cscs.toFixed(2);
    document.getElementById('lblStampRate').textContent = rate.stamp.toFixed(2);
    document.getElementById('lblVatRate').textContent = rate.vat.toFixed(2);

    document.getElementById('valConsideration').textContent = formatNaira(gross);
    document.getElementById('valBrokerage').textContent = formatNaira(brokerage);
    document.getElementById('valSec').textContent = formatNaira(sec);
    document.getElementById('valNgx').textContent = formatNaira(ngx);
    document.getElementById('valCscs').textContent = formatNaira(cscs);
    document.getElementById('valStamp').textContent = formatNaira(stamp);
    document.getElementById('valVat').textContent = formatNaira(vat);
    document.getElementById('valTotalCharges').textContent = formatNaira(totalCharges);

    document.getElementById('lblNetAmount').textContent =
      type === 'BUY' ? 'Net Amount Payable' : 'Net Proceeds Receivable';
    document.getElementById('valNetAmount').textContent = formatNaira(netAmount);
  }

  function handlePricelistUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseNgxCsv(ev.target.result);
      if (parsed.length === 0) {
        pricelistStatusText.textContent =
          `Could not find valid Symbol & Price columns in "${file.name}". Please check the CSV format.`;
        return;
      }
      pricelist = parsed;
      savePricelist();
      populateDatalist();
      pricelistStatusText.textContent =
        `Loaded ${parsed.length} equities from "${file.name}". Select any symbol in the table to auto-fill its price.`;
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function parseNgxCsv(text) {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];

    const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    const symIdx = headers.findIndex((h) =>
      ['symbol', 'ticker', 'stock', 'security', 'code'].some((k) => h.includes(k))
    );
    const nameIdx = headers.findIndex((h) =>
      ['company', 'name', 'description', 'issuer'].some((k) => h.includes(k))
    );
    const priceIdx = headers.findIndex((h) =>
      ['close', 'price', 'last', 'current', 'vwap'].some((k) => h.includes(k))
    );

    if (symIdx === -1 || priceIdx === -1) return [];

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i]);
      const symbol = (cols[symIdx] || '').trim().toUpperCase();
      const rawPrice = (cols[priceIdx] || '').replace(/[₦,\s]/g, '');
      const price = parseFloat(rawPrice);
      if (!symbol || !Number.isFinite(price) || price <= 0) continue;
      const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].trim() : symbol;
      items.push({ symbol, name, price });
    }
    return items;
  }

  function splitCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  function downloadSampleCsv() {
    const header = 'Symbol,Company Name,Close Price\n';
    const body = SAMPLE_PRICELIST.map(
      (s) => `${s.symbol},"${s.name}",${s.price.toFixed(2)}`
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ngx_sample_pricelist.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatNaira(amount) {
    return (
      '₦' +
      Number(amount || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function getMandateSnapshot() {
    const type = txTypeEl.value;
    const rate = fees[type];
    const items = rows
      .filter((r) => r.symbol || r.name || parseFloat(r.qty) > 0)
      .map((r, i) => {
        const qty = parseFloat(r.qty) || 0;
        const price = parseFloat(r.price) || 0;
        return {
          index: i + 1,
          symbol: r.symbol || '',
          name: r.name || '',
          qty,
          price,
          consideration: qty * price,
        };
      });

    const gross = items.reduce((s, it) => s + it.consideration, 0);
    const brokerage = gross * (rate.brokerage / 100);
    const sec = gross * (rate.sec / 100);
    const ngx = gross * (rate.ngx / 100);
    const cscs = gross * (rate.cscs / 100);
    const stamp = gross * (rate.stamp / 100);
    const vat = brokerage * (rate.vat / 100);
    const totalCharges = brokerage + sec + ngx + cscs + stamp + vat;
    const netAmount = type === 'BUY' ? gross + totalCharges : Math.max(0, gross - totalCharges);

    return {
      ref: mandateRefEl.value || 'MANDATE',
      date: mandateDateEl.value || '',
      txType: type === 'BUY' ? 'Purchase (Buy)' : 'Sale (Sell)',
      orderType: document.getElementById('orderType').value,
      validity: document.getElementById('validity').value,
      expiryDate: document.getElementById('expiryDate').value,
      clientName: document.getElementById('clientName').value,
      cscsNumber: document.getElementById('cscsNumber').value,
      chnNumber: document.getElementById('chnNumber').value,
      clientPhone: document.getElementById('clientPhone').value,
      clientEmail: document.getElementById('clientEmail').value,
      bankAccount: document.getElementById('bankAccount').value,
      notes: document.getElementById('mandateNotes').value,
      items,
      rate,
      gross,
      brokerage,
      sec,
      ngx,
      cscs,
      stamp,
      vat,
      totalCharges,
      netLabel: type === 'BUY' ? 'Net Amount Payable' : 'Net Proceeds Receivable',
      netAmount,
    };
  }

  function csvCell(val) {
    const s = String(val ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv() {
    const d = getMandateSnapshot();
    const lines = [
      ['NGX STOCKBROKING MANDATE FORM'],
      ['Mandate Ref', d.ref, 'Date', d.date],
      ['Transaction Type', d.txType, 'Order Type', d.orderType],
      ['Validity', d.validity, 'Expiry Date', d.expiryDate],
      ['Client Name', d.clientName, 'CSCS No.', d.cscsNumber],
      ['CHN No.', d.chnNumber, 'Phone', d.clientPhone],
      ['Email', d.clientEmail, 'Settlement Bank', d.bankAccount],
      [],
      ['#', 'NGX Symbol', 'Security Name', 'Quantity (Units)', 'Price (NGN)', 'Consideration (NGN)'],
      ...d.items.map((it) => [
        it.index,
        it.symbol,
        it.name,
        it.qty,
        it.price.toFixed(2),
        it.consideration.toFixed(2),
      ]),
      [],
      ['CHARGES & SUMMARY', 'Rate (%)', 'Amount (NGN)'],
      ['Gross Consideration', '', d.gross.toFixed(2)],
      ['Brokerage Commission', d.rate.brokerage.toFixed(2), d.brokerage.toFixed(2)],
      ['SEC Fee', d.rate.sec.toFixed(2), d.sec.toFixed(2)],
      ['NGX Transaction Fee', d.rate.ngx.toFixed(2), d.ngx.toFixed(2)],
      ['CSCS Fee', d.rate.cscs.toFixed(2), d.cscs.toFixed(2)],
      ['Stamp Duty', d.rate.stamp.toFixed(2), d.stamp.toFixed(2)],
      ['VAT on Brokerage', d.rate.vat.toFixed(2), d.vat.toFixed(2)],
      ['Total Charges & Deductions', '', d.totalCharges.toFixed(2)],
      [d.netLabel, '', d.netAmount.toFixed(2)],
      [],
      ['Remarks', d.notes],
    ];

    const csv = '\uFEFF' + lines.map((row) => row.map(csvCell).join(',')).join('\r\n');
    triggerDownload(csv, `${d.ref}.csv`, 'text/csv;charset=utf-8;');
  }

  function exportExcel() {
    const d = getMandateSnapshot();
    const itemRows = d.items
      .map(
        (it) => `
      <tr>
        <td>${it.index}</td>
        <td>${escapeHtml(it.symbol)}</td>
        <td>${escapeHtml(it.name)}</td>
        <td style="text-align:right">${it.qty}</td>
        <td style="text-align:right">${it.price.toFixed(2)}</td>
        <td style="text-align:right">${it.consideration.toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1" cellspacing="0" cellpadding="5">
          <tr><th colspan="6" style="background:#0f4c81;color:#fff;font-size:14pt;">NGX STOCKBROKING MANDATE FORM</th></tr>
          <tr><td><b>Mandate Ref</b></td><td>${escapeHtml(d.ref)}</td><td><b>Date</b></td><td colspan="3">${escapeHtml(d.date)}</td></tr>
          <tr><td><b>Transaction Type</b></td><td>${escapeHtml(d.txType)}</td><td><b>Order Type</b></td><td>${escapeHtml(d.orderType)}</td><td><b>Validity</b></td><td>${escapeHtml(d.validity)}</td></tr>
          <tr><td><b>Client Name</b></td><td colspan="2">${escapeHtml(d.clientName)}</td><td><b>CSCS No.</b></td><td colspan="2">${escapeHtml(d.cscsNumber)}</td></tr>
          <tr><td><b>CHN No.</b></td><td>${escapeHtml(d.chnNumber)}</td><td><b>Phone</b></td><td>${escapeHtml(d.clientPhone)}</td><td><b>Email</b></td><td>${escapeHtml(d.clientEmail)}</td></tr>
          <tr><td><b>Settlement Bank</b></td><td colspan="5">${escapeHtml(d.bankAccount)}</td></tr>
          <tr><td colspan="6"></td></tr>
          <tr style="background:#f1f5f9;font-weight:bold;">
            <th>#</th><th>NGX Symbol</th><th>Security Name</th><th>Quantity</th><th>Price (NGN)</th><th>Consideration (NGN)</th>
          </tr>
          ${itemRows}
          <tr><td colspan="6"></td></tr>
          <tr><td colspan="4"><b>Gross Consideration</b></td><td></td><td style="text-align:right"><b>${d.gross.toFixed(2)}</b></td></tr>
          <tr><td colspan="4">Brokerage Commission</td><td style="text-align:right">${d.rate.brokerage.toFixed(2)}%</td><td style="text-align:right">${d.brokerage.toFixed(2)}</td></tr>
          <tr><td colspan="4">SEC Fee</td><td style="text-align:right">${d.rate.sec.toFixed(2)}%</td><td style="text-align:right">${d.sec.toFixed(2)}</td></tr>
          <tr><td colspan="4">NGX Transaction Fee</td><td style="text-align:right">${d.rate.ngx.toFixed(2)}%</td><td style="text-align:right">${d.ngx.toFixed(2)}</td></tr>
          <tr><td colspan="4">CSCS Fee</td><td style="text-align:right">${d.rate.cscs.toFixed(2)}%</td><td style="text-align:right">${d.cscs.toFixed(2)}</td></tr>
          <tr><td colspan="4">Stamp Duty</td><td style="text-align:right">${d.rate.stamp.toFixed(2)}%</td><td style="text-align:right">${d.stamp.toFixed(2)}</td></tr>
          <tr><td colspan="4">VAT on Brokerage</td><td style="text-align:right">${d.rate.vat.toFixed(2)}%</td><td style="text-align:right">${d.vat.toFixed(2)}</td></tr>
          <tr><td colspan="4"><b>Total Charges &amp; Deductions</b></td><td></td><td style="text-align:right"><b>${d.totalCharges.toFixed(2)}</b></td></tr>
          <tr style="background:#0f4c81;color:#fff;font-weight:bold;"><td colspan="4">${escapeHtml(d.netLabel)}</td><td></td><td style="text-align:right">${d.netAmount.toFixed(2)}</td></tr>
          <tr><td><b>Remarks</b></td><td colspan="5">${escapeHtml(d.notes)}</td></tr>
        </table>
      </body>
      </html>`;

    triggerDownload('\uFEFF' + html, `${d.ref}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
  }

  function triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadPricelist() {
    try {
      const saved = localStorage.getItem('ngx_pricelist_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [...SAMPLE_PRICELIST];
  }

  function savePricelist() {
    try {
      localStorage.setItem('ngx_pricelist_v1', JSON.stringify(pricelist));
    } catch (_) {}
  }

  function loadMandates() {
    try {
      const saved = localStorage.getItem('ngx_mandates_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  }

  function saveMandates() {
    try {
      localStorage.setItem('ngx_mandates_v1', JSON.stringify(mandates));
    } catch (_) {}
  }

  function isAdminAuthenticated() {
    return sessionStorage.getItem('ngx_admin_auth') === '1';
  }

  function getAdminPassword() {
    return localStorage.getItem('ngx_admin_pass_v1') || 'regency2026';
  }

  function openAdminLogin() {
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminLoginError').style.display = 'none';
    document.getElementById('adminLoginModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('adminPasswordInput').focus(), 50);
  }

  function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('hidden');
  }

  function attemptAdminLogin() {
    const entered = document.getElementById('adminPasswordInput').value;
    if (entered === getAdminPassword()) {
      sessionStorage.setItem('ngx_admin_auth', '1');
      closeAdminLogin();
      switchView('admin');
    } else {
      document.getElementById('adminLoginError').style.display = 'block';
    }
  }

  function switchView(view) {
    const clientView = document.getElementById('clientView');
    const adminView = document.getElementById('adminView');
    const btnClient = document.getElementById('btnViewClient');
    const btnAdmin = document.getElementById('btnViewAdmin');

    if (view === 'admin') {
      clientView.classList.add('hidden');
      adminView.classList.remove('hidden');
      btnClient.classList.remove('active');
      btnAdmin.classList.add('active');
      renderAdminDashboard();
    } else {
      adminView.classList.add('hidden');
      clientView.classList.remove('hidden');
      btnAdmin.classList.remove('active');
      btnClient.classList.add('active');
    }
  }

  function submitMandate() {
    const d = getMandateSnapshot();
    if (!d.clientName.trim()) {
      alert('Please enter your Client Full Name / Corporate Name before submitting.');
      document.getElementById('clientName').focus();
      return;
    }
    if (!d.clientPhone.trim()) {
      alert('Please enter your Phone Number before submitting.');
      document.getElementById('clientPhone').focus();
      return;
    }
    if (!d.clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.clientEmail.trim())) {
      alert('Please enter a valid Email Address before submitting.');
      document.getElementById('clientEmail').focus();
      return;
    }
    if (d.items.length === 0 || d.gross <= 0) {
      alert('Please add at least one security with a valid quantity and price.');
      return;
    }
    const agreed = document.getElementById('indemnityYes').checked;
    if (!agreed) {
      alert('Please select "Yes, I Agree" on the Client Agreement & Indemnity before submitting.');
      document.getElementById('indemnityYes').focus();
      return;
    }

    const record = {
      ...d,
      rawType: txTypeEl.value,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    mandates.unshift(record);
    saveMandates();
    renderAdminDashboard();

    // Auto-download Excel file for attachment
    exportExcel();

    // Open pre-filled email to configured Dealing Desk / Admin email
    const deliveryEmail = (localStorage.getItem('ngx_delivery_email_v1') || '').trim();
    if (deliveryEmail) {
      const subject = encodeURIComponent(
        `New ${record.txType} Mandate - ${record.ref} (${record.clientName})`
      );
      const body = encodeURIComponent(
        `Dear Regency Assets Management Limited,\n\n` +
          `Please find attached the Excel mandate (${record.ref}.xls) for:\n` +
          `- Client: ${record.clientName}\n` +
          `- CSCS No.: ${record.cscsNumber || 'N/A'}\n` +
          `- Transaction: ${record.txType}\n` +
          `- Gross Consideration: ${formatNaira(record.gross)}\n` +
          `- Total Charges: ${formatNaira(record.totalCharges)}\n` +
          `- ${record.netLabel}: ${formatNaira(record.netAmount)}\n\n` +
          `Please attach the downloaded "${record.ref}.xls" file before sending.\n`
      );
      window.location.href = `mailto:${encodeURIComponent(deliveryEmail)}?subject=${subject}&body=${body}`;
    }

    const toast = document.getElementById('submitSuccessToast');
    toast.textContent = deliveryEmail
      ? `Mandate ${record.ref} submitted! Excel file (${record.ref}.xls) downloaded and email draft opened for ${deliveryEmail}.`
      : `Mandate ${record.ref} submitted and Excel file (${record.ref}.xls) downloaded!`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 7000);

    mandateRefEl.value = generateRef();
  }

  function renderAdminDashboard() {
    const pendingCount = mandates.filter((m) => m.status === 'PENDING').length;
    const approvedCount = mandates.filter((m) => m.status === 'APPROVED' || m.status === 'EXECUTED').length;
    const totalVolume = mandates.reduce((s, m) => s + (m.gross || 0), 0);

    document.getElementById('pendingBadge').textContent = pendingCount;
    document.getElementById('kpiTotal').textContent = mandates.length;
    document.getElementById('kpiPending').textContent = pendingCount;
    document.getElementById('kpiApproved').textContent = approvedCount;
    document.getElementById('kpiVolume').textContent = formatNaira(totalVolume);

    const q = (document.getElementById('adminSearch').value || '').toLowerCase().trim();
    const st = document.getElementById('adminStatusFilter').value;
    const tp = document.getElementById('adminTypeFilter').value;

    const filtered = mandates.filter((m) => {
      if (st !== 'ALL' && m.status !== st) return false;
      if (tp !== 'ALL' && m.rawType !== tp) return false;
      if (q) {
        const hay = `${m.ref} ${m.clientName} ${m.cscsNumber}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const tbody = document.getElementById('adminTableBody');
    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:24px;">No matching mandates found.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (m) => `
      <tr>
        <td><strong>${escapeHtml(m.ref)}</strong></td>
        <td>${escapeHtml(m.date)}</td>
        <td>${escapeHtml(m.clientName)}</td>
        <td>${escapeHtml(m.cscsNumber || '-')}</td>
        <td><span class="type-badge ${m.rawType === 'BUY' ? 'buy' : 'sell'}" style="font-size:11px;padding:2px 7px;">${m.rawType}</span></td>
        <td class="num">${formatNaira(m.gross)}</td>
        <td class="num">${formatNaira(m.totalCharges)}</td>
        <td class="num"><strong>${formatNaira(m.netAmount)}</strong></td>
        <td><span class="status-pill status-${m.status}">${m.status}</span></td>
        <td>
          <div class="action-group">
            <button type="button" class="btn-xs" data-act="load" data-ref="${escapeHtml(m.ref)}">View</button>
            <button type="button" class="btn-xs" data-act="APPROVED" data-ref="${escapeHtml(m.ref)}">Approve</button>
            <button type="button" class="btn-xs" data-act="EXECUTED" data-ref="${escapeHtml(m.ref)}">Execute</button>
            <button type="button" class="btn-xs" data-act="REJECTED" data-ref="${escapeHtml(m.ref)}">Reject</button>
          </div>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const act = e.currentTarget.getAttribute('data-act');
        const ref = e.currentTarget.getAttribute('data-ref');
        const target = mandates.find((m) => m.ref === ref);
        if (!target) return;

        if (act === 'load') {
          loadMandateIntoForm(target);
          switchView('client');
        } else {
          target.status = act;
          saveMandates();
          renderAdminDashboard();
        }
      });
    });
  }

  function loadMandateIntoForm(m) {
    mandateRefEl.value = m.ref;
    mandateDateEl.value = m.date;
    txTypeEl.value = m.rawType;
    txTypeEl.dispatchEvent(new Event('change'));
    document.getElementById('orderType').value = m.orderType || 'MARKET';
    document.getElementById('validity').value = m.validity || 'DAY';
    document.getElementById('expiryDate').value = m.expiryDate || '';
    document.getElementById('clientName').value = m.clientName || '';
    document.getElementById('cscsNumber').value = m.cscsNumber || '';
    document.getElementById('chnNumber').value = m.chnNumber || '';
    document.getElementById('clientPhone').value = m.clientPhone || '';
    document.getElementById('clientEmail').value = m.clientEmail || '';
    document.getElementById('bankAccount').value = m.bankAccount || '';
    document.getElementById('mandateNotes').value = m.notes || '';
    rows = m.items.map((it) => ({
      symbol: it.symbol,
      name: it.name,
      qty: String(it.qty),
      price: String(it.price),
    }));
    if (rows.length === 0) rows = [{ symbol: '', name: '', qty: '', price: '' }];
    renderRows();
    recalculate();
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
