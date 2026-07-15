import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchResult from '../views/Searchresult.vue'
import BoardListView from '../views/BoardListview.vue'
import BoardDetail from '../views/BoardDetail.vue'
import BoardForm from '../views/BoardForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search-result',
      component: SearchResult
    },
    {
      path: '/board/:category',
      name: 'board-list',
      component: BoardListView
    },
    {
      path: '/board/:category/write',
      name: 'board-write',
      component: BoardForm
    },
    {
      path: '/board/:category/:id',
      name: 'board-detail',
      component: BoardDetail
    },
    {
      path: '/board/:category/:id/edit',
      name: 'board-edit',
      component: BoardForm
    }
  ]
})

export default router