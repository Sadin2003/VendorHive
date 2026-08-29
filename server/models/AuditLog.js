import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

export default mongoose.model('AuditLog', auditLogSchema)
