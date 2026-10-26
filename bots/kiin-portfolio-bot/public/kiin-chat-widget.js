/* KIIN portfolio chat widget — self-contained, no dependencies.
 * Embed: <script src="https://kiin-portfolio-bot.rotr531.workers.dev/kiin-chat-widget.js"
 *                 data-api="https://kiin-portfolio-bot.rotr531.workers.dev/api/chat" defer></script>
 * The API key lives ONLY in the Cloudflare Worker secret. This file never sees it.
 */
(function () {
  "use strict";
  var script = document.currentScript;
  var API = (script && script.getAttribute("data-api")) || window.KIIN_CHAT_API || "";
  var TITLE = "KIIN — Portfolio Assistant";
  var GREETING = "Hi! I'm KIIN's portfolio assistant. Ask me about Trung Kien's QA services, projects, or how to work with him.";
  var QUICK = [
    "What services does Trung Kien offer?",
    "Show me projects",
    "How can I contact KIIN?",
  ];

  var CSS = [
    ".k-root{position:fixed;z-index:999999;right:20px;bottom:20px;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111}",
    ".k-btn{width:56px;height:56px;border-radius:50%;background:#111;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:0}",
    ".k-btn:hover{background:#000;transform:scale(1.04)}",
    ".k-btn svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    ".k-panel{display:none;width:380px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 100px);background:#fff;border:1px solid #e5e5e5;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.22);flex-direction:column;overflow:hidden;margin-bottom:12px}",
    ".k-panel.open{display:flex}",
    ".k-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eee}",
    ".k-head b{font-size:13px;letter-spacing:.06em;text-transform:uppercase}",
    ".k-head span{font-size:12px;color:#888}",
    ".k-close{background:none;border:none;font-size:20px;cursor:pointer;color:#888;line-height:1;padding:0 2px}",
    ".k-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}",
    ".k-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}",
    ".k-msg.user{align-self:flex-end;background:#111;color:#fff;border-bottom-right-radius:4px}",
    ".k-msg.bot{align-self:flex-start;background:#f2f2f2;color:#111;border-bottom-left-radius:4px}",
    ".k-msg.err{align-self:flex-start;background:#fdf0f0;color:#a00;border-bottom-left-radius:4px}",
    ".k-dots{display:inline-block}.k-dots i{display:inline-block;width:6px;height:6px;margin-right:3px;border-radius:50%;background:#999;animation:kblink 1.2s infinite}.k-dots i:nth-child(2){animation-delay:.2s}.k-dots i:nth-child(3){animation-delay:.4s}",
    "@keyframes kblink{0%,80%,100%{opacity:.25}40%{opacity:1}}",
    ".k-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px}",
    ".k-chip{font-size:12px;border:1px solid #ddd;background:#fff;border-radius:999px;padding:6px 11px;cursor:pointer;color:#333}",
    ".k-chip:hover{border-color:#111}",
    ".k-form{display:flex;gap:8px;padding:12px;border-top:1px solid #eee}",
    ".k-input{flex:1;border:1px solid #ddd;border-radius:999px;padding:10px 14px;font-size:14px;outline:none;font-family:inherit}",
    ".k-input:focus{border-color:#111}",
    ".k-send{background:#111;color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:16px;flex:none}",
    ".k-send:disabled{opacity:.4;cursor:default}",
    "@media (max-width:480px){.k-root{right:12px;bottom:12px;left:12px}.k-panel{width:100%;max-width:none;height:70vh}.k-btn{margin-left:auto}}",
    ".k-btn{margin-left:auto}.k-input{min-width:0}.k-head{gap:8px}.k-head>div{flex:1;min-width:0}.k-close,.k-reset{min-width:32px;min-height:32px}.k-reset{border:0;background:none;font-size:21px;cursor:pointer;color:#777}.k-status-row{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:0 14px 10px;font-size:11px;color:#777}.k-status{line-height:1.45}.k-stop,.k-retry{border:1px solid #ddd;border-radius:999px;background:#fff;color:#111;cursor:pointer;padding:6px 12px;min-height:32px;font:inherit;flex:none}.k-stop[hidden]{display:none}.k-retry{margin:8px 10px 0 0}.k-contact{font-size:12px;color:inherit}.k-chip:disabled{opacity:.45;cursor:default}.k-markdown{white-space:normal}.k-markdown p,.k-msg.err p{margin:0 0 8px}.k-markdown p:last-child{margin-bottom:0}.k-markdown ul{margin:4px 0 10px;padding-left:18px}.k-markdown li{margin:4px 0}.k-markdown a{color:inherit;text-decoration:underline;overflow-wrap:anywhere}.k-msg{overflow-wrap:anywhere}.k-msgs{min-height:0}.k-panel{height:560px;max-height:calc(100dvh - 100px)}@media(max-width:480px){.k-root{bottom:max(12px,env(safe-area-inset-bottom))}.k-panel{height:70dvh;max-height:calc(100dvh - 100px)}.k-input{font-size:16px}.k-close,.k-reset{min-height:40px;min-width:36px}}",
  ].join("\n");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var host = document.createElement("div");
  host.style.cssText = "position:fixed;z-index:999999;right:0;bottom:0;width:0;height:0;overflow:visible;";
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: "open" });
  var style = document.createElement("style");
  style.textContent = CSS;
  shadow.appendChild(style);

  var root = el("div", "k-root");
  var panel = el("div", "k-panel");
  var head = el("div", "k-head");
  var headTxt = el("div");
  headTxt.appendChild(el("b", "", TITLE));
  headTxt.appendChild(el("div", "", ""));
  headTxt.lastChild.appendChild(document.createTextNode("Replies in your language · Powered by AI"));
  headTxt.lastChild.style.cssText = "font-size:12px;color:#888";
  var closeBtn = el("button", "k-close", "×");
  closeBtn.setAttribute("aria-label", "Close chat");
  head.appendChild(headTxt);
  head.appendChild(closeBtn);

  var msgs = el("div", "k-msgs");
  var chips = el("div", "k-chips");
  QUICK.forEach(function (q) {
    var c = el("button", "k-chip", q);
    c.addEventListener("click", function () { send(q); });
    chips.appendChild(c);
  });
  var form = el("form", "k-form");
  var input = el("input", "k-input");
  input.type = "text";
  input.placeholder = "Ask about services, projects…";
  input.setAttribute("aria-label", "Type your message");
  var sendBtn = el("button", "k-send", "↑");
  sendBtn.type = "submit";
  sendBtn.setAttribute("aria-label", "Send");
  form.appendChild(input);
  form.appendChild(sendBtn);

  panel.appendChild(head);
  panel.appendChild(msgs);
  panel.appendChild(chips);
  panel.appendChild(form);

  var btn = el("button", "k-btn");
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1.1L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/></svg>';
  root.appendChild(panel);
  root.appendChild(btn);
  shadow.appendChild(root);

  var opened = false, greeted = false, busy = false, active = null;
  var locale = /^vi/i.test(navigator.language || '') ? 'vi' : 'en';
  var COPY = {
    en: { greeting: GREETING, placeholder: 'Ask about services, projects…', ready: 'Ask about KIIN’s work', waiting: 'KIIN is preparing a reply…', slow: 'Still waiting for the AI. You can stop or email KIIN.', stop: 'Stop', retry: 'Try again', reset: 'New conversation', contact: 'Email KIIN', done: 'Reply received', cancelled: 'Response stopped.', unavailable: 'The AI could not complete this reply. Please try again or email KIIN.', timeout: 'The AI took too long to reply. Please try again or email KIIN.', rate: 'Too many messages. Please wait a minute and try again.', quick: QUICK },
    vi: { greeting: 'Chào bạn! Mình là trợ lý portfolio của Kiên. Bạn muốn tìm hiểu dịch vụ QA, dự án hay cách liên hệ?', placeholder: 'Hỏi về dịch vụ, dự án…', ready: 'Tìm hiểu công việc của Kiên', waiting: 'Đang chuẩn bị câu trả lời…', slow: 'AI đang phản hồi chậm. Bạn có thể dừng hoặc gửi email cho Kiên.', stop: 'Dừng', retry: 'Thử lại', reset: 'Hội thoại mới', contact: 'Email cho Kiên', done: 'Đã nhận câu trả lời', cancelled: 'Đã dừng phản hồi.', unavailable: 'AI chưa thể hoàn tất câu trả lời. Bạn hãy thử lại hoặc gửi email cho Kiên.', timeout: 'AI phản hồi quá lâu. Bạn hãy thử lại hoặc gửi email cho Kiên.', rate: 'Bạn gửi hơi nhiều tin nhắn. Vui lòng chờ một phút rồi thử lại.', quick: ['Kiên cung cấp dịch vụ gì?', 'Xem các dự án', 'Liên hệ Kiên thế nào?'] }
  };
  function t(key) { return COPY[locale][key]; }
  var statusRow = el('div', 'k-status-row');
  var status = el('span', 'k-status', t('ready'));
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  var stopBtn = el('button', 'k-stop', t('stop'));
  stopBtn.type = 'button'; stopBtn.hidden = true;
  statusRow.append(status, stopBtn);
  panel.insertBefore(statusRow, chips);
  var resetBtn = el('button', 'k-reset', '↺');
  resetBtn.type = 'button';
  head.insertBefore(resetBtn, closeBtn);
  panel.id = 'kiin-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', TITLE);
  panel.setAttribute('aria-hidden', 'true');
  btn.setAttribute('aria-controls', panel.id);
  btn.setAttribute('aria-expanded', 'false');
  msgs.setAttribute('role', 'log');
  msgs.setAttribute('aria-label', 'Conversation');
  input.maxLength = 2000;
  var history = [], storageKey = 'kiin-chat-conversation-v2';
  try {
    var stored = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored) && stored.length <= 20 && stored.length % 2 === 0 && stored.every(function (m, i) { return m && m.role === (i % 2 ? 'assistant' : 'user') && typeof m.content === 'string' && m.content.length <= 20000; })) history = stored;
  } catch (e) { /* Storage may be unavailable in private browsing. */ }
  function persist() { try { sessionStorage.setItem(storageKey, JSON.stringify(history.slice(-20))); } catch (e) {} }
  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(text, cls) { var m = el('div', 'k-msg ' + cls, text); msgs.appendChild(m); scrollBottom(); return m; }
  function inline(parent, text) {
    var pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|https?:\/\/[^\s<>]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/ig;
    var match, offset = 0;
    while ((match = pattern.exec(text))) {
      parent.appendChild(document.createTextNode(text.slice(offset, match.index)));
      var token = match[0], node;
      if (token.slice(0, 2) === '**') node = el('strong', '', token.slice(2, -2));
      else {
        var markdown = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        var label = markdown ? markdown[1] : token;
        var href = markdown ? markdown[2] : token.indexOf('@') > 0 && !/^https?:/i.test(token) ? 'mailto:' + token : token;
        try {
          var url = new URL(href);
          if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) throw new Error('Unsupported link');
          node = el('a', '', label); node.href = url.href;
          if (url.protocol !== 'mailto:') { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
        } catch (e) { node = document.createTextNode(label); }
      }
      parent.appendChild(node); offset = pattern.lastIndex;
    }
    parent.appendChild(document.createTextNode(text.slice(offset)));
  }
  function renderReply(node, text) {
    node.replaceChildren(); node.classList.add('k-markdown');
    var list = null;
    text.split('\n').forEach(function (line) {
      var bullet = line.match(/^\s*[-*]\s+(.+)/);
      if (bullet) { if (!list) { list = el('ul'); node.appendChild(list); } var li = el('li'); inline(li, bullet[1]); list.appendChild(li); }
      else { list = null; if (line.trim()) { var p = el('p'); inline(p, line); node.appendChild(p); } }
    });
    scrollBottom();
  }
  function labels() {
    input.placeholder = t('placeholder'); resetBtn.title = t('reset'); resetBtn.setAttribute('aria-label', t('reset'));
    stopBtn.textContent = t('stop');
    chips.replaceChildren();
    t('quick').forEach(function (q) { var c = el('button', 'k-chip', q); c.disabled = busy; c.addEventListener('click', function () { send(q); }); chips.appendChild(c); });
  }
  labels();
  history.forEach(function (m) { var node = addMsg(m.content, m.role === 'user' ? 'user' : 'bot'); if (m.role === 'assistant') renderReply(node, m.content); });
  if (history.length) greeted = true;
  function toggle(open) {
    opened = open === undefined ? !opened : open;
    panel.classList.toggle('open', opened); panel.setAttribute('aria-hidden', String(!opened)); btn.setAttribute('aria-expanded', String(opened));
    if (opened) { if (!greeted) { addMsg(t('greeting'), 'bot'); greeted = true; } setTimeout(function () { if (opened) input.focus(); }, 50); }
    else btn.focus();
  }
  btn.addEventListener('click', function () { toggle(); });
  closeBtn.addEventListener('click', function () { toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && opened) toggle(false); });
  resetBtn.addEventListener('click', function () { if (busy) return; history = []; persist(); msgs.replaceChildren(); addMsg(t('greeting'), 'bot'); greeted = true; status.textContent = t('ready'); input.focus(); });
  stopBtn.addEventListener('click', function () { if (active) { active.stopped = true; active.controller.abort(); } });
  function busyState(value) {
    busy = value; sendBtn.disabled = value; resetBtn.disabled = value; stopBtn.hidden = !value;
    msgs.setAttribute('aria-busy', String(value)); chips.querySelectorAll('button').forEach(function (c) { c.disabled = value; });
  }
  function failure(node, key, question) {
    node.className = 'k-msg err'; node.replaceChildren(el('p', '', t(key)));
    var retry = el('button', 'k-retry', t('retry')); retry.type = 'button';
    retry.addEventListener('click', function () { if (busy) return; node.remove(); send(question, true); });
    var contact = el('a', 'k-contact', t('contact')); contact.href = 'mailto:hello@kiin.ai'; node.append(retry, contact);
  }
  async function send(text, retrying) {
    var q = (text !== undefined ? text : input.value).trim();
    if (!q || busy) return;
    if (q.length > 2000) { input.setCustomValidity('Please keep your message under 2000 characters.'); input.reportValidity(); return; }
    input.setCustomValidity('');
    if (/[\u00c0-\u024f\u1e00-\u1eff]/.test(q)) locale = 'vi';
    else if (/\b(what|how|tell|show|who|contact|services|projects)\b/i.test(q)) locale = 'en';
    labels(); input.value = '';
    if (!retrying) addMsg(q, 'user');
    var typing = addMsg('', 'bot');
    typing.innerHTML = '<span class="k-dots"><i></i><i></i><i></i></span>';
    var requestState = { controller: new AbortController(), stopped: false, timedOut: false };
    active = requestState; busyState(true); status.textContent = t('waiting');
    var deadline = setTimeout(function () { requestState.timedOut = true; requestState.controller.abort(); }, 65000);
    var slow = setTimeout(function () { if (busy) status.textContent = t('slow'); }, 10000);
    var reply = '', started = false, finished = false, errorKey = 'unavailable', reader;
    function consume(part) {
      part.split('\n').forEach(function (line) {
        var value = line.trim(); if (value.indexOf('data:') !== 0 || finished) return;
        var payload = value.slice(5).trim(); if (payload === '[DONE]') { finished = true; return; }
        var data; try { data = JSON.parse(payload); } catch (e) { return; }
        if (data.error) throw new Error('Provider error');
        reply += typeof data.content === 'string' ? data.content.replace(/[\u200b\u2060\ufeff]/g, '') : '';
        if (reply.length > 20000) throw new Error('Reply too large');
        var visible = reply.trimStart();
        if (!visible || '[error]'.indexOf(visible.toLowerCase()) === 0) return;
        if (/^\[error\]/i.test(visible)) throw new Error('Provider error');
        started = true; typing.textContent = reply; scrollBottom();
      });
    }
    try {
      if (!API) throw new Error('Missing API');
      var res = await fetch(API, { method: 'POST', signal: requestState.controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8).concat({ role: 'user', content: q }) }) });
      if (!res.ok) { if (res.status === 429) errorKey = 'rate'; throw new Error('Request failed'); }
      reader = res.body.getReader(); var decoder = new TextDecoder(), buffer = '';
      while (!finished) {
        var chunk = await reader.read();
        if (chunk.done) { buffer += decoder.decode(); if (buffer.trim()) consume(buffer); break; }
        buffer += decoder.decode(chunk.value, { stream: true });
        if (buffer.length > 131072) throw new Error('Invalid stream');
        var parts = buffer.split(/\r?\n\r?\n/); buffer = parts.pop(); parts.forEach(consume);
      }
      if (!finished || !started) throw new Error('Incomplete reply');
      renderReply(typing, reply); history.push({ role: 'user', content: q }, { role: 'assistant', content: reply }); history = history.slice(-20); persist(); status.textContent = t('done');
    } catch (e) {
      requestState.controller.abort();
      errorKey = requestState.stopped ? 'cancelled' : requestState.timedOut ? 'timeout' : errorKey;
      failure(typing, errorKey, q); status.textContent = t('ready');
    } finally {
      clearTimeout(deadline); clearTimeout(slow);
      if (reader) reader.cancel().catch(function () {});
      active = null; busyState(false); if (opened) input.focus();
    }
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); send(); });
})();
