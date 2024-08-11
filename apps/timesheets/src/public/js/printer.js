const reports = document.querySelector('.reports')

const printer = async (e) => {
  // First we get the pseudo-elements style
  const target = e.target
  const after = getComputedStyle(target, ':after')

  if (after) {
    // Then we parse out the dimensions
    const atop = Number(after.getPropertyValue('top').slice(0, -2))
    const aheight = Number(after.getPropertyValue('height').slice(0, -2))
    const aleft = Number(after.getPropertyValue('left').slice(0, -2))
    const awidth = Number(after.getPropertyValue('width').slice(0, -2))
    // And get the mouse position
    const ex = e.layerX
    const ey = e.layerY
    // Finally we do a bounds check (Is the mouse inside of the after element)
    if (ex > aleft && ex < aleft + awidth && ey > atop && ey < atop + aheight) {
      let element = target.closest('details')
      let filename = element.className

      let saveBlob = (function () {
        var a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'
        return function (blob, fileName) {
          var url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = fileName
          a.click()
          window.URL.revokeObjectURL(url)
        }
      })()

      try {
        html2canvas(element).then((canvas) => {
          let blob = canvas.toBlob((blob) => {
            saveBlob(blob, `${filename}.png`)
          })
        })
      } catch (error) {
        console.error('Failed to download image', error)
      }
    }
  }
}

reports?.addEventListener('click', printer)
