<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ResumeSheet from './ResumeSheet.vue'

const A4_WIDTH = 794
const A4_HEIGHT = 1122

const frame = ref(null)
const scale = ref(0.6)
const expanded = ref(false)
const modalStage = ref(null)
const modalScale = ref(1)
const isCompact = ref(false)
const openButton = ref(null)
const closeButton = ref(null)

let observer
let mediaQuery
let rafId = 0

function syncCompact(event) {
  isCompact.value = event.matches
  measure()
}

function measure() {
  if (isCompact.value) {
    scale.value = 1
    return
  }
  const element = frame.value
  if (!element) return
  const styles = getComputedStyle(element)
  const available =
    element.clientWidth -
    parseFloat(styles.paddingLeft) -
    parseFloat(styles.paddingRight)
  if (available > 0) scale.value = Math.min(1, available / A4_WIDTH)
}

function measureModal() {
  const stage = modalStage.value
  if (!stage) return
  const availableW = stage.clientWidth - 40
  const availableH = stage.clientHeight - 40
  modalScale.value = Math.max(
    0.3,
    Math.min(1, availableW / A4_WIDTH, availableH / A4_HEIGHT),
  )
}

function open() {
  expanded.value = true
}

function close() {
  expanded.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape' && expanded.value) close()
}

watch(expanded, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) {
    await nextTick()
    measureModal()
    closeButton.value?.focus()
  } else {
    openButton.value?.focus()
  }
})

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 640px)')
  isCompact.value = mediaQuery.matches
  mediaQuery.addEventListener('change', syncCompact)

  observer = new ResizeObserver(() => {
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      measure()
      measureModal()
    })
  })
  if (frame.value) observer.observe(frame.value)
  if (modalStage.value) observer.observe(modalStage.value)

  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', measureModal)
  measure()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(rafId)
  mediaQuery?.removeEventListener('change', syncCompact)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', measureModal)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="preview" aria-label="Prévia do currículo">
    <header class="preview__head">
      <span class="preview__status">
        <span class="preview__dot" aria-hidden="true"></span>
        Prévia ao vivo
      </span>
      <button
        ref="openButton"
        type="button"
        class="btn btn--ghost btn--sm"
        @click="open"
      >
        Tela cheia
      </button>
    </header>

    <div ref="frame" class="preview__frame">
      <div
        class="preview__scaler"
        :class="{ 'preview__scaler--fluid': isCompact }"
        :style="{ zoom: isCompact ? 1 : scale }"
      >
        <ResumeSheet :fluid="isCompact" />
      </div>
    </div>

    <p class="preview__hint">
      O PDF sai com texto selecionável — ideal para sistemas de recrutamento.
    </p>

    <Teleport to="body">
      <div v-if="expanded" class="modal" @click.self="close">
        <div
          class="modal__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Prévia do currículo"
        >
          <header class="modal__head">
            <span>Prévia do currículo</span>
            <button
              ref="closeButton"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="close"
            >
              Fechar
            </button>
          </header>
          <div
            ref="modalStage"
            class="modal__stage"
            :class="{ 'modal__stage--fluid': isCompact }"
          >
            <div
              class="modal__scaler"
              :style="{ zoom: isCompact ? 1 : modalScale }"
            >
              <ResumeSheet :fluid="isCompact" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.preview {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 112px);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: #e9edf5;
  box-shadow: var(--shadow-sm);
}

.preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.preview__status {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-soft);
}

.preview__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #12b76a;
  box-shadow: 0 0 0 3px rgba(18, 183, 106, 0.18);
}

.preview__frame {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 22px;
  overflow: auto;
}

.preview__scaler {
  flex: none;
}

.preview__scaler--fluid {
  width: 100%;
  min-width: 0;
}

.preview__hint {
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  background: var(--surface);
  font-size: 11.5px;
  color: var(--muted);
  text-align: center;
}

/* ---------- modal ---------- */

.modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(16, 24, 40, 0.58);
  backdrop-filter: blur(3px);
}

.modal__panel {
  display: flex;
  flex-direction: column;
  width: min(1040px, 100%);
  max-height: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #e9edf5;
  box-shadow: 0 40px 80px -30px rgba(16, 24, 40, 0.6);
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  font-size: 14px;
  font-weight: 600;
}

.modal__stage {
  flex: 1;
  display: flex;
  padding: 20px;
  overflow: auto;
}

.modal__scaler {
  margin: auto;
}

.modal__stage--fluid {
  padding: 0;
}

.modal__stage--fluid .modal__scaler {
  width: 100%;
  margin: 0;
  background: #fff;
}

@media (max-width: 1080px) {
  .preview {
    position: static;
    max-height: none;
  }
}

@media (max-width: 640px) {
  .preview {
    background: var(--surface);
  }

  .preview__frame {
    padding: 0;
  }

  .modal {
    padding: 10px;
  }

  .modal__stage {
    padding: 10px;
  }

  .modal__stage--fluid {
    padding: 0;
  }
}
</style>
