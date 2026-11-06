<script setup>
import { EDUCATION_LEVELS, THEMES, state } from '@/stores/resume'
import { formatPhone } from '@/lib/format'

const props = defineProps({
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit', 'reset'])

const errorOf = (path) => props.errors?.[path] || ''
const hasError = (path) => Boolean(errorOf(path))
const invalid = (path) => (hasError(path) ? 'true' : 'false')
const describedBy = (path, id) => (hasError(path) ? id : undefined)

function onPhoneBlur() {
  state.personal.phone = formatPhone(state.personal.phone)
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="emit('submit')">
    <!-- 1. dados pessoais -->
    <section class="card">
      <header class="card__head">
        <span class="card__step" aria-hidden="true">1</span>
        <div class="card__titles">
          <h2>Dados pessoais</h2>
          <p>É o que aparece no topo do currículo.</p>
        </div>
      </header>

      <div class="grid">
        <div class="field">
          <label for="firstName">Nome <span class="req">*</span></label>
          <input
            id="firstName"
            v-model.trim="state.personal.firstName"
            type="text"
            autocomplete="given-name"
            placeholder="Maria"
            :aria-invalid="invalid('personal.firstName')"
            :aria-describedby="describedBy('personal.firstName', 'firstName-error')"
          />
          <p v-if="hasError('personal.firstName')" id="firstName-error" class="field__error">
            {{ errorOf('personal.firstName') }}
          </p>
        </div>

        <div class="field">
          <label for="lastName">Sobrenome <span class="req">*</span></label>
          <input
            id="lastName"
            v-model.trim="state.personal.lastName"
            type="text"
            autocomplete="family-name"
            placeholder="Silva"
            :aria-invalid="invalid('personal.lastName')"
            :aria-describedby="describedBy('personal.lastName', 'lastName-error')"
          />
          <p v-if="hasError('personal.lastName')" id="lastName-error" class="field__error">
            {{ errorOf('personal.lastName') }}
          </p>
        </div>

        <div class="field">
          <label for="age">Idade</label>
          <input
            id="age"
            v-model="state.personal.age"
            type="number"
            inputmode="numeric"
            min="14"
            max="100"
            placeholder="23"
            :aria-invalid="invalid('personal.age')"
            :aria-describedby="describedBy('personal.age', 'age-error')"
          />
          <p v-if="hasError('personal.age')" id="age-error" class="field__error">
            {{ errorOf('personal.age') }}
          </p>
        </div>

        <div class="field">
          <label for="phone">Telefone / WhatsApp</label>
          <input
            id="phone"
            v-model="state.personal.phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="(11) 91234-5678"
            @blur="onPhoneBlur"
          />
          <p class="field__hint">Aparece com DDD, do jeito que o recrutador liga.</p>
        </div>

        <div class="field field--full">
          <label for="email">E-mail <span class="req">*</span></label>
          <input
            id="email"
            v-model.trim="state.personal.email"
            type="email"
            autocomplete="email"
            placeholder="maria.silva@email.com"
            :aria-invalid="invalid('personal.email')"
            :aria-describedby="describedBy('personal.email', 'email-error')"
          />
          <p v-if="hasError('personal.email')" id="email-error" class="field__error">
            {{ errorOf('personal.email') }}
          </p>
        </div>
      </div>
    </section>

    <!-- 2. escolaridade -->
    <section class="card">
      <header class="card__head">
        <span class="card__step" aria-hidden="true">2</span>
        <div class="card__titles">
          <h2>Escolaridade</h2>
          <p>Sua formação mais recente.</p>
        </div>
      </header>

      <div class="grid">
        <div class="field field--full">
          <label for="educationLevel">Nível de escolaridade</label>
          <select id="educationLevel" v-model="state.education.level">
            <option value="">Selecione…</option>
            <option v-for="level in EDUCATION_LEVELS" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="course">Curso</label>
          <input
            id="course"
            v-model="state.education.course"
            type="text"
            placeholder="Técnico em Administração"
          />
        </div>

        <div class="field">
          <label for="institution">Instituição</label>
          <input
            id="institution"
            v-model="state.education.institution"
            type="text"
            placeholder="Escola ou faculdade"
          />
        </div>

        <div class="field field--full">
          <label for="year">Ano de conclusão</label>
          <input
            id="year"
            v-model="state.education.year"
            type="text"
            placeholder="2023 ou Cursando"
          />
        </div>
      </div>
    </section>

    <!-- 3. experiências -->
    <section class="card">
      <header class="card__head">
        <span class="card__step" aria-hidden="true">3</span>
        <div class="card__titles">
          <h2>Experiência profissional</h2>
          <p>Comece pela mais recente. O penúltimo emprego é opcional.</p>
        </div>
      </header>

      <div class="job">
        <div class="job__head">
          <span class="chip">Último emprego</span>
          <label class="switch">
            <input v-model="state.jobs.last.current" type="checkbox" />
            <span class="switch__track" aria-hidden="true"></span>
            <span>Trabalho aqui atualmente</span>
          </label>
        </div>

        <div class="grid">
          <div class="field">
            <label for="last-role">Cargo</label>
            <input
              id="last-role"
              v-model="state.jobs.last.role"
              type="text"
              placeholder="Auxiliar administrativo"
            />
          </div>
          <div class="field">
            <label for="last-company">Empresa</label>
            <input
              id="last-company"
              v-model="state.jobs.last.company"
              type="text"
              placeholder="Nome da empresa"
            />
          </div>
          <div class="field">
            <label for="last-start">Início</label>
            <input
              id="last-start"
              v-model="state.jobs.last.start"
              type="text"
              placeholder="Mar 2022"
            />
          </div>
          <div class="field">
            <label for="last-end">Fim</label>
            <input
              id="last-end"
              v-model="state.jobs.last.end"
              type="text"
              placeholder="Dez 2023"
              :disabled="state.jobs.last.current"
            />
            <p v-if="state.jobs.last.current" class="field__hint">
              Marcado como emprego atual.
            </p>
          </div>
          <div class="field field--full">
            <label for="last-activities">Principais atividades</label>
            <textarea
              id="last-activities"
              v-model="state.jobs.last.activities"
              rows="3"
              placeholder="Uma atividade por linha. Ex.: Atendimento ao público"
            ></textarea>
            <p class="field__hint">Uma atividade por linha vira um item com marcador.</p>
          </div>
        </div>
      </div>

      <label class="switch switch--block">
        <input v-model="state.jobs.hasPrevious" type="checkbox" />
        <span class="switch__track" aria-hidden="true"></span>
        <span>Já trabalhei antes — adicionar penúltimo emprego</span>
      </label>

      <div v-if="state.jobs.hasPrevious" class="job job--previous">
        <div class="job__head">
          <span class="chip">Penúltimo emprego</span>
          <label class="switch">
            <input v-model="state.jobs.previous.current" type="checkbox" />
            <span class="switch__track" aria-hidden="true"></span>
            <span>Trabalho aqui atualmente</span>
          </label>
        </div>

        <div class="grid">
          <div class="field">
            <label for="previous-role">Cargo</label>
            <input
              id="previous-role"
              v-model="state.jobs.previous.role"
              type="text"
              placeholder="Jovem aprendiz"
            />
          </div>
          <div class="field">
            <label for="previous-company">Empresa</label>
            <input
              id="previous-company"
              v-model="state.jobs.previous.company"
              type="text"
              placeholder="Nome da empresa"
            />
          </div>
          <div class="field">
            <label for="previous-start">Início</label>
            <input
              id="previous-start"
              v-model="state.jobs.previous.start"
              type="text"
              placeholder="Jan 2020"
            />
          </div>
          <div class="field">
            <label for="previous-end">Fim</label>
            <input
              id="previous-end"
              v-model="state.jobs.previous.end"
              type="text"
              placeholder="Fev 2022"
              :disabled="state.jobs.previous.current"
            />
          </div>
          <div class="field field--full">
            <label for="previous-activities">Principais atividades</label>
            <textarea
              id="previous-activities"
              v-model="state.jobs.previous.activities"
              rows="3"
              placeholder="Uma atividade por linha."
            ></textarea>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. complementos -->
    <section class="card">
      <header class="card__head">
        <span class="card__step" aria-hidden="true">4</span>
        <div class="card__titles">
          <h2>Complementos</h2>
          <p>Opcional — ajuda a destacar seu perfil.</p>
        </div>
      </header>

      <div class="grid">
        <div class="field field--full">
          <label for="objective">Objetivo</label>
          <textarea
            id="objective"
            v-model="state.objective"
            rows="3"
            maxlength="420"
            placeholder="Ex.: Busco minha primeira oportunidade na área administrativa para aplicar e desenvolver minhas habilidades."
          ></textarea>
          <p class="field__hint">{{ state.objective.length }}/420 caracteres</p>
        </div>

        <div class="field field--full">
          <label for="skills">Habilidades</label>
          <input
            id="skills"
            v-model="state.skills"
            type="text"
            placeholder="Atendimento ao cliente, Excel, organização"
          />
          <p class="field__hint">Separe por vírgulas.</p>
        </div>
      </div>
    </section>

    <!-- 5. aparência -->
    <section class="card">
      <header class="card__head">
        <span class="card__step" aria-hidden="true">5</span>
        <div class="card__titles">
          <h2>Aparência</h2>
          <p>Escolha a cor de destaque do currículo.</p>
        </div>
      </header>

      <div class="themes" role="radiogroup" aria-label="Cor de destaque">
        <button
          v-for="theme in THEMES"
          :key="theme.id"
          type="button"
          class="theme"
          :class="{ 'is-active': state.theme === theme.id }"
          :style="{ '--swatch': theme.color }"
          role="radio"
          :aria-checked="state.theme === theme.id"
          @click="state.theme = theme.id"
        >
          <span class="theme__dot" aria-hidden="true"></span>
          {{ theme.label }}
        </button>
      </div>
    </section>

    <div class="actions">
      <button type="submit" class="btn btn--primary btn--block">
        <svg
          class="btn__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        Baixar currículo em PDF
      </button>
      <p class="actions__note">Seus dados ficam salvos apenas neste navegador.</p>
      <button type="button" class="btn btn--ghost btn--sm" @click="emit('reset')">
        Limpar dados
      </button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.card__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.card__step {
  display: grid;
  place-items: center;
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 11%, #fff);
  color: color-mix(in srgb, var(--accent) 72%, #101828);
  font-size: 13px;
  font-weight: 700;
}

.card__titles h2 {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.card__titles p {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field--full {
  grid-column: 1 / -1;
}

/* ---------- blocos de emprego ---------- */

.job {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-2);
}

.job--previous {
  margin-top: 14px;
}

.job__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 10%, #fff);
  /* Mistura com tinta escura para manter contraste AA em todos os temas. */
  color: color-mix(in srgb, var(--accent) 72%, #101828);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.switch--block {
  margin-top: 16px;
}

/* ---------- temas ---------- */

.themes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.theme {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--surface);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-soft);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.theme:hover {
  border-color: color-mix(in srgb, var(--swatch) 55%, #fff);
}

.theme.is-active {
  border-color: var(--swatch);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--swatch) 16%, transparent);
  color: var(--text);
}

.theme__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--swatch);
}

/* ---------- ações ---------- */

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 0;
}

.btn--block {
  width: 100%;
  min-height: 52px;
  font-size: 15.5px;
}

.actions__note {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 640px) {
  .card {
    padding: 18px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .theme {
    min-height: 44px;
  }
}
</style>
