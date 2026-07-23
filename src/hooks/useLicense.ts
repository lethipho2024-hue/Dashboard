// useLicense Hook
// React hook for license management

import { useState, useEffect, useCallback } from 'react'
import {
  LicenseService,
  getLicenseService,
  LicenseValidation,
  License,
  LicenseEdition,
} from '../services/auth'

export interface UseLicenseResult {
  // State
  validation: LicenseValidation
  license: License | null
  isValid: boolean
  isLoading: boolean
  errors: string[]
  warnings: string[]

  // Actions
  validate: () => Promise<LicenseValidation>
  activate: (licenseKey: string) => Promise<LicenseValidation>
  deactivate: () => Promise<boolean>
  refresh: () => Promise<LicenseValidation>

  // Helpers
  hasFeature: (feature: string) => boolean
  hasMinimumEdition: (edition: LicenseEdition) => boolean
  getEditionName: (edition: LicenseEdition) => string
}

export function useLicense(): UseLicenseResult {
  const [licenseService] = useState(() => getLicenseService())
  const [validation, setValidation] = useState<LicenseValidation>(
    licenseService.getValidation()
  )

  // Sync with license service state
  useEffect(() => {
    const unsubscribe = licenseService.subscribe(setValidation)
    return unsubscribe
  }, [licenseService])

  // Initialize on mount
  useEffect(() => {
    licenseService.initialize()
  }, [licenseService])

  // Validate
  const validate = useCallback(async (): Promise<LicenseValidation> => {
    return licenseService.validate()
  }, [licenseService])

  // Activate
  const activate = useCallback(
    async (licenseKey: string): Promise<LicenseValidation> => {
      return licenseService.activate(licenseKey)
    },
    [licenseService]
  )

  // Deactivate
  const deactivate = useCallback(async (): Promise<boolean> => {
    return licenseService.deactivate()
  }, [licenseService])

  // Refresh
  const refresh = useCallback(async (): Promise<LicenseValidation> => {
    return licenseService.refresh()
  }, [licenseService])

  // Has feature
  const hasFeature = useCallback(
    (feature: string): boolean => {
      return licenseService.hasFeature(feature)
    },
    [licenseService]
  )

  // Has minimum edition
  const hasMinimumEdition = useCallback(
    (edition: LicenseEdition): boolean => {
      return licenseService.hasMinimumEdition(edition)
    },
    [licenseService]
  )

  // Get edition name
  const getEditionName = useCallback(
    (edition: LicenseEdition): string => {
      return LicenseService.getEditionDisplayName(edition)
    },
    []
  )

  return {
    validation,
    license: validation.license,
    isValid: validation.valid,
    isLoading: false,
    errors: validation.errors,
    warnings: validation.warnings,
    validate,
    activate,
    deactivate,
    refresh,
    hasFeature,
    hasMinimumEdition,
    getEditionName,
  }
}
