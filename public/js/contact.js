document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    // Client-side validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      formMessage.textContent = 'Please fill out all fields.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
      return;
    }

    try {
      // Simulate API call (replace with actual endpoint)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        formMessage.textContent = 'Message sent successfully!';
        formMessage.classList.add('success');
        formMessage.classList.remove('error');
        form.reset();
      } else {
        throw new Error('Failed to send message.');
      }
    } catch (error) {
      formMessage.textContent = 'An error occurred. Please try again.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
    }
  });
});
