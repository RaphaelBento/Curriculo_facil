/** Funções de formatação usadas tanto na prévia quanto no PDF. */

/** Remove acentos, espaços e caracteres especiais (para nome de arquivo). */
export function slugify(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Nome completo a partir dos campos separados. */
export function fullName(personal = {}) {
  return [personal.firstName, personal.lastName]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' ')
}

/** Formata telefone brasileiro enquanto o usuário digita: (11) 91234-5678 */
export function formatPhone(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** Ex.: "mar 2020 – Atual" */
export function formatPeriod(job = {}) {
  const start = (job.start || '').trim()
  const end = job.current ? 'Atual' : (job.end || '').trim()
  if (start && end) return `${start} – ${end}`
  return start || end
}

/** Quebra um texto em linhas, removendo marcadores que o usuário digitar. */
export function splitLines(value = '') {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-•*·]\s*/, ''))
    .filter(Boolean)
}

/** "Excel, atendimento; Pacote Office" -> ["Excel", "atendimento", "Pacote Office"] */
export function parseSkills(value = '') {
  return value
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
}

/**
 * As fontes padrão do PDF (Helvetica) só cobrem Latin-1 e o jsPDF descarta
 * caracteres fora dessa faixa (travessões, bullets, emojis...). Aqui a gente
 * troca por equivalentes seguros antes de desenhar o texto.
 */
export function pdfSafe(value = '') {
  return String(value)
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2022\u2023\u25CF\u25AA]/g, '-')
    .replace(/[^\x00-\xFF]/g, '')
}

/** Itens exibidos na linha de contato do currículo. */
export function contactItems(personal = {}) {
  const items = []
  const age = String(personal.age ?? '').trim()
  if (age) items.push(`${age} anos`)
  if ((personal.phone || '').trim()) items.push(personal.phone.trim())
  if ((personal.email || '').trim()) items.push(personal.email.trim())
  return items
}
