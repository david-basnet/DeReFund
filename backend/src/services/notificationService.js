const { eq, and, desc } = require('drizzle-orm');
const { db } = require('../db/client');
const { notifications } = require('../db/schema');

const createNotification = async (data) => {
  const [row] = await db
    .insert(notifications)
    .values({
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      link: data.link || null,
    })
    .returning();
  return row;
};

const getByUser = async (userId) => {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at));
};

const markAsRead = async (notificationId, userId) => {
  const [row] = await db
    .update(notifications)
    .set({ is_read: true })
    .where(and(eq(notifications.notification_id, notificationId), eq(notifications.user_id, userId)))
    .returning();
  return row;
};

const deleteNotification = async (notificationId, userId) => {
  const [row] = await db
    .delete(notifications)
    .where(and(eq(notifications.notification_id, notificationId), eq(notifications.user_id, userId)))
    .returning();
  return row;
};

const checkAndCreateWalletNotification = async (userId, walletAddress) => {
  if (!walletAddress) {
    // Check if notification already exists to avoid duplicates
    const existing = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.title, 'Wallet Not Set'),
          eq(notifications.is_read, false)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await createNotification({
        user_id: userId,
        title: 'Wallet Not Set',
        message: 'Please set your wallet address in your profile to receive donations.',
        type: 'WARNING',
        link: '/ngo/profile',
      });
    }
  }
};

module.exports = {
  createNotification,
  getByUser,
  markAsRead,
  deleteNotification,
  checkAndCreateWalletNotification,
};
