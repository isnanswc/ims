<template>
  <div class="w-full space-y-4">
    <!-- 1. SKELETON RIBBON / TOP BANNER -->
    <div v-if="type === 'banner'" class="glass-card p-6 rounded-3xl space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-2.5 max-w-lg w-full">
          <div class="h-4 w-32 rounded-full skeleton-shimmer"></div>
          <div class="h-7 w-3/4 rounded-xl skeleton-shimmer"></div>
          <div class="h-3.5 w-full rounded-lg skeleton-shimmer"></div>
        </div>
        <div class="flex gap-2">
          <div class="h-10 w-28 rounded-2xl skeleton-shimmer"></div>
          <div class="h-10 w-28 rounded-2xl skeleton-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- 2. SKELETON KPI CARDS -->
    <div v-else-if="type === 'kpi'" :class="['grid gap-3.5 sm:gap-4', gridColsClass]">
      <div 
        v-for="i in count" 
        :key="i"
        class="glass-card p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 relative overflow-hidden"
      >
        <div class="w-12 h-12 rounded-2xl skeleton-shimmer shrink-0"></div>
        <div class="space-y-2 flex-1 min-w-0">
          <div class="h-3 w-24 rounded skeleton-shimmer"></div>
          <div class="h-6 w-32 rounded-lg skeleton-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- 3. SKELETON TABLE -->
    <div v-else-if="type === 'table'" class="glass-card overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
      <!-- Table Header Skeleton -->
      <div class="p-3.5 bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div class="h-3.5 w-32 rounded skeleton-shimmer"></div>
        <div class="h-3.5 w-24 rounded skeleton-shimmer"></div>
        <div class="h-3.5 w-20 rounded skeleton-shimmer"></div>
        <div class="h-3.5 w-28 rounded skeleton-shimmer"></div>
      </div>

      <!-- Table Rows Skeleton -->
      <div class="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1">
        <div 
          v-for="i in count" 
          :key="i"
          class="p-3.5 flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-2.5 flex-1">
            <div class="h-5 w-20 rounded-md skeleton-shimmer"></div>
            <div class="h-4 w-44 rounded-md skeleton-shimmer"></div>
          </div>
          <div class="h-4 w-16 rounded skeleton-shimmer"></div>
          <div class="h-4 w-20 rounded skeleton-shimmer"></div>
          <div class="h-7 w-20 rounded-xl skeleton-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- 4. SKELETON MOBILE CARD LIST -->
    <div v-else-if="type === 'card-list'" class="space-y-3">
      <div 
        v-for="i in count" 
        :key="i"
        class="glass-card p-3.5 rounded-2xl space-y-3 border border-zinc-200/80 dark:border-zinc-800"
      >
        <div class="flex items-center justify-between">
          <div class="h-5 w-24 rounded-md skeleton-shimmer"></div>
          <div class="h-4 w-16 rounded-full skeleton-shimmer"></div>
        </div>
        <div class="h-4 w-3/4 rounded-md skeleton-shimmer"></div>
        <div class="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
          <div class="h-8 rounded skeleton-shimmer"></div>
          <div class="h-8 rounded skeleton-shimmer"></div>
          <div class="h-8 rounded skeleton-shimmer"></div>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
          <div class="h-4 w-28 rounded skeleton-shimmer"></div>
          <div class="h-8 w-24 rounded-xl skeleton-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- 5. SKELETON CHART -->
    <div v-else-if="type === 'chart'" class="glass-card p-5 rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div class="h-4 w-48 rounded skeleton-shimmer"></div>
        <div class="h-4 w-24 rounded skeleton-shimmer"></div>
      </div>
      <div class="h-64 rounded-xl skeleton-shimmer w-full"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'kpi', // 'banner', 'kpi', 'table', 'card-list', 'chart'
    validator: v => ['banner', 'kpi', 'table', 'card-list', 'chart'].includes(v)
  },
  count: {
    type: Number,
    default: 4
  },
  cols: {
    type: Number,
    default: 4
  }
});

const gridColsClass = computed(() => {
  if (props.cols === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (props.cols === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-4';
});
</script>
