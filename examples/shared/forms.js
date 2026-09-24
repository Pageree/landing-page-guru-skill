// Demonstration instrumentation stays in memory; nothing is sent to an analytics service.
window.__landingEvents = [];
window.__landingActions = [];
const pageId = document.body.dataset.page;
const counted = new Set();

for (const form of document.querySelectorAll('[data-demo-form]')) {
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  const mode = form.dataset.mode;
  let pending = false;
  let completed = false;
  let attempt = null;
  function lockFields(locked) {
    for (const field of form.querySelectorAll('input, textarea, select')) {
      if (field.tagName === 'SELECT') field.disabled = locked;
      else field.readOnly = locked;
    }
  }
  button.disabled = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || completed) return;
    if (mode === 'unconnected') {
      status.textContent = 'This waitlist is not connected. Nothing has been sent or saved.';
      status.dataset.state = 'info';
      return;
    }
    const actionId = crypto.randomUUID();
    const action = { id: actionId, kind: 'form-submit', outcome: 'timeout', permission: 'not-required', conversionId: null };
    if (!attempt) attempt = { id: crypto.randomUUID(), body: JSON.stringify(Object.fromEntries(new FormData(form))) };
    const attemptId = attempt.id;
    pending = true;
    lockFields(true);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = 'Checking your demo request…';
    status.dataset.state = 'pending';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attemptId }, body: attempt.body, signal: controller.signal });
      const result = await response.json();
      if (result.duplicate === true) {
        action.outcome = 'duplicate';
        action.conversionId = attemptId;
        status.textContent = 'This request was already received in the demo. No additional request was recorded.';
        status.dataset.state = 'success';
        completed = true;
      } else if (response.ok && result.accepted === true) {
        action.outcome = 'accepted';
        action.conversionId = attemptId;
        status.textContent = form.dataset.success;
        status.dataset.state = 'success';
        completed = true;
        if (!counted.has(attemptId)) {
          window.__landingEvents.push({ name: 'lead_accepted', actionId, eventId: crypto.randomUUID(), conversionId: attemptId, permission: 'not-required', properties: { page_id: pageId, form_id: form.id } });
          counted.add(attemptId);
        }
        document.querySelector('[data-resource]')?.removeAttribute('hidden');
      } else {
        if (response.status === 422) {
          action.outcome = 'rejected';
          attempt = null;
          lockFields(false);
        }
        throw new Error('Request rejected');
      }
    } catch {
      status.textContent = attempt
        ? 'We could not confirm your request. Keep this page open and try again; your original details are locked for a safe retry.'
        : 'The request was rejected. Your details are still here; check them and try again.';
      status.dataset.state = 'error';
    } finally {
      clearTimeout(timer);
      window.__landingActions.push(action);
      pending = false;
      if (completed) attempt = null;
      button.disabled = completed;
      button.removeAttribute('aria-busy');
    }
  });
}
