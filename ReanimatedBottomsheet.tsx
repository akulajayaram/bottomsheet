import React, {useRef, forwardRef, useImperativeHandle, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type ReanimatedBottomsheetProps = {
  children: React.ReactNode;
  snapPoints?: number[];
};

export type ReanimatedBottomsheetRef = {
  open: (snapIndex?: number) => void;
  close: () => void;
};

const ReanimatedBottomsheet = forwardRef<
  ReanimatedBottomsheetRef,
  ReanimatedBottomsheetProps
>(
  (
    {
      children,
      snapPoints = [
        SCREEN_HEIGHT / 4,
        SCREEN_HEIGHT / 3,
        SCREEN_HEIGHT / 2,
        SCREEN_HEIGHT * 0.6,
        SCREEN_HEIGHT * 0.8,
        SCREEN_HEIGHT * 0.9,
      ],
    },
    ref,
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT); // Start fully hidden
    const gestureStartY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const paddingBottom = useSharedValue(20);
    const currentTranslateY = useRef(SCREEN_HEIGHT);

    const [contentHeight, setContentHeight] = useState(0); // To store the content height

    const scrollHandler = useAnimatedScrollHandler(event => {
      scrollOffset.value = event.contentOffset.y;
    });

    useImperativeHandle(ref, () => ({
      open: (snapIndex = -1) => {
        let targetSnapPoint: number;

        if (snapIndex === -1) {
          // If no snapIndex is provided, snap based on content height
          const closestIndex = snapPoints.reduce((prev, curr) => {
            const prevDistance = Math.abs(contentHeight - prev);
            const currDistance = Math.abs(contentHeight - curr);
            return currDistance < prevDistance ? curr : prev;
          }, snapPoints[0]);

          targetSnapPoint = closestIndex + 1;
        } else {
          targetSnapPoint = snapPoints[snapIndex] || snapPoints[0];
        }

        translateY.value = withSpring(
          SCREEN_HEIGHT - targetSnapPoint,
          {
            damping: 30, // controls how much the spring resists movement
            stiffness: 250, // controls the speed of the spring movement
            mass: 1,
          },
          () => {
            currentTranslateY.current = SCREEN_HEIGHT - targetSnapPoint;
          },
        );
      },
      close: () => {
        translateY.value = withTiming(
          SCREEN_HEIGHT,
          {
            duration: 300,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            currentTranslateY.current = SCREEN_HEIGHT;
          },
        );
      },
    }));

    const snapToNearestPoint = () => {
      'worklet';
      const distances = snapPoints.map(point =>
        Math.abs(translateY.value - (SCREEN_HEIGHT - point)),
      );
      const closestIndex = distances.indexOf(Math.min(...distances));

      translateY.value = withSpring(
        SCREEN_HEIGHT - snapPoints[closestIndex],
        {},
        () => {
          currentTranslateY.current = SCREEN_HEIGHT - snapPoints[closestIndex];
        },
      );
    };

    const bottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{translateY: translateY.value}],
      };
    });

    const panhandler = Gesture.Pan()
      .onBegin(() => {
        'worklet';
        gestureStartY.value = translateY.value;
      })
      .onChange(event => {
        'worklet';
        const newTranslateY = gestureStartY.value + event.translationY;
        translateY.value = Math.max(
          Math.min(newTranslateY, SCREEN_HEIGHT),
          SCREEN_HEIGHT - snapPoints[snapPoints.length - 1],
        );
        paddingBottom.value = Math.max(translateY.value, 0) + 20;
      })
      .onFinalize(() => {
        'worklet';
        snapToNearestPoint();
      });

    // Handle ScrollView content layout
    const handleContentLayout = (_: number, height: number) => {
      setContentHeight(height);
    };

    const contentContainerStyle = useAnimatedStyle(() => {
      return {
        paddingBottom: paddingBottom.value,
      };
    });

    return (
      <GestureHandlerRootView>
        <Animated.View style={[styles.container, bottomSheetStyle]}>
          <GestureDetector gesture={panhandler}>
            <Animated.View>
              <View style={styles.handle} />
            </Animated.View>
          </GestureDetector>
          <Animated.ScrollView
            onScroll={scrollHandler}
            onContentSizeChange={handleContentLayout}
            contentContainerStyle={contentContainerStyle}>
            {children}
          </Animated.ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: 'pink',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default ReanimatedBottomsheet;
