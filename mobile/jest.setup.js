/* eslint-disable no-undef */

jest.mock('react-native-screens', () => {
  const RN = require('react-native');
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => true),
    NativeScreen: RN.View,
    NativeScreenContainer: RN.View,
    Screen: RN.View,
    ScreenContainer: RN.View,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }: any) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }: any) => children,
      Screen: () => null,
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: any) => children,
      Screen: () => null,
    }),
  };
});

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent }: any) => {
      if (!data || data.length === 0) {
        return ListEmptyComponent ? React.createElement(ListEmptyComponent) : null;
      }
      return React.createElement(
        RN.View,
        null,
        data.map((item: any, index: number) =>
          renderItem({ item, index, target: 'Cell' })
        )
      );
    },
  };
});
