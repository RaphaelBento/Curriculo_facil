import { jsPDF } from 'jspdf'
import {
  contactItems,
  formatPeriod,
  fullName,
  parseSkills,
  pdfSafe,
  slugify,
  splitLines,
} from './format'

/* Medidas em milímetros (A4) */
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 16
const RIGHT = PAGE_W - MARGIN
const CONTENT_W = RIGHT - MARGIN
const BOTTOM = PAGE_H - 20

const INK = [17, 24, 39]
const SOFT = [55, 65, 81]
const MUTED = [102, 112, 133]
const RULE = [226, 232, 240]
const FOOTER = [148, 163, 184]

const THEME_RGB = {
  blue: [37, 99, 235],
  green: [15, 118, 110],
  graphite: [51, 65, 85],
  wine: [157, 23, 77],
}

/** pt -> mm */
const mm = (pt) => pt * 0.3528

export function pdfFileName(data) {
  const slug = slugify(fullName(data.personal))
  return `curriculo-${slug || 'sem-nome'}.pdf`
}

/**
 * Monta o currículo em PDF com texto selecionável (bom para ATS/recrutadores).
 * Retorna a instância do jsPDF pronta para `save()` ou `output()`.
 */
export function buildResumePdf(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const accent = THEME_RGB[data.theme] || THEME_RGB.blue
  let y = MARGIN

  /* ---------------- helpers ---------------- */

  const style = (weight, size, color = INK) => {
    doc.setFont('helvetica', weight)
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
  }

  const widthOf = (text, weight, size) => {
    style(weight, size, MUTED)
    return doc.getTextWidth(pdfSafe(text))
  }

  const addPage = () => {
    doc.addPage()
    y = MARGIN
  }

  const ensure = (height) => {
    if (y + height > BOTTOM) addPage()
  }

  /** Desenha uma linha e avança o cursor. */
  const line = (text, x, lineHeight, opts = {}) => {
    const { weight = 'normal', size = 10, color = SOFT, align = 'left' } = opts
    style(weight, size, color)
    doc.text(pdfSafe(text), x, y + lineHeight * 0.78, { align })
    y += lineHeight
  }

  const wrap = (text, weight, size, maxWidth = CONTENT_W) => {
    style(weight, size)
    return doc.splitTextToSize(pdfSafe(text), maxWidth)
  }

  const paragraph = (text, opts = {}) => {
    const { size = 10, lineHeight = 5.1, color = SOFT } = opts
    const clean = String(text).replace(/\s+/g, ' ').trim()
    if (!clean) return
    for (const row of wrap(clean, 'normal', size)) {
      ensure(lineHeight)
      line(row, MARGIN, lineHeight, { size, color })
    }
  }

  const sectionTitle = (label) => {
    y += 3
    ensure(24)
    line(label.toUpperCase(), MARGIN, 5.6, {
      weight: 'bold',
      size: 10,
      color: accent,
    })
    y += 1.4
    doc.setDrawColor(RULE[0], RULE[1], RULE[2])
    doc.setLineWidth(0.25)
    doc.line(MARGIN, y, RIGHT, y)
    y += 5
  }

  /* ---------------- cabeçalho ---------------- */

  const name = fullName(data.personal).toUpperCase() || 'CURRÍCULO'
  const nameSize = name.length > 34 ? 17 : name.length > 26 ? 20 : 24
  const nameLines = wrap(name, 'bold', nameSize)
  const nameLineHeight = mm(nameSize) * 1.2

  for (const row of nameLines) {
    line(row, MARGIN, nameLineHeight, {
      weight: 'bold',
      size: nameSize,
      color: INK,
    })
  }

  y += 1.8
  doc.setFillColor(accent[0], accent[1], accent[2])
  doc.rect(MARGIN, y, 28, 1.4, 'F')
  y += 7

  const contacts = contactItems(data.personal)
  if (contacts.length) {
    for (const row of wrap(contacts.join('   |   '), 'normal', 9.5)) {
      line(row, MARGIN, 5, { size: 9.5, color: MUTED })
    }
  }

  /* ---------------- objetivo ---------------- */

  if ((data.objective || '').trim()) {
    sectionTitle('Objetivo')
    paragraph(data.objective)
  }

  /* ---------------- experiência ---------------- */

  const jobBlock = (job) => {
    const role = (job.role || '').trim() || 'Experiência profissional'
    const company = (job.company || '').trim()
    const period = formatPeriod(job)
    const bullets = splitLines(job.activities)

    ensure(16)

    const periodWidth = period ? widthOf(period, 'normal', 8.5) : 0
    const roleLines = wrap(
      role,
      'bold',
      11.5,
      CONTENT_W - (periodWidth ? periodWidth + 6 : 0),
    )
    const firstLineTop = y

    if (period) {
      style('normal', 8.5, MUTED)
      doc.text(pdfSafe(period), RIGHT, firstLineTop + 5.4 * 0.78, {
        align: 'right',
      })
    }

    for (const row of roleLines) {
      ensure(5.4)
      line(row, MARGIN, 5.4, { weight: 'bold', size: 11.5, color: INK })
    }

    if (company) line(company, MARGIN, 5, { size: 10, color: SOFT })

    for (const text of bullets) {
      const rows = wrap(text, 'normal', 9.8, CONTENT_W - 6)
      rows.forEach((row, index) => {
        ensure(4.9)
        if (index === 0) {
          doc.setFillColor(accent[0], accent[1], accent[2])
          doc.circle(MARGIN + 1.3, y + 1.55, 0.62, 'F')
        }
        line(row, MARGIN + 5, 4.9, { size: 9.8, color: SOFT })
      })
    }
  }

  const jobs = [
    data.jobs?.last,
    data.jobs?.hasPrevious ? data.jobs?.previous : null,
  ]
    .filter(Boolean)
    .filter((job) => (job.role || '').trim() || (job.company || '').trim())

  if (jobs.length) {
    sectionTitle('Experiência profissional')
    jobs.forEach((job, index) => {
      if (index > 0) y += 2.4
      jobBlock(job)
    })
  }

  /* ---------------- formação ---------------- */

  const education = data.education || {}
  const year = (education.year || '').trim()
  const hasEducation = Boolean(
    education.level || education.course || education.institution || year,
  )

  if (hasEducation) {
    sectionTitle('Formação acadêmica')

    if (education.level) {
      const yearWidth = year ? widthOf(year, 'normal', 8.5) + 6 : 0
      const levelLines = wrap(
        education.level,
        'bold',
        11,
        CONTENT_W - yearWidth,
      )
      const firstLineTop = y

      if (year) {
        style('normal', 8.5, MUTED)
        doc.text(pdfSafe(year), RIGHT, firstLineTop + 5.4 * 0.78, {
          align: 'right',
        })
      }

      for (const row of levelLines) {
        line(row, MARGIN, 5.4, { weight: 'bold', size: 11, color: INK })
      }
    }

    if (education.course) {
      line(education.course, MARGIN, 5, { size: 10, color: SOFT })
    }

    const place = [education.institution, education.level ? '' : year]
      .map((part) => (part || '').trim())
      .filter(Boolean)
      .join('  ·  ')

    if (place) line(place, MARGIN, 4.9, { size: 9.5, color: MUTED })
  }

  /* ---------------- habilidades ---------------- */

  const skills = parseSkills(data.skills)
  if (skills.length) {
    sectionTitle('Habilidades')
    paragraph(skills.join('   ·   '))
  }

  /* ---------------- rodapé ---------------- */

  doc.setProperties({
    title: `Currículo - ${fullName(data.personal)}`,
    subject: 'Currículo profissional',
    author: fullName(data.personal),
    creator: 'Currículo Fácil',
  })

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(RULE[0], RULE[1], RULE[2])
    doc.setLineWidth(0.2)
    doc.line(MARGIN, PAGE_H - 15, RIGHT, PAGE_H - 15)

    style('normal', 7.8, FOOTER)
    doc.text('Currículo Fácil', MARGIN, PAGE_H - 10.5)
    doc.text(`Página ${page} de ${totalPages}`, RIGHT, PAGE_H - 10.5, {
      align: 'right',
    })
  }

  return doc
}

export function downloadResumePdf(data) {
  const doc = buildResumePdf(data)
  doc.save(pdfFileName(data))
}
