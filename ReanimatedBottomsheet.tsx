/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
    const inset = useSafeAreaInsets();
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const gestureStartY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const isBottomSheetOpened = useSharedValue(false);
    const isBottomSheetOpening = useSharedValue(false);
    const isVisibleState = useSharedValue(false);
    const [isVisible, setIsVisible] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const [originalPosition, setOriginalPosition] =
      useState<number>(SCREEN_HEIGHT);

    useDerivedValue(() => {
      runOnJS(setIsVisible)(isVisibleState.value);
    }, [isVisibleState]);

    const scrollHandler = useAnimatedScrollHandler(event => {
      'worklet';
      scrollOffset.value = event.contentOffset.y;
    });

    const open = (snapIndex = -1) => {
      if (contentHeight === 0) {
        isBottomSheetOpening.value = true;
        isVisibleState.set(true);
        return;
      }
      if (isBottomSheetOpened.value) {
        return;
      }

      let targetSnapPoint: number;

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

      isBottomSheetOpened.value = true;

      translateY.value = withTiming(SCREEN_HEIGHT - targetSnapPoint, {}, () => {
        isBottomSheetOpening.value = false;
      });
      setOriginalPosition(SCREEN_HEIGHT - targetSnapPoint);
    };

    const close = () => {
      'worklet';
      translateY.value = withTiming(SCREEN_HEIGHT, {}, () => {
        isVisibleState.set(false);
        runOnJS(setContentHeight)(0);
        isBottomSheetOpened.value = false;
      });
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
        close();
      } else {
        translateY.value = withTiming(SCREEN_HEIGHT - snapPoints[closestIndex]);
      }
    };

    const bottomSheetStyle = useAnimatedStyle(() => {
      'worklet';
      return {
        top: translateY.value,
      };
    });

    const tapHandler = Gesture.Tap().onEnd(() => {
      close();
    });

    const panHandler = Gesture.Pan()
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
      })
      .onEnd(event => {
        'worklet';
        const isMovingDown = event.translationY > 0;
        const isFastMovement = Math.abs(event.velocityY) > 1000;

        if (isMovingDown && isFastMovement) {
          close();
        } else {
          snapToNearestPoint();
        }
      });

    const combinedHandler = Gesture.Exclusive(panHandler, tapHandler);

    const handleContentLayout = (_: number, height: number) => {
      if (!isVisibleState.value || isBottomSheetOpened.value) {
        return;
      }

      if (contentHeight !== height) {
        runOnJS(setContentHeight)(height);
      }
    };

    useEffect(() => {
      if (contentHeight <= 0) {
        return;
      }

      const timer = setTimeout(() => {
        'worklet';
        // if (isBottomSheetOpening) {
        //   return;
        // }
        if (isBottomSheetOpened.value) {
          isBottomSheetOpened.value = false;
        }
        runOnJS(open)();
      }, 200);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentHeight]);

    const overlayStyle = useAnimatedStyle(() => {
      'worklet';
      const progress = (SCREEN_HEIGHT - translateY.value) / SCREEN_HEIGHT;
      return {
        backgroundColor: `rgba(0, 0, 0, ${Math.min(progress, 0.5)})`,
        opacity: progress * 2,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      };
    });
    const keyboardDidHide = () => {
      translateY.value = withTiming(originalPosition, {duration: 300});
    };

    useEffect(() => {
      const keyboardDidShow = (event: {endCoordinates: {height: any}}) => {
        const keyboardHeight = event.endCoordinates.height;

        const currentBottomSheetTop =
          SCREEN_HEIGHT - translateY.value - contentHeight;

        if (currentBottomSheetTop < keyboardHeight) {
          const adjustment = keyboardHeight - currentBottomSheetTop;

          translateY.value = withTiming(translateY.value - adjustment, {
            duration: 300,
          });
        }
      };

      const showSubscription = Keyboard.addListener(
        'keyboardDidShow',
        keyboardDidShow,
      );
      const hideSubscription = Keyboard.addListener(
        'keyboardDidHide',
        keyboardDidHide,
      );

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translateY, snapToNearestPoint, contentHeight]);

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={close}>
        <GestureHandlerRootView>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            {/* Overlay */}
            <GestureDetector gesture={combinedHandler}>
              <Animated.View style={[overlayStyle, styles.overlay]} />
            </GestureDetector>

            {/* Bottom Sheet */}
            <Animated.View
              style={[
                styles.container,
                bottomSheetStyle,
                {paddingBottom: inset.bottom},
              ]}>
              <GestureDetector gesture={panHandler}>
                <Animated.View style={{height: 20}}>
                  <View style={styles.handle} />
                </Animated.View>
              </GestureDetector>
              <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={100}
                automaticallyAdjustKeyboardInsets
                onContentSizeChange={handleContentLayout}>
                {children}
              </Animated.ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    // ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
