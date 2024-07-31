console.log('clock.js loaded')
const date = document.querySelector('.date')
const clock = document.querySelector('.clock')
dayjs.extend(window.dayjs_plugin_advancedFormat)
dayjs.extend(window.dayjs_plugin_duration)
dayjs.extend(window.dayjs_plugin_relativeTime)

const interval = setInterval(updateClock, 1000)

function updateClock() {
  if (!date || !clock) {
    clearInterval(interval)
    return
  }
  const now = dayjs()
  date.setAttribute('datetime', now.format('YYYY-MM-DD'))
  date.textContent = now.format('dddd, MMMM Do, YYYY')
  clock.setAttribute('datetime', now.format('YYYY-MM-DDTHH:mm:ss'))
  clock.textContent = now.format('HH:mm:ss')
}
