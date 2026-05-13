import { validationResult } from 'express-validator'
import { badRequest } from '../utils/response.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const details = errors.array().map(e => `${e.path}: ${e.msg}`)
    return badRequest(res, 'Validation failed', details)
  }
  next()
}

export const validateCreateAudit = [validate]  // NO rules — accept everything

export const validatePublicId = [validate]

import { body } from 'express-validator'

export const validateCreateLead = [
  body('email')
    .isEmail().withMessage('A valid email address is required')
    .normalizeEmail(),
  body('auditPublicId')
    .isString().notEmpty().withMessage('auditPublicId is required'),
  validate,
]