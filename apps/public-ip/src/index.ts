import gip from 'gip'

let ip = await gip()

setInterval(async () => {
  let url = 'https://webhooks.wwsc.cloud'
  url = 'https://webhooks.localhost'
  url = 'http://localhost:6321'

  try {
  } catch (error) {}
  let current = await gip()
  console.log('IP:', current)
  if (current !== ip) {
    console.log('IP changed:', current)
    ip = current
  }

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip: current, force: true }),
  })
  if (!response.ok) {
    console.log('webhook failed ok', response.status)
  }
}, 1000)
