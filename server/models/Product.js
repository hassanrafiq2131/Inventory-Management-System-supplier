import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String, // Field for storing the image URL
    required: false, // Optional (set to true if you want to enforce image upload)
    default: 'https://via.placeholder.com/150' // Default placeholder image URL
  },
  owner: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add unique index for owner and SKU combination
productSchema.index({ owner: 1, sku: 1 }, { unique: true });

// Update the `updatedAt` timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', productSchema);
