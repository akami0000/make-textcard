import { prepareCardFont } from './card-fonts'

const svgNamespace = 'http://www.w3.org/2000/svg'
const xmlNamespace = 'http://www.w3.org/XML/1998/namespace'
const bodySize = 48
const noteSize = 36
export const kotobagakiPrefix = '詞書：'

export type CardText = {
  title: string
  body: string
  leftNote: string
  rightNote: string
  font: string
  mainColor: string
  subColor: string
  outline: string
}

function svgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(svgNamespace, tag)
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value))
  }
  return element
}

function firstLine(text: string): string {
  return text.split('\n')[0]
}

type RubyMark = { start: number; length: number; reading: string }

function parseRuby(text: string): { plain: string; marks: RubyMark[] } {
  const marks: RubyMark[] = []
  let plain = ''
  let cursor = 0
  // 『』 explicitly delimit the ruby base, avoiding ambiguous word boundaries.
  const pattern = /『([^『』\n]+?)（ルビ：([^（）\n]+)）』/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const offset = match.index
    plain += text.slice(cursor, offset)
    const base = match[1]
    const start = Array.from(plain.replace(/\*\*\*/g, '')).length
    plain += base
    marks.push({
      start,
      length: Array.from(base.replace(/\*\*\*/g, '')).length,
      reading: match[2]
    })
    cursor = offset + match[0].length
  }
  plain += text.slice(cursor)
  return { plain, marks }
}

// Explicit glyph positions avoid iOS WebKit's inconsistent SVG vertical shaping.
// Prefer Unicode vertical presentation forms where available.
const verticalForms: Record<string, string> = {
  '、': '︑', '。': '︒', '，': '︐', '．': '︒',
  '「': '﹁', '」': '﹂', '『': '﹃', '』': '﹄',
  '（': '︵', '）': '︶', '(': '︵', ')': '︶',
  '［': '﹇', '］': '﹈', '【': '︻', '】': '︼',
  '｛': '︷', '｝': '︸', '〈': '︿', '〉': '﹀',
  '《': '︽', '》': '︾', '〔': '︹', '〕': '︺',
  '…': '︙', '‥': '︰', 'ー': '丨', '―': '︱'
}

// Historical chkRotate coverage. Keep explicit glyph positioning for all
// browsers; only rotate characters without a vertical presentation form.
const rotateSideways = /^[0-9a-zA-Z]$/
const rotateSymbols = new Set(Array.from('〜～=_;~|><}{][＜＞：；｜−／＼-＝/\\＿'))
const unchangedSymbols = new Set(Array.from('!+·“\'\x60”‘’'))
const punctuationSymbols = new Set(Array.from('、。，．'))
const specialSymbols = new Set(Array.from('ー（）「」【】『』［］…‥―'))

function glyphLayout(char: string, size: number) {
  if (verticalForms[char]) {
    return { text: verticalForms[char], angle: 0, dx: 0, dy: 0 }
  }
  if (punctuationSymbols.has(char)) {
    return { text: char, angle: 180, dx: 0, dy: size * 0.3 }
  }
  if (rotateSideways.test(char)) {
    return { text: char, angle: 90, dx: 0, dy: 0 }
  }
  if (rotateSymbols.has(char) || specialSymbols.has(char)) {
    return { text: char, angle: 90, dx: 0, dy: 0 }
  }
  if (char === ':' || char === '(' || char === ')') {
    return { text: char, angle: 90, dx: 0, dy: 0 }
  }
  if (char === '!' || char === '+' || unchangedSymbols.has(char)) {
    return { text: char, angle: 0, dx: size * 0.15, dy: 0 }
  }
  return { text: char, angle: 0, dx: 0, dy: 0 }
}

function verticalColumn(text: string, x: number, size: number, subColor: string) {
  const column = svgElement('g')
  let index = 0
  let highlight = false
  for (const run of text.split('***')) {
    for (const char of Array.from(run)) {
      const y = (index + 0.5) * size
      const glyph = svgElement('text', {
        x, y, 'font-size': size, 'text-anchor': 'middle',
        'dominant-baseline': 'central',
        ...(highlight ? { fill: subColor } : {})
      })
      const layout = glyphLayout(char, size)
      glyph.textContent = layout.text
      glyph.setAttribute('x', String(x + layout.dx))
      glyph.setAttribute('y', String(y + layout.dy))
      if (layout.angle) {
        glyph.setAttribute(
          'transform',
          `rotate(${layout.angle} ${x + layout.dx} ${y + layout.dy})`
        )
      }
      column.appendChild(glyph)
      index++
    }
    highlight = !highlight
  }
  return { column, length: index * size }
}

function horizontalNote(text: string, x: number, y: number, anchor: string) {
  const note = svgElement('text', {
    x,
    y,
    'font-size': noteSize,
    'text-anchor': anchor
  })
  note.textContent = firstLine(text).replace(/\*\*\*/g, '')
  return note
}

function positionBody(
  columns: { column: SVGGElement; length: number }[], height: number
) {
  const longest = Math.max(0, ...columns.map(item => item.length))
  const offset = (height - longest) / 2
  for (const { column } of columns) {
    column.setAttribute('transform', `translate(0 ${offset})`)
  }
}

export async function renderCardText(
  card: CardText,
  width: number,
  height: number,
  scale: number
): Promise<HTMLImageElement> {
  const lines = card.body.split('\n')
  const svg = svgElement('svg', { width, height })
  svg.setAttributeNS(xmlNamespace, 'xml:lang', 'ja')
  const group = svgElement('g', { fill: card.mainColor })
  group.setAttributeNS(xmlNamespace, 'xml:space', 'preserve')
  if (card.outline === 'white' || card.outline === 'black') {
    group.setAttribute('stroke', card.outline)
    group.setAttribute('stroke-width', '10')
    group.setAttribute('stroke-linejoin', 'round')
    group.setAttribute('paint-order', 'stroke fill')
  }

  const titleColumn = verticalColumn(
    firstLine(card.title), width * 0.9 - 30, 60, card.subColor
  )
  titleColumn.column.setAttribute(
    'transform', `translate(0 ${(height - titleColumn.length) / 2})`
  )
  group.appendChild(titleColumn.column)

  group.appendChild(
    horizontalNote(card.leftNote, width * 0.05, height * 0.95, 'start')
  )
  group.appendChild(
    horizontalNote(card.rightNote, width * 0.95, height * 0.95, 'end')
  )

  const rubyColumns: { x: number; marks: RubyMark[]; size: number }[] = []
  const columns = lines.map((line, index) => {
    const annotation = line.startsWith(kotobagakiPrefix)
    const text = annotation ? line.slice(kotobagakiPrefix.length) : line
    const x = width / 2 + ((lines.length - 1) / 2 - index) * bodySize
    const parsed = parseRuby(text)
    const size = annotation ? noteSize : bodySize
    const column = verticalColumn(
      parsed.plain,
      x,
      size,
      card.subColor
    )
    rubyColumns.push({ x, marks: parsed.marks, size })
    group.appendChild(column.column)
    return column
  })

  const { fontFamily, fontCss } = await prepareCardFont(
    card.font,
    group.textContent || ''
  )
  group.setAttribute('font-family', fontFamily)
  svg.appendChild(group)
  positionBody(columns, height)
  // Ruby uses the same fixed cell grid as its base glyphs.
  const longest = Math.max(0, ...columns.map(item => item.length))
  const offset = (height - longest) / 2
  for (const { x, marks, size } of rubyColumns) {
    for (const mark of marks) {
      if (!mark.length) continue
      const reading = verticalColumn(mark.reading, x + size * 0.9, size * 0.5, card.subColor)
      const center = offset + (mark.start + mark.length / 2) * size
      reading.column.setAttribute(
        'transform', `translate(0 ${center - reading.length / 2})`
      )
      group.appendChild(reading.column)
    }
  }
  if (scale !== 1) {
    group.setAttribute(
      'transform',
      `translate(${width / 2} ${height / 2}) scale(${scale}) translate(${-width / 2} ${-height / 2})`
    )
  }

  const style = svgElement('style')
  style.textContent = fontCss
  svg.prepend(style)
  const svgSource = new XMLSerializer().serializeToString(svg)
  const url = URL.createObjectURL(
    new Blob([svgSource], { type: 'image/svg+xml;charset=utf-8' })
  )
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}
