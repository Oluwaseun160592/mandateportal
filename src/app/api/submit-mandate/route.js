import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildExcelHtml(d) {
  const itemRows = (d.items || [])
    .map(
      (it) => `
    <tr>
      <td>${it.index}</td>
      <td>${esc(it.symbol)}</td>
      <td>${esc(it.name)}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">${Number(it.price).toFixed(2)}</td>
      <td style="text-align:right">${Number(it.consideration).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head><meta charset="UTF-8" /></head>
  <body>
    <table border="1" cellspacing="0" cellpadding="6">
      <tr><th colspan="6" style="background:#0052cc;color:#fff;font-size:14pt;">REGENCY ASSETS MANAGEMENT LIMITED — MANDATE FORM</th></tr>
      <tr><td><b>Mandate Ref</b></td><td>${esc(d.ref)}</td><td><b>Date</b></td><td colspan="3">${esc(d.date)}</td></tr>
      <tr><td><b>Transaction Type</b></td><td>${esc(d.txType)}</td><td><b>Order Type</b></td><td>${esc(d.orderType)}</td><td><b>Validity</b></td><td>${esc(d.validity)}</td></tr>
      <tr><td><b>Client Name</b></td><td colspan="2">${esc(d.clientName)}</td><td><b>CSCS No.</b></td><td colspan="2">${esc(d.cscsNumber)}</td></tr>
      <tr><td><b>CHN No.</b></td><td>${esc(d.chnNumber)}</td><td><b>Phone</b></td><td>${esc(d.clientPhone)}</td><td><b>Email</b></td><td>${esc(d.clientEmail)}</td></tr>
      <tr><td><b>Settlement Bank</b></td><td colspan="3">${esc(d.bankAccount)}</td><td><b>Indemnity Agreed</b></td><td>${d.indemnityAgreed ? 'YES' : 'NO'}</td></tr>
      <tr><td colspan="6"></td></tr>
      <tr style="background:#f1f5f9;font-weight:bold;">
        <th>#</th><th>Symbol</th><th>Security Name</th><th>Quantity</th><th>Price (NGN)</th><th>Consideration (NGN)</th>
      </tr>
      ${itemRows}
      <tr><td colspan="6"></td></tr>
      <tr><td colspan="4"><b>Gross Consideration</b></td><td></td><td style="text-align:right"><b>${Number(d.gross).toFixed(2)}</b></td></tr>
      <tr><td colspan="4">Brokerage Commission</td><td style="text-align:right">${Number(d.rate?.brokerage || 0).toFixed(2)}%</td><td style="text-align:right">${Number(d.brokerage).toFixed(2)}</td></tr>
      <tr><td colspan="4">SEC Fee</td><td style="text-align:right">${Number(d.rate?.sec || 0).toFixed(2)}%</td><td style="text-align:right">${Number(d.sec).toFixed(2)}</td></tr>
      <tr><td colspan="4">NGX Transaction Fee</td><td style="text-align:right">${Number(d.rate?.ngx || 0).toFixed(2)}%</td><td style="text-align:right">${Number(d.ngx).toFixed(2)}</td></tr>
      <tr><td colspan="4">CSCS Fee</td><td style="text-align:right">${Number(d.rate?.cscs || 0).toFixed(2)}%</td><td style="text-align:right">${Number(d.cscs).toFixed(2)}</td></tr>
      <tr><td colspan="4">Stamp Duty</td><td style="text-align:right">${Number(d.rate?.stamp || 0).toFixed(2)}%</td><td style="text-align:right">${Number(d.stamp).toFixed(2)}</td></tr>
      <tr><td colspan="4">VAT on Brokerage</td><td style="text-align:right">${Number(d.rate?.vat || 0).toFixed(2)}%</td><td style="text-align:right">${Number(d.vat).toFixed(2)}</td></tr>
      <tr><td colspan="4"><b>Total Charges &amp; Deductions</b></td><td></td><td style="text-align:right"><b>${Number(d.totalCharges).toFixed(2)}</b></td></tr>
      <tr style="background:#0052cc;color:#fff;font-weight:bold;"><td colspan="4">${esc(d.netLabel)}</td><td></td><td style="text-align:right">${Number(d.netAmount).toFixed(2)}</td></tr>
      <tr><td><b>Remarks</b></td><td colspan="5">${esc(d.notes)}</td></tr>
    </table>
  </body>
  </html>`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { mandate, deliveryEmail } = body;
    const recipient = (deliveryEmail || process.env.DEFAULT_DELIVERY_EMAIL || '').trim();

    if (!recipient || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        ok: true,
        emailed: false,
        reason: 'SMTP credentials not configured in .env.local',
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const xlsContent = '\uFEFF' + buildExcelHtml(mandate);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      replyTo: mandate.clientEmail,
      subject: `New ${mandate.txType} Mandate — ${mandate.ref} (${mandate.clientName})`,
      text: `New client mandate submitted by ${mandate.clientName} (${mandate.clientPhone}, ${mandate.clientEmail}).\n\nMandate Ref: ${mandate.ref}\nTransaction: ${mandate.txType}\nGross Consideration: NGN ${Number(mandate.gross).toFixed(2)}\nTotal Charges: NGN ${Number(mandate.totalCharges).toFixed(2)}\n${mandate.netLabel}: NGN ${Number(mandate.netAmount).toFixed(2)}\nIndemnity Agreed: YES`,
      attachments: [
        {
          filename: `${mandate.ref}.xls`,
          content: xlsContent,
          contentType: 'application/vnd.ms-excel',
        },
      ],
    });

    return NextResponse.json({ ok: true, emailed: true, recipient });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
