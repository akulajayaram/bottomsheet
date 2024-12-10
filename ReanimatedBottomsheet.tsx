/* eslint-disable react-native/no-inline-styles */
import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import {View, StyleSheet, Dimensions, Modal} from 'react-native';
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
  runOnJS,
} from 'react-native-reanimated';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type ReanimatedBottomsheetProps = {
  children: React.ReactNode;
  snapPoints?: number[];
};

export type ReanimatedBottomsheetRef = {
  present: (snapIndex?: number) => void;
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
        0,
        SCREEN_HEIGHT / 4,
        SCREEN_HEIGHT / 3,
        SCREEN_HEIGHT / 2,
        SCREEN_HEIGHT * 0.6,
        SCREEN_HEIGHT * 0.8,
        SCREEN_HEIGHT * 0.95,
      ],
    },
    ref,
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const gestureStartY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const paddingBottom = useSharedValue(20);
    const currentTranslateY = useRef(SCREEN_HEIGHT);

    const [isVisible, setIsVisible] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    const scrollHandler = useAnimatedScrollHandler(event => {
      scrollOffset.value = event.contentOffset.y;
    });

    const open = (snapIndex = -1) => {
      if (contentHeight === 0) {
        setIsVisible(true);
        return;
      }

      let targetSnapPoint: number;
      runOnJS(setIsVisible)(true);

      if (snapIndex === -1) {
        const closestIndex = snapPoints.reduce((prevIndex, curr, index) => {
          const prevDistance = Math.abs(contentHeight - snapPoints[prevIndex]);
          const currDistance = Math.abs(contentHeight - curr);
          return currDistance < prevDistance ? index : prevIndex;
        }, 0);

        targetSnapPoint =
          snapPoints[closestIndex + 1] || snapPoints[closestIndex];
      } else {
        targetSnapPoint = snapPoints[snapIndex] || snapPoints[0];
      }

      translateY.value = withSpring(
        SCREEN_HEIGHT - targetSnapPoint,
        {
          damping: 15,
          stiffness: 100,
          mass: 1,
        },
        () => {
          currentTranslateY.current = SCREEN_HEIGHT - targetSnapPoint;
        },
      );
    };
    const close = () => {
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          'worklet';
          currentTranslateY.current = SCREEN_HEIGHT;
          paddingBottom.value = 0;
          runOnJS(setIsVisible)(false);
        },
      );
    };
    useImperativeHandle(ref, () => ({
      present: open,
      close,
    }));

    const snapToNearestPoint = () => {
      'worklet';
      const distances = snapPoints.map(point =>
        Math.abs(translateY.value - (SCREEN_HEIGHT - point)),
      );
      const closestIndex = distances.indexOf(Math.min(...distances));

      if (snapPoints[closestIndex] === 0) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(
          SCREEN_HEIGHT - snapPoints[closestIndex],
          {},
          () => {
            currentTranslateY.current =
              SCREEN_HEIGHT - snapPoints[closestIndex];
          },
        );
      }
    };

    const bottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{translateY: translateY.value}],
      };
    });

    const tapHandler = Gesture.Tap().onEnd(() => {
      runOnJS(close)();
    });
    const panHandler = Gesture.Pan()
      .onBegin(() => {
        gestureStartY.value = translateY.value;
      })
      .onChange(event => {
        const newTranslateY = gestureStartY.value + event.translationY;
        translateY.value = Math.max(
          Math.min(newTranslateY, SCREEN_HEIGHT),
          SCREEN_HEIGHT - snapPoints[snapPoints.length - 1],
        );
        paddingBottom.value = Math.max(translateY.value, 0) + 20;
      })
      .onFinalize(event => {
        const isMovingDown = event.translationY > 0;
        const isFastMovement = Math.abs(event.velocityY) > 1000;

        if (isMovingDown && isFastMovement) {
          runOnJS(close)();
        } else {
          snapToNearestPoint();
        }
      });
    const combinedHandler = Gesture.Exclusive(panHandler, tapHandler);

    const contentContainerStyle = useAnimatedStyle(() => {
      return {
        paddingBottom: paddingBottom.value,
      };
    });

    const handleContentLayout = (_: number, height: number) => {
      runOnJS(setContentHeight)(height);
    };

    useEffect(() => {
      if (contentHeight > 0) {
        open();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentHeight]);

    const overlayStyle = useAnimatedStyle(() => {
      const progress = (SCREEN_HEIGHT - translateY.value) / SCREEN_HEIGHT;
      return {
        backgroundColor: `rgba(0, 0, 0, ${Math.min(progress, 0.5)})`,
        opacity: progress,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      };
    });

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={close}>
        <GestureHandlerRootView style={styles.modalContainer}>
          {/* Overlay */}
          <GestureDetector gesture={combinedHandler}>
            <Animated.View style={[overlayStyle, styles.overlay]} />
          </GestureDetector>
          {/* Bottom Sheet */}
          <GestureHandlerRootView style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.container,
                bottomSheetStyle,
                contentContainerStyle,
              ]}>
              <GestureDetector gesture={panHandler}>
                <Animated.View style={{height: 20}}>
                  <View style={styles.handle} />
                </Animated.View>
              </GestureDetector>
              <Animated.ScrollView
                onScroll={scrollHandler}
                onContentSizeChange={handleContentLayout}>
                {children}
              </Animated.ScrollView>
            </Animated.View>
          </GestureHandlerRootView>
        </GestureHandlerRootView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  container: {
    width: '100%',
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
