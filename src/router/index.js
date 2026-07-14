import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CommunityView from '../views/CommunityView.vue'
import CurationDetailView from '../views/CurationDetailView.vue'
import CurationNewView from '../views/CurationNewView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '지금, 여기' } },
    { path: '/community', name: 'community', component: CommunityView, meta: { title: '큐레이션' } },
    {
      path: '/community/new',
      name: 'curation-new',
      component: CurationNewView,
      meta: { title: '곡 등록' },
    },
    {
      path: '/community/:id',
      name: 'curation-detail',
      component: CurationDetailView,
      meta: { title: '큐레이션' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
