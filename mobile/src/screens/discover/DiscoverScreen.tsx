import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecommendationItem } from '../../api/types';
import { apiClient } from '../../api/client';
import { Input, Button, Card, SkeletonLoader, IconButton, Icon } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RecommendationCard } from './RecommendationCard';
import { FilterModal, FilterCriteria } from './FilterModal';
import { InviteModal } from './InviteModal';

const DEFAULT_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-1',
    type: 'candidate',
    title: 'Elena Rostova',
    subtitle: 'Full-Stack Developer & AI Enthusiast',
    description: 'Specializes in NestJS backend architectures, Upstash Redis, and React Native mobile development. Ready to build high-scale solutions.',
    avatarUrl: null,
    college: 'MIT Computer Science',
    availableHoursWeek: 25,
    matchScore: 0.94,
    breakdown: {
      skillCoverage: 0.95,
      complementarySkills: 0.90,
      availabilityMatch: 0.96,
      interestOverlap: 0.92,
      experienceLevel: 0.98,
    },
    skills: ['React Native', 'NestJS', 'TypeScript', 'Docker', 'Redis'],
    aiReasoning: [
      'Direct match on mobile React Native and TypeScript stack',
      'Provides high weekly availability matching hackathon cadence (25 hrs/wk)',
      'Demonstrated experience with Redis caching and NestJS architectures',
    ],
  },
  {
    id: 'rec-2',
    type: 'project',
    title: 'NeuroVision Health',
    subtitle: 'HackMIT 2026 Innovation Track',
    description: 'Building real-time on-device biomedical image processing and diagnostic alerting for rural healthcare clinics.',
    avatarUrl: null,
    college: 'Stanford Medical Tech Lab',
    availableHoursWeek: 20,
    matchScore: 0.88,
    breakdown: {
      skillCoverage: 0.85,
      complementarySkills: 0.95,
      availabilityMatch: 0.88,
      interestOverlap: 0.90,
      experienceLevel: 0.82,
    },
    skills: ['Python', 'PyTorch', 'React Native', 'Computer Vision'],
    aiReasoning: [
      'Complementary skill match: team requires a mobile frontend lead for their PyTorch model',
      'High overlap in AI healthcare and social impact interests',
    ],
  },
  {
    id: 'rec-3',
    type: 'candidate',
    title: 'Marcus Chen',
    subtitle: 'UI/UX Designer & Frontend Engineer',
    description: 'Focuses on sleek mobile animations, accessible design systems, and Figma design tokens mapped to native code.',
    avatarUrl: null,
    college: 'UC Berkeley EECS',
    availableHoursWeek: 18,
    matchScore: 0.82,
    breakdown: {
      skillCoverage: 0.78,
      complementarySkills: 0.92,
      availabilityMatch: 0.85,
      interestOverlap: 0.80,
      experienceLevel: 0.80,
    },
    skills: ['Figma', 'UI/UX Design', 'React Native', 'CSS/Design Tokens'],
    aiReasoning: [
      'Fills critical UI/UX design and design system ownership gap',
      'Excellent track record in hackathon product presentations and design awards',
    ],
  },
  {
    id: 'rec-4',
    type: 'project',
    title: 'BlockVote Campus',
    subtitle: 'Ethereum Student DAO Election Platform',
    description: 'Decentralized voting mobile client with zero-knowledge identity verification for student university elections.',
    avatarUrl: null,
    college: 'Harvard Innovation Labs',
    availableHoursWeek: 15,
    matchScore: 0.76,
    breakdown: {
      skillCoverage: 0.72,
      complementarySkills: 0.80,
      availabilityMatch: 0.78,
      interestOverlap: 0.85,
      experienceLevel: 0.70,
    },
    skills: ['Solidity', 'TypeScript', 'Web3', 'React Native'],
    aiReasoning: [
      'Strong cross-domain alignment with TypeScript and mobile frontend frameworks',
    ],
  },
  {
    id: 'rec-5',
    type: 'candidate',
    title: 'Priya Sharma',
    subtitle: 'Data Engineer & Cloud Systems Architect',
    description: 'Prisma ORM, PostgreSQL database sharding, and real-time WebSocket pipelines for collaborative mobile applications.',
    avatarUrl: null,
    college: 'Georgia Tech Computing',
    availableHoursWeek: 20,
    matchScore: 0.71,
    breakdown: {
      skillCoverage: 0.68,
      complementarySkills: 0.84,
      availabilityMatch: 0.75,
      interestOverlap: 0.70,
      experienceLevel: 0.65,
    },
    skills: ['PostgreSQL', 'Prisma', 'NestJS', 'GraphQL', 'AWS'],
    aiReasoning: [
      'Offers high backend reliability for database queries and API design',
    ],
  },
];

export const DiscoverScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<RecommendationItem[]>(DEFAULT_RECOMMENDATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedInviteItem, setSelectedInviteItem] = useState<RecommendationItem | null>(null);
  const [invitedIds, setInvitedIds] = useState<Record<string, boolean>>({});
  const [criteria, setCriteria] = useState<FilterCriteria>({
    type: 'all',
    category: 'All',
    minScore: 0,
    minHours: 0,
  });

  const handleConnect = (item: RecommendationItem) => {
    setSelectedInviteItem(item);
  };

  const handleInviteSuccess = (itemId: string) => {
    setInvitedIds((prev) => ({ ...prev, [itemId]: true }));
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<RecommendationItem[]>('/recommendations');
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Merge real backend recommendations with dummy items (real items prioritized)
        const realIds = new Set(response.data.map((r) => r.id));
        const merged = [
          ...response.data,
          ...DEFAULT_RECOMMENDATIONS.filter((d) => !realIds.has(d.id)),
        ];
        setItems(merged);
      } else {
        setItems(DEFAULT_RECOMMENDATIONS);
      }
    } catch {
      // Use loaded recommendations
      setItems(DEFAULT_RECOMMENDATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search query
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        item.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      // Type filter
      const matchesType = criteria.type === 'all' || item.type === criteria.type;

      // Min score filter
      const matchesScore = Math.round(item.matchScore * 100) >= criteria.minScore;

      // Min hours filter
      const matchesHours = (item.availableHoursWeek || 0) >= criteria.minHours;

      return matchesSearch && matchesType && matchesScore && matchesHours;
    });
  }, [items, search, criteria]);

  const hasActiveFilters =
    criteria.type !== 'all' ||
    criteria.category !== 'All' ||
    criteria.minScore > 0 ||
    criteria.minHours > 0;

  return (
    <View style={styles.container}>
      {/* Search & Filter Header */}
      <View style={[styles.searchHeader, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
        <View style={styles.searchInputWrap}>
          <Input
            placeholder="Search skills, teammates, projects..."
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchContainer}
            leftIcon={<Icon name="search" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />}
          />
        </View>

        <IconButton
          icon={<Icon name="filter" size={18} color={hasActiveFilters ? colors.textPrimary : colors.secondaryLight} />}
          variant={hasActiveFilters ? 'primary' : 'default'}
          badgeCount={hasActiveFilters ? 1 : 0}
          onPress={() => setFilterModalVisible(true)}
          accessibilityLabel="Open filters"
        />
      </View>

      {/* Segmented Type Bar */}
      <View style={styles.segmentBar}>
        {(['all', 'candidate', 'project'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            activeOpacity={0.8}
            style={[styles.segmentTab, criteria.type === t && styles.segmentTabActive]}
            onPress={() => setCriteria((prev) => ({ ...prev, type: t }))}
          >
            <Text
              style={[
                styles.segmentText,
                criteria.type === t && styles.segmentTextActive,
              ]}
            >
              {t === 'all' ? 'All Matches' : t === 'candidate' ? 'Teammates' : 'Projects'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FlashList Feed */}
      {isLoading && items.length === 0 ? (
        <View style={styles.loadingFeed}>
          <SkeletonLoader height={240} style={styles.skeletonCard} />
          <SkeletonLoader height={240} style={styles.skeletonCard} />
        </View>
      ) : filteredItems.length === 0 ? (
        <Card variant="elevated" style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Recommendations Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search query or relaxing your filter parameters.
          </Text>
          <Button
            title="Reset Filters"
            variant="outline"
            size="sm"
            onPress={() => {
              setSearch('');
              setCriteria({
                type: 'all',
                category: 'All',
                minScore: 0,
                minHours: 0,
              });
            }}
            style={styles.resetBtn}
          />
        </Card>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecommendationCard
              item={item}
              onConnect={handleConnect}
              isInvited={Boolean(invitedIds[item.id])}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        criteria={criteria}
        onApply={(newCriteria) => setCriteria(newCriteria)}
      />

      <InviteModal
        visible={!!selectedInviteItem}
        item={selectedInviteItem}
        onClose={() => setSelectedInviteItem(null)}
        onSuccess={handleInviteSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  searchInputWrap: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 0,
  },
  filterButton: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderColor: colors.student,
    backgroundColor: colors.studentSubtle,
  },
  filterIcon: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterIconActive: {
    color: colors.student,
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  segmentTabActive: {
    backgroundColor: colors.student,
  },
  segmentText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.textDark,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.huge,
  },
  loadingFeed: {
    padding: spacing.md,
  },
  skeletonCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
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
    marginBottom: spacing.md,
  },
  resetBtn: {
    minWidth: 140,
  },
});
