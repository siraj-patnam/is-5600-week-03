// Set up EventSource to receive server-sent events
new window.EventSource("/sse").onmessage = function(event) {
  window.messages.innerHTML += `<p>${event.data}</p>`;
};

// Set up form submission handler
window.form.addEventListener('submit', function(event) {
  event.preventDefault();

  window.fetch(`/chat?message=${window.input.value}`);
  window.input.value = '';
});