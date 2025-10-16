import mongoose, { Schema, model, models } from 'mongoose';

const LoanSchema = new Schema(
  {
    poolId: { type: Schema.Types.ObjectId, ref: 'Pool', required: true },
    borrowerId: { type: String, required: true },
    principalUsd: { type: Number, required: true },
    aprBps: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'REPAID', 'DEFAULTED', 'CANCELED'], default: 'ACTIVE' },
    collateral: {
      kind: String,
      symbol: String,
      amount: Number,
      requiredUsd: Number,
      link: String,
    },
    creditScoreBefore: Number,
    creditScoreAfter: Number,
    fundedAt: Date,
  },
  { timestamps: true }
);

export type LoanDocument = mongoose.InferSchemaType<typeof LoanSchema> & { _id: mongoose.Types.ObjectId };

export default models.Loan || model('Loan', LoanSchema);


