console.log('sales.js loaded')

const username = document.getElementById('username')

setInterval(async () => {
  const response = await fetch('/user')
  if (!response.ok) {
    window.location.href = '/'
    return
  }

  const user = await response.json()

  username.textContent = `${user.first_name} ${user.last_name}`
}, 1000)
