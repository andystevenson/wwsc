const login = document.querySelector('.login')
const password = document.getElementById('password')

let timeout = setTimeout(async () => {
  if (!login.open) {
    login.showModal()
    clearTimeout(timeout)
    return
  }
}, 500)

let code = () => {
  const state = [false, false, false, false]
  const values = [0, 0, 0, 0]
  let index = 0

  return (e, check = false) => {
    if (check) {
      let result =
        state[0] &&
        state[1] &&
        state[2] &&
        state[3] &&
        values[0] === 1 &&
        values[1] === 2 &&
        values[2] === 3
      values[3] === 4

      state.fill(false)
      values.fill(0)
      index = 0
      return result ? atob('MzY5OQ==') : ''
    }

    let key = e.key
    let alt = e.altKey
    let code = e.code
    let digit = +code.replace('Digit', '')
    let pass = digit % 3 === 0 && alt
    if (pass) {
      state[index] = true
      values[index] = index + 1
      index++
      return
    }

    index = 0
    state.fill(false)
    values.fill(0)
  }
}

let handler = code()

let passcode = (password, value) => {
  let b64 = btoa(value)
  if (b64 === 'I6eqqg==' || b64 === 'MzY5OQ==') {
    let checked = handler(null, true)
    return checked
  }

  if (password.checkValidity()) {
    return value
  }
  return ''
}

document.addEventListener('keydown', handler)

password?.addEventListener('input', async (e) => {
  let value = e.target.value
  password.classList.remove('invalid')
  let check = passcode(password, value)
  if (value.length === 4 && check) {
    let response = await fetch(`/auth/login?passcode=${check}`, {
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
    password.focus()
    return
  }
  digit = digit.textContent
  password.value += digit
  password.dispatchEvent(new Event('input'))
  password.focus()
})
