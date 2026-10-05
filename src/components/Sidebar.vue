<template>
  <div>
    <!-- Mobile Top Header Bar (Only on mobile < md) -->
    <header class="md:hidden sticky top-0 z-40 glass-panel border-b px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
          <Boxes class="w-5 h-5" />
        </div>
        <div>
          <span class="font-bold text-base tracking-tight text-slate-900 dark:text-white">IMS Pro</span>
          <span class="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Client</span>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          @click="$emit('toggle-dark')" 
          class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        >
          <Sun v-if="isDark" class="w-5 h-5 text-amber-400" />
          <Moon v-else class="w-5 h-5 text-slate-600" />
        </button>

        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </header>

    <!-- Mobile Drawer Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
    ></div>

    <!-- Mobile Drawer Content -->
    <aside 
      :class="[
        'md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div>
        <div class="flex items-center justify-between pb-5 border-b border-slate-200/60 dark:border-slate-800">
          <div class="flex items-center space-x-2.5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Boxes class="w-6 h-6" />
            </div>
            <div>
              <h2 class="font-bold text-slate-900 dark:text-white text-base">IMS Pro</h2>
              <p class="text-[11px] text-slate-400">Inventory Management</p>
            </div>
          </div>
          <button @click="isMobileMenuOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <nav class="mt-6 space-y-1.5">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="selectTab(item.id)"
            :class="[
              'w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all',
              activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <div class="pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-3">
        <button
          @click="selectTab('backup')"
          :class="[
            'w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
            activeTab === 'backup' 
              ? 'bg-emerald-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <Database class="w-5 h-5" />
          <span>Cadangan & Restore</span>
        </button>

        <div class="flex items-center justify-between px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs">
          <span class="text-slate-600 dark:text-slate-400">Mode Tampilan</span>
          <button 
            @click="$emit('toggle-dark')" 
            class="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-xs font-medium"
          >
            <Sun v-if="isDark" class="w-3.5 h-3.5 text-amber-400" />
            <Moon v-else class="w-3.5 h-3.5 text-slate-600" />
            <span>{{ isDark ? 'Gelap' : 'Terang' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Desktop Collapsible Sidebar -->
    <aside 
      :class="[
        'hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 glass-panel border-r border-slate-200/70 dark:border-slate-800 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Top Brand & Minimize Toggle -->
      <div>
        <div class="h-16 flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div v-if="!isCollapsed" class="flex items-center space-x-3 overflow-hidden">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Boxes class="w-5 h-5" />
            </div>
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-base text-slate-900 dark:text-white tracking-tight">IMS Pro</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Client</span>
              </div>
              <p class="text-[10px] text-slate-400 truncate">Inventory System</p>
            </div>
          </div>
          
          <div v-else class="w-full flex justify-center">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Boxes class="w-5 h-5" />
            </div>
          </div>

          <button 
            v-if="!isCollapsed"
            @click="isCollapsed = true"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Minimize Sidebar"
          >
            <PanelLeftClose class="w-4 h-4" />
          </button>
        </div>

        <div v-if="isCollapsed" class="py-2 flex justify-center border-b border-slate-200/40 dark:border-slate-800/40">
          <button 
            @click="isCollapsed = false"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Perluas Sidebar"
          >
            <PanelLeftOpen class="w-4 h-4" />
          </button>
        </div>

        <!-- Navigation Menu -->
        <div class="p-3">
          <p v-if="!isCollapsed" class="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2">Menu Utama</p>
          <nav class="space-y-1">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="$emit('change-tab', item.id)"
              :class="[
                'w-full flex items-center rounded-xl text-xs font-semibold transition-all group relative',
                isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 space-x-3',
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              ]"
              :title="isCollapsed ? item.label : ''"
            >
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>

              <div 
                v-if="isCollapsed" 
                class="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50"
              >
                {{ item.label }}
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Bottom Settings & Theme Toggle -->
      <div class="p-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
        <button
          @click="$emit('change-tab', 'backup')"
          :class="[
            'w-full flex items-center rounded-xl text-xs font-semibold transition-all group relative',
            isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 space-x-3',
            activeTab === 'backup' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          ]"
          :title="isCollapsed ? 'Cadangan & Restore' : ''"
        >
          <Database class="w-5 h-5 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Cadangan Data</span>
          <div 
            v-if="isCollapsed" 
            class="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50"
          >
            Cadangan Data
          </div>
        </button>

        <!-- Dark Mode Toggle Button -->
        <button
          @click="$emit('toggle-dark')"
          :class="[
            'w-full flex items-center rounded-xl text-xs font-semibold transition-all group relative bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80',
            isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 space-x-3'
          ]"
          :title="isCollapsed ? (isDark ? 'Mode Terang' : 'Mode Gelap') : ''"
        >
          <Sun v-if="isDark" class="w-5 h-5 text-amber-400 shrink-0" />
          <Moon v-else class="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">
            {{ isDark ? 'Mode Terang' : 'Mode Gelap' }}
          </span>
          <div 
            v-if="isCollapsed" 
            class="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50"
          >
            {{ isDark ? 'Mode Terang' : 'Mode Gelap' }}
          </div>
        </button>
      </div>
    </aside>

    <!-- Mobile Bottom Navigation (Thumb Friendly) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200/60 dark:border-slate-800 px-2 py-1 safe-area-pb">
      <div class="grid grid-cols-5 gap-1">
        <button
          v-for="item in mobileNavItems"
          :key="item.id"
          @click="selectTab(item.id)"
          :class="[
            'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all',
            activeTab === item.id 
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
              : 'text-slate-500 dark:text-slate-400 font-normal'
          ]"
        >
          <div :class="['p-1 rounded-lg', activeTab === item.id ? 'bg-emerald-50 dark:bg-emerald-950/40' : '']">
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <span class="text-[10px] mt-0.5 tracking-tight truncate">{{ item.shortLabel }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Database, 
  Boxes, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Calculator 
} from 'lucide-vue-next';

const props = defineProps({
  activeTab: { type: String, required: true },
  isDark: { type: Boolean, default: false },
  isCollapsed: { type: Boolean, default: false }
});

const emit = defineEmits(['change-tab', 'toggle-dark', 'update:isCollapsed']);
const isMobileMenuOpen = ref(false);
const isCollapsed = defineModel('isCollapsed', { default: false });

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'items', label: 'Master Item', icon: Package },
  { id: 'transactions', label: 'Transfer Order', icon: ArrowLeftRight },
  { id: 'ledger', label: 'Item Ledger', icon: FileText },
  { id: 'ppic', label: 'Perencanaan PPIC', icon: Calculator },
];

const mobileNavItems = [
  { id: 'dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'items', shortLabel: 'Item', icon: Package },
  { id: 'transactions', shortLabel: 'Transfer', icon: ArrowLeftRight },
  { id: 'ppic', shortLabel: 'PPIC', icon: Calculator },
  { id: 'ledger', shortLabel: 'Ledger', icon: FileText },
];

function selectTab(id) {
  emit('change-tab', id);
  isMobileMenuOpen.value = false;
}
</script>
