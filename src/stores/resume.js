import { reactive, watch } from 'vue'

const STORAGE_KEY = 'curriculo-facil:draft:v1'

export const THEMES = [
  { id: 'blue', label: 'Azul', color: '#2563eb', rgb: [37, 99, 235] },
  { id: 'green', label: 'Verde', color: '#0f766e', rgb: [15, 118, 110] },
  { id: 'graphite', label: 'Grafite', color: '#334155', rgb: [51, 65, 85] },
  { id: 'wine', label: 'Vinho', color: '#9d174d', rgb: [157, 23, 77] },
]

export const EDUCATION_LEVELS = [
  'Fundamental incompleto',
  'Fundamental completo',
  'Médio incompleto',
  'Médio completo',
  'Técnico',
  'Superior incompleto',
  'Superior completo',
  'Pós-graduação',
  'Mestrado',
  'Doutorado',
]

export function createJob() {
  return {
    role: '',
    company: '',
    start: '',
    end: '',
    current: false,
    activities: '',
  }
}

export function createState() {
  return {
    theme: 'blue',
    personal: {
      firstName: '',
      lastName: '',
      age: '',
      phone: '',
      email: '',
    },
    objective: '',
    education: {
      level: '',
      course: '',
      institution: '',
      year: '',
    },
    skills: '',
    jobs: {
      hasPrevious: true,
      last: createJob(),
      previous: createJob(),
    },
  }
}

/* ------------------------------------------------------------------ */
/* Persistência local (rascunho no navegador)                          */
/* ------------------------------------------------------------------ */

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function mergeDraft(base, saved) {
  if (!saved) return base
  return {
    ...base,
    ...saved,
    personal: { ...base.personal, ...(saved.personal || {}) },
    education: { ...base.education, ...(saved.education || {}) },
    jobs: {
      ...base.jobs,
      ...(saved.jobs || {}),
      last: { ...base.jobs.last, ...(saved.jobs?.last || {}) },
      previous: { ...base.jobs.previous, ...(saved.jobs?.previous || {}) },
    },
  }
}

export const state = reactive(mergeDraft(createState(), loadDraft()))

let saveTimer
watch(
  state,
  (value) => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* armazenamento indisponível: segue sem salvar */
      }
    }, 250)
  },
  { deep: true },
)

export function resetState() {
  Object.assign(state, createState())
}

/* ------------------------------------------------------------------ */
/* Validação                                                           */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Retorna um objeto com mensagens por caminho de campo.
 * Ex.: { 'personal.firstName': 'Informe seu nome.' }
 */
export function validate(source) {
  const errors = {}
  const { personal } = source

  if (!personal.firstName.trim()) errors['personal.firstName'] = 'Informe seu nome.'
  if (!personal.lastName.trim()) errors['personal.lastName'] = 'Informe seu sobrenome.'

  if (!personal.email.trim()) {
    errors['personal.email'] = 'Informe seu e-mail.'
  } else if (!EMAIL_RE.test(personal.email.trim())) {
    errors['personal.email'] = 'Digite um e-mail válido (ex.: nome@email.com).'
  }

  if (String(personal.age).trim() !== '') {
    const age = Number(personal.age)
    if (!Number.isFinite(age) || age < 14 || age > 100) {
      errors['personal.age'] = 'Informe uma idade entre 14 e 100.'
    }
  }

  return errors
}
