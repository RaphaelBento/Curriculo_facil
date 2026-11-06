<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import ResumeForm from './components/ResumeForm.vue'
import ResumePreview from './components/ResumePreview.vue'
import { THEMES, resetState, state, validate } from './stores/resume'

const attempted = ref(false)
const isGenerating = ref(false)
const notice = ref(null)

let noticeTimer

const theme = computed(
  () => THEMES.find((item) => item.id === state.theme) || THEMES[0],
)
const errors = computed(() => (attempted.value ? validate(state) : {}))
const errorCount = computed(() => Object.keys(errors.value).length)

function flash(message, type = 'error') {
  notice.value = { message, type }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = null
  }, 4500)
}

async function handleGenerate() {
  attempted.value = true

  if (errorCount.value > 0) {
    flash(
      errorCount.value === 1
        ? 'Falta 1 campo obrigatório. Confira os destaques em vermelho.'
        : `Faltam ${errorCount.value} campos obrigatórios. Confira os destaques em vermelho.`,
    )
    await nextTick()
    const firstInvalid = document.querySelector('[aria-invalid="true"]')
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true })
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  isGenerating.value = true
  await new Promise((resolve) => setTimeout(resolve, 60))

  try {
    // O jsPDF é pesado: só carrega quando o usuário realmente baixa o PDF.
    const { downloadResumePdf, pdfFileName } = await import('./lib/resumePdf')
    downloadResumePdf(state)
    flash(`PDF gerado: ${pdfFileName(state)}`, 'success')
  } catch (error) {
    console.error(error)
    flash('Não foi possível gerar o PDF. Tente novamente.', 'error')
  } finally {
    isGenerating.value = false
  }
}

function handleReset() {
  const confirmed = window.confirm(
    'Limpar todos os dados preenchidos? Essa ação não pode ser desfeita.',
  )
  if (!confirmed) return

  resetState()
  attempted.value = false
  flash('Dados limpos. Você pode começar de novo.', 'success')
}

onBeforeUnmount(() => clearTimeout(noticeTimer))
</script>

<template>
  <div class="app" :style="{ '--accent': theme.color }">
    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand">
          <span class="brand__mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
              <path d="M9 13h6M9 17h4" />
            </svg>
          </span>
          <span class="brand__text">
            <strong>Currículo Fácil</strong>
            <small>gerador de currículo em PDF</small>
          </span>
        </div>

        <div class="topbar__actions">
          <button type="button" class="btn btn--ghost btn--sm" @click="handleReset">
            Limpar
          </button>
          <button
            type="button"
            class="btn btn--primary"
            :disabled="isGenerating"
            @click="handleGenerate"
          >
            <svg
              v-if="!isGenerating"
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
            {{ isGenerating ? 'Gerando…' : 'Baixar PDF' }}
          </button>
        </div>
      </div>
    </header>

    <main class="workspace">
      <section class="intro">
        <h1>Seu currículo pronto em minutos</h1>
        <p>
          Preencha os campos, acompanhe a prévia e baixe o PDF. Sem cadastro e
          sem pagar nada.
        </p>
      </section>

      <div class="layout">
        <div class="layout__form">
          <ResumeForm
            :errors="errors"
            @submit="handleGenerate"
            @reset="handleReset"
          />
        </div>

        <div class="layout__preview">
          <ResumePreview />
        </div>
      </div>
    </main>

    <footer class="site-footer">
      Feito com Vue 3 · Seus dados não saem do seu navegador.
    </footer>

    <Transition name="toast">
      <div
        v-if="notice"
        class="toast"
        :class="`toast--${notice.type}`"
        role="status"
        aria-live="polite"
      >
        {{ notice.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
}

.topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 10px 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.brand__mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  box-shadow: 0 10px 20px -10px color-mix(in srgb, var(--accent) 85%, transparent);
}

.brand__mark svg {
  width: 22px;
  height: 22px;
}

.brand__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}

.brand__text strong {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.brand__text small {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.workspace {
  flex: 1;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 30px 20px 56px;
}

.intro {
  max-width: 640px;
  margin-bottom: 24px;
}

.intro h1 {
  font-size: clamp(26px, 3.2vw, 36px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.025em;
}

.intro p {
  margin-top: 8px;
  font-size: 14.5px;
  color: var(--muted);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 24px;
  align-items: start;
}

.layout__form,
.layout__preview {
  min-width: 0;
}

.site-footer {
  padding: 22px 20px 32px;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}

/* ---------- toast ---------- */

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 120;
  max-width: min(92vw, 480px);
  padding: 13px 20px;
  border-radius: 12px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 500;
  text-align: center;
  transform: translateX(-50%);
  box-shadow: 0 20px 40px -16px rgba(16, 24, 40, 0.55);
}

.toast--error {
  background: #b42318;
}

.toast--success {
  background: #054f31;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .topbar__inner {
    padding: 8px 14px;
  }

  .brand__text small {
    display: none;
  }

  .workspace {
    padding: 22px 14px 40px;
  }

  .layout {
    gap: 18px;
  }

  .topbar__actions .btn--primary {
    min-height: 40px;
    padding: 0 16px;
    font-size: 13.5px;
  }
}
</style>
