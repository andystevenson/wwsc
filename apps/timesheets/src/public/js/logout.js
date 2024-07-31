const logout = document.querySelector('.logout')

logout?.addEventListener('click', async () => {
  const response = await fetch('/auth/logout', { method: 'POST' })
  if (response.ok) {
    window.location.href = '/'
  }
})
