import { ref } from 'vue'

export const toastMessage = ref('')

let hideTimer = null

export function showToast(text, duration = 2600) {
  toastMessage.value = text
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}
