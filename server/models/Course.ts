import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  intensity: 'bassa' | 'media' | 'alta';
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  intensity: {
    type: String,
    enum: ['bassa', 'media', 'alta'],
    default: 'media'
  },
  color: {
    type: String,
    default: 'bg-primary'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICourse>('Course', CourseSchema);
