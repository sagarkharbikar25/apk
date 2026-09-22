import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RecommendationCard } from '../src/screens/discover/RecommendationCard';
import { RecommendationItem } from '../src/api/types';
import { Text, TouchableOpacity } from 'react-native';

const mockItem: RecommendationItem = {
  id: 'test-item-1',
  type: 'candidate',
  title: 'Elena Rostova',
  subtitle: 'Full-Stack Developer',
  description: 'Specializes in NestJS and React Native mobile development.',
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
  skills: ['React Native', 'NestJS', 'TypeScript'],
  aiReasoning: [
    'Direct match on mobile React Native and TypeScript stack',
    'Provides high weekly availability matching hackathon cadence',
  ],
};

const getTextContent = (node: any): string => {
  if (!node || !node.props) return '';
  const { children } = node.props;
  if (Array.isArray(children)) {
    return children.map((c) => (typeof c === 'object' ? getTextContent(c) : String(c))).join('');
  }
  return String(children || '');
};

describe('Phase 4: Discover & Matchmaking Feed Unit Tests', () => {
  it('renders RecommendationCard title and computed score percentage', () => {
    let testRenderer: any;
    ReactTestRenderer.act(() => {
      testRenderer = ReactTestRenderer.create(
        <RecommendationCard item={mockItem} />
      );
    });

    const texts = testRenderer.root.findAllByType(Text);
    const titleText = texts.find((t: any) => getTextContent(t).includes('Elena Rostova'));
    expect(titleText).toBeTruthy();

    const scoreText = texts.find((t: any) => getTextContent(t).includes('94%'));
    expect(scoreText).toBeTruthy();
  });

  it('toggles explainable scoring factors when breakdown toggle is clicked', () => {
    let testRenderer: any;
    ReactTestRenderer.act(() => {
      testRenderer = ReactTestRenderer.create(
        <RecommendationCard item={mockItem} />
      );
    });

    // Initially breakdown is hidden
    let breakdownTitle = testRenderer.root
      .findAllByType(Text)
      .find((t: any) => getTextContent(t).includes('Explainable Scoring Factors'));
    expect(breakdownTitle).toBeUndefined();

    // Click toggle button
    const touchables = testRenderer.root.findAllByType(TouchableOpacity);
    const toggleBtn = touchables.find((touch: any) => {
      const txt = touch.findAllByType(Text);
      return txt.some((t: any) => getTextContent(t).includes('View AI Match Breakdown'));
    });

    expect(toggleBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      toggleBtn.props.onPress();
    });

    // Now breakdown is visible
    breakdownTitle = testRenderer.root
      .findAllByType(Text)
      .find((t: any) => getTextContent(t).includes('Explainable Scoring Factors'));
    expect(breakdownTitle).toBeTruthy();

    // Verify 40% skill overlap text is displayed
    const skillOverlapText = testRenderer.root
      .findAllByType(Text)
      .find((t: any) => getTextContent(t).includes('Skill Overlap (40%)'));
    expect(skillOverlapText).toBeTruthy();

    // Verify Gemini AI reasoning bullets are displayed
    const reasoningText = testRenderer.root
      .findAllByType(Text)
      .find((t: any) => getTextContent(t).includes('Direct match on mobile React Native'));
    expect(reasoningText).toBeTruthy();
  });

  it('triggers connect button callback with item', () => {
    const onConnectMock = jest.fn();
    let testRenderer: any;
    ReactTestRenderer.act(() => {
      testRenderer = ReactTestRenderer.create(
        <RecommendationCard item={mockItem} onConnect={onConnectMock} />
      );
    });

    const buttonTouchable = testRenderer.root
      .findAllByType(TouchableOpacity)
      .find((touch: any) => {
        const innerText = touch.findAllByType(Text);
        return innerText.some((t: any) => getTextContent(t).includes('Invite to Team'));
      });

    expect(buttonTouchable).toBeTruthy();

    ReactTestRenderer.act(() => {
      buttonTouchable.props.onPress();
    });

    expect(onConnectMock).toHaveBeenCalledWith(mockItem);
  });
});
