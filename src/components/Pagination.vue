<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-2 text-xs text-slate-600 dark:text-slate-400">
    <!-- Info baris & Page Size Selector -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span>Baris per halaman:</span>
        <select 
          :value="pageSize" 
          @change="$emit('update:pageSize', Number($event.target.value))"
          class="px-2 py-1 bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
      <span class="text-slate-400">•</span>
      <span>
        Menampilkan <strong class="text-slate-800 dark:text-slate-200">{{ fromIndex }}</strong> - <strong class="text-slate-800 dark:text-slate-200">{{ toIndex }}</strong> dari <strong class="text-slate-800 dark:text-slate-200">{{ totalItems }}</strong> data
      </span>
    </div>

    <!-- Page Number Navigation Buttons -->
    <div class="flex items-center gap-1">
      <button 
        @click="$emit('update:currentPage', 1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Halaman Pertama"
      >
        <ChevronsLeft class="w-4 h-4" />
      </button>
      <button 
        @click="$emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Sebelumnya"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1 mx-1">
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="$emit('update:currentPage', p)"
          :class="[
            'w-7 h-7 rounded-lg text-xs font-semibold transition-all',
            currentPage === p 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          ]"
        >
          {{ p }}
        </button>
      </div>

      <button 
        @click="$emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Berikutnya"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
      <button 
        @click="$emit('update:currentPage', totalPages)"
        :disabled="currentPage >= totalPages"
        class="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Halaman Terakhir"
      >
        <ChevronsRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-vue-next';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
});

defineEmits(['update:currentPage', 'update:pageSize']);

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)));

const fromIndex = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1);
const toIndex = computed(() => Math.min(props.totalItems, props.currentPage * props.pageSize));

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>
