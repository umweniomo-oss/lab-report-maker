import './style.css';
import { heroArt, emptyArt, testsArt, companyArt } from './art.js';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const $ = (s) => document.querySelector(s);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
class V extends Error { constructor(m, sel) { super(m); this.sel = sel; } }

let tt;
function toast(m, t = 'err') { const e = $('#toast'); e.textContent = m; e.className = 'show ' + t; clearTimeout(tt); tt = setTimeout(() => (e.className = ''), 3500); }
const run = async (f) => { try { await f(); } catch (e) { if (/cancel/i.test(e?.message || '')) return; if (e?.sel) $(e.sel)?.classList.add('bad'); toast(e?.message || 'Something went wrong. Please try again.'); } };
window.addEventListener('error', () => toast('Something went wrong. Please try again.'));
window.addEventListener('unhandledrejection', (e) => { e.preventDefault(); toast('Something went wrong. Please try again.'); });

const DEF = [['Colour', 'ASTM D 1500', ''], ['Colour Rating', 'ASTM D 1500', ''], ['Flash Point', 'ASTM D 92', '°C'], ['Density at 15°C', 'ASTM D 1298', 'gm/cc'], ['Kinematic Viscosity At 40°C', 'ASTM D 445', 'cSt'], ['Kinematic Viscosity At 100°C', 'ASTM D 445', 'cSt'], ['Viscosity Index', 'ASTM D 2270', ''], ['Moisture Content', 'ASTM D 5349', '%']];
const S = {
  company: load('company', { name: '', addr: '', contact: '', logo: '', signatory: '', disclaimer: 'This certificate shall not be reproduced, except in full, unless written permission from the company. Samples submitted by party. The results relate only to the samples tested.' }),
  lib: load('lib', [{ id: uid(), cat: 'PHYSICAL ANALYSIS', tests: DEF.map(([name, std, unit]) => ({ id: uid(), name, std, unit })) }]),
  reports: load('reports', []), view: 'home', rid: null, q: '',
};
const persist = () => { try { localStorage.setItem('company', JSON.stringify(S.company)); localStorage.setItem('lib', JSON.stringify(S.lib)); localStorage.setItem('reports', JSON.stringify(S.reports)); } catch { toast('Could not save. Phone storage may be full.'); } };
let pt; const persistSoon = () => { clearTimeout(pt); pt = setTimeout(persist, 300); };
const setp = (path, val) => { const k = path.split('.'); let o = S; while (k.length > 1) o = o[k.shift()]; o[k[0]] = val; persistSoon(); };
const cur = () => S.reports.find((r) => r.id === S.rid);
const inp = (p, l, v, t = 'text') => `<label>${l}<input type="${t}" data-p="${p}" value="${esc(v)}"></label>`;

const views = {
  home() {
    const q = S.q.toLowerCase(), list = S.reports.filter((r) => (r.certNo + r.client.name).toLowerCase().includes(q));
    return heroArt + `<h2>Reports</h2><input id="q" placeholder="Search by certificate no. or client" value="${esc(S.q)}">` +
      (list.length ? list.map((r) => `<div class="card"><b>${esc(r.certNo)}</b><small>${esc(r.client.name || 'No client yet')} · ${esc(r.date)}</small><div class="row"><span><button data-a="open" data-id="${r.id}">Open</button><button data-a="pdf" data-id="${r.id}">PDF</button><button data-a="dup" data-id="${r.id}">Copy</button></span><button class="danger" data-a="del" data-id="${r.id}">Delete</button></div></div>`).join('') : emptyArt + '<p class="empty">No reports yet. Tap New Report to start.</p>') +
      '<button class="fab" data-a="newr">+ New Report</button>';
  },
  edit() {
    const ri = S.reports.findIndex((r) => r.id === S.rid), r = S.reports[ri], P = `reports.${ri}.`;
    return `<div class="bar"><button data-a="tab" data-v="home">Back</button><h2>Report</h2></div>
<div class="card"><h3>Details</h3>${inp(P + 'certNo', 'Certificate no.', r.certNo)}${inp(P + 'invoiceNo', 'Invoice no.', r.invoiceNo)}${inp(P + 'date', 'Date', r.date, 'date')}${inp(P + 'sample.type', 'Sample type', r.sample.type)}${inp(P + 'sample.ref', 'Sample reference', r.sample.ref)}</div>
<div class="card"><h3>Client</h3>${inp(P + 'client.name', 'Client name', r.client.name)}${inp(P + 'client.addr', 'Client address', r.client.addr)}</div>` +
      r.pages.map((pg, i) => `<div class="card"><div class="row"><h3>Page ${i + 1}</h3>${r.pages.length > 1 ? `<button class="danger" data-a="rmpage" data-i="${i}">Remove page</button>` : ''}</div>` +
        pg.blocks.map((b, j) => `<div class="blk"><div class="row"><b>${esc(b.cat)}</b><button class="danger" data-a="rmblock" data-i="${i}" data-j="${j}">Remove</button></div>` +
          b.rows.map((x, k) => { const Q = `${P}pages.${i}.blocks.${j}.rows.${k}.`; return `<div class="trow"><input data-p="${Q}name" value="${esc(x.name)}" placeholder="Test"><input data-p="${Q}std" value="${esc(x.std)}" placeholder="Standard"><button class="danger" data-a="rmrow" data-i="${i}" data-j="${j}" data-k="${k}">✕</button><input data-p="${Q}result" value="${esc(x.result)}" placeholder="Result${x.unit ? ' (' + esc(x.unit) + ' added for you)' : ''}"></div>`; }).join('') +
          `<button data-a="addrow" data-i="${i}" data-j="${j}">+ Test row</button></div>`).join('') +
        `<div class="row"><select id="cat${i}" style="flex:1">${S.lib.map((c) => `<option value="${c.id}">${esc(c.cat)}</option>`).join('')}</select><button data-a="addcat" data-i="${i}">Add category</button></div></div>`).join('') +
      `<button data-a="addpage">+ Add page</button><button class="fab" data-a="pdf" data-id="${r.id}">Export PDF</button>`;
  },
  lib() {
    return testsArt + '<h2>Test Library</h2>' + S.lib.map((c, ci) => `<div class="card"><div class="row"><input data-p="lib.${ci}.cat" value="${esc(c.cat)}" style="flex:1"><button class="danger" data-a="rmlcat" data-i="${ci}">Delete</button></div>` +
      c.tests.map((t, ti) => `<div class="trow"><input data-p="lib.${ci}.tests.${ti}.name" value="${esc(t.name)}" placeholder="Test"><input data-p="lib.${ci}.tests.${ti}.std" value="${esc(t.std)}" placeholder="Standard"><button class="danger" data-a="rmtest" data-i="${ci}" data-j="${ti}">✕</button><input data-p="lib.${ci}.tests.${ti}.unit" value="${esc(t.unit)}" placeholder="Unit"></div>`).join('') +
      `<button data-a="addtest" data-i="${ci}">+ Test</button></div>`).join('') +
      '<div class="card"><h3>New category</h3><input id="newcat" placeholder="e.g. Chemical Analysis"><button data-a="addlcat">Add category</button></div>';
  },
  co() {
    const c = S.company;
    return companyArt + `<h2>Company</h2><div class="card">${c.logo ? `<img src="${c.logo}" alt="Logo" style="max-height:70px">` : '<p class="empty">No logo yet.</p>'}<label>Company logo<input id="logo" type="file" accept="image/*"></label>${c.logo ? '<button class="danger" data-a="rmlogo">Remove logo</button>' : ''}
${inp('company.name', 'Company name', c.name)}${inp('company.addr', 'Address', c.addr)}${inp('company.contact', 'Phone, email, website', c.contact)}${inp('company.signatory', 'Signatory name and title', c.signatory)}<label>Footer note<textarea rows="4" data-p="company.disclaimer">${esc(c.disclaimer)}</textarea></label></div>`;
  },
};
function render() {
  const v = S.view; $('#app').innerHTML = `<section class="view">${views[v]()}</section>`;
  const n = $('#nav'); n.style.display = v === 'edit' ? 'none' : 'flex';
  n.innerHTML = [['home', '📄', 'Reports'], ['lib', '🧪', 'Tests'], ['co', '🏢', 'Company']].map(([k, i, t]) => `<button data-a="tab" data-v="${k}" class="${v === k ? 'on' : ''}"><span>${i}</span>${t}</button>`).join('');
}

const go = (f) => (d) => { f(d); persist(); render(); };
const act = {
  tab: (d) => { S.view = d.v; render(); },
  newr: go(() => { const r = { id: uid(), certNo: `CERT-${new Date().getFullYear()}-${String(S.reports.length + 1).padStart(3, '0')}`, invoiceNo: '', date: new Date().toISOString().slice(0, 10), client: { name: '', addr: '' }, sample: { type: 'Oil Sample', ref: '' }, pages: [{ blocks: [] }] }; S.reports.unshift(r); S.rid = r.id; S.view = 'edit'; }),
  open: (d) => { S.rid = d.id; S.view = 'edit'; render(); },
  dup: go((d) => { const r = JSON.parse(JSON.stringify(S.reports.find((x) => x.id === d.id))); r.id = uid(); r.certNo += '-COPY'; S.reports.unshift(r); }),
  del: (d) => { if (!confirm('Delete this report?')) return; S.reports = S.reports.filter((x) => x.id !== d.id); persist(); render(); },
  pdf: (d) => exportPdf(d.id),
  addpage: go(() => cur().pages.push({ blocks: [] })),
  rmpage: go((d) => cur().pages.splice(+d.i, 1)),
  addcat: go((d) => { const c = S.lib.find((x) => x.id === $('#cat' + d.i)?.value); if (!c) throw new Error('Add a category in the Tests tab first.'); cur().pages[d.i].blocks.push({ cat: c.cat, rows: c.tests.map((t) => ({ name: t.name, std: t.std, unit: t.unit || '', result: '' })) }); }),
  rmblock: go((d) => cur().pages[d.i].blocks.splice(+d.j, 1)),
  addrow: go((d) => cur().pages[d.i].blocks[d.j].rows.push({ name: '', std: '', unit: '', result: '' })),
  rmrow: go((d) => cur().pages[d.i].blocks[d.j].rows.splice(+d.k, 1)),
  addlcat: go(() => { const n = $('#newcat').value.trim(); if (!n) throw new V('Type a category name first.', '#newcat'); S.lib.push({ id: uid(), cat: n.toUpperCase(), tests: [] }); }),
  rmlcat: (d) => { if (!confirm('Delete this category and its tests?')) return; S.lib.splice(+d.i, 1); persist(); render(); },
  addtest: go((d) => S.lib[d.i].tests.push({ id: uid(), name: '', std: '', unit: '' })),
  rmtest: go((d) => S.lib[d.i].tests.splice(+d.j, 1)),
  rmlogo: go(() => { S.company.logo = ''; }),
};
document.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) run(() => act[b.dataset.a](b.dataset)); });
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'q') { S.q = t.value; render(); const q = $('#q'); q.focus(); q.setSelectionRange(99, 99); return; }
  if (t.dataset.p) { t.classList.remove('bad'); run(() => setp(t.dataset.p, t.value)); }
});
document.addEventListener('change', (e) => { if (e.target.id === 'logo') run(async () => { const f = e.target.files[0]; if (!f) return; S.company.logo = await readLogo(f); persist(); render(); toast('Logo saved.', 'ok'); }); });

function readLogo(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader(); fr.onerror = () => rej(new Error('Could not read that file.'));
    fr.onload = () => { const im = new Image(); im.onerror = () => rej(new Error('That file is not a valid image.')); im.onload = () => { const s = Math.min(1, 300 / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/png')); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}

function drawPage(d, r, c, pg, i, n) {
  const W = 210; let y = 12;
  if (c.logo) { try { const p = d.getImageProperties(c.logo), s = Math.min(28 / p.width, 22 / p.height); d.addImage(c.logo, 'PNG', 14, y - 2, p.width * s, p.height * s); } catch { /* skip bad logo */ } }
  d.setFont('helvetica', 'bold').setFontSize(16).text(c.name, W / 2 + 8, y + 4, { align: 'center', maxWidth: 140 });
  d.setFont('helvetica', 'normal').setFontSize(8);
  [c.addr, c.contact].filter(Boolean).forEach((t, k) => d.text(t, W / 2 + 8, y + 10 + k * 4, { align: 'center', maxWidth: 140 }));
  d.setDrawColor(40).setLineWidth(0.5).line(14, 36, W - 14, 36);
  y = 46; d.setFontSize(10);
  d.text('Invoice No.: ' + (r.invoiceNo || '-'), 14, y); d.text(r.date, W - 14, y, { align: 'right' }); d.text('Test Certificate No.: ' + r.certNo, 14, y + 6);
  d.text('To,', 14, y + 16); d.setFont('helvetica', 'bold').text(r.client.name, 14, y + 22); d.setFont('helvetica', 'normal');
  let ay = y + 22; if (r.client.addr) d.splitTextToSize(r.client.addr, 120).forEach((t) => { ay += 5; d.text(t, 14, ay); });
  y = ay + 12; d.setFont('helvetica', 'bold').setFontSize(13).text('TEST CERTIFICATE', W / 2, y, { align: 'center', charSpace: 2 });
  y += 8; d.setFont('helvetica', 'normal').setFontSize(10).text(`We hereby certify the following results of your ${r.sample.type || 'sample'}${r.sample.ref ? ' (' + r.sample.ref + ')' : ''} tested.`, 14, y, { maxWidth: W - 28 }); y += 8;
  pg.blocks.forEach((b) => {
    const rows = b.rows.filter((x) => x.name.trim()); if (!rows.length) return;
    if (y > 235) { d.addPage(); y = 20; }
    d.setFont('helvetica', 'bold').setFontSize(10).text(b.cat, 14, y); y += 3;
    const cw = [16, 70, 50, 46];
    const row = (cells, bold) => { d.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(9); let x = 14; cells.forEach((t, k) => { d.rect(x, y, cw[k], 8); d.text(String(t), x + cw[k] / 2, y + 5.3, { align: 'center', maxWidth: cw[k] - 2 }); x += cw[k]; }); y += 8; };
    const hd = ['Sr. No.', 'Test', 'Standard', 'Results']; row(hd, true);
    rows.forEach((x, k) => { if (y > 248) { d.addPage(); y = 20; row(hd, true); } row([k + 1, x.name, x.std, x.result ? `${x.result} ${x.unit || ''}`.trim() : '-']); });
    y += 8;
  });
  d.setFont('helvetica', 'bold').setFontSize(10).text('FOR ' + c.name.toUpperCase(), 14, 262);
  d.setFont('helvetica', 'normal'); if (c.signatory) d.text(c.signatory, 14, 268);
  d.setFontSize(7).text(d.splitTextToSize(c.disclaimer || '', W - 28), 14, 280); d.text(`Page ${i + 1} of ${n}`, W - 14, 292, { align: 'right' });
}

async function exportPdf(id) {
  const r = S.reports.find((x) => x.id === id); if (!r) throw new Error('Report not found.');
  const sel = (p) => `[data-p="reports.${S.reports.indexOf(r)}.${p}"]`;
  if (!r.certNo.trim()) throw new V('Certificate number is required.', sel('certNo'));
  if (!r.client.name.trim()) throw new V('Client name is required.', sel('client.name'));
  if (!S.company.name.trim()) throw new Error('Add your company name in the Company tab first.');
  if (!r.pages.some((p) => p.blocks.some((b) => b.rows.some((x) => x.result.trim())))) throw new Error('Enter at least one test result first.');
  const d = new jsPDF({ unit: 'mm', format: 'a4' });
  r.pages.forEach((pg, i) => { if (i) d.addPage(); drawPage(d, r, S.company, pg, i, r.pages.length); });
  const name = r.certNo.replace(/[^\w-]+/g, '_') + '.pdf';
  if (Capacitor.isNativePlatform()) {
    const f = await Filesystem.writeFile({ path: name, data: d.output('datauristring').split(',')[1], directory: Directory.Cache });
    await Share.share({ title: name, url: f.uri, dialogTitle: 'Save or share report' });
  } else d.save(name);
  toast('PDF ready.', 'ok');
}

render();
setTimeout(() => $('#splash').classList.add('hide'), 1500);
