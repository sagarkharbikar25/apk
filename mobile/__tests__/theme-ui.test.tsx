import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Avatar } from '../src/components/ui/Avatar';
import { SkeletonLoader } from '../src/components/ui/SkeletonLoader';
import { Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

describe('UI Primitives Unit Tests', () => {
  describe('Button component', () => {
    it('renders with given title and triggers onPress', () => {
      const onPressMock = jest.fn();
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Button title="Continue" onPress={onPressMock} />
        );
      });

      const buttonTouchable = testRenderer.root.findByType(TouchableOpacity);
      expect(buttonTouchable).toBeTruthy();

      const textNode = testRenderer.root.findByType(Text);
      expect(textNode.props.children).toContain('Continue');

      ReactTestRenderer.act(() => {
        buttonTouchable.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('renders ActivityIndicator when isLoading is true', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Button title="Save" isLoading={true} />
        );
      });

      const indicator = testRenderer.root.findByType(ActivityIndicator);
      expect(indicator).toBeTruthy();
    });
  });

  describe('Input component', () => {
    it('renders label, placeholder, and triggers onChangeText', () => {
      const onChangeMock = jest.fn();
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Input
            label="Email Address"
            placeholder="user@college.edu"
            onChangeText={onChangeMock}
          />
        );
      });

      const textInputs = testRenderer.root.findAllByType(TextInput);
      expect(textInputs.length).toBe(1);
      expect(textInputs[0].props.placeholder).toBe('user@college.edu');

      ReactTestRenderer.act(() => {
        textInputs[0].props.onChangeText('test@college.edu');
      });
      expect(onChangeMock).toHaveBeenCalledWith('test@college.edu');
    });

    it('renders error message when error prop is provided', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Input
            label="Password"
            error="Password must be at least 8 characters"
          />
        );
      });

      const texts = testRenderer.root.findAllByType(Text);
      const errorText = texts.find((t: any) =>
        t.props.children === 'Password must be at least 8 characters'
      );
      expect(errorText).toBeTruthy();
    });

    it('toggles secureTextEntry when eye button is pressed', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Input
            label="Password"
            isPassword={true}
          />
        );
      });

      const textInput = testRenderer.root.findByType(TextInput);
      expect(textInput.props.secureTextEntry).toBe(true);

      const toggleBtn = testRenderer.root.findByType(TouchableOpacity);
      ReactTestRenderer.act(() => {
        toggleBtn.props.onPress();
      });

      expect(textInput.props.secureTextEntry).toBe(false);
    });
  });

  describe('Card component', () => {
    it('renders card and fires onPress when pressable', () => {
      const onPressMock = jest.fn();
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Card onPress={onPressMock}>
            <Text>Card Content</Text>
          </Card>
        );
      });

      const touchable = testRenderer.root.findByType(TouchableOpacity);
      expect(touchable).toBeTruthy();
      ReactTestRenderer.act(() => {
        touchable.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Badge component', () => {
    it('renders label and handles remove callback', () => {
      const onRemoveMock = jest.fn();
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(
          <Badge label="TypeScript" variant="primary" onRemove={onRemoveMock} />
        );
      });

      const texts = testRenderer.root.findAllByType(Text);
      const labelText = texts.find((t: any) => t.props.children === 'TypeScript');
      expect(labelText).toBeTruthy();

      const touchables = testRenderer.root.findAllByType(TouchableOpacity);
      expect(touchables.length).toBe(1);
      ReactTestRenderer.act(() => {
        touchables[0].props.onPress();
      });
      expect(onRemoveMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Avatar component', () => {
    it('computes 2-letter initials from full name', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(<Avatar name="Alex Johnson" size={48} />);
      });

      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('AJ');
    });

    it('computes single-name initials correctly', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(<Avatar name="Antigravity" size={48} />);
      });

      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('AN');
    });
  });

  describe('SkeletonLoader component', () => {
    it('renders without crashing', () => {
      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(<SkeletonLoader width={100} height={20} />);
      });
      expect(testRenderer.toJSON()).toBeTruthy();
    });
  });
});
