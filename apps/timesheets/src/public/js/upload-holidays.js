const fileInput = document.querySelector('input[type=file]')
const payload = document.querySelector('[name=payload]')
const contents = document.querySelector('.contents')
const errors = document.querySelector('.errors')
const errorMesssage = document.querySelector('.errors .message')
const cancel = document.querySelector('.errors .cancel')
const upload = document.querySelector('.upload button')

if (!fileInput || !contents || !errors || !errorMesssage || !upload) {
  throw new Error('layout is not correct')
}

cancel.addEventListener('click', () => errors.close())

upload.addEventListener('click', () => {
  fileInput.click()
})
fileInput.addEventListener('change', uploadCSV)

async function uploadCSV() {
  const [file] = fileInput.files
  const reader = new FileReader()

  const loader = async () => {
    payload.value = reader.result
    contents.classList.add('active')
    fileInput.value = ''
    reader.removeEventListener('load', loader, false)
    await shiftsUpload()
  }

  reader.addEventListener('load', loader, false)

  if (file) {
    reader.readAsText(file)
  }
}

function showError(message) {
  errors.showModal()
  errorMesssage.textContent = message
}

async function shiftsUpload() {
  let headers = { 'Content-Type': 'application/json' }
  let body = JSON.stringify({ payload: payload.value })

  let response = await fetch('/holidays/upload', {
    method: 'POST',
    headers,
    body,
  })
  if (!response.ok) {
    showError('failed to upload')
    return
  }

  let json = await response.json()
  let data = json
  contents.innerHTML = ''
  let grid = new gridjs.Grid({
    language: {
      search: {
        placeholder: '🔍 Search...',
      },
    },
    search: true,
    data,
  })

  let el = document.createElement('div')
  el.classList.add('newgrid')
  contents.appendChild(el)
  grid.render(el)

  if (json.errors.length > 0) {
    showError(
      'upload failed, input data has errors, please correct and try again',
    )
    return
  }
}
