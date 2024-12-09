import mongoose from 'mongoose';

const supplierInventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      required: false,
      default: 'https://via.placeholder.com/150',
    },
    owner: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'supplierInventory' }
);

supplierInventorySchema.index({ owner: 1, sku: 1 }, { unique: true });

supplierInventorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('SupplierInventory', supplierInventorySchema);
