console.log('keys.js loaded')
let main = document.querySelector('main')

document.addEventListener('keydown', (e) => {
  console.log(e.key, e.code, e.altKey)
  if (!e.altKey) return

  let selected = null
  switch (e.code) {
    case 'ArrowLeft':
      selected = main.querySelector('.active button.previous')
      break
    case 'ArrowRight':
      selected = main.querySelector('.active button.next')
      break
    case 'KeyD':
      selected = document.querySelector('#timespan .day')
      break
    case 'KeyW':
      selected = document.querySelector('#timespan .week')
      break
    case 'KeyM':
      selected = document.querySelector('#timespan .month')
      break
    case 'KeyY':
      selected = document.querySelector('#timespan .year')
      break
    case 'KeyS':
      break
    case 'KeyT':
      gotoToday()
      break

    default:
      break
  }
  selected?.click()
})
