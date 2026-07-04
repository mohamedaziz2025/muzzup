import { NotificationModel, type NotificationType } from "../../models/notification.model.js";
import { getIoInstance } from "../../sockets/io-instance.js";

export const notificationsService = {
  async create(userId: string, type: NotificationType, title: string, body: string, link?: string) {
    const notification = await NotificationModel.create({ userId, type, title, body, link });

    getIoInstance()
      ?.of("/notifications")
      .to(`user:${userId}`)
      .emit("notification:new", {
        id: notification._id.toString(),
        type,
        title,
        body,
        link: link ?? null,
        createdAt: notification.createdAt,
      });

    return notification;
  },

  async listForUser(userId: string) {
    return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50).exec();
  },

  async markRead(userId: string, notificationId: string) {
    await NotificationModel.updateOne(
      { _id: notificationId, userId },
      { $set: { readAt: new Date() } },
    );
  },

  async markAllRead(userId: string) {
    await NotificationModel.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } },
    );
  },
};
