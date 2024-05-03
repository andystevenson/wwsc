import { oraPromise as spinner } from 'ora'
console.log('Hello, World!')

async function main() {
  console.log('Hello, World!')
  const users = await spinner(getUsers(), {
    text: 'Loading...',
    successText: 'Users loaded!',
  })

  await new Promise((r) => setTimeout(r, 2000))

  const quotes = await spinner(getQuotes(), {
    text: 'Loading...',
    color: 'yellow',
    successText: 'Quotes loaded!',
  })

  const asleep = await spinner(sleep(10000), {
    text: 'Shark!!!...',
    color: 'yellow',
    // spinner: 'shark',
    successText: 'phew! that was close!',
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getUsers() {
  const users = await fetch('https://dummyjson.com/users')
  return users.json()
}

async function getQuotes() {
  const quotes = await fetch('https://dummyjson.com/quotes')
  return quotes.json()
}

await main()
