// ── MENU DATA ─────────────────────────────────────────
const MENU = {
  "Entradas": [
    { id: 1, name: "Burrata com tomate cereja",           emoji: "🍅", price: 60, desc: "Burrata cremosa com tomates cherry assados, manjericão fresco e azeite extra virgem." },
    { id: 2, name: "Tábua de fríos",                      emoji: "🧀", price: 50, desc: "Selección de quesos artesanais, presunto cru, salame e torradas." },
    { id: 3, name: "Batatas fritas com cheddar e bacon",  emoji: "🍟", price: 40, desc: "Batatas fritas com queijo cheddar derretido e bacon em pedaços" },
  ],
  "Principais": [
    { id: 4, name: "Hamburguer Charly Watts",             emoji: "🍔", price: 60, desc: "Hamburguesa de 200gr com pao vermelho e salada. Acompanha batatas fritas" },
    { id: 5, name: "Bife de chorizo",                     emoji: "🥩", price: 70, desc: "400g de bife madurado. Batatas rústicas com alecrim, chimichurri da casa." },
    // { id: 6, name: "Pasta fresca al tartufo",          emoji: "🍝", price: 1590, desc: "Fettuccine casero con manteca de trufa, nuez de pecan tostada y parmesano rallado. (vegetariano)" },
    // { id: 7, name: "Salmón a la plancha",              emoji: "🐠", price: 1950, desc: "Filete de salmón rosado, puré de coliflor ahumada, espárragos grillados y salsa beurre blanc." },
    // { id: 8, name: "Pollo en salsa de limón",          emoji: "🍋", price: 1480, desc: "Suprema de pollo en salsa cremosa de limón y alcaparras. Arroz thai con coco." },
  ],
  "Sobremesas": [
    { id: 9,  name: "Tiramisú clásico",                   emoji: "🍦", price: 30, desc: "Receta tradicional italiana com mascarpone, café expresso e cacau belga." },
    { id: 10, name: "Crepe de chocolate",                 emoji: "🍫", price: 30, desc: "Coulant tibio con centro líquido, helado de vainilla artesanal y coulis de frutos rojos." },
    // { id: 11, name: "Pannacotta de maracuyá",          emoji: "🟡", price: 650, desc: "Pannacotta sedosa con coulis de maracuyá y frutos frescos de estación." },
  ],
  "Bebidas": [
    { id: 12, name: "Agua com o sem gas",                 emoji: "💧", price: 5,  desc: "Limón fresco, jengibre, menta y soda. Refrescante y digestiva." },
    { id: 13, name: "Chopp cerveja",                      emoji: "🍺", price: 20,  desc: "Malbec reserva de Mendoza. Notas de frutos rojos, vainilla y taninos suaves." },
    { id: 14, name: "Sucos da fruta",                     emoji: "💧", price: 15,  desc: "Con o sin gas. 500ml." },
    { id: 15, name: "Taça de Vinho",                      emoji: "🍷", price: 25,  desc: "Granos de origen único, tostado artesanal. Cremoso y intenso." },
  ]
};

// ── CHAT CONTROL ─────────────────────────────────────
const CHAT_ENABLED = false; // Cambiar a true cuando quieras habilitar el asistente IA otra vez

// ── CART ──────────────────────────────────────────────
let cart = {};

function addToCart(id) {
  const item = Object.values(MENU).flat().find(i => i.id === id);
  if (!cart[id]) cart[id] = { ...item, qty: 0 };
  cart[id].qty++;
  updateCartUI();

  const btn = document.querySelector(`[data-id="${id}"] .add-btn`);
  if (btn) {
    btn.textContent = '✓';
    btn.style.background = 'var(--amber)';
    setTimeout(() => { btn.textContent = '+'; btn.style.background = ''; }, 800);
  }
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty = Math.max(0, cart[id].qty + delta);
  if (cart[id].qty === 0) delete cart[id];
  updateCartUI();
  if (Object.values(cart).filter(i => i.qty > 0).length === 0) {
    closeModal();
  } else {
    openModal();
  }
}

function updateCartUI() {
  const items = Object.values(cart).filter(i => i.qty > 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = total.toLocaleString();

  const ind = document.getElementById('cartIndicator');
  ind.classList.toggle('visible', count > 0);
}

function openModal() {
  const items = Object.values(cart).filter(i => i.qty > 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  document.getElementById('modalItems').innerHTML = items.map(i => `
    <div class="order-item">
      <div>
        <div class="order-item-name">${i.emoji} ${i.name}</div>
        <div style="font-size:0.65rem;color:var(--muted)">$${i.price.toLocaleString()} c/u</div>
      </div>
      <div class="order-controls">
        <button class="qty-btn" onclick="changeQty(${i.id}, -1)">−</button>
        <span style="font-size:0.9rem;min-width:20px;text-align:center">${i.qty}</span>
        <button class="qty-btn" onclick="changeQty(${i.id}, 1)">+</button>
        <span style="color:var(--amber);font-family:'Cormorant Garamond',serif;font-size:1rem;margin-left:0.5rem">
          $${(i.qty * i.price).toLocaleString()}
        </span>
      </div>
    </div>
  `).join('');

  document.getElementById('modalTotal').textContent = total.toLocaleString();
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function confirmOrder() {
  const items = Object.values(cart).filter(i => i.qty > 0);
  const summary = items.map(i => `${i.qty}x ${i.name}`).join(', ');
  cart = {};
  updateCartUI();
  closeModal();
  addBotMessage(`✅ ¡Pedido confirmado!\n\n${summary}\n\nEn breve un mozo pasará por tu mesa. ¡Gracias por tu orden!`);
}

// ── RENDER MENU ───────────────────────────────────────
let currentCat = Object.keys(MENU)[0];

function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = Object.keys(MENU).map(cat => `
    <button class="${cat === currentCat ? 'active' : ''}" onclick="switchCat('${cat}')">${cat}</button>
  `).join('');
}

function switchCat(cat) {
  currentCat = cat;
  renderNav();
  renderMenu();
}

// Unsplash food images mapped by item id (free-to-use, food photography)
const ITEM_IMAGES = {
  1:  'imagenes/burrata.jfif',  // burrata
  2:  'imagenes/tabua frios.jfif',  // tabua
  3:  'imagenes/batatas cheddar.jfif',  // batatas cheddar
  4:  'imagenes/hamburguer.jfif',  // hamburguer
  5:  'imagenes/bife chorizo.jfif',  // bife
  9:  'imagenes/tiramisu.jfif',  // tiramisu
  10:  'imagenes/crepe.jfif',  // crepe
  8:  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80',  // pollo
  6:  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',  // tiramisu
  7:  'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80',  // fondant
  11: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',  // pannacotta
  12: 'imagenes/agua.jfif',  // agua
  13: 'imagenes/cerveja.jfif',  // cerveja
  14: 'imagenes/sucos.jfif',  // sucos
  15: 'imagenes/vinho.jfif',  // vinho
};

function toggleFlip(event, id) {
  // Don't flip when clicking the add button
  if (event.target.closest('.add-btn') || event.target.closest('.add-btn-back')) return;
  const card = document.querySelector(`.item-card[data-id="${id}"]`);
  if (card) card.classList.toggle('flipped');
}

function renderMenu() {
  const items = MENU[currentCat];
  document.getElementById('menuSection').innerHTML = `
    <div class="category-title">${currentCat}</div>
    <div class="category-sub">${items.length} platos disponiveis</div>
    <div class="items-grid">
      ${items.map((item, i) => {
        const imgUrl = ITEM_IMAGES[item.id];
        const backMedia = imgUrl
          ? `<img class="card-back-img" src="${imgUrl}" alt="${item.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : '';
        return `
        <div class="item-card" data-id="${item.id}" style="animation-delay:${i * 0.06}s" onclick="toggleFlip(event, ${item.id})">
          <div class="card-inner">

            <!-- FRONT -->
            <div class="card-front">
              <span class="item-emoji">${item.emoji}</span>
              <div class="item-name">${item.name}</div>
              <div class="item-desc">${item.desc}</div>
              <div class="item-footer">
                <div>
                  <div class="item-price">$${item.price.toLocaleString()}</div>
                  <div class="flip-hint">clic para ver foto</div>
                </div>
                <button class="add-btn" onclick="addToCart(${item.id})">+</button>
              </div>
            </div>

            <!-- BACK -->
            <div class="card-back">
              ${backMedia}
              <div class="card-back-img-placeholder" style="display:${imgUrl ? 'none' : 'flex'}">
                ${item.emoji}
              </div>
              <div class="card-back-footer">
                <div>
                  <div class="card-back-name">${item.name}</div>
                  <div class="card-back-price">$${item.price.toLocaleString()}</div>
                </div>
                <button class="add-btn-back" onclick="addToCart(${item.id})">+ Agregar</button>
              </div>
            </div>

          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// ── AI CHAT ───────────────────────────────────────────
const menuContext = Object.entries(MENU).map(([cat, items]) =>
  `**${cat}:**\n` + items.map(i => `- ${i.name} ($${i.price}): ${i.desc}`).join('\n')
).join('\n\n');

const SYSTEM_PROMPT = `Sos el asistente virtual del restaurante "La Mesa", un restaurante de cocina de autor en Buenos Aires. Tu rol es ayudar a los clientes con el menú y ayudarlos a hacer su pedido.

MENÚ COMPLETO:
${menuContext}

INSTRUCCIONES:
- Respondé siempre en español, de manera cálida y profesional
- Cuando alguien quiera hacer un pedido, guialos por categorías
- Podés hacer recomendaciones basadas en preferencias
- Si preguntan por alergias o restricciones, sé honesto sobre los ingredientes
- Los platos vegetarianos están marcados con "(vegetariano)"
- Sé conciso pero amable. Máximo 3-4 oraciones por respuesta.
- Si el cliente confirma un pedido, respondé con los items mencionados claramente`;

let conversationHistory = [];
let isTyping = false;

function addBotMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = `<div class="msg-label">Asistente</div>${text.replace(/\n/g, '<br>')}`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `<div class="msg-label">Tú</div>${text}`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg bot typing';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="msg-label">Asistente</div>escribiendo...`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

async function sendMessage() {
  if (!CHAT_ENABLED) return; // asistente apagado

  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || isTyping) return;

  input.value = '';
  input.style.height = 'auto';
  addUserMessage(text);
  conversationHistory.push({ role: 'user', content: text });

  isTyping = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: conversationHistory
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Lo siento, hubo un error. Intentá de nuevo.';

    conversationHistory.push({ role: 'assistant', content: reply });
    removeTyping();
    addBotMessage(reply);

  } catch (err) {
    removeTyping();
    addBotMessage('Ups, hubo un problema de conexión. ¿Podés intentar de nuevo?');
  }

  isTyping = false;
  document.getElementById('sendBtn').disabled = false;
}

function sendChip(text) {
  if (!CHAT_ENABLED) return;
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function handleKey(e) {
  if (!CHAT_ENABLED) return;

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ── MOBILE CHAT TOGGLE ────────────────────────────────
function toggleMobileChat() {
  const sidebar = document.getElementById('chatSidebar');
  const btn = document.getElementById('mobileToggle');
  sidebar.classList.toggle('mobile-open');
  btn.textContent = sidebar.classList.contains('mobile-open') ? '✕' : '💬';
}

// ── AUTO-RESIZE TEXTAREA ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chatInput').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  if (!CHAT_ENABLED) {
    const sidebar = document.getElementById('chatSidebar');
    const mobileBtn = document.getElementById('mobileToggle');
    if (sidebar) sidebar.style.display = 'none';
    if (mobileBtn) mobileBtn.style.display = 'none';
  }
  renderNav();
  renderMenu();
});
