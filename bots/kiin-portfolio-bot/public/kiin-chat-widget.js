/* KIIN portfolio chat widget — self-contained, no dependencies.
 * Embed: <script src="https://YOUR-APP.vercel.app/kiin-chat-widget.js"
 *                 data-api="https://YOUR-APP.vercel.app/api/chat" defer></script>
 * The API key lives ONLY in the backend (Vercel env vars). This file never sees it.
 */
(function () {
  "use strict";
  var script = document.currentScript;
  var API = (script && script.getAttribute("data-api")) || window.KIIN_CHAT_API || "";
  var TITLE = "KIIN — Portfolio Assistant";
  var GREETING = "Hi! I'm KIIN's portfolio assistant. Ask me about Trung Kien's QA services, projects, or how to work with him.";
  var QUICK = [
    "What services does Trung Kien offer?",
    "Tell me about the Yeah1 Group project",
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

  var opened = false, greeted = false, busy = false;
  function addMsg(text, cls) {
    var m = el("div", "k-msg " + cls, text);
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
    return m;
  }
  function toggle(open) {
    opened = open === undefined ? !opened : open;
    panel.classList.toggle("open", opened);
    if (opened) {
      if (!greeted) { addMsg(GREETING, "bot"); greeted = true; }
      setTimeout(function () { input.focus(); }, 50);
    }
  }
  btn.addEventListener("click", function () { toggle(); });
  closeBtn.addEventListener("click", function () { toggle(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && opened) toggle(false);
  });

  function send(text) {
    var q = (text !== undefined ? text : input.value).trim();
    if (!q || busy) return;
    input.value = "";
    addMsg(q, "user");
    if (!API) {
      addMsg("Chat is not configured yet (missing API address). Please contact hello@kiin.ai.", "err");
      return;
    }
    busy = true;
    sendBtn.disabled = true;
    var typing = addMsg("", "bot");
    typing.innerHTML = '<span class="k-dots"><i></i><i></i><i></i></span>';
    var history = [];
    msgs.querySelectorAll(".k-msg.user, .k-msg.bot").forEach(function (m) {
      if (m !== typing) history.push({ role: m.classList.contains("user") ? "user" : "assistant", content: m.textContent });
    });
    history = history.slice(-10);

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          throw new Error((j && j.error) || ("Server error " + res.status));
        });
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = "";
      var started = false;
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return;
          buf += decoder.decode(r.value, { stream: true });
          var parts = buf.split("\n\n");
          buf = parts.pop();
          parts.forEach(function (part) {
            part.split("\n").forEach(function (line) {
              var t = line.trim();
              if (t.indexOf("data:") !== 0) return;
              var payload = t.slice(5).trim();
              if (payload === "[DONE]") return;
              try {
                var c = JSON.parse(payload).content;
                if (c) {
                  if (!started) { typing.textContent = ""; started = true; }
                  typing.textContent += c;
                  msgs.scrollTop = msgs.scrollHeight;
                }
              } catch (e) { /* ignore */ }
            });
          });
          return pump();
        });
      }
      return pump().then(function () {
        if (!started) { typing.textContent = "No reply received. Please try again or email hello@kiin.ai."; typing.className = "k-msg err"; }
      });
    }).catch(function (e) {
      typing.textContent = "Sorry, the chat is unavailable right now (" + e.message + "). You can reach KIIN at hello@kiin.ai.";
      typing.className = "k-msg err";
    }).finally(function () {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); send(); });
})();
