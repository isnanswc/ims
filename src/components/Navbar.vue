<template>
  <div>
    <!-- Desktop & Tablet Header -->
    <header class="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Boxes class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-bold text-lg tracking-tight">IMS Pro</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Client-Side</span>
              </div>
              <p class="text-[11px] text-slate-400 hidden sm:block">Inventory Management System (IndexedDB)</p>
            </div>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-1">
            <button 
              v-for="item in navItems" 
              :key="item.id"
              @click="$emit('change-tab', item.id)"
              :class="[
                'flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <!-- Quick Action / Status -->
          <div class="flex items-center space-x-2">
            <button 
              @click="$emit('change-tab', 'backup')"
              :class="[
                'p-2 rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-medium',
                activeTab === 'backup' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              ]"
              title="Backup & Restore Data"
            >
              <Database class="w-4 h-4 text-emerald-400" />
              <span class="hidden sm:inline">Cadangan Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Navigation (Thumb Friendly) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb">
      <div class="grid grid-cols-5 gap-1">
        <button
          v-for="item in mobileNavItems"
          :key="item.id"
          @click="$emit('change-tab', item.id)"
          :class="[
            'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all',
            activeTab === item.id 
              ? 'text-emerald-600 font-semibold scale-105' 
              : 'text-slate-500 hover:text-slate-700 font-normal'
          ]"
        >
          <div :class="['p-1 rounded-lg', activeTab === item.id ? 'bg-emerald-50' : '']">
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <span class="text-[10px] mt-0.5 tracking-tight truncate">{{ item.shortLabel }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Database,
  Boxes
} from 'lucide-vue-next';

defineProps({
  activeTab: {
    type: String,
    required: true
  }
});

defineEmits(['change-tab']);

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'items', label: 'Master Item', icon: Package },
  { id: 'transactions', label: 'Inbound & Outbound', icon: ArrowLeftRight },
  { id: 'ledger', label: 'Item Ledger', icon: FileText },
];

const mobileNavItems = [
  { id: 'dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'items', shortLabel: 'Item', icon: Package },
  { id: 'transactions', shortLabel: 'Mutasi', icon: ArrowLeftRight },
  { id: 'ledger', shortLabel: 'Ledger', icon: FileText },
  { id: 'backup', shortLabel: 'Backup', icon: Database },
];
</script>
