import fetchR from 'fetch-retry'
const fetch = fetchR(global.fetch, {
  retryOn: function (attempt, error, response) {
    if (attempt === 5) return false
    if (error !== null || (response && response.status >= 400)) {
      console.warn(`fetch retrying, attempt number ${attempt + 1}`)
      return true
    }
    return false
  },
})

export { fetch }
