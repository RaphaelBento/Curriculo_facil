<script setup>
import { computed } from 'vue'
import {
  contactItems,
  formatPeriod,
  fullName,
  parseSkills,
  splitLines,
} from '@/lib/format'
import { state } from '@/stores/resume'

const props = defineProps({
  /** No celular a prévia vira um documento fluido (legível) em vez de A4. */
  fluid: {
    type: Boolean,
    default: false,
  },
})

const name = computed(() => fullName(state.personal))
const contacts = computed(() => contactItems(state.personal))
const objective = computed(() => (state.objective || '').trim())

const jobs = computed(() => {
  const list = []

  const add = (job) => {
    if (!job) return
    const role = (job.role || '').trim()
    const company = (job.company || '').trim()
    if (!role && !company) return

    list.push({
      role: role || 'Experiência profissional',
      company,
      period: formatPeriod(job),
      bullets: splitLines(job.activities),
    })
  }

  add(state.jobs.last)
  if (state.jobs.hasPrevious) add(state.jobs.previous)
  return list
})

const education = computed(() => {
  const { level, course, institution, year } = state.education
  const place = [institution, level ? '' : year]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' · ')

  return {
    level: (level || '').trim(),
    course: (course || '').trim(),
    place,
    year: (year || '').trim(),
  }
})

const hasEducation = computed(
  () =>
    Boolean(education.value.level) ||
    Boolean(education.value.course) ||
    Boolean(education.value.place) ||
    Boolean(education.value.year),
)

const skills = computed(() => parseSkills(state.skills))

const isEmpty = computed(
  () =>
    !name.value &&
    !objective.value &&
    !jobs.value.length &&
    !hasEducation.value &&
    !skills.value.length,
)
</script>

<template>
  <article class="sheet" :class="{ 'sheet--fluid': props.fluid }">
    <header class="sheet__header">
      <h1 class="sheet__name" :class="{ 'is-placeholder': !name }">
        {{ name || 'Seu Nome Completo' }}
      </h1>
      <span class="sheet__accent" aria-hidden="true"></span>

      <ul v-if="contacts.length" class="sheet__contacts">
        <li v-for="(item, index) in contacts" :key="index">{{ item }}</li>
      </ul>
      <p v-else class="sheet__contacts is-placeholder">
        Idade · Telefone / WhatsApp · E-mail
      </p>
    </header>

    <section v-if="objective" class="sheet__section">
      <h2 class="sheet__section-title">Objetivo</h2>
      <p class="sheet__paragraph">{{ objective }}</p>
    </section>

    <section v-if="jobs.length" class="sheet__section">
      <h2 class="sheet__section-title">Experiência profissional</h2>

      <div v-for="(job, index) in jobs" :key="index" class="sheet__entry">
        <div class="sheet__entry-head">
          <h3 class="sheet__entry-title">{{ job.role }}</h3>
          <span v-if="job.period" class="sheet__period">{{ job.period }}</span>
        </div>
        <p v-if="job.company" class="sheet__entry-sub">{{ job.company }}</p>

        <ul v-if="job.bullets.length" class="sheet__bullets">
          <li v-for="(bullet, bulletIndex) in job.bullets" :key="bulletIndex">
            {{ bullet }}
          </li>
        </ul>
      </div>
    </section>

    <section v-if="hasEducation" class="sheet__section">
      <h2 class="sheet__section-title">Formação acadêmica</h2>

      <div class="sheet__entry">
        <div class="sheet__entry-head">
          <h3 v-if="education.level" class="sheet__entry-title">
            {{ education.level }}
          </h3>
          <span v-if="education.year" class="sheet__period">
            {{ education.year }}
          </span>
        </div>
        <p v-if="education.course" class="sheet__entry-sub">
          {{ education.course }}
        </p>
        <p v-if="education.place" class="sheet__entry-place">
          {{ education.place }}
        </p>
      </div>
    </section>

    <section v-if="skills.length" class="sheet__section">
      <h2 class="sheet__section-title">Habilidades</h2>
      <ul class="sheet__skills">
        <li v-for="skill in skills" :key="skill">{{ skill }}</li>
      </ul>
    </section>

    <p v-if="isEmpty" class="sheet__empty">
      Preencha o formulário e seu currículo aparece aqui, prontinho para virar
      PDF.
    </p>
  </article>
</template>

<style scoped>
.sheet {
  position: relative;
  width: 794px;
  min-height: 1122px;
  padding: 62px 60px 70px;
  background: #ffffff;
  color: #101828;
  font-family: var(--font-sans);
  line-height: 1.5;
  box-shadow: 0 24px 60px -30px rgba(16, 24, 40, 0.45);
  border-radius: 2px;
  overflow: hidden;
}

.sheet__name {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.015em;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.sheet__accent {
  display: block;
  width: 106px;
  height: 5px;
  margin: 16px 0 18px;
  border-radius: 999px;
  background: var(--accent);
}

.sheet__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  color: #667085;
}

.sheet__contacts li {
  display: flex;
  align-items: center;
  overflow-wrap: anywhere;
}

.sheet__contacts li + li::before {
  content: '';
  width: 1px;
  height: 11px;
  margin: 0 13px;
  background: #d0d5dd;
}

.sheet__section {
  margin-top: 30px;
}

.sheet__section-title {
  margin: 0 0 14px;
  padding-bottom: 7px;
  border-bottom: 1px solid #e5e9f0;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.sheet__paragraph {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: #374151;
  white-space: pre-line;
}

.sheet__entry + .sheet__entry {
  margin-top: 20px;
}

.sheet__entry-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.sheet__entry-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.35;
  color: #101828;
}

.sheet__period {
  flex: none;
  font-size: 11.5px;
  color: #667085;
  white-space: nowrap;
}

.sheet__entry-sub {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: #475467;
}

.sheet__entry-place {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: #667085;
}

.sheet__bullets {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.sheet__bullets li {
  position: relative;
  padding-left: 16px;
  font-size: 13px;
  line-height: 1.65;
  color: #374151;
}

.sheet__bullets li + li {
  margin-top: 3px;
}

.sheet__bullets li::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

.sheet__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sheet__skills li {
  padding: 4px 11px;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, #ffffff);
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 7%, #ffffff);
  font-size: 12px;
  font-weight: 500;
  color: #344054;
}

.sheet__empty {
  margin-top: 40px;
  padding: 22px;
  border: 1px dashed #d6dde8;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  color: #667085;
}

.is-placeholder {
  color: #6b7280;
}

/* No celular a folha vira um documento fluido, com texto legível. */
.sheet--fluid {
  width: 100%;
  min-height: 0;
  padding: 30px 22px 38px;
  border-radius: 0;
  box-shadow: none;
}

.sheet--fluid .sheet__name {
  font-size: 26px;
}

.sheet--fluid .sheet__accent {
  width: 74px;
  height: 4px;
  margin: 14px 0 15px;
}

.sheet--fluid .sheet__section {
  margin-top: 26px;
}
</style>
