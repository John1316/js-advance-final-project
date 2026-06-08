import { describe, expect, it } from 'vitest'
import { validateTripForm } from './validators.js'

describe('validateTripForm', () => {
  const validForm = {
    destination: 'Paris',
    startDate: '2026-07-01',
    endDate: '2026-07-08',
    adults: 2,
    children: 1,
    budget: 'medium',
    customBudget: '',
    interests: ['food'],
  }

  it('accepts a valid form', () => {
    const result = validateTripForm(validForm)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects end date before start date', () => {
    const result = validateTripForm({
      ...validForm,
      startDate: '2026-07-08',
      endDate: '2026-07-01',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.endDate).toBeTruthy()
  })

  it('requires custom budget when budget is custom', () => {
    const result = validateTripForm({
      ...validForm,
      budget: 'custom',
      customBudget: '',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.customBudget).toBeTruthy()
  })
})
