import '../css/style.scss'
import '../css/style_radio.scss'
import { loadFontSamples, selectedFontFamily } from './card-fonts'
import { kotobagakiPrefix, renderCardText } from './card-text'

const palette: Record<string, string> = {
  siro: '#ffffff',
  koniro: '#223a70',
  aiiro: '#165e83',
  enjiiro: '#b94047',
  fujiiro: '#bbbcde',
  azukiiro: '#96514d',
  sakurairo: '#fef4f4',
  momoiro: '#f09199',
  nezumiiro: '#949495',
  syuiro: '#ba2636',
  kuro: '#000000'
}

function selectedColor(name: string, picker: string, fallback: string) {
  const radio = document.querySelector<HTMLInputElement>(
    `input[name="${name}"]:checked`
  )
  if (radio?.classList.contains('picker')) {
    return document.querySelector<HTMLInputElement>(picker)?.value || fallback
  }
  return palette[radio?.className || ''] || fallback
}

function canvasSize() {
  if (document.querySelector<HTMLInputElement>('.masikaku')?.checked) {
    return { width: 2000, height: 2000 }
  }
  if (document.querySelector<HTMLInputElement>('.matiuke')?.checked) {
    return { width: 2000, height: 4000 }
  }
  return { width: 1500, height: 2000 }
}

function textScale() {
  if (document.querySelector<HTMLInputElement>('.text-xlarge')?.checked)
    return 1.4
  if (document.querySelector<HTMLInputElement>('.text-large')?.checked)
    return 1.25
  if (document.querySelector<HTMLInputElement>('.text-medium')?.checked)
    return 1.12
  return 1
}

function imageNumber(id: string) {
  return Number(document.querySelector<HTMLInputElement>(`#${id}`)?.value || 0)
}

function drawBackgroundImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  scale: number
) {
  const x = imageNumber('posX')
  const y = imageNumber('posY')
  const size = imageNumber('size') / 100
  context.save()
  context.translate(width / 2, height / 2)
  context.scale(scale, scale)
  context.translate(-width / 2 + x, -height / 2 + y)
  context.rotate((imageNumber('angle') * Math.PI) / 180)
  context.drawImage(image, x, y, size * image.width, size * image.height)
  context.restore()
}

function downloadPng(png: string, filename: string) {
  const link = document.createElement('a')
  link.href = png
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function isAppleMobileDevice() {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    // iPadOS can report a desktop Mac user agent.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function saveCard(canvas: HTMLCanvasElement) {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const filename = `${date.getFullYear()}-${month}-${day}.png`

  const png = canvas.toDataURL('image/png')
  if (isAppleMobileDevice() && navigator.share && navigator.canShare) {
    const bytes = Uint8Array.from(atob(png.split(',')[1]), char =>
      char.charCodeAt(0)
    )
    const file = new File([bytes], filename, { type: 'image/png' })
    if (navigator.canShare({ files: [file] })) {
      // Call share within the click so the browser still has user activation.
      navigator.share({ files: [file], title: '縦書き画像' }).catch(error => {
        if (error.name !== 'AbortError') console.error(error)
      })
      return
    }
  }

  downloadPng(png, filename)
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
  const context = canvas.getContext('2d')
  if (!context) return

  const download =
    document.querySelector<HTMLButtonElement>('.js_downloadButton')!
  const poster = document.querySelector<HTMLImageElement>('.initial-preview')!
  const dimensions = document.querySelector('.dimensions')!
  const previewStatus = document.querySelector('.preview-status')!
  const fontSettings =
    document.querySelector<HTMLDetailsElement>('.font-settings')!
  const currentFont = document.querySelector('.current-font')!
  const title = document.querySelector<HTMLTextAreaElement>('#card-title')!
  const body = document.querySelector<HTMLTextAreaElement>('#card-body')!
  const leftNote = document.querySelector<HTMLTextAreaElement>('#left-note')!
  const rightNote = document.querySelector<HTMLTextAreaElement>('#right-note')!
  let backgroundImage: HTMLImageElement | null = null
  let renderVersion = 0
  let uploadVersion = 0
  let uploadPending = false
  let previewReady = false

  function updateDownloadButton() {
    download.disabled = uploadPending || !previewReady
    const message = uploadPending
      ? '背景画像を読み込んでいます'
      : previewReady
        ? '入力に合わせて自動更新'
        : 'プレビューを更新しています'
    if (previewStatus.textContent !== message)
      previewStatus.textContent = message
  }

  const updatePreview = async () => {
    const version = ++renderVersion
    previewReady = false
    updateDownloadButton()
    const { width, height } = canvasSize()
    const scale = textScale()
    const backgroundColor = selectedColor('c_color', '.c_picker', '#ffffff')

    try {
      const textImage = await renderCardText(
        {
          title: title.value,
          body: body.value,
          leftNote: leftNote.value,
          rightNote: rightNote.value,
          font: selectedFontFamily(),
          mainColor: selectedColor('ms_color', '.ms_picker', '#000000'),
          subColor: selectedColor('ss_color', '.ss_picker', '#000000'),
          outline:
            document.querySelector<HTMLInputElement>(
              'input[name="outline"]:checked'
            )?.value || 'none'
        },
        width,
        height,
        scale
      )
      if (version !== renderVersion) return

      canvas.width = width
      canvas.height = height
      context.fillStyle = backgroundColor
      context.fillRect(0, 0, width, height)
      if (backgroundImage)
        drawBackgroundImage(context, backgroundImage, width, height, scale)
      context.drawImage(textImage, 0, 0)
      dimensions.textContent = `${width} × ${height} px`
      poster.hidden = true
      canvas.hidden = false
      previewReady = true
      updateDownloadButton()
    } catch (error) {
      if (version === renderVersion) {
        previewStatus.textContent = 'プレビューを更新できませんでした'
        console.error('カードを描画できませんでした', error)
      }
    }
  }

  fontSettings.addEventListener(
    'toggle',
    () => {
      if (fontSettings.open) loadFontSamples()
    },
    { once: true }
  )
  fontSettings.addEventListener('change', () => {
    const name = fontSettings
      .querySelector<HTMLInputElement>('input[name="font"]:checked')
      ?.closest('label')
      ?.querySelector('.font-name')
    currentFont.textContent = name?.textContent || ''
  })

  download.addEventListener('click', () => saveCard(canvas))
  document.querySelector('.js_insertButton')!.addEventListener('click', () => {
    body.value += `${body.value ? '\n' : ''}${kotobagakiPrefix}`
    body.focus()
    body.setSelectionRange(body.value.length, body.value.length)
    updatePreview()
  })
  document
    .querySelector('#insert-color-text')!
    .addEventListener('click', () => {
      const start = body.selectionStart
      const marker = '***'
      const placeholder = '色文字'
      body.setRangeText(`${marker}${placeholder}${marker}`)
      body.focus()
      body.setSelectionRange(
        start + marker.length,
        start + marker.length + placeholder.length
      )
      updatePreview()
    })

  const fileInput = document.querySelector<HTMLInputElement>('#fileUpload')!
  fileInput.addEventListener('change', async () => {
    const version = ++uploadVersion
    const file = fileInput.files?.[0]
    uploadPending = Boolean(file)
    updateDownloadButton()
    if (!file) return

    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      if (version !== uploadVersion) return
      backgroundImage = image
      updatePreview()
    } catch (error) {
      if (version === uploadVersion)
        console.error('画像を読み込めませんでした', error)
    } finally {
      URL.revokeObjectURL(url)
      if (version === uploadVersion) {
        uploadPending = false
        updateDownloadButton()
      }
    }
  })

  for (const input of [title, body, leftNote, rightNote]) {
    input.addEventListener('input', updatePreview)
  }

  const settings = [
    'font',
    'font_size_scale',
    'size',
    'c_color',
    'ms_color',
    'ss_color',
    'outline'
  ]
  const radioSelectors = settings.map(
    name => `input[type="radio"][name="${name}"]`
  )
  document
    .querySelectorAll(
      [...radioSelectors, '#posX', '#posY', '#size', '#angle'].join(',')
    )
    .forEach(input => input.addEventListener('change', updatePreview))

  const colorPickers = [
    ['.c_picker', 'c_color'],
    ['.ms_picker', 'ms_color'],
    ['.ss_picker', 'ss_color']
  ]
  for (const [selector, name] of colorPickers) {
    document.querySelector(selector)?.addEventListener('change', () => {
      const radio = document.querySelector<HTMLInputElement>(
        `input.picker[name="${name}"]`
      )
      if (radio) radio.checked = true
      updatePreview()
    })
  }
  updatePreview()
})
