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
  for (const match of text.matchAll(pattern)) {
    const offset = match.index ?? 0
    plain += text.slice(cursor, offset)
    const base = match[1]
    const start = [...plain.replace(/\*\*\*/g, '')].length
    plain += base
    marks.push({
      start,
      length: [...base.replace(/\*\*\*/g, '')].length,
      reading: match[2]
    })
    cursor = offset + match[0].length
  }
  plain += text.slice(cursor)
  return { plain, marks }
}

function verticalColumn(
  text: string,
  x: number,
  size: number,
  subColor: string
) {
  const column = svgElement('text', {
    x,
    'font-size': size,
    'writing-mode': 'vertical-rl',
    'text-orientation': 'mixed',
    'dominant-baseline': 'central'
  })
  // Color whole runs so the browser can still shape adjacent characters.
  text.split('***').forEach((run, index) => {
    if (!run) return
    const span = svgElement('tspan', index % 2 ? { fill: subColor } : {})
    span.textContent = run
    column.appendChild(span)
  })
  return column
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
  svg: SVGSVGElement,
  columns: SVGTextElement[],
  height: number
) {
  // SVG measures the same shaped text it will paint. The longest column sets
  // the shared starting position, including shorter annotation columns.
  svg.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
  document.body.appendChild(svg)
  try {
    const longest = columns.reduce(
      (length, column) => Math.max(length, column.getComputedTextLength()),
      0
    )
    for (const column of columns) {
      column.setAttribute('y', String((height - longest) / 2))
    }
  } finally {
    svg.remove()
    svg.removeAttribute('style')
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
    firstLine(card.title),
    width * 0.9 - 30,
    60,
    card.subColor
  )
  titleColumn.setAttribute('text-anchor', 'middle')
  titleColumn.setAttribute('y', String(height / 2))
  group.appendChild(titleColumn)

  group.appendChild(
    horizontalNote(card.leftNote, width * 0.05, height * 0.95, 'start')
  )
  group.appendChild(
    horizontalNote(card.rightNote, width * 0.95, height * 0.95, 'end')
  )

  const rubyColumns: { column: SVGTextElement; marks: RubyMark[]; size: number }[] = []
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
    rubyColumns.push({ column, marks: parsed.marks, size })
    group.appendChild(column)
    return column
  })

  const { fontFamily, fontCss } = await prepareCardFont(
    card.font,
    group.textContent || ''
  )
  group.setAttribute('font-family', fontFamily)
  svg.appendChild(group)
  positionBody(svg, columns, height)
  // Measure the actual vertical glyph positions, then center each reading on its base.
  svg.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
  document.body.appendChild(svg)
  try {
    for (const { column, marks, size } of rubyColumns) {
      for (const mark of marks) {
        if (!mark.length) continue
        try {
          const first = column.getStartPositionOfChar(mark.start)
          const last = column.getEndPositionOfChar(mark.start + mark.length - 1)
          const reading = svgElement('text', {
            x: Number(column.getAttribute('x')) + size * 0.72,
            y: (first.y + last.y) / 2,
            'font-size': size * 0.5,
            'writing-mode': 'vertical-rl',
            'text-orientation': 'mixed',
            'text-anchor': 'middle',
            'dominant-baseline': 'central'
          })
          reading.textContent = mark.reading
          group.appendChild(reading)
        } catch (error) {
          console.warn('ルビの位置を計測できませんでした', error)
        }
      }
    }
  } finally {
    svg.remove()
    svg.removeAttribute('style')
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
