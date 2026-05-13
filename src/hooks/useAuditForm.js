import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'spendlens_audit_form'

const createEmptyTool = (overrides = {}) => ({
  id: `tool_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  toolName: '',
  plan: '',
  monthlySpend: '',
  seats: '',
  ...overrides,
})

const defaultFormState = {
  teamSize: '',
  primaryUseCase: '',
  tools: [createEmptyTool()],
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure at least one tool exists
      if (!parsed.tools || parsed.tools.length === 0) {
        parsed.tools = [createEmptyTool()]
      }
      return parsed
    }
  } catch (e) {
    console.warn('Failed to load form from localStorage:', e)
  }
  return defaultFormState
}

export function useAuditForm() {
  const [formState, setFormState] = useState(loadFromStorage)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Auto-save to localStorage on change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formState))
        setLastSaved(new Date())
        setIsDirty(false)
      } catch (e) {
        console.warn('Failed to save form to localStorage:', e)
      }
    }, 500) // debounce 500ms

    return () => clearTimeout(timer)
  }, [formState])

  const updateField = useCallback((field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  const addTool = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      tools: [...prev.tools, createEmptyTool()],
    }))
    setIsDirty(true)
  }, [])

  const removeTool = useCallback((toolId) => {
    setFormState(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.id !== toolId),
    }))
    setIsDirty(true)
  }, [])

  const updateTool = useCallback((toolId, field, value) => {
    setFormState(prev => ({
      ...prev,
      tools: prev.tools.map(t =>
        t.id === toolId ? { ...t, [field]: value } : t
      ),
    }))
    setIsDirty(true)
  }, [])

  const duplicateTool = useCallback((toolId) => {
    setFormState(prev => {
      const source = prev.tools.find(t => t.id === toolId)
      if (!source) return prev
      const clone = createEmptyTool({ ...source })
      const idx = prev.tools.findIndex(t => t.id === toolId)
      const newTools = [...prev.tools]
      newTools.splice(idx + 1, 0, clone)
      return { ...prev, tools: newTools }
    })
    setIsDirty(true)
  }, [])

  const resetForm = useCallback(() => {
    const fresh = { ...defaultFormState, tools: [createEmptyTool()] }
    setFormState(fresh)
    localStorage.removeItem(STORAGE_KEY)
    setIsDirty(false)
    setLastSaved(null)
  }, [])

  // Computed totals
  const totals = {
    totalMonthlySpend: formState.tools.reduce((sum, t) => {
      const spend = parseFloat(t.monthlySpend) || 0
      return sum + spend
    }, 0),
    totalSeats: formState.tools.reduce((sum, t) => {
      const seats = parseInt(t.seats) || 0
      return sum + seats
    }, 0),
    toolCount: formState.tools.filter(t => t.toolName).length,
  }

  const isValid = formState.teamSize &&
    formState.primaryUseCase &&
    formState.tools.some(t => t.toolName && t.monthlySpend)

  return {
    formState,
    updateField,
    addTool,
    removeTool,
    updateTool,
    duplicateTool,
    resetForm,
    totals,
    isValid,
    isDirty,
    lastSaved,
  }
}
