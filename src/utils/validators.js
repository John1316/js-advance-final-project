export function validateTripForm(form) {
  const errors = {}

  if (!form.destination?.trim()) {
    errors.destination = 'Destination is required.'
  }

  if (!form.startDate) {
    errors.startDate = 'Start date is required.'
  }

  if (!form.endDate) {
    errors.endDate = 'End date is required.'
  }

  if (form.startDate && form.endDate && form.endDate <= form.startDate) {
    errors.endDate = 'End date must be at least one day after the start date.'
  }

  const adults = Number(form.adults)
  const children = Number(form.children)

  if (!Number.isFinite(adults) || adults < 1) {
    errors.adults = 'At least one adult is required.'
  }

  if (!Number.isFinite(children) || children < 0) {
    errors.children = 'Children count must be 0 or more.'
  }

  if (form.budget === 'custom') {
    const amount = Number(form.customBudget)
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.customBudget = 'Enter a valid custom budget amount.'
    }
  }

  if (!form.interests?.length) {
    errors.interests = 'Select at least one interest.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
