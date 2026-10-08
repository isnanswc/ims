<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      @keydown.down.prevent="openDropdown"
      @keydown.up.prevent="openDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      :class="[
        'w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left border cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white',
        disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' :
        isOpen 
          ? 'bg-white dark:bg-zinc-900 border-zinc-950 dark:border-white ring-1 ring-zinc-950/20 dark:ring-white/20' 
          : 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
      ]"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <component v-if="icon" :is="icon" class="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span v-if="selectedOption" class="truncate font-bold text-zinc-900 dark:text-zinc-100 font-mono">
          {{ selectedOption.label }}
        </span>
        <span v-else class="truncate text-zinc-400 dark:text-zinc-500">
          {{ placeholder }}
        </span>
        <span v-if="selectedOption?.badge" class="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
          {{ selectedOption.badge }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0 text-zinc-400">
        <button
          v-if="clearable && selectedOption && !disabled"
          type="button"
          @click.stop="clearSelection"
          class="p-0.5 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
          title="Hapus pilihan"
        >
          <X class="w-3 h-3" />
        </button>
        <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </div>
    </button>

    <!-- Floating Popover Dropdown Teleported to Body to Avoid Overflow & Clip Issues -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
        @keydown.esc.prevent="closeDropdown"
      >
        <!-- Search Input Box -->
        <div class="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/80 flex items-center gap-2 shrink-0">
          <Search class="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            @keydown.down.prevent="navigateHighlight(1)"
            @keydown.up.prevent="navigateHighlight(-1)"
            @keydown.enter.prevent="selectHighlighted"
            @keydown.esc.prevent="closeDropdown"
            class="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 font-medium"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''; highlightedIndex = 0"
            class="text-zinc-400 hover:text-zinc-600 p-0.5"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Quick Info Bar: Total Matches -->
        <div class="px-2.5 py-1 text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <span>{{ displayedOptions.length }} dari {{ filteredOptions.length }} data</span>
          <span class="font-mono text-[9px] text-zinc-400">Navigasi: &darr; &uarr; | Pilih: Enter</span>
        </div>

        <!-- Options List -->
        <div 
          ref="optionsListRef"
          class="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1"
        >
          <div
            v-if="displayedOptions.length === 0"
            class="py-6 text-center text-xs text-zinc-400 font-medium"
          >
            Tidak ada data yang cocok dengan "{{ searchQuery }}"
          </div>

          <div
            v-for="(opt, idx) in displayedOptions"
            :key="opt.value"
            @click="selectOption(opt)"
            @mouseenter="highlightedIndex = idx"
            :class="[
              'p-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between gap-2 select-none',
              highlightedIndex === idx ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-medium' : 'text-zinc-700 dark:text-zinc-300',
              opt.value === modelValue && highlightedIndex !== idx ? 'font-bold bg-zinc-100 dark:bg-zinc-800/60 text-zinc-950 dark:text-white' : ''
            ]"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-mono font-bold">{{ opt.label }}</span>
                <span 
                  v-if="opt.badge" 
                  :class="[
                    'px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold',
                    highlightedIndex === idx 
                      ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800' 
                      : 'bg-zinc-200/70 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                  ]"
                >
                  {{ opt.badge }}
                </span>
              </div>
              <p 
                v-if="opt.sublabel" 
                :class="[
                  'text-[10px] truncate mt-0.5',
                  highlightedIndex === idx ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
                ]"
              >
                {{ opt.sublabel }}
              </p>
            </div>

            <Check 
              v-if="opt.value === modelValue" 
              class="w-3.5 h-3.5 shrink-0" 
              :class="highlightedIndex === idx ? 'text-white dark:text-zinc-950' : 'text-zinc-950 dark:text-white'"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Search, ChevronDown, Check, X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Pilih opsi...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Ketik untuk mencari...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Object,
    default: null
  },
  limit: {
    type: Number,
    default: 15
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const containerRef = ref(null);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);
const optionsListRef = ref(null);
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(0);
const dropdownStyle = ref({});

const selectedOption = computed(() => {
  return props.options.find(o => o.value === props.modelValue) || null;
});

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) return props.options;
  const q = searchQuery.value.toLowerCase().trim();
  return props.options.filter(o => {
    const l = String(o.label || '').toLowerCase();
    const s = String(o.sublabel || '').toLowerCase();
    const b = String(o.badge || '').toLowerCase();
    const v = String(o.value || '').toLowerCase();
    return l.includes(q) || s.includes(q) || b.includes(q) || v.includes(q);
  });
});

const displayedOptions = computed(() => {
  return filteredOptions.value.slice(0, props.limit);
});

watch(searchQuery, () => {
  highlightedIndex.value = 0;
  nextTick(() => {
    if (optionsListRef.value) {
      optionsListRef.value.scrollTop = 0;
    }
  });
});

function updateDropdownPosition() {
  if (!triggerRef.value || !isOpen.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = 300;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const width = Math.max(rect.width, 260);
  let left = rect.left;
  if (left + width > window.innerWidth - 12) {
    left = Math.max(8, window.innerWidth - width - 12);
  }

  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    dropdownStyle.value = {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${left}px`,
      width: `${width}px`,
      zIndex: 99999
    };
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${left}px`,
      width: `${width}px`,
      zIndex: 99999
    };
  }
}

function toggleDropdown() {
  if (props.disabled) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function openDropdown() {
  if (props.disabled) return;
  isOpen.value = true;
  searchQuery.value = '';
  
  // Set highlighted to current selected option index if visible, else 0
  const curIdx = displayedOptions.value.findIndex(o => o.value === props.modelValue);
  highlightedIndex.value = curIdx >= 0 ? curIdx : 0;

  nextTick(() => {
    updateDropdownPosition();
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
    scrollToHighlighted();
  });
}

function closeDropdown() {
  isOpen.value = false;
  searchQuery.value = '';
}

function selectOption(opt) {
  emit('update:modelValue', opt.value);
  emit('change', opt);
  closeDropdown();
  // Return focus to trigger button
  nextTick(() => {
    if (triggerRef.value) {
      triggerRef.value.focus();
    }
  });
}

function clearSelection() {
  emit('update:modelValue', '');
  emit('change', null);
}

function navigateHighlight(direction) {
  const max = displayedOptions.value.length;
  if (max === 0) return;
  highlightedIndex.value = (highlightedIndex.value + direction + max) % max;
  scrollToHighlighted();
}

function scrollToHighlighted() {
  nextTick(() => {
    if (!optionsListRef.value) return;
    const items = optionsListRef.value.children;
    if (items && items[highlightedIndex.value]) {
      items[highlightedIndex.value].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

function selectHighlighted() {
  if (displayedOptions.value.length > 0 && displayedOptions.value[highlightedIndex.value]) {
    selectOption(displayedOptions.value[highlightedIndex.value]);
  }
}

function handleOutsideClick(e) {
  if (
    containerRef.value && !containerRef.value.contains(e.target) &&
    dropdownRef.value && !dropdownRef.value.contains(e.target)
  ) {
    closeDropdown();
  }
}

function handleScrollOrResize() {
  if (isOpen.value) {
    updateDropdownPosition();
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
  window.addEventListener('scroll', handleScrollOrResize, true);
  window.addEventListener('resize', handleScrollOrResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
  window.removeEventListener('scroll', handleScrollOrResize, true);
  window.removeEventListener('resize', handleScrollOrResize);
});
</script>
