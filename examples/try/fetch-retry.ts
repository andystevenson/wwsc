console.log('fetch-retry.ts')

import fetchR from 'fetch-retry'
const fetch = fetchR(global.fetch, {
  retryOn: function (attempt, error, response) {
    if (attempt === 5) return false
    if (error !== null || (response && response.status >= 400)) {
      console.log(`retrying, attempt number ${attempt + 1}`)
      return true
    }
    return false
  },
})

const data = await fetch('https://jsonplaceholder.typicode.com/users')
const users = data.ok ? await data.json() : []
console.log(users)

export default fetch
