import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const ToolEntrySchema = new Schema({
  toolId:       { type: String, required: false, default: '', trim: true },
  toolName:     { type: String, required: false, default: '', trim: true },
  plan:         { type: String, trim: true, default: '' },
  monthlySpend: { type: Number, required: true, min: 0 },
  seats:        { type: Number, default: 1, min: 1 },
}, { _id: false })

const FindingSchema = new Schema({
  id:             { type: String, required: true },
  toolId:         { type: String, required: true },
  type:           { type: String, required: true },
  severity:       {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
  },
  title:          { type: String, required: true },
  description:    { type: String, required: true },
  reasoning:      { type: String, required: true },
  action:         { type: String, required: true },
  monthlySavings: { type: Number, default: 0, min: 0 },
  confidence:     { type: String, enum: ['exact', 'estimate', 'rough'], default: 'estimate' },
  tag:            { type: String, required: true },
  affectedTools:  [{ type: String }],
  isOpportunity:  { type: Boolean, default: false },
}, { _id: false })

const MetricsSchema = new Schema({
  totalMonthlySpend:       { type: Number, required: true, min: 0 },
  totalAnnualSpend:        { type: Number, required: true, min: 0 },
  potentialMonthlySavings: { type: Number, required: true, min: 0 },
  potentialAnnualSavings:  { type: Number, required: true, min: 0 },
  savingsPercent:          { type: Number, required: true, min: 0 },
  perEmployeeCost:         { type: Number, required: true, min: 0 },
  criticalCount:           { type: Number, default: 0 },
  highCount:               { type: Number, default: 0 },
  mediumCount:             { type: Number, default: 0 },
  totalFindings:           { type: Number, default: 0 },
  wasteScore:              { type: Number, min: 0, max: 100, default: 100 },
  toolCount:               { type: Number, default: 0 },
}, { _id: false })

const VerdictSchema = new Schema({
  headline: { type: String, required: true },
  subtext:  { type: String, required: true },
  mood:     {
    type: String,
    enum: ['excellent', 'good', 'concerning', 'critical'],
    required: true,
  },
}, { _id: false })

const ContextSchema = new Schema({
  teamSize:       { type: Number, required: true, min: 1 },
  primaryUseCase: { type: String, required: true, trim: true },
  teamBucket:     { type: String, trim: true },
}, { _id: false })

// ─── Main Audit Schema ────────────────────────────────────────────────────────

const AuditSchema = new Schema(
  {
    // Unique short ID for public sharing (e.g. "xK3mN9")
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // Audit inputs
    context:  { type: ContextSchema, required: true },
    tools:    { type: [ToolEntrySchema], required: true },

    // Audit outputs
    findings: { type: [FindingSchema], default: [] },
    metrics:  { type: MetricsSchema, required: true },
    verdict:  { type: VerdictSchema, required: true },

    // AI-generated summary (100 words, personalised)
    aiSummary: {
      text:          { type: String, default: '' },
      generatedAt:   { type: Date },
      model:         { type: String, default: 'llama-3.1-8b-instant' },
      isFallback:    { type: Boolean, default: false },
    },

    // Linked lead (optional — filled after lead capture)
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },

    // Analytics
    viewCount: { type: Number, default: 0 },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,   // createdAt, updatedAt
    collection: 'audits',
  }
)

// ─── Indexes ──────────────────────────────────────────────────────────────────

AuditSchema.index({ createdAt: -1 })
AuditSchema.index({ 'metrics.potentialAnnualSavings': -1 })

// ─── Instance methods ─────────────────────────────────────────────────────────

/**
 * Return a public-safe version of the audit (strips internal fields).
 */
AuditSchema.methods.toPublic = function () {
  const obj = this.toObject()
  delete obj.__v
  delete obj.isDeleted
  delete obj.leadId
  return obj
}

/**
 * Increment view count atomically.
 */
AuditSchema.methods.incrementViews = async function () {
  this.viewCount += 1
  await this.save()
}

// ─── Static methods ───────────────────────────────────────────────────────────

/**
 * Find a non-deleted audit by its public short ID.
 */
AuditSchema.statics.findByPublicId = function (publicId) {
  return this.findOne({ publicId, isDeleted: false })
}

export default model('Audit', AuditSchema)
