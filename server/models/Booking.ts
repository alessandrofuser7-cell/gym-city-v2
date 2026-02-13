import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  date: string;
  status: 'confirmed' | 'cancelled' | 'attended';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'attended'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Index for faster queries
BookingSchema.index({ userId: 1, date: 1 });
BookingSchema.index({ scheduleId: 1, date: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
