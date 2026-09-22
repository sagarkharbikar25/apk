import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';
import { IconButton } from '../src/components/ui/IconButton';
import { Header } from '../src/components/ui/Header';
import { SplashScreen } from '../src/screens/splash/SplashScreen';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

describe('Splash & Reusable Components Unit Tests', () => {
  describe('LoadingScreen', () => {
    it('renders with custom message and subtitle', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <LoadingScreen
            message="Connecting to Gemini AI..."
            subtitle="Matching hackathon profiles"
          />
        );
      });

      const texts = testRenderer.root.findAllByType(Text);
      const msg = texts.find((t: any) => t.props.children === 'Connecting to Gemini AI...');
      expect(msg).toBeTruthy();

      const subtitle = texts.find((t: any) => t.props.children === 'Matching hackathon profiles');
      expect(subtitle).toBeTruthy();

      const spinner = testRenderer.root.findByType(ActivityIndicator);
      expect(spinner).toBeTruthy();
    });
  });

  describe('IconButton', () => {
    it('renders text icon and responds to onPress', () => {
      const onPressMock = jest.fn();
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <IconButton icon="🔍" onPress={onPressMock} />
        );
      });

      const touchable = testRenderer.root.findByType(TouchableOpacity);
      expect(touchable).toBeTruthy();

      ReactTestRenderer.act(() => {
        touchable.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('renders badge count when greater than 0', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <IconButton icon="🔔" onPress={jest.fn()} badgeCount={5} />
        );
      });

      const texts = testRenderer.root.findAllByType(Text);
      const badge = texts.find((t: any) => t.props.children === 5);
      expect(badge).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('renders title, subtitle, and fires back callback', () => {
      const onBackMock = jest.fn();
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Header
            title="Manage Skills"
            subtitle="Choose your proficiencies"
            onBack={onBackMock}
          />
        );
      });

      const texts = testRenderer.root.findAllByType(Text);
      const title = texts.find((t: any) => t.props.children === 'Manage Skills');
      expect(title).toBeTruthy();

      const backBtn = testRenderer.root.findByType(TouchableOpacity);
      ReactTestRenderer.act(() => {
        backBtn.props.onPress();
      });
      expect(onBackMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('SplashScreen', () => {
    it('renders brand title and live status indicator', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(<SplashScreen />);
      });

      const texts = testRenderer.root.findAllByType(Text);
      const brand = texts.find((t: any) => t.props.children === 'SkillSync');
      expect(brand).toBeTruthy();

      const accent = texts.find(
        (t: any) => t.props.children === 'AI HACKATHON COLLABORATION'
      );
      expect(accent).toBeTruthy();
    });
  });
});
