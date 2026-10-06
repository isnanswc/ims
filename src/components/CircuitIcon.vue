<template>
  <div 
    class="relative group cursor-pointer flex flex-col items-center justify-center shrink-0 select-none"
    :title="'IMS Core • The Cyber Cube'"
  >
    <!-- Outer Circuit Board Housing (Monochrome Dark / Light Adaptive) -->
    <div 
      :class="[
        'rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-300',
        'bg-white dark:bg-zinc-950 border border-zinc-300/90 dark:border-zinc-800/90 shadow-sm dark:shadow-md dark:shadow-black/60 group-hover:border-zinc-500 dark:group-hover:border-zinc-400',
        sizeClasses
      ]"
    >
      <!-- Micro Circuit Grid Texture Background -->
      <div class="absolute inset-0 opacity-15 dark:opacity-20 bg-[radial-gradient(#71717a_1px,transparent_1px)] dark:bg-[radial-gradient(#52525b_1px,transparent_1px)] [background-size:5px_5px] pointer-events-none"></div>

      <!-- THE CYBER CUBE SVG (Concept 1: Isometric Cargo Box + Microchip Seal + Conduction Streams) -->
      <svg 
        viewBox="0 0 48 48" 
        class="w-full h-full p-1 relative z-10" 
        style="transform: translateZ(0);"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- ============================================== -->
        <!-- 1. BASE ISOMETRIC 3D CUBE FACES (Warehouse Cargo) -->
        <!-- ============================================== -->
        
        <!-- Top Face (Tutup Paket Atas) -->
        <polygon 
          points="24,6 39,14 24,22 9,14" 
          class="fill-white dark:fill-[#18181b] stroke-zinc-900 dark:stroke-zinc-600 transition-colors"
          stroke-width="1.3" 
        />
        
        <!-- Left Face (Sisi Kiri Berbayang) -->
        <polygon 
          points="9,14 24,22 24,39 9,31" 
          class="fill-zinc-200 dark:fill-[#09090b] stroke-zinc-900 dark:stroke-zinc-600 transition-colors"
          stroke-width="1.3" 
        />
        
        <!-- Right Face (Sisi Kanan) -->
        <polygon 
          points="24,22 39,14 39,31 24,39" 
          class="fill-zinc-100 dark:fill-[#121215] stroke-zinc-900 dark:stroke-zinc-600 transition-colors"
          stroke-width="1.3" 
        />

        <!-- ============================================== -->
        <!-- 2. BOX SEAL / TAPE & INTEGRATED MICROCHIP CORE -->
        <!-- ============================================== -->
        <!-- Vertical Package Tape Seam -->
        <line x1="24" y1="6" x2="24" y2="22" class="stroke-zinc-400 dark:stroke-zinc-700" stroke-width="1.5" stroke-dasharray="1 1" />
        <line x1="24" y1="22" x2="24" y2="39" class="stroke-zinc-400 dark:stroke-zinc-700" stroke-width="1.5" />

        <!-- Top Face Microchip Core (Smart Tracking Unit) -->
        <polygon 
          points="24,10.5 28.5,13 24,15.5 19.5,13" 
          class="fill-zinc-300 dark:fill-zinc-800 stroke-zinc-700 dark:stroke-zinc-500" 
          stroke-width="0.9" 
        />
        <!-- Microchip Contact Leads -->
        <line x1="21.5" y1="11.8" x2="20" y2="11" class="stroke-zinc-500 dark:stroke-zinc-600" stroke-width="0.8" />
        <line x1="26.5" y1="11.8" x2="28" y2="11" class="stroke-zinc-500 dark:stroke-zinc-600" stroke-width="0.8" />
        <line x1="21.5" y1="14.2" x2="20" y2="15" class="stroke-zinc-500 dark:stroke-zinc-600" stroke-width="0.8" />
        <line x1="26.5" y1="14.2" x2="28" y2="15" class="stroke-zinc-500 dark:stroke-zinc-600" stroke-width="0.8" />

        <!-- ============================================== -->
        <!-- 3. PASSIVE PCB TRACE GROOVES                   -->
        <!-- ============================================== -->
        <path d="M 9,31 L 9,14 L 24,6 L 39,14 L 39,31" class="stroke-zinc-300/80 dark:stroke-zinc-800" stroke-width="1.2" stroke-linecap="round" />
        <path d="M 24,39 L 24,22 L 39,14" class="stroke-zinc-300/80 dark:stroke-zinc-800" stroke-width="1.2" stroke-linecap="round" />
        <path d="M 9,14 L 24,22" class="stroke-zinc-300/80 dark:stroke-zinc-800" stroke-width="1.2" stroke-linecap="round" />

        <!-- ============================================== -->
        <!-- 4. ACTIVE FLOWING ELECTRIC CURRENTS            -->
        <!-- Light Mode: Deep High-Contrast Obsidian Black  -->
        <!-- Dark Mode: Pure Brilliant Phosphor White       -->
        <!-- ============================================== -->
        <!-- Current 1: Outer Isometric Rim -->
        <path 
          d="M 9,31 L 9,14 L 24,6 L 39,14 L 39,31" 
          class="stroke-zinc-950 dark:stroke-white anim-cyber-flow-1" 
          stroke-width="1.6" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
        />

        <!-- Current 2: Center Front Spine & Right Flank -->
        <path 
          d="M 24,39 L 24,22 L 39,14" 
          class="stroke-zinc-950 dark:stroke-white anim-cyber-flow-2" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
        />

        <!-- Current 3: Left Inward Branch -->
        <path 
          d="M 9,14 L 24,22 L 24,39" 
          class="stroke-zinc-950 dark:stroke-white anim-cyber-flow-3" 
          stroke-width="1.4" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
        />

        <!-- ============================================== -->
        <!-- 5. TERMINAL NODES / VIAS (Pulsing Sparks)      -->
        <!-- ============================================== -->
        <circle cx="24" cy="6" r="1.6" class="fill-zinc-950 dark:fill-white anim-cyber-node" />
        <circle cx="9" cy="14" r="1.6" class="fill-zinc-950 dark:fill-white anim-cyber-node" />
        <circle cx="39" cy="14" r="1.6" class="fill-zinc-950 dark:fill-white anim-cyber-node-delayed" />
        <circle cx="24" cy="39" r="1.6" class="fill-zinc-950 dark:fill-white anim-cyber-node" />
        <circle cx="24" cy="22" r="1.4" class="fill-zinc-950 dark:fill-white anim-cyber-node-delayed" />
      </svg>

      <!-- Precision Corner Brackets / Mechanical Notches -->
      <div class="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-zinc-400 dark:border-zinc-600/70"></div>
      <div class="absolute top-0.5 right-0.5 w-1 h-1 border-t border-r border-zinc-400 dark:border-zinc-600/70"></div>
      <div class="absolute bottom-0.5 left-0.5 w-1 h-1 border-b border-l border-zinc-400 dark:border-zinc-600/70"></div>
      <div class="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-zinc-400 dark:border-zinc-600/70"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8';
    case 'lg':
      return 'w-11 h-11';
    case 'md':
    default:
      return 'w-9 h-9';
  }
});
</script>
