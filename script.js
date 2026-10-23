const STORE = {
  name: 'SYAD MARKET',
  wa: '6283177610152',
  waDisplay: '083177610152',
  backup: '083177610152'
};

// Daftar dan harga asli SYAD MARKET dipertahankan.
const products = [
  ['𝘼𝙋𝙆 𝙃𝙊𝙇𝙇𝙊𝙒', '3-80𝙆'],
  ['𝘼𝙋𝙆 𝙈𝘼𝙉𝙏𝘼 𝙭 𝙍𝘼𝙏', '5-100𝙆'],
  ['𝘼𝙋𝙆 𝙉𝙀𝙑𝙀𝙓', '1-80𝙆'],
  ['𝘼𝙋𝙆 𝙏𝙍𝘼𝙋𝙀𝙉𝘿𝙀𝙉', '20-75𝙠'],
  ['𝘼𝙋𝙆 𝙑𝙊𝙇𝙏𝘼𝙍𝘼', '5-50𝙆'],
  ['𝙈𝙐𝙍𝘽𝘼𝙉𝘿 𝙒𝙃𝘼𝙏𝙎𝘼𝙋𝙋', '50𝙆', true],
  ['𝙈𝙐𝙍𝙍𝘼𝙉𝙎𝙊𝙈', '25𝙆'],
  ['𝙅𝘼𝙎𝙇𝙊𝙂', '5-10𝙆'],
  ['𝙈𝙐𝙍𝙇𝙊𝙂', '25𝙆'],
  ['𝘼𝙋𝙆 𝘽𝘼𝙉𝙉𝙀𝘿', '25𝙆'],
  ['𝘼𝙋𝙆 𝘼𝙐𝙏𝙊 𝙎𝘼𝙑𝙀 𝙆𝙊𝙉𝙏𝘼𝙆', '10𝙆'],
  ['𝘼𝙋𝙆 𝙍𝙀𝙎𝙋𝙊𝙉 𝙊𝙏𝙊𝙈𝘼𝙏𝙄𝙎', '15𝙆'],
  ['𝘼𝙋𝙆 𝙀 𝙆𝙏𝙋', '30𝙆'],
  ['𝘼𝙋𝙆 𝙂𝘼𝙈𝙀 𝙋𝙎', '5𝙆'],
  ['𝘼𝙋𝙆 𝙂𝘼𝙈𝙀 𝙋𝘾', '15𝙆'],
  ['𝘼𝙋𝙆 𝙆𝙀𝙉𝙊𝙉', '50𝙆'],
  ['𝘼𝙋𝙆 𝙉𝙊𝙆𝙊𝙎', '25𝙆'],
  ['𝘼𝙋𝙆 𝘾𝙀𝙆 𝘽𝘼𝙉𝘿', '10𝙆']
];

const randomShops = [
  'rifzz store', 'Zack shop', 'hanxstr', 'zyxstore', 'ar store',
  'dark shop', 'raa store', 'velz shop', 'rxz store', 'king shop',
  'alpha store', 'beta shop', 'omega store', 'sigma shop', 'nexus store',
  'nova shop', 'cyber store', 'phantom shop', 'ghost store', 'elite shop',
  'pro store', 'max shop', 'mega shop', 'ultra shop', 'prime shop',
  'gacor shop', 'sultan store', 'bos shop', 'raja store', 'master shop',
  'vip store', 'legend shop'
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const getOrders = () => {
  try {
    const orders = JSON.parse(localStorage.getItem('syadd_orders') || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
};

const saveOrders = (orders) => {
  localStorage.setItem('syadd_orders', JSON.stringify(orders));
  localStorage.setItem('syadd_orders_backup', JSON.stringify(orders));
};

function renderProducts() {
  const grid = $('#productGrid');
  grid.innerHTML = products.map(([name, price, needLink]) => `
    <article class="product-card">
      <i class="fa-solid fa-box product-icon" aria-hidden="true"></i>
      <h3>${name}</h3>
      <p>Produk SYAD MARKET • Harga sesuai paket.</p>
      <div class="product-price">${price}</div>
      <button
        class="btn btn-red order-btn"
        type="button"
        data-product="${name}"
        data-price="${price}"
        data-need-link="${Boolean(needLink)}"
      >ORDER</button>
    </article>
  `).join('');
}

function bindOrderButtons() {
  $$('.order-btn').forEach((button) => {
    button.addEventListener('click', () => {
      openOrder(
        button.dataset.product,
        button.dataset.price,
        button.dataset.needLink === 'true'
      );
    });
  });
}

function formatOrder(order) {
  return `🔥 Baru saja: [${order.shop || STORE.name}] order [${order.product} - Rp${order.price}]   •••   `;
}

function renderTicker() {
  const orders = getOrders()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 10);

  const items = orders.length
    ? orders.map(formatOrder)
    : Array.from({ length: 10 }, (_, index) => {
      const prices = ['2𝙆', '5𝙆', '10𝙆', '20𝙆'];
      return `🔥 Baru saja: [${randomShops[index]}] order [PAKET - ${prices[index % 4]}]   •••   `;
    });

  const group = document.createElement('span');
  group.className = 'ticker-group';
  group.textContent = items.join('     ');

  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  $('#tickerTrack').replaceChildren(group, duplicate);
}

function updateStats() {
  $('#totalOrders').textContent = getOrders().length;
  $('#onlineCount').textContent = 100 + Math.floor(Math.random() * 61);
}

let timerId = null;
let expires = 0;
let current = {};
let lastFocusedElement = null;

function showModal(modal, focusTarget) {
  lastFocusedElement = document.activeElement;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    const target = focusTarget || modal.querySelector('[data-close], input, button');
    target?.focus({ preventScroll: true });
  });
}

function updateOrderTimer() {
  const left = Math.max(0, expires - Date.now());
  const totalSeconds = Math.ceil(left / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  $('#orderTimer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (!left) {
    clearInterval(timerId);
    $('#orderTimer').textContent = '00:00';
  }
}

function openOrder(product, price, needLink = false) {
  current = { product, price, needLink };
  $('#modalProduct').textContent = product;
  $('#modalPrice').textContent = price === 'CHAT ADMIN' ? 'CHAT ADMIN' : `Rp${price}`;
  $('#linkField').classList.toggle('hidden', !needLink);
  $('#channelLink').required = needLink;
  $('#orderForm').reset();

  expires = Date.now() + 15 * 60 * 1000;
  clearInterval(timerId);
  updateOrderTimer();
  timerId = setInterval(updateOrderTimer, 1000);
  showModal($('#orderModal'), $('#shopName'));
}

function closeModals() {
  const hadOpenModal = Boolean($('.modal.show'));

  $$('.modal').forEach((modal) => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  });

  document.body.classList.remove('modal-open');
  clearInterval(timerId);

  if (hadOpenModal && lastFocusedElement?.isConnected) {
    lastFocusedElement.focus({ preventScroll: true });
  }
}

function normalizeWA(value) {
  let number = value.replace(/\D/g, '');
  if (number.startsWith('0')) number = `62${number.slice(1)}`;
  if (number.startsWith('8')) number = `62${number}`;
  return number;
}

function createCode() {
  let code;
  do {
    code = `VNX-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  } while (getOrders().some((order) => order.code === code));
  return code;
}

function confirmOrder(event) {
  event.preventDefault();

  if (Date.now() > expires) {
    alert('Timer order sudah habis. Silakan buka order kembali.');
    return;
  }

  const shop = $('#shopName').value.trim();
  const wa = $('#waNumber').value.trim();
  const link = $('#channelLink').value.trim();

  if (!shop) {
    alert('NAMA TOKO wajib diisi.');
    $('#shopName').focus();
    return;
  }

  if (!wa) {
    alert('NO WA wajib diisi.');
    $('#waNumber').focus();
    return;
  }

  if (current.needLink && !link) {
    alert('Link Saluran Informasi SYAD wajib diisi untuk produk ini.');
    $('#channelLink').focus();
    return;
  }

  const order = {
    code: createCode(),
    shop,
    wa: normalizeWA(wa),
    product: current.product,
    price: current.price,
    link,
    status: 'Menunggu',
    createdAt: Date.now()
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  updateStats();
  renderTicker();

  const message = `𝐇𝐀𝐋𝐎 𝐒𝐘𝐀𝐃 𝐌𝐀𝐑𝐊𝐄𝐓 𝐒𝐀𝐘𝐀 𝐈𝐍𝐆𝐈𝐍 𝐎𝐑𝐃𝐄𝐑\n\nNama Toko: ${shop}\nNo WA: ${wa}\nPaket: ${current.product}\nHarga: ${current.price}\nKode: ${order.code}${link ? `\nLink Saluran: ${link}` : ''}\nPembayaran: QRIS\n\nMohon menunggu konfirmasi Admin 🙏`;

  closeModals();
  window.open(`https://wa.me/${STORE.wa}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

function checkQueue() {
  const code = $('#queueCode').value.trim().toUpperCase();
  const found = getOrders().find((order) => order.code === code);
  const box = $('#queueResult');

  if (!code) {
    box.textContent = 'Masukkan kode VNX-XXXX.';
    return;
  }

  if (!found) {
    box.textContent = 'Kode belum ditemukan di browser ini. Pastikan kode benar.';
    return;
  }

  box.innerHTML = `<b>${found.code}</b> • ${found.product}<br><span style="color:#ff5555">Status: ${found.status}</span><br><small>${new Date(found.createdAt).toLocaleString('id-ID')}</small>`;
}

document.addEventListener('click', (event) => {
  const scrollButton = event.target.closest('[data-scroll]');
  if (scrollButton) {
    document.querySelector(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
  }
});

$$('[data-nav]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector(button.dataset.nav)?.scrollIntoView({ behavior: 'smooth' });
    $$('.nav-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

$$('[data-close]').forEach((button) => button.addEventListener('click', closeModals));

$$('[data-open-qris]').forEach((button) => {
  button.addEventListener('click', () => showModal($('#qrisModal')));
});

$$('.modal').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModals();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && $('.modal.show')) closeModals();
});

$('#orderForm').addEventListener('submit', confirmOrder);
$('#checkQueue').addEventListener('click', checkQueue);
$('#queueCode').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') checkQueue();
});

renderProducts();
bindOrderButtons();
renderTicker();
updateStats();
setInterval(() => {
  updateStats();
  renderTicker();
}, 30000);
