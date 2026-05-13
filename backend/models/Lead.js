import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ─── Lead Schema ──────────────────────────────────────────────────────────────

const LeadSchema = new Schema(
  {
    // Contact info
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },

    // Company info
    companyName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Company name must be under 120 characters'],
    },

    role: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Role must be under 80 characters'],
    },

    teamSize: {
      type: Number,
      min: [1, 'Team size must be at least 1'],
      default: null,
    },

    // The audit this lead came from
    auditId: {
      type: Schema.Types.ObjectId,
      ref: 'Audit',
      required: [true, 'Audit reference is required'],
      index: true,
    },

    // Public audit ID for easy reference (denormalised for quick lookup)
    auditPublicId: {
      type: String,
      trim: true,
      default: '',
    },

    // Snapshot of the audit's savings at time of lead capture
    savingsSnapshot: {
      monthly: { type: Number, default: 0 },
      annual:  { type: Number, default: 0 },
    },

    // Email delivery status
    emailStatus: {
      sent:     { type: Boolean, default: false },
      sentAt:   { type: Date,    default: null },
      resendId: { type: String,  default: null }, // Resend message ID for tracking
      error:    { type: String,  default: null },
    },

    // Lead source tracking
    source: {
      type: String,
      enum: ['audit_results', 'landing_page', 'direct', 'referral'],
      default: 'audit_results',
    },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'leads',
  }
)

// ─── Indexes ──────────────────────────────────────────────────────────────────

LeadSchema.index({ createdAt: -1 })
LeadSchema.index({ email: 1, auditId: 1 }, { unique: true }) // prevent duplicate lead per audit

// ─── Instance methods ─────────────────────────────────────────────────────────

/**
 * Mark email as sent with Resend message ID.
 */
LeadSchema.methods.markEmailSent = async function (resendId) {
  this.emailStatus.sent     = true
  this.emailStatus.sentAt   = new Date()
  this.emailStatus.resendId = resendId
  this.emailStatus.error    = null
  await this.save()
}

/**
 * Mark email as failed with error message.
 */
LeadSchema.methods.markEmailFailed = async function (errorMsg) {
  this.emailStatus.sent   = false
  this.emailStatus.error  = errorMsg
  await this.save()
}

// ─── Static methods ───────────────────────────────────────────────────────────

/**
 * Check if a lead already exists for this email + audit combination.
 */
LeadSchema.statics.alreadyExists = function (email, auditId) {
  return this.findOne({ email: email.toLowerCase(), auditId, isDeleted: false })
}

export default model('Lead', LeadSchema)
