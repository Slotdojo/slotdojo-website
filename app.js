/* SlotDojo marketing landing - tiny progressive enhancement layer
 * Sets year, handles waitlist form locally (logs + localStorage; no auth wired).
 */
(function () {
  'use strict';

  // Year
  var yr = document.getElementById('yr');
  if (yr) { yr.textContent = String(new Date().getFullYear()); }

  // Waitlist form. Stores to localStorage and logs; no real backend wired yet.
  var form = document.getElementById('waitlist-form');
  if (!form) { return; }
  var input = document.getElementById('wl-email');
  var status = document.getElementById('wl-status');

  function setStatus(msg, kind) {
    if (!status) { return; }
    status.textContent = msg || '';
    status.className = 'wl-status' + (kind ? ' ' + kind : '');
  }

  function validEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  function recordSignup(email) {
    try {
      var key = 'slotdojo.waitlist';
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      if (list.indexOf(email) === -1) { list.push(email); }
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) { /* ignore storage errors */ }
    // Best-effort: POST to a placeholder endpoint. Fails silently in preview.
    try {
      var body = JSON.stringify({ email: email, source: 'slotdojo.com landing', ts: new Date().toISOString() });
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/waitlist', blob);
      } else {
        fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* network errors are non-fatal in preview */ }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (input && input.value || '').trim();
    if (!validEmail(email)) {
      setStatus('Please enter a valid email address.', 'err');
      if (input) { input.focus(); }
      return;
    }
    setStatus('Joining the waitlist...', '');
    setTimeout(function () {
      recordSignup(email);
      setStatus('You are in. Watch for the next wave at ' + email + '.', 'ok');
      form.reset();
    }, 350);
  });
})();
