const wrap = (id, vb, body) => `<svg class="art" viewBox="${vb}" role="img" aria-hidden="true">${body.replaceAll('GID', id)}</svg>`;
const glass = 'fill="#e8f1f4" fill-opacity=".18" stroke="#e8f1f4" stroke-width="3" stroke-linejoin="round"';

export const heroArt = wrap('h', '0 0 400 140', `
<defs><linearGradient id="GID" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10283a"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>
<rect width="400" height="140" fill="url(#GID)"/><rect y="112" width="400" height="28" fill="#0a1a26"/>
<path d="M70 40h24v30l26 42H44l26-42z" ${glass}/><path d="M54 98h56l10 14H44z" fill="#e0a526"/>
<path d="M160 56h60l-6 56h-48z" ${glass}/><path d="M169 84h42l-3 28h-36z" fill="#c98a12"/>
<g ${glass}><rect x="262" y="52" width="16" height="60" rx="8"/><rect x="288" y="52" width="16" height="60" rx="8"/><rect x="314" y="52" width="16" height="60" rx="8"/></g>
<rect x="265" y="82" width="10" height="27" rx="5" fill="#e0a526"/><rect x="291" y="70" width="10" height="39" rx="5" fill="#2fb5a8"/><rect x="317" y="92" width="10" height="17" rx="5" fill="#c98a12"/>
<path class="drop" d="M190 14c6 10 9 15 9 20a9 9 0 0 1-18 0c0-5 3-10 9-20z" fill="#e0a526"/>`);

export const emptyArt = wrap('e', '0 0 200 140', `
<rect x="50" y="10" width="100" height="120" rx="8" fill="var(--card)" stroke="var(--pri)" stroke-width="3"/>
<path d="M66 36h68M66 52h68M66 68h46" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/>
<circle cx="128" cy="100" r="18" fill="none" stroke="var(--pri)" stroke-width="3"/><path d="M123 90h10v8l6 10h-22l6-10z" fill="#e0a526"/>`).replace('class="art"', 'class="art sm"');

export const testsArt = wrap('t', '0 0 400 110', `
<defs><linearGradient id="GID" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#10283a"/></linearGradient></defs>
<rect width="400" height="110" fill="url(#GID)"/>
<path d="M120 14c22 30 34 46 34 62a34 34 0 0 1-68 0c0-16 12-32 34-62z" fill="#e0a526"/><path d="M104 70a18 18 0 0 0 12 20" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/>
<path class="drop" d="M200 20c5 8 7 12 7 16a7 7 0 0 1-14 0c0-4 2-8 7-16z" fill="#c98a12"/><path class="drop d2" d="M232 30c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="#e0a526"/>
<rect x="300" y="14" width="16" height="70" rx="8" ${glass}/><circle cx="308" cy="88" r="14" fill="#e8f1f4" fill-opacity=".18" stroke="#e8f1f4" stroke-width="3"/><rect x="305" y="40" width="6" height="46" rx="3" fill="#e0523f"/><circle cx="308" cy="88" r="9" fill="#e0523f"/>`);

export const companyArt = wrap('c', '0 0 400 110', `
<defs><linearGradient id="GID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10283a"/><stop offset="1" stop-color="#2a5a6e"/></linearGradient></defs>
<rect width="400" height="110" fill="url(#GID)"/><rect y="90" width="400" height="20" fill="#0a1a26"/>
<rect x="20" y="58" width="76" height="32" rx="8" fill="#3d6a7f"/><rect x="106" y="68" width="52" height="22" rx="6" fill="#4a7a90"/>
<rect x="200" y="22" width="18" height="68" fill="#5b8aa0"/><rect x="230" y="40" width="14" height="50" fill="#5b8aa0"/><rect x="196" y="34" width="26" height="4" fill="#3d6a7f"/><rect x="196" y="56" width="26" height="4" fill="#3d6a7f"/>
<rect x="300" y="30" width="8" height="60" fill="#5b8aa0"/><path class="flame" d="M304 8c6 8 9 12 9 17a9 9 0 0 1-18 0c0-5 3-9 9-17z" fill="#e0a526"/>
<path d="M158 80h42M244 80h56" stroke="#5b8aa0" stroke-width="4"/>`);
