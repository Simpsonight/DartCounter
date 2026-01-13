<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Player Name -->
    <div>
      <label for="player-name" class="block text-sm font-medium text-slate-300 mb-2">
        Player Name *
      </label>
      <input
        id="player-name"
        v-model="formData.name"
        type="text"
        required
        maxlength="50"
        placeholder="Enter player name"
        class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        :disabled="loading"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-dart-red">
        {{ errors.name }}
      </p>
    </div>

    <!-- Avatar Preview (if editing with existing avatar) -->
    <div v-if="initialData?.avatar" class="flex items-center gap-4">
      <PlayerAvatar
        :name="formData.name || initialData.name"
        :avatar="initialData.avatar"
        size="lg"
      />
      <div>
        <p class="text-sm text-slate-400">Current Avatar</p>
        <button
          type="button"
          class="text-sm text-dart-red hover:text-red-400 mt-1"
          @click="removeAvatar"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- Avatar Upload Info -->
    <div class="text-sm text-slate-500 bg-slate-800/50 p-3 rounded-lg">
      <p>🎯 Avatar feature coming soon! For now, we'll use your initials.</p>
    </div>

    <!-- Form Actions -->
    <div class="flex gap-3">
      <UiButton
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="!isValid"
        full-width
      >
        {{ submitLabel }}
      </UiButton>
      <UiButton
        v-if="showCancel"
        type="button"
        variant="ghost"
        @click="emit('cancel')"
        :disabled="loading"
      >
        Cancel
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Player, PlayerFormData } from '~/types/player'

interface Props {
  initialData?: Player
  submitLabel?: string
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Create Player',
  showCancel: false
})

const emit = defineEmits<{
  submit: [data: PlayerFormData]
  cancel: []
}>()

const loading = ref(false)
const formData = reactive<PlayerFormData>({
  name: props.initialData?.name || '',
  avatar: props.initialData?.avatar
})

const errors = reactive({
  name: ''
})

const isValid = computed(() => {
  return formData.name.trim().length >= 2
})

const validateName = () => {
  errors.name = ''
  const trimmed = formData.name.trim()

  if (trimmed.length === 0) {
    errors.name = 'Name is required'
    return false
  }

  if (trimmed.length < 2) {
    errors.name = 'Name must be at least 2 characters'
    return false
  }

  if (trimmed.length > 50) {
    errors.name = 'Name must be less than 50 characters'
    return false
  }

  return true
}

const removeAvatar = () => {
  formData.avatar = undefined
}

const handleSubmit = async () => {
  if (!validateName() || loading.value) {
    return
  }

  loading.value = true
  try {
    emit('submit', {
      name: formData.name.trim(),
      avatar: formData.avatar
    })
  } finally {
    loading.value = false
  }
}

// Watch for external data changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.name = newData.name
    formData.avatar = newData.avatar
  }
}, { immediate: true })
</script>
