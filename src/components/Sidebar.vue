<template>
  <div>
    <!-- Mobile Top Header Bar (Only on mobile < md) -->
    <header class="md:hidden sticky top-0 z-40 glass-panel border-b border-zinc-200 dark:border-zinc-800 px-3.5 py-2 flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <!-- Sudut Kiri: The Cyber Cube dengan Teks Estetik IMS di Bawahnya -->
        <div class="flex flex-col items-center shrink-0">
          <CircuitIcon size="sm" />
          <span class="text-[7.5px] font-black font-mono tracking-widest text-zinc-950 dark:text-zinc-100 leading-none mt-0.5">IMS</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-xs tracking-wider text-zinc-950 dark:text-white uppercase font-sans">INVENTORY</span>
            <span class="text-[8px] px-1 py-0.2 rounded font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">SYS</span>
          </div>
          <p class="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight uppercase">MANAGEMENT SYSTEM</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-1.5">
        <button 
          @click="$emit('toggle-dark')" 
          class="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        >
          <Sun v-if="isDark" class="w-4 h-4 text-zinc-200" />
          <Moon v-else class="w-4 h-4 text-zinc-700" />
        </button>

        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-1.5 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Mobile Drawer Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="md:hidden fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
    ></div>

    <!-- Mobile Drawer Content -->
    <aside 
      :class="[
        'md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-zinc-200 dark:border-zinc-800',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <div class="flex items-center space-x-2.5">
            <!-- Icon Cyber Cube dengan Teks Estetik IMS di Bawahnya -->
            <div class="flex flex-col items-center shrink-0">
              <CircuitIcon size="sm" />
              <span class="text-[7.5px] font-black font-mono tracking-widest text-zinc-950 dark:text-zinc-100 leading-none mt-0.5">IMS</span>
            </div>
            <div>
              <h2 class="font-extrabold text-zinc-950 dark:text-white text-xs tracking-wider uppercase font-sans">INVENTORY</h2>
              <p class="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight uppercase">MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <button @click="isMobileMenuOpen = false" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <nav class="mt-4 space-y-1">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="selectTab(item.id)"
            :class="[
              'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
              activeTab === item.id 
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <div class="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <button
          @click="selectTab('backup')"
          :class="[
            'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
            activeTab === 'backup' 
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          ]"
        >
          <Database class="w-4 h-4 shrink-0" />
          <span>Cadangan & Restore</span>
        </button>

        <div class="flex items-center justify-between px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs">
          <span class="text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">Tema</span>
          <button 
            @click="$emit('toggle-dark')" 
            class="px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-600"
          >
            <Sun v-if="isDark" class="w-3 h-3 text-zinc-200" />
            <Moon v-else class="w-3 h-3 text-zinc-800" />
            <span>{{ isDark ? 'Dark' : 'Light' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Desktop Collapsible Sidebar (Minimalis, Padat, Profesional & Estetik) -->
    <aside 
      :class="[
        'hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 glass-panel border-r border-zinc-200/90 dark:border-zinc-800/90 transition-all duration-200 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Top Brand with Animated Circuit Icon in the Corner -->
      <div>
        <div class="h-14 flex items-center justify-between px-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div v-if="!isCollapsed" class="flex items-center space-x-2.5 overflow-hidden">
            <!-- The Cyber Cube dengan Teks Estetik IMS di Bawahnya -->
            <div class="flex flex-col items-center shrink-0">
              <CircuitIcon size="sm" />
              <span class="text-[7.5px] font-black font-mono tracking-widest text-zinc-950 dark:text-zinc-100 leading-none mt-0.5">IMS</span>
            </div>
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-xs tracking-wider text-zinc-950 dark:text-white uppercase font-sans">INVENTORY</span>
                <span class="text-[8px] font-mono px-1 py-0.2 rounded font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">SYS</span>
              </div>
              <p class="text-[8px] font-medium font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-tight truncate">MANAGEMENT SYSTEM</p>
            </div>
          </div>
          
          <!-- When Collapsed: Centered Cyber Cube with Aesthetic Text IMS Below -->
          <div v-else class="w-full flex flex-col items-center justify-center py-0.5">
            <CircuitIcon size="sm" />
            <span class="text-[8px] font-black font-mono tracking-widest text-zinc-950 dark:text-zinc-100 mt-1 leading-none">IMS</span>
          </div>

          <!-- Minimize Toggle Button -->
          <button 
            v-if="!isCollapsed"
            @click="isCollapsed = true"
            class="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Sembunyikan Sidebar"
          >
            <PanelLeftClose class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Expand Button When Collapsed -->
        <div v-if="isCollapsed" class="py-1.5 flex justify-center border-b border-zinc-200/60 dark:border-zinc-800/60">
          <button 
            @click="isCollapsed = false"
            class="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Perluas Sidebar"
          >
            <PanelLeftOpen class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Navigation Menu (Lebih Padat & Estetik) -->
        <div class="p-2.5">
          <p v-if="!isCollapsed" class="text-[9px] font-bold tracking-wider text-zinc-400 uppercase px-2.5 mb-1.5 font-mono">Modul Utama</p>
          <nav class="space-y-0.5">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="$emit('change-tab', item.id)"
              :class="[
                'w-full flex items-center rounded-xl text-xs transition-all group relative font-medium',
                isCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-1.5 space-x-2.5',
                activeTab === item.id 
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
              ]"
              :title="isCollapsed ? item.label : ''"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>

              <!-- Hover Tooltip When Collapsed -->
              <div 
                v-if="isCollapsed" 
                class="absolute left-full ml-2.5 px-2 py-1 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50 border border-zinc-800 dark:border-zinc-200"
              >
                {{ item.label }}
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Bottom Settings & Theme Toggle (Minimalis & Rapi) -->
      <div class="p-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
        <!-- Cadangan Data -->
        <button
          @click="$emit('change-tab', 'backup')"
          :class="[
            'w-full flex items-center rounded-xl text-xs font-medium transition-all group relative',
            isCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-1.5 space-x-2.5',
            activeTab === 'backup' 
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
          ]"
          :title="isCollapsed ? 'Cadangan & Restore' : ''"
        >
          <Database class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Cadangan Data</span>
          <div 
            v-if="isCollapsed" 
            class="absolute left-full ml-2.5 px-2 py-1 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50"
          >
            Cadangan Data
          </div>
        </button>

        <!-- Dark/Light Mode Toggle Button -->
        <button
          @click="$emit('toggle-dark')"
          :class="[
            'w-full flex items-center rounded-xl text-xs font-medium transition-all group relative text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white',
            isCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-1.5 space-x-2.5'
          ]"
          :title="isCollapsed ? (isDark ? 'Mode Terang' : 'Mode Gelap') : ''"
        >
          <Sun v-if="isDark" class="w-4 h-4 text-zinc-200 shrink-0" />
          <Moon v-else class="w-4 h-4 text-zinc-700 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">
            {{ isDark ? 'Mode Terang' : 'Mode Gelap' }}
          </span>
          <div 
            v-if="isCollapsed" 
            class="absolute left-full ml-2.5 px-2 py-1 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50"
          >
            {{ isDark ? 'Mode Terang' : 'Mode Gelap' }}
          </div>
        </button>
      </div>
    </aside>

    <!-- Mobile Bottom Navigation (Thumb Friendly & Padat) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-zinc-200 dark:border-zinc-800 px-1.5 py-1 safe-area-pb">
      <div class="grid grid-cols-6 gap-0.5">
        <button
          v-for="item in mobileNavItems"
          :key="item.id"
          @click="selectTab(item.id)"
          :class="[
            'flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all',
            activeTab === item.id 
              ? 'text-zinc-950 dark:text-white font-bold' 
              : 'text-zinc-400 dark:text-zinc-500 font-normal'
          ]"
        >
          <div :class="['p-1 rounded-lg', activeTab === item.id ? 'bg-zinc-200 dark:bg-zinc-800' : '']">
            <component :is="item.icon" class="w-4 h-4" />
          </div>
          <span class="text-[9px] mt-0.5 tracking-tight truncate">{{ item.shortLabel }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CircuitIcon from './CircuitIcon.vue';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Database, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Calculator,
  MapPin 
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
  { id: 'ppic', label: 'PPIC Planning', icon: Calculator },
  { id: 'locations', label: 'Lokasi & Mutasi', icon: MapPin },
];

const mobileNavItems = [
  { id: 'dashboard', shortLabel: 'Dash', icon: LayoutDashboard },
  { id: 'items', shortLabel: 'Item', icon: Package },
  { id: 'transactions', shortLabel: 'Order', icon: ArrowLeftRight },
  { id: 'ppic', shortLabel: 'PPIC', icon: Calculator },
  { id: 'locations', shortLabel: 'Lokasi', icon: MapPin },
  { id: 'ledger', shortLabel: 'Ledger', icon: FileText },
];

function selectTab(id) {
  emit('change-tab', id);
  isMobileMenuOpen.value = false;
}
</script>
