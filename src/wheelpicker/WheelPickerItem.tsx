import React from 'react';
import {StyleProp, TextStyle, Animated, Text, ViewStyle} from 'react-native';
import styles from './WheelPicker.styles.ts';

interface ItemProps {
  textStyle: StyleProp<TextStyle>;
  style: StyleProp<ViewStyle>;
  option: string | null;
  height: number;
  index: number;
  currentScrollIndex: Animated.AnimatedAddition;
  visibleRest: number;
  rotationFunction: (x: number) => number;
  opacityFunction: (x: number) => number;
  scaleFunction: (x: number) => number;
  wheelType: string;
}

const WheelPickerItem: React.FC<ItemProps> = ({
  textStyle,
  style,
  height,
  option,
  index,
  visibleRest = 3,
  currentScrollIndex,
  opacityFunction,
  rotationFunction,
  scaleFunction,
  wheelType,
}) => {
  const relativeScrollIndex = Animated.subtract(index, currentScrollIndex);

  const translateX = relativeScrollIndex.interpolate({
    inputRange: (() => {
      const range = [0];

      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-i);

        range.push(i);
      }
      console.log(range, 'input');

      return range;
    })(),

    outputRange: (() => {
      // const range = [-1];
      const range = [wheelType === 'right' ? -1 : wheelType === 'left' ? 1 : 0];

      const offset =
        wheelType === 'right' ? 1.5 : wheelType === 'left' ? -1.5 : 0; // Adjust this value for more or less 3D effect

      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-offset * i);

        range.push(-offset * i);
      }
      console.log(range, 'output', wheelType);

      return range;
    })(),
  });

  const translateY = relativeScrollIndex.interpolate({
    inputRange: (() => {
      const range = [0];
      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-i);
        range.push(i);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [0];
      for (let i = 1; i <= 3 + 1; i++) {
        let y =
          (height / 2) * (1 - Math.sin(Math.PI / 2 - rotationFunction(i)));
        for (let j = 1; j < i; j++) {
          y += height * (1 - Math.sin(Math.PI / 2 - rotationFunction(j)));
        }
        range.unshift(y);
        range.push(-y);
      }
      return range;
    })(),
  });

  const opacity = relativeScrollIndex.interpolate({
    inputRange: (() => {
      const range = [0];
      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-i);
        range.push(i);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [0.2, 0.2, 0.4, 0.6, 1, 0.6, 0.4, 0.2, 0.2];
      return range;
    })(),
  });

  const scale = relativeScrollIndex.interpolate({
    inputRange: (() => {
      const range = [0];
      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-i);
        range.push(i);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [0.9, 0.9, 0.9, 0.95, 0.95, 0.95, 0.9, 0.9, 0.9];
      return range;
    })(),
  });

  const rotateX = relativeScrollIndex.interpolate({
    inputRange: (() => {
      const range = [0];
      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-i);
        range.push(i);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [
        '-75deg',
        '-55deg',
        '-30deg',
        '-15deg',
        '0deg',
        '15deg',
        '35deg',
        '55deg',
        '75deg',
      ];
      return range;
    })(),
  });

  const rotateY = relativeScrollIndex.interpolate({
    inputRange: (() => {
      const range = [0];
      for (let i = 1; i <= 3 + 1; i++) {
        range.unshift(-i);
        range.push(i);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [
        '0deg',
        '0deg',
        '0deg',
        '0deg',
        '0deg',
        '0deg',
        '0deg',
        '0deg',
        '0deg',
      ];
      console.log(
        range.map(deg =>
          wheelType === 'right'
            ? deg
            : wheelType === 'left'
            ? `-${deg}`
            : '0deg',
        ),
        '---------------',
      );

      return range;
    })(),
  });
  const scaleY = relativeScrollIndex.interpolate({
    inputRange: [-4, -3, -2, -1, 0, 1, 2, 3, 4],

    outputRange: [0.8, 0.85, 0.9, 0.9, 1, 0.9, 0.9, 0.85, 0.8],

    extrapolate: 'clamp', // Prevents the height from going below the minimum value
  });
  const scaleX = 1;
  return (
    <Animated.View
      style={[
        styles.option,
        style,
        {
          height,
          opacity,
          transform: [
            {translateY},
            {rotateX},
            {translateX},
            {rotateY},
            {scaleX},
            {scaleY},
            // {scale},
          ],
        },
      ]}>
      <Text style={textStyle}>{option}</Text>
    </Animated.View>
  );
};

export default React.memo(
  WheelPickerItem,
  /**
   * We enforce that this component will not rerender after the initial render.
   * Therefore props that change on every render like style objects or functions
   * do not need to be wrapped into useMemo and useCallback.
   */
  () => true,
);
