<script setup>
import { computed, inject, onMounted, onBeforeUnmount, ref } from 'vue'
import { addCuration } from '../lib/communityStore'
import { showToast } from '../lib/toast'

// 컨셉: "지금 듣고 있는 곡"을 "지금 있는 장소"에 등록. 곡·장소·무드는 자동 스냅샷, 사용자는 이유만 적는다.
const emit = defineEmits(['close'])

const app = inject('app')

const track = computed(() => app.player.currentTrack.value)
const nearest = computed(() => app.places.value[0] ?? null)
const mood = computed(() => app.mood.value)

const reason = ref('')

// 재생 중인 곡이 없으면 등록 자체가 성립하지 않는다
const canSubmit = computed(() => Boolean(track.value) && reason.value.trim().length > 0)

function submit() {
  if (!canSubmit.value) return
  addCuration({
    place: nearest.value?.title ?? '현재 위치',
    placeType: nearest.value?.type?.label ?? '',
    track: track.value.title,
    comment: reason.value,
    moodId: mood.value.id,
    nickname: '지금 산책 중',
    coords: nearest.value?.coords ?? null,
  })
  showToast('등록되었습니다')
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="reg-title">
        <header class="head">
          <h2 id="reg-title" class="title">이 장소에 곡 등록</h2>
          <button class="close" aria-label="닫기" @click="emit('close')">✕</button>
        </header>

        <!-- 재생 중인 곡이 없을 때 -->
        <template v-if="!track">
          <p class="empty">
            지금 재생 중인 곡이 없습니다.<br />
            먼저 음악을 재생한 뒤, 마음에 드는 순간에 등록해주세요.
          </p>
          <button class="submit" disabled>등록하기</button>
        </template>

        <!-- 자동 스냅샷 + 이유 입력 -->
        <template v-else>
          <div class="snapshot">
            <div class="row">
              <span class="row__label">곡</span>
              <span class="row__value">{{ track.title }}</span>
            </div>
            <div class="row">
              <span class="row__label">장소</span>
              <span class="row__value">
                <template v-if="nearest">{{ nearest.type.icon }} {{ nearest.title }}</template>
                <template v-else>현재 위치 (근처 장소 확인 중)</template>
              </span>
            </div>
            <div class="row">
              <span class="row__label">무드</span>
              <span class="row__value row__value--mood">{{ mood.label }}</span>
            </div>
          </div>
          <p class="snapshot__hint">곡·장소·무드는 지금 이 순간 기준으로 자동 기록됩니다.</p>

          <label class="field">
            <span class="field__label">이유</span>
            <textarea
              v-model="reason"
              class="input"
              rows="4"
              placeholder="이 장소에서 왜 이 곡이 어울리는지 적어주세요"
              autofocus
            />
          </label>

          <button class="submit" :disabled="!canSubmit" @click="submit">등록하기</button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
}

.modal {
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  color: var(--panel-text);
  --text: var(--panel-text);
  --text-dim: var(--panel-text-dim);
  --text-faint: var(--panel-text-faint);
  --surface-2: var(--panel-surface-2);
  --mood-accent: var(--panel-mood-accent);
  --border: #0d1014;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
}

.close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--text-faint);
  font-size: 0.9rem;
}

.close:hover {
  background: var(--surface-2);
  color: var(--text);
}

.empty {
  margin: 0 0 16px;
  font-size: 0.86rem;
  line-height: 1.7;
  color: var(--text-dim);
  text-align: center;
  padding: 14px 0;
}

.snapshot {
  display: grid;
  gap: 8px;
  padding: 13px 14px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.row__label {
  flex-shrink: 0;
  width: 32px;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.row__value {
  font-size: 0.88rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__value--mood {
  color: var(--mood-accent);
}

.snapshot__hint {
  margin: 8px 0 16px;
  font-size: 0.7rem;
  color: var(--text-faint);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 16px;
}

.field__label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-dim);
}

.input {
  width: 100%;
  padding: 10px 13px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 0.88rem;
  line-height: 1.6;
  resize: vertical;
}

.input:focus {
  outline: none;
  border-color: var(--mood);
}

.input::placeholder {
  color: var(--text-faint);
}

.submit {
  width: 100%;
  min-height: 50px;
  border-radius: var(--radius-sm);
  background: var(--mood);
  color: #0d1014;
  font-size: 0.95rem;
  font-weight: 600;
}

.submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hint {
  margin: 10px 0 0;
  font-size: 0.72rem;
  text-align: center;
  color: var(--text-faint);
}
</style>