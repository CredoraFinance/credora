import mongoose, { Schema, model, models } from 'mongoose';

const PoolSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    aprBps: { type: Number, required: true },
    ltvBps: { type: Number, required: true },
    tenureMonths: { type: [Number], default: [] },
    allowedCollateralKinds: { type: [String], default: [] },
    allowedSymbols: { type: [String], default: [] },
    minLoanUsd: { type: Number, required: true },
    maxLoanUsd: { type: Number, required: true },
    totalLiquidityUsd: { type: Number, required: true },
    totalBorrowedUsd: { type: Number, default: 0 },
    owner: {
      _id: { type: String },
      displayName: { type: String },
    },
  },
  { timestamps: true }
);

export type PoolDocument = mongoose.InferSchemaType<typeof PoolSchema> & { _id: mongoose.Types.ObjectId };

export default models.Pool || model('Pool', PoolSchema);


