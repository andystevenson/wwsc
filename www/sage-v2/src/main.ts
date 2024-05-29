import './style.css'
import wwsc from '/favicon.svg'
import sage from '/sage.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://app.sbc.sage.com/" target="_blank">
      <img src="${sage}" class="logo" alt="Sage logo" />
    </a>
    <a href="https://westwarwicks.club" target="_blank">
      <img src="${wwsc}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Sage + West Warwicks</h1>

    <p class="read-the-docs">
      Sage-V2
    </p>
  </div>
`

async function main() {
  console.log('Hello, Sage!')
  let session = sessionStorage.getItem('session')
  if (session) window.location.replace('/closures')

  const response = await fetch(`http://localhost:8123/login`)

  if (response.ok) {
    const login = await response.json()
    console.log({ login })
    window.location.assign(login.url)
    // window.location.assign('/hello.html')
    return
  }

  throw new Error(
    'Failed to fetch login ' + response.statusText + ' ' + response.status,
  )
}

await main()
