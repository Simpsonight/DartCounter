<template>
  <div class="bg-slate-900 rounded-xl p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
      <div class="flex gap-1">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          @click="selectedRange = range.value"
          class="px-2 py-1 text-xs rounded transition-colors"
          :class="selectedRange === range.value
            ? 'bg-primary-500 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div v-if="chartData.length > 0" class="relative">
      <!-- Y-Axis Labels -->
      <div class="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-right pr-2">
        <span class="text-xs text-slate-500">{{ maxValue.toFixed(0) }}</span>
        <span class="text-xs text-slate-500">{{ (maxValue / 2).toFixed(0) }}</span>
        <span class="text-xs text-slate-500">0</span>
      </div>

      <!-- SVG Chart -->
      <div class="ml-10">
        <svg
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          class="w-full"
          preserveAspectRatio="none"
          style="height: 160px;"
        >
          <!-- Grid Lines -->
          <line
            x1="0" :y1="chartHeight * 0.25"
            :x2="chartWidth" :y2="chartHeight * 0.25"
            stroke="#334155" stroke-width="1" stroke-dasharray="4"
          />
          <line
            x1="0" :y1="chartHeight * 0.5"
            :x2="chartWidth" :y2="chartHeight * 0.5"
            stroke="#334155" stroke-width="1" stroke-dasharray="4"
          />
          <line
            x1="0" :y1="chartHeight * 0.75"
            :x2="chartWidth" :y2="chartHeight * 0.75"
            stroke="#334155" stroke-width="1" stroke-dasharray="4"
          />

          <!-- Area Fill -->
          <defs>
            <linearGradient :id="`gradient-${chartId}`" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :style="`stop-color: ${primaryColor}; stop-opacity: 0.3`" />
              <stop offset="100%" :style="`stop-color: ${primaryColor}; stop-opacity: 0`" />
            </linearGradient>
          </defs>

          <path
            :d="areaPath"
            :fill="`url(#gradient-${chartId})`"
          />

          <!-- Line -->
          <path
            :d="linePath"
            fill="none"
            :stroke="primaryColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data Points -->
          <circle
            v-for="(point, index) in chartPoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :fill="primaryColor"
            class="cursor-pointer hover:r-6 transition-all"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          />
        </svg>

        <!-- X-Axis Labels -->
        <div class="flex justify-between mt-2">
          <span
            v-for="(label, index) in xAxisLabels"
            :key="index"
            class="text-xs text-slate-500"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- Tooltip -->
      <Transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="hoveredIndex !== null && chartData[hoveredIndex]"
          class="absolute bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10"
          :style="tooltipStyle"
        >
          <div class="text-sm font-medium text-white">
            {{ formatValue(chartData[hoveredIndex].value) }}
          </div>
          <div class="text-xs text-slate-400">
            {{ chartData[hoveredIndex].label }}
          </div>
        </div>
      </Transition>
    </div>

    <!-- Empty State -->
    <div v-else class="h-40 flex items-center justify-center text-slate-500">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm">Not enough data</p>
      </div>
    </div>

    <!-- Stats Summary -->
    <div v-if="chartData.length > 0" class="mt-4 grid grid-cols-3 gap-3">
      <div class="text-center">
        <div class="text-lg font-bold" :style="{ color: primaryColor }">
          {{ formatValue(currentValue) }}
        </div>
        <div class="text-xs text-slate-500">Current</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-white">
          {{ formatValue(averageValue) }}
        </div>
        <div class="text-xs text-slate-500">Average</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-dart-gold">
          {{ formatValue(bestValue) }}
        </div>
        <div class="text-xs text-slate-500">Best</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChartDataPoint {
  value: number
  label: string
  date?: Date
}

interface Props {
  title: string
  data: ChartDataPoint[]
  valueFormatter?: (value: number) => string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  valueFormatter: (value: number) => value.toFixed(1),
  color: '#22c55e' // primary-500
})

const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`
const primaryColor = computed(() => props.color)

const timeRanges = [
  { value: 10, label: 'Last 10' },
  { value: 20, label: 'Last 20' },
  { value: 0, label: 'All' }
] as const

const selectedRange = ref<number>(10)
const hoveredIndex = ref<number | null>(null)

// Chart dimensions
const chartWidth = 300
const chartHeight = 120
const padding = 10

// Filter data based on selected range
const chartData = computed(() => {
  if (selectedRange.value === 0 || props.data.length <= selectedRange.value) {
    return props.data
  }
  return props.data.slice(-selectedRange.value)
})

// Calculate min/max values
const minValue = computed(() => {
  if (chartData.value.length === 0) return 0
  return Math.min(...chartData.value.map(d => d.value))
})

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 100
  const max = Math.max(...chartData.value.map(d => d.value))
  // Add 10% padding to top
  return max * 1.1
})

// Calculate chart points
const chartPoints = computed(() => {
  if (chartData.value.length === 0) return []

  const xStep = (chartWidth - padding * 2) / Math.max(chartData.value.length - 1, 1)
  const yRange = maxValue.value - minValue.value || 1

  return chartData.value.map((point, index) => ({
    x: padding + index * xStep,
    y: chartHeight - padding - ((point.value - minValue.value) / yRange) * (chartHeight - padding * 2)
  }))
})

// Generate SVG line path
const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  return chartPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

// Generate SVG area path (for gradient fill)
const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  const line = chartPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const lastX = chartPoints.value[chartPoints.value.length - 1]?.x || 0
  const firstX = chartPoints.value[0]?.x || 0

  return `${line} L ${lastX} ${chartHeight - padding} L ${firstX} ${chartHeight - padding} Z`
})

// X-axis labels
const xAxisLabels = computed(() => {
  if (chartData.value.length === 0) return []

  // Show max 5 labels
  const step = Math.ceil(chartData.value.length / 5)
  const labels: string[] = []

  for (let i = 0; i < chartData.value.length; i += step) {
    labels.push(chartData.value[i].label)
  }

  // Always include last label
  if (labels.length > 0 && labels[labels.length - 1] !== chartData.value[chartData.value.length - 1].label) {
    labels.push(chartData.value[chartData.value.length - 1].label)
  }

  return labels
})

// Tooltip positioning
const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null) return {}

  const point = chartPoints.value[hoveredIndex.value]
  if (!point) return {}

  // Convert SVG coordinates to percentage
  const leftPercent = (point.x / chartWidth) * 100 + 3 // Account for ml-10 (40px ~ 3%)

  return {
    left: `${leftPercent}%`,
    top: '20px',
    transform: 'translateX(-50%)'
  }
})

// Stats calculations
const currentValue = computed(() => {
  if (chartData.value.length === 0) return 0
  return chartData.value[chartData.value.length - 1].value
})

const averageValue = computed(() => {
  if (chartData.value.length === 0) return 0
  const sum = chartData.value.reduce((acc, d) => acc + d.value, 0)
  return sum / chartData.value.length
})

const bestValue = computed(() => {
  if (chartData.value.length === 0) return 0
  return Math.max(...chartData.value.map(d => d.value))
})

// Format value using provided formatter
const formatValue = (value: number): string => {
  return props.valueFormatter(value)
}
</script>
