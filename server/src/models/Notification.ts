import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
  deviceId: string;
  data: any;
}

const NotificationSchema = new Schema<INotification>({
  type: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  deviceId: { type: String, required: true },
  data: { type: Schema.Types.Mixed }
});

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;