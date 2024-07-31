console.log('home.js loaded')

const login = document.querySelector('.login')
const password = document.getElementById('password')

let timeout = setTimeout(async () => {
  if (!login.open) {
    login.showModal()
    clearTimeout(timeout)
    return
  }
}, 500)

password?.addEventListener('input', async (e) => {
  let value = e.target.value
  password.classList.remove('invalid')
  if (value.length === 4 && password.checkValidity()) {
    let response = await fetch(`/auth/login?passcode=${value}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

    if (!response.ok) {
      password.classList.add('invalid')
      return
    }

    login.close()
    window.location.href = response.url
  }
})

login?.addEventListener('click', (e) => {
  let digit = e.target.closest('button')
  if (!digit) {
    return
  }
  digit = digit.textContent
  password.value += digit
  password.dispatchEvent(new Event('input'))
})
