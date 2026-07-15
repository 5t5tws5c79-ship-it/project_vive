<script setup>
import { inject, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { MOODS } from '../config/moods'
import { addCuration } from '../lib/communityStore'
import { showToast } from '../lib/toast'

const app = inject('app')
const router = useRouter()

const form = ref({
  place: '',
  track: '',
  artist: '',
  comment: '',
  moodId: MOODS[0].id,
  password: '',
})

function submit() {
  if (!form.value.place.trim() || !form.value.track.trim()) return
  const entry = addCuration({ ...form.value, nickname: '익명의 산책자' })
  showToast('등록되었습니다')
  router.push(`/community/${entry.id}`)
}
</script>

<template>
  <RouterLink to="/community" class="back">← 취소</RouterLink>

  <form class="card" @submit.prevent="submit">
    <header class="head">
      <h2 class="title">이 장소의 곡 등록</h2>
    </header>

    <label class="field">
      <span class="field__label">장소</span>
      <input v-model="form.place" class="input" placeholder="근처 장소에서 고르거나 직접 입력" />
      <span class="field__hint">
        근처 {{ app.places.value.length }}곳에서 선택하는 UI가 여기 붙습니다.
      </span>
    </label>

    <div class="pair">
      <label class="field">
        <span class="field__label">곡 제목</span>
        <input v-model="form.track" class="input" placeholder="예: 여름날" />
      </label>
      <label class="field">
        <span class="field__label">아티스트</span>
        <input v-model="form.artist" class="input" placeholder="예: 유희열" />
      </label>
    </div>

    <div class="field">
      <span class="field__label">무드</span>
      <div class="moods">
        <button
          v-for="m in MOODS"
          :key="m.id"
          type="button"
          class="chip"
          :class="{ 'chip--on': form.moodId === m.id }"
          :style="{ '--chip': m.color }"
          @click="form.moodId = m.id"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <label class="field">
      <span class="field__label">한마디</span>
      <textarea
        v-model="form.comment"
        class="input input--area"
        rows="4"
        placeholder="이 장소에서 왜 이 곡이 어울리는지 적어주세요"
      />
    </label>

    <!-- 익명 커뮤니티: 회원가입 없이 비밀번호로만 수정·삭제 권한 확인 -->
    <label class="field">
      <span class="field__label">수정용 비밀번호</span>
      <input
        v-model="form.password"
        class="input"
        type="password"
        placeholder="4자리 이상 — 수정·삭제할 때 필요합니다"
      />
    </label>

    <button class="submit" type="submit">등록하기</button>
  </form>
</template>

<style scoped>
.back {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--text-faint);
  text-decoration: none;
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
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

.field__hint {
  font-size: 0.7rem;
  color: var(--text-faint);
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.input {
  width: 100%;
  min-height: 44px;
  padding: 10px 13px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 0.88rem;
}

.input:focus {
  outline: none;
  border-color: var(--mood);
}

.input::placeholder {
  color: var(--text-faint);
}

.input--area {
  resize: vertical;
  line-height: 1.6;
}

.moods {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  min-height: 40px;
  padding: 8px 13px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-faint);
}

.chip--on {
  border-color: color-mix(in srgb, var(--chip) 70%, transparent);
  background: color-mix(in srgb, var(--chip) 22%, transparent);
  color: #fff;
}

.submit {
  width: 100%;
  min-height: 50px;
  margin-top: 4px;
  border-radius: var(--radius-sm);
  background: var(--mood);
  color: #0d1014;
  font-size: 0.95rem;
  font-weight: 600;
}

.hint {
  margin: 10px 0 0;
  font-size: 0.72rem;
  text-align: center;
  color: var(--text-faint);
}

@media (max-width: 480px) {
  .pair {
    grid-template-columns: 1fr;
  }
}
</style>
