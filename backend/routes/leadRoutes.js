import { Router } from 'express'
import { createLead } from '../controllers/leadController.js'
import { validateCreateLead } from '../middleware/validate.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// POST /api/leads — capture a lead and send confirmation email
router.post('/', writeLimiter, validateCreateLead, createLead)

export default router
