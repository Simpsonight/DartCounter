import { CHANGELOG, getCurrentVersion, getVersionInfo, type ChangelogEntry } from '~/utils/changelog'

/**
 * Composable for accessing version and changelog information
 */
export const useVersion = () => {
  const version = computed(() => getCurrentVersion())
  const versionInfo = computed(() => getVersionInfo())
  const changelog = computed(() => CHANGELOG)

  /**
   * Get formatted version string (e.g., "v0.2.0")
   */
  const formattedVersion = computed(() => `v${version.value}`)

  /**
   * Get version with date (e.g., "v0.2.0 (2026-01-18)")
   */
  const versionWithDate = computed(() => {
    const info = versionInfo.value
    return `v${info.version} (${info.date})`
  })

  /**
   * Check if this is a pre-release version (0.x.x)
   */
  const isPreRelease = computed(() => {
    return version.value.startsWith('0.')
  })

  /**
   * Get release label based on version
   */
  const releaseLabel = computed(() => {
    if (isPreRelease.value) {
      return 'Beta'
    }
    return 'Stable'
  })

  return {
    version,
    versionInfo,
    changelog,
    formattedVersion,
    versionWithDate,
    isPreRelease,
    releaseLabel
  }
}
