import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  day: string;
  time: string;
  instructorId: mongoose.Types.ObjectId;
  instructorName: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
  },
  time: {
    type: String,
    required: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  instructorName: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 20,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
