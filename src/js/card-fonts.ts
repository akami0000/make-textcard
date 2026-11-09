type FontSource = { url: string; range: string }
type EmbeddedFace = { family: string; dataUrl: string; range: string }

const bundledFamily = 'lineseed'
const embeddedFaces = new Map<string, Promise<EmbeddedFace>>()

export function selectedFontFamily(): string {
  const label = document
    .querySelector<HTMLInputElement>('input[name="font"]:checked')
    ?.closest('label')
  if (!label) return bundledFamily
  return getComputedStyle(label)
    .fontFamily.split(',')[0]
    .replace(/['"]/g, '')
    .trim()
}

function fontSources(family: string): FontSource[] {
  const sources: FontSource[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue
      const style = (rule as CSSFontFaceRule).style
      const name = style.getPropertyValue('font-family').replace(/['"]/g, '')
      if (name !== family) continue
      const url = /url\(["']?([^"')]+)["']?\)/.exec(
        style.getPropertyValue('src')
      )?.[1]
      if (url) {
        sources.push({
          url: new URL(url, sheet.href || document.baseURI).href,
          range: style.getPropertyValue('unicode-range') || 'U+0-10FFFF'
        })
      }
    }
  }
  return sources
}

function matchingSources(family: string, text: string): FontSource[] {
  const points = Array.from(
    new Set(Array.from(text, char => char.codePointAt(0)!))
  )
  return fontSources(family).filter(({ range }) =>
    range.split(',').some(value => {
      const [start, end] = value.trim().slice(2).split('-')
      const first = parseInt(start.replace(/\?/g, '0'), 16)
      const last = parseInt(end || start.replace(/\?/g, 'F'), 16)
      return points.some(point => point >= first && point <= last)
    })
  )
}

function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function loadFace(family: string, source: FontSource): Promise<EmbeddedFace> {
  const key = JSON.stringify([family, source.url, source.range])
  const existing = embeddedFaces.get(key)
  if (existing) return existing

  const request = (async () => {
    const response = await fetch(source.url)
    if (!response.ok)
      throw new Error(`Font request failed (${response.status})`)
    const blob = await response.blob()
    const face = new FontFace(family, await blob.arrayBuffer(), {
      unicodeRange: source.range
    })
    await face.load()
    const dataUrl = await readDataUrl(blob)
    // Use the same downloaded face for DOM measurement and for the SVG image.
    document.fonts.add(face)
    return { family, dataUrl, range: source.range }
  })()
  embeddedFaces.set(key, request)
  request.catch(() => embeddedFaces.delete(key))
  return request
}

async function loadFamily(family: string, sources: FontSource[]) {
  return Promise.all(
    sources.map(source => loadFace(`card-${family}`, source).catch(() => null))
  )
}

export async function prepareCardFont(family: string, text: string) {
  if (!text.trim()) return { fontFamily: 'sans-serif', fontCss: '' }

  const requested = await loadFamily(family, matchingSources(family, text))
  const faces = requested.filter((face): face is EmbeddedFace => face !== null)
  if (
    family !== bundledFamily &&
    (!faces.length || faces.length < requested.length)
  ) {
    const fallback = await loadFamily(
      bundledFamily,
      matchingSources(bundledFamily, text)
    )
    faces.push(
      ...fallback.filter((face): face is EmbeddedFace => face !== null)
    )
  }

  const families = Array.from(new Set(faces.map(face => `"${face.family}"`)))
  return {
    fontFamily: [...families, 'sans-serif'].join(', '),
    // SVG images cannot load external resources. Embed only the matching subsets.
    fontCss: faces
      .map(
        ({ family, dataUrl, range }) =>
          `@font-face{font-family:"${family}";src:url("${dataUrl}");unicode-range:${range}}`
      )
      .join('\n')
  }
}
