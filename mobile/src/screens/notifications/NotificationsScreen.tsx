import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNotificationsStore, AppNotification, TeamInvitation } from '../../store/notificationsStore';
import { Header, Card, Badge, Button, LoadingScreen } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { InvitationActionModal } from './InvitationActionModal';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    invitations,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isLoading,
  } = useNotificationsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeInvitation, setActiveInvitation] = useState<TeamInvitation | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notif: AppNotification) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }

    if (notif.type === 'INVITATION' && notif.referenceId) {
      const found = invitations.find((i) => i.id === notif.referenceId) || {
        id: notif.referenceId,
        teamId: 'tm-1',
        teamName: 'VectorPulse Hackers',
        senderName: 'Marcus Chen',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      setActiveInvitation(found);
    }
  };

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'INVITATION':
        return '🤝';
      case 'MATCH':
        return '⚡';
      case 'HACKATHON_ALERT':
        return '🏆';
      default:
        return '🔔';
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <LoadingScreen
        message="Loading Notifications..."
        subtitle="Retrieving real-time alerts & invitations"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
        rightAction={
          unreadCount > 0 ? (
            <Button
              title="Mark All Read"
              variant="outline"
              size="sm"
              onPress={markAllAsRead}
            />
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {notifications.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Match alerts, team invitations, and hackathon updates will appear here.
            </Text>
          </Card>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(notif)}
            >
              <Card
                variant="elevated"
                style={[
                  styles.notifCard,
                  !notif.isRead && styles.unreadCard,
                ]}
              >
                <View style={styles.notifRow}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>{getTypeIcon(notif.type)}</Text>
                  </View>

                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      {!notif.isRead && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.bodyText}>{notif.body}</Text>

                    {notif.type === 'INVITATION' && (
                      <View style={styles.actionRow}>
                        <Badge label="Action Required: Respond to Invite" variant="primary" size="sm" />
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {activeInvitation && (
        <InvitationActionModal
          visible={!!activeInvitation}
          onClose={() => setActiveInvitation(null)}
          invitation={activeInvitation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  notifCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unreadCard: {
    borderColor: colors.studentAccent,
    backgroundColor: colors.surfaceElevated,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.studentAccent,
    marginLeft: spacing.xs,
  },
  bodyText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xxs,
  },
  actionRow: {
    marginTop: spacing.xs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
