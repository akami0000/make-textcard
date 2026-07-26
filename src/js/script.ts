import '../css/style.scss'
import '../css/style_radio.scss'

class charPosition {
  // プロパティ
  angle: number
  transPosX: number
  transPosY: number
  drawPosX: number
  drawPosY: number

  // コンストラクタ
  constructor(
    angle: number,
    transPosX: number,
    transPosY: number,
    drawPosX: number,
    drawPosY: number
  ) {
    this.angle = angle
    this.transPosX = transPosX
    this.transPosY = transPosY
    this.drawPosX = drawPosX
    this.drawPosY = drawPosY
  }
}
const kotobagaki: string = '詞書：'
let img: HTMLImageElement | null = null // imgを外部スコープで宣言

// ユーザーがiOS（iPhone, iPad, iPod）かどうかを判定するヘルパー
function isiOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  )
}

function downloadCardImage(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) return

  const date = new Date()
  const filename = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}.png`

  // 1. Web Share API（画像共有）が使える環境（iOS Safariなど）の場合
  if (navigator.canShare && navigator.canShare({ files: [new File([], '')] })) {
    canvas.toBlob(async blob => {
      if (!blob) return
      const file = new File([blob], filename, { type: 'image/png' })
      try {
        await navigator.share({
          files: [file],
          title: '縦書き画像'
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error(error)
        }
      }
    }, 'image/png')
    return
  }

  // 2. PCやAndroidなど、通常ブラウザ向けのダウンロード処理
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function genereteCardImage() {
  drawCanvas()
}

window.onload = function () {
  drawCanvas()
}

function chkRotate(text: string, width: number): charPosition {
  if (text.match(/[0-9a-zA-Z]/)) {
    return new charPosition(90, 0, 2, -width + 10, -10)
  }
  {
    const kigou = 'ー〜～（）=_;~|><}{][＜＞…‥：；｜「」【】『』［］−―'
    if (kigou.indexOf(text) !== -1) return new charPosition(90, 0, 2, -width, 0)
  }
  {
    const kigou = '／＼'
    if (kigou.indexOf(text) !== -1) return new charPosition(0, 0, 5, 0, 0)
  }
  {
    const kigou = '、。，．'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(180, 0, 2, -width, 0.8 * width)
    }
  }
  {
    const kigou = '!'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.3 * width, 0)
    }
  }
  {
    const kigou = '+'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.1 * width, 0)
    }
  }
  {
    const kigou = '-＝'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 0, 0, -width, -0.1 * width)
    }
  }
  {
    const kigou = '('
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.5 * width, -0.1 * width)
    }
  }
  {
    const kigou = ')'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.75 * width, -0.1 * width)
    }
  }
  {
    const kigou = ':'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.5 * width, -0.1 * width)
    }
  }
  {
    const kigou = "·“'`”‘’"
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.3 * width, 0)
    }
  }
  {
    const kigou = '/\\＿'
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 0, 2, -0.8 * width, -0.1 * width)
    }
  }
  return new charPosition(0, 0, 0, 0, 0)
}

function fontSetting(
  context: CanvasRenderingContext2D | null,
  mode: number
): void {
  let fontText = ''

  switch (mode) {
    // タイトル
    case 0:
      fontText += '400 60px '
      break
    // 文字
    case 1:
      fontText += '400 48px '
      break
    // 付記・詞書
    case 2:
      fontText += '400 36px '
      break
  }

  if (context !== null) {
    context.font = fontText + getCheckedFont()
  }
}

function getCheckedFont(): string {
  const fontInputs = [
    'roundedmplus1c',
    'notosansjapanese',
    'lineseed',
    'rocknroll',
    'zenAntique',
    'kiwiMaru',
    'mochiyPop',
    'dotGothic16',
    'kaiseiDecol',
    'zenKurenaido',
    'yuseiMagic',
    'delaGothicOne',
    'hachiMaruPop',
    'zenKakuGothicNew',
    'ShipporiMincho',
    'PottaOne',
    'KleeOne',
    'Stick',
    'HinaMincho',
    'SawarabiMincho',
    'SawarabiGothic'
  ]
  for (const input of fontInputs) {
    const checkbox = document.querySelector(`.${input}`) as HTMLInputElement
    if (checkbox.checked) {
      switch (input) {
        case 'roundedmplus1c':
          return '"M PLUS Rounded 1c"'
        case 'notosansjapanese':
          return '"Noto Sans JP"'
        case 'lineseed':
          return "'lineseed'"
        case 'rocknroll':
          return "'RocknRoll One'"
        case 'zenAntique':
          return "'Zen Antique'"
        case 'kiwiMaru':
          return "'Kiwi Maru'"
        case 'mochiyPop':
          return "'Mochiy Pop One'"
        case 'dotGothic16':
          return "'DotGothic16'"
        case 'kaiseiDecol':
          return "'Kaisei Decol'"
        case 'zenKurenaido':
          return "'Zen Kurenaido'"
        case 'yuseiMagic':
          return "'Yusei Magic'"
        case 'delaGothicOne':
          return "'Dela Gothic One'"
        case 'hachiMaruPop':
          return "'Hachi Maru Pop'"
        case 'zenKakuGothicNew':
          return "'Zen Kaku Gothic New'"
        case 'ShipporiMincho':
          return "'Shippori Mincho'"
        case 'PottaOne':
          return "'Potta One'"
        case 'KleeOne':
          return "'Klee One'"
        case 'Stick':
          return "'Stick'"
        case 'HinaMincho':
          return "'Hina Mincho'"
        case 'SawarabiMincho':
          return "'Sawarabi Mincho'"
        case 'SawarabiGothic':
          return "'Sawarabi Gothic'"
      }
    }
  }
  return ''
}

// 選択された文字サイズに応じた倍率を返す関数
function getSelectedFontSizeScale(): number {
  const xlargeInput = document.querySelector('.text-xlarge') as HTMLInputElement
  const mediumInput = document.querySelector('.text-medium') as HTMLInputElement
  const largeInput = document.querySelector('.text-large') as HTMLInputElement

  if (xlargeInput?.checked) {
    return 1.4 // 特大（必要に応じて 1.5 などに調整してください）[cite: 2]
  } else if (largeInput?.checked) {
    return 1.25 // 大[cite: 2]
  } else if (mediumInput?.checked) {
    return 1.12 // 中[cite: 2]
  }
  return 1.0 // 小（初期値）[cite: 2]
}

function drawUploadedImage() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  const posX = document.getElementById('posX') as HTMLInputElement
  const posY = document.getElementById('posY') as HTMLInputElement
  const size = document.getElementById('size') as HTMLInputElement
  const angle = document.getElementById('angle') as HTMLInputElement

  var posXValue = 0
  var posYValue = 0
  var sizeValue = 0
  var angleValue = 0

  if (posX) {
    posXValue = Number(posX.value)
  }
  if (posY) {
    posYValue = Number(posY.value)
  }
  if (size) {
    sizeValue = Number(size.value)
  }
  if (angle) {
    angleValue = Number(angle.value)
  }

  if (img) {
    context.save()
    context.translate(posXValue, posYValue)
    context.rotate((angleValue * Math.PI) / 180)
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      posXValue,
      posYValue,
      (sizeValue * img.width) / 100,
      (sizeValue * img.height) / 100
    )
    context.restore()
  }
}

function drawCanvas() {
  changeCanvasSize()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  const color = getSelectedCanvasColor()

  // background color
  context.fillStyle = color
  context.fillRect(0, 0, canvas.width, canvas.height)

  // -------------------------------------------------------------------------
  // 文字サイズ設定に応じた「中心基準のズーム（拡大）」を適用
  // -------------------------------------------------------------------------
  const scale = getSelectedFontSizeScale()
  context.save()
  if (scale !== 1.0) {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    context.translate(centerX, centerY)
    context.scale(scale, scale)
    context.translate(-centerX, -centerY)
  }

  drawUploadedImage()

  const displayElem = document.getElementsByClassName(
    'js_display'
  )[0] as HTMLInputElement
  displayElem.style.fontFamily = getCheckedFont()

  const title = document.getElementsByClassName(
    'js_input-text'
  )[0] as HTMLInputElement
  const text = document.getElementsByClassName(
    'js_input-text'
  )[1] as HTMLInputElement
  const note1 = document.getElementsByClassName(
    'js_input-text'
  )[2] as HTMLInputElement
  const note2 = document.getElementsByClassName(
    'js_input-text'
  )[3] as HTMLInputElement

  tategaki(
    context,
    title.value,
    text.value,
    note1.value,
    note2.value,
    canvas.width,
    canvas.height
  )

  // ズーム用のコンテキスト状態を復元
  context.restore()
}

var tategaki = function (
  context: CanvasRenderingContext2D,
  title: string,
  text: string,
  note1: string,
  note2: string,
  x: number,
  y: number
) {
  const outlineOptions = document.getElementsByName('outline')
  let selectedValue = ''

  const optionsArray = Array.from(outlineOptions) as HTMLInputElement[]

  for (const option of optionsArray) {
    if (option.checked) {
      selectedValue = option.value
      break
    }
  }

  // タイトル出力
  {
    var titleList = title.split('\n')
    fontSetting(context, 0)
    var lineWidth = context.measureText('あ').width

    let text: string = titleList[0]
    let start_index_1: number = -1
    let start_index_2: number = -1

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i)
      if (char === '*') {
        if (text.substring(i, i + 3) === '***') {
          if (start_index_1 === -1) {
            start_index_1 = i
          } else {
            start_index_2 = i - 4
            break
          }
        }
      }
    }

    if (text.indexOf('***') !== -1) text = text.replace(/\*/g, '')

    Array.prototype.forEach.call(text, function (ch, j) {
      if (
        start_index_1 == -1 ||
        j < start_index_1 ||
        (start_index_2 != -1 && start_index_2 < j)
      )
        context.fillStyle = getSelectedMainStrColor()
      else context.fillStyle = getSelectedSubStrColor()

      var drawX = x * 0.9
      var drawY = (y - lineWidth * text.length) / 2 + lineWidth

      var charPos = chkRotate(ch, lineWidth)
      context.beginPath()
      context.translate(
        drawX - lineWidth + charPos.transPosX,
        drawY + (lineWidth * j + charPos.transPosY)
      )
      context.rotate((charPos.angle * Math.PI) / 180)
      context.translate(
        -(drawX - lineWidth + charPos.transPosX),
        -(drawY + (lineWidth * j + charPos.transPosY))
      )
      if (selectedValue === 'white' || selectedValue === 'black') {
        if (selectedValue === 'white') context.strokeStyle = 'white'
        else context.strokeStyle = 'black'
        context.lineWidth = 10
        context.strokeText(
          ch,
          drawX - lineWidth + charPos.drawPosX,
          drawY + lineWidth * j + charPos.drawPosY
        )
      }

      context.fillText(
        ch,
        drawX - lineWidth + charPos.drawPosX,
        drawY + lineWidth * j + charPos.drawPosY
      )

      context.translate(
        drawX - lineWidth + charPos.transPosX,
        drawY + (lineWidth * j + charPos.transPosY)
      )
      context.rotate((-charPos.angle * Math.PI) / 180)
      context.translate(
        -(drawX - lineWidth + charPos.transPosX),
        -(drawY + (lineWidth * j + charPos.transPosY))
      )
    })
  }

  // 付記1出力
  {
    var noteList = note1.split('\n')
    fontSetting(context, 2)
    var lineWidth = context.measureText('あ').width

    let text: string = noteList[0]

    if (text.indexOf('***') !== -1) text = text.replace(/\*/g, '')
    context.fillStyle = getSelectedMainStrColor()

    if (selectedValue === 'white' || selectedValue === 'black') {
      if (selectedValue === 'white') context.strokeStyle = 'white'
      else context.strokeStyle = 'black'
      context.lineWidth = 10
      context.strokeText(text, x * 0.05, y * 0.95)
    }
    context.fillText(text, x * 0.05, y * 0.95)
  }
  // 付記2出力
  {
    var noteList = note2.split('\n')
    fontSetting(context, 2)
    var lineWidth = 0

    let text: string = noteList[0]

    Array.prototype.forEach.call(text, function (ch, j) {
      lineWidth += context.measureText(ch).width
    })

    if (text.indexOf('***') !== -1) text = text.replace(/\*/g, '')
    context.fillStyle = getSelectedMainStrColor()
    if (selectedValue === 'white' || selectedValue === 'black') {
      if (selectedValue === 'white') context.strokeStyle = 'white'
      else context.strokeStyle = 'black'
      context.lineWidth = 10
      context.strokeText(text, x * 0.95 - lineWidth, y * 0.95)
    }
    context.fillText(text, x * 0.95 - lineWidth, y * 0.95)
  }

  // 本文出力
  {
    const lines = text.split('\n')
    const result: {
      isKotobagaki: boolean
      line: string
      indices: number[]
    }[] = []
    for (const line of lines) {
      const lineData = convertTextToArray(line)
      result.push(...lineData)
    }
    fontSetting(context, 1)
    var lineWidth1 = context.measureText('あ').width
    fontSetting(context, 2)
    var lineWidth2 = context.measureText('あ').width

    var KotobagakiCnt = 0
    var maxLength = 0
    var lineWidthA = 0

    for (let i = 0; i < result.length; i++) {
      const element = result[i]
      if (element.isKotobagaki) KotobagakiCnt++
      if (maxLength < element.line.length) maxLength = element.line.length
    }

    var startX =
      x / 2 +
      ((result.length - KotobagakiCnt) * lineWidth1 +
        KotobagakiCnt * lineWidth2) /
        2 -
      lineWidth1 * 2

    var startY = (y - lineWidth1 * maxLength) / 2 + lineWidth1
    var posX = 0

    for (let i = 0; i < result.length; i++) {
      const element = result[i]
      if (element.isKotobagaki) {
        fontSetting(context, 2)
        lineWidthA = lineWidth2
      } else {
        fontSetting(context, 1)
        lineWidthA = lineWidth1
      }
      var hosei = 0
      if (element.isKotobagaki) {
        hosei += lineWidth2 / 2
      }
      Array.prototype.forEach.call(element.line, function (ch, j) {
        if (element.indices.includes(j)) {
          context.fillStyle = getSelectedSubStrColor()
        } else {
          context.fillStyle = getSelectedMainStrColor()
        }

        var charPos = chkRotate(ch, lineWidthA)

        context.beginPath()
        context.translate(
          startX - posX + charPos.transPosX + lineWidthA + hosei,
          startY + (lineWidthA * j + charPos.transPosY)
        )
        context.rotate((charPos.angle * Math.PI) / 180)
        context.translate(
          -(startX - posX + charPos.transPosX + lineWidthA + hosei),
          -(startY + (lineWidthA * j + charPos.transPosY))
        )

        if (selectedValue === 'white' || selectedValue === 'black') {
          if (selectedValue === 'white') context.strokeStyle = 'white'
          else context.strokeStyle = 'black'
          context.lineWidth = 10
          context.strokeText(
            ch,
            startX - posX + charPos.drawPosX + lineWidthA + hosei,
            startY + lineWidthA * j + charPos.drawPosY
          )
        }

        context.fillText(
          ch,
          startX - posX + charPos.drawPosX + lineWidthA + hosei,
          startY + lineWidthA * j + charPos.drawPosY
        )
        context.translate(
          startX - posX + charPos.transPosX + lineWidthA + hosei,
          startY + (lineWidthA * j + charPos.transPosY)
        )
        context.rotate((-charPos.angle * Math.PI) / 180)
        context.translate(
          -(startX - posX + charPos.transPosX + lineWidthA + hosei),
          -(startY + (lineWidthA * j + charPos.transPosY))
        )
      })
      posX += lineWidth1
    }
  }
}

function convertTextToArray(
  text: string
): { isKotobagaki: boolean; line: string; indices: number[] }[] {
  const result: { isKotobagaki: boolean; line: string; indices: number[] }[] =
    []

  let isKotobagaki = false
  let indices: number[] = []

  if (text.startsWith('詞書：')) {
    isKotobagaki = true
  }

  let isInsideStars = false
  let currentIndex = 0
  let starsNum = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '*' && text[i + 1] === '*' && text[i + 2] === '*') {
      if (!isInsideStars) {
        isInsideStars = true
        currentIndex = i + 3
        starsNum++
      } else {
        isInsideStars = false
      }
      i += 2
    } else if (isInsideStars) {
      if (isKotobagaki) indices.push(currentIndex - (starsNum * 6 - 3) - 3)
      else indices.push(currentIndex - (starsNum * 6 - 3))
      currentIndex++
    } else {
      currentIndex++
    }
  }

  const formattedLine = text.replace(/^詞書：/, '').replace(/\*\*\*/g, '')
  result.push({ isKotobagaki, line: formattedLine, indices })

  return result
}

function changeCanvasSize() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) {
    return
  }

  const canvasSize = getCanvasSize()
  canvas.setAttribute('width', canvasSize.width.toString())
  canvas.setAttribute('height', canvasSize.height.toString())
}

function getCanvasSize() {
  const yokonaga1 = document.querySelector<HTMLInputElement>('.yokonaga1')
  const masikaku = document.querySelector<HTMLInputElement>('.masikaku')
  const matiuke = document.querySelector<HTMLInputElement>('.matiuke')

  if (masikaku?.checked) {
    return { width: 2000, height: 2000 }
  } else if (matiuke?.checked) {
    return { width: 2000, height: 4000 }
  } else {
    return { width: 1500, height: 2000 }
  }
}

function check2Color(radioButtons: NodeListOf<HTMLInputElement>): string {
  const colors: { [key: string]: string } = {
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
    kuro: '#000000',
    picker: 'picker'
  }
  for (let i = 0; i < radioButtons.length; i++) {
    const radioButton = radioButtons[i] as HTMLInputElement
    if (radioButton.checked) {
      const propertyName = Object.keys(colors)[i]
      return colors[propertyName]
    }
  }
  return ''
}

function getSelectedCanvasColor(): string {
  const radioButtons = document.getElementsByName(
    'c_color'
  ) as NodeListOf<HTMLInputElement>
  const color = check2Color(radioButtons)
  if (color === 'picker') {
    let title = (<HTMLInputElement>(
      document.getElementsByClassName('c_picker')[0]
    )) as HTMLInputElement
    return title.value
  }
  return color
}

function getSelectedMainStrColor(): string {
  const radioButtons = document.getElementsByName(
    'ms_color'
  ) as NodeListOf<HTMLInputElement>
  const color = check2Color(radioButtons)
  if (color === 'picker') {
    let title = (<HTMLInputElement>(
      document.getElementsByClassName('ms_picker')[0]
    )) as HTMLInputElement
    return title.value
  }
  return color
}

function getSelectedSubStrColor(): string {
  const radioButtons = document.getElementsByName(
    'ss_color'
  ) as NodeListOf<HTMLInputElement>
  const color = check2Color(radioButtons)
  if (color === 'picker') {
    let title = (<HTMLInputElement>(
      document.getElementsByClassName('ss_picker')[0]
    )) as HTMLInputElement
    return title.value
  }
  return color
}

function insertText(): void {
  const inputTextElements: HTMLCollectionOf<HTMLInputElement> =
    document.getElementsByClassName(
      'js_input-text'
    ) as HTMLCollectionOf<HTMLInputElement>
  const inputText: HTMLInputElement = inputTextElements[1]

  let text: string = inputText.value
  text += '\n詞書：'

  inputText.value = text
}

const fileInput = document.querySelector('#fileUpload') as HTMLInputElement
if (fileInput) {
  fileInput.addEventListener('change', function (event) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.onload = function (e) {
        img = new Image()
        img.src = e.target?.result as string
        img.onload = function () {
          genereteCardImage()
        }
      }
      reader.readAsDataURL(file)
    }
  })
}

function registerButtonEvent(selector: string, callback: () => void) {
  const button = document.querySelector(selector) as HTMLElement
  button.addEventListener('click', callback)
}

document.addEventListener('DOMContentLoaded', () => {
  registerButtonEvent('.js_downloadButton', downloadCardImage)
  registerButtonEvent('.js_insertButton', insertText)

  const textareas = document.querySelectorAll('.js_input-text')
  textareas.forEach(areas => {
    areas.addEventListener('input', function () {
      genereteCardImage()
    })
  })

  const radioFontInputs = document.querySelectorAll(
    'input[type="radio"][name="font"]'
  )
  radioFontInputs.forEach(fontInput => {
    fontInput.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  // 文字サイズ変更ラジオボタンのイベントリスナー追加
  const radioFontSizeInputs = document.querySelectorAll(
    'input[type="radio"][name="font_size_scale"]'
  )
  radioFontSizeInputs.forEach(fontSizeInput => {
    fontSizeInput.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  const radioSizeInputs = document.querySelectorAll(
    'input[type="radio"][name="size"]'
  )
  radioSizeInputs.forEach(sizeInput => {
    sizeInput.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  const radioCColorInputs = document.querySelectorAll(
    'input[type="radio"][name="c_color"]'
  )
  radioCColorInputs.forEach(ccolorInput => {
    ccolorInput.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  const radioMsColorInputs = document.querySelectorAll(
    'input[type="radio"][name="ms_color"]'
  )
  radioMsColorInputs.forEach(mscolorInput => {
    mscolorInput.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  const radioSsColorInputs = document.querySelectorAll(
    'input[type="radio"][name="ss_color"]'
  )
  radioSsColorInputs.forEach(sscolorInput => {
    sscolorInput.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  const outlineInputs = document.querySelectorAll(
    'input[type="radio"][name="outline"]'
  )
  outlineInputs.forEach(outlineInputs => {
    outlineInputs.addEventListener('change', function () {
      genereteCardImage()
    })
  })

  const colorPicker1 = document.querySelector('.c_picker') as HTMLInputElement
  if (colorPicker1) {
    colorPicker1.addEventListener('change', function (event) {
      const selectedRadio = document.querySelector(
        `input[type="radio"][class="picker"][name="c_color"]`
      ) as HTMLInputElement
      if (selectedRadio) {
        selectedRadio.checked = true
      }
      genereteCardImage()
    })
  }

  const colorPicker2 = document.querySelector('.ms_picker') as HTMLInputElement
  if (colorPicker2) {
    colorPicker2.addEventListener('change', function (event) {
      const selectedRadio = document.querySelector(
        `input[type="radio"][class="picker"][name="ms_color"]`
      ) as HTMLInputElement
      if (selectedRadio) {
        selectedRadio.checked = true
      }
      genereteCardImage()
    })
  }

  const colorPicker3 = document.querySelector('.ss_picker') as HTMLInputElement
  if (colorPicker3) {
    colorPicker3.addEventListener('change', function (event) {
      const selectedRadio = document.querySelector(
        `input[type="radio"][class="picker"][name="ss_color"]`
      ) as HTMLInputElement
      if (selectedRadio) {
        selectedRadio.checked = true
      }
      genereteCardImage()
    })
  }

  const iposx = document.getElementById('posX') as HTMLInputElement
  if (iposx) {
    iposx.addEventListener('change', function (event) {
      genereteCardImage()
    })
  }

  const iposy = document.getElementById('posY') as HTMLInputElement
  if (iposy) {
    iposy.addEventListener('change', function (event) {
      genereteCardImage()
    })
  }
  const isize = document.getElementById('size') as HTMLInputElement
  if (isize) {
    isize.addEventListener('change', function (event) {
      genereteCardImage()
    })
  }

  const iangle = document.getElementById('angle') as HTMLInputElement
  if (iangle) {
    iangle.addEventListener('change', function (event) {
      genereteCardImage()
    })
  }
})
