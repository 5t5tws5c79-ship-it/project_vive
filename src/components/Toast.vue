<script setup>
import { toastMessage } from '../lib/toast'
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toastMessage" class="toast" role="status">
        <span class="toast__icon" aria-hidden="true">✓</span>
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  top: 22px;
  z-index: 80;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 999px;
  background: var(--mood);
  color: #0d1014;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 10px 30px color-mix(in srgb, var(--mood) 55%, black 45%), 0 0 0 3px color-mix(in srgb, var(--mood) 30%, transparent);
  white-space: nowrap;
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0d1014;
  color: var(--mood);
  font-size: 0.72rem;
  font-weight: 900;
}

.toast-enter-active {
  transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -14px) scale(0.85);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.95);
}
</style>
