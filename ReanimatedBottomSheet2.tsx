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
import {colors} from '../../constants';
import {heightPixel, pixelSizeVertical} from '../../utils';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type ReanimatedBottomsheetProps = {
  children: React.ReactNode;
  snapPoints?: number[];
};

export type ReanimatedBottomsheetRef = {
  present: () => void;
  close: () => void;
};

const ReanimatedBottomsheet = forwardRef<
  ReanimatedBottomsheetRef,
  ReanimatedBottomsheetProps
>(({children}, ref) => {
  const inset = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const gestureStartY = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const isVisibleState = useSharedValue(false);
  const scrollBegin = useSharedValue(0);
  const isScrollEnabled = useSharedValue(true);

  const [isVisible, setIsVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [originalPosition, setOriginalPosition] =
    useState<number>(SCREEN_HEIGHT);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useDerivedValue(() => {
    runOnJS(setIsVisible)(isVisibleState.value);
  }, [isVisibleState]);

  useDerivedValue(() => {
    runOnJS(setScrollEnabled)(isScrollEnabled.value);
  }, [isScrollEnabled]);

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: event => {
      scrollBegin.value = event.contentOffset.y;
    },
    onScroll: event => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const open = () => {
    if (contentHeight === 0) {
      isVisibleState.set(true);
      return;
    }

    if (contentHeight >= SCREEN_HEIGHT * 0.9) {
      translateY.value = withTiming(SCREEN_HEIGHT * 0.1);
      setOriginalPosition(SCREEN_HEIGHT * 0.1);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT - contentHeight);
      setOriginalPosition(SCREEN_HEIGHT - contentHeight);
    }
  };

  const close = () => {
    'worklet';
    translateY.value = withTiming(SCREEN_HEIGHT, {}, () => {
      isVisibleState.set(false);
      runOnJS(setContentHeight)(0);
    });
  };

  useImperativeHandle(ref, () => ({
    present: open,
    close,
  }));

  const snapToNearestPoint = () => {
    'worklet';
    const threshholdValue =
      SCREEN_HEIGHT < contentHeight ? SCREEN_HEIGHT * 0.9 : contentHeight;

    if (SCREEN_HEIGHT - translateY.value < threshholdValue * 0.7) {
      close();
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT - threshholdValue);
    }
  };

  const bottomSheetStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      top: translateY.value,
    };
  });

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

  const tapHandler = Gesture.Tap()
    .onBegin(() => {})
    .onEnd(() => {
      close();
    });

  const overlayPanHandler = Gesture.Pan()
    .onBegin(() => {
      ('worklet');
      gestureStartY.value = translateY.value;
    })
    .onChange(event => {
      ('worklet');
      const newTranslateY = gestureStartY.value + event.translationY;
      translateY.value = Math.max(
        Math.min(newTranslateY, SCREEN_HEIGHT),
        SCREEN_HEIGHT - contentHeight,
      );
    })
    .onEnd(event => {
      ('worklet');
      const isMovingDown = event.translationY > 0;
      const isFastMovement = Math.abs(event.velocityY) > 1000;

      if (isMovingDown && isFastMovement) {
        close();
      } else {
        snapToNearestPoint();
      }
    });

  const scrollPanHandler = Gesture.Pan()
    .onBegin(() => {
      ('worklet');
      gestureStartY.value = translateY.value;
    })
    .onChange(event => {
      ('worklet');

      if (
        (scrollOffset.value === 0 && event.translationY > 0) ||
        contentHeight < SCREEN_HEIGHT
      ) {
        isScrollEnabled.value = false;
        const newTranslateY =
          gestureStartY.value + event.translationY - scrollBegin.value;

        const finalTranslateY = Math.max(
          Math.min(newTranslateY, SCREEN_HEIGHT),
          SCREEN_HEIGHT - contentHeight,
        );

        translateY.value = finalTranslateY < 0 ? 0 : finalTranslateY;
      }
    })
    .onEnd(() => {
      ('worklet');
      if (!isScrollEnabled.value) {
        snapToNearestPoint();
      }
      isScrollEnabled.value = true;
    });

  const panHandler = Gesture.Pan()
    .onBegin(() => {
      ('worklet');
      gestureStartY.value = translateY.value;
    })
    .onChange(event => {
      ('worklet');
      const newTranslateY = gestureStartY.value + event.translationY;
      translateY.value = Math.max(
        Math.min(newTranslateY, SCREEN_HEIGHT),
        SCREEN_HEIGHT - contentHeight,
      );
    })
    .onEnd(event => {
      ('worklet');
      const isMovingDown = event.translationY > 0;
      const isFastMovement = Math.abs(event.velocityY) > 1000;

      if (isMovingDown && isFastMovement) {
        close();
      } else {
        snapToNearestPoint();
      }
    });

  const scrollViewGesture = Gesture.Native();

  const handleContentLayout = (_: number, height: number) => {
    if (contentHeight !== height) {
      runOnJS(setContentHeight)(height + heightPixel(60));
    }
  };

  useEffect(() => {
    if (contentHeight <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      'worklet';
      runOnJS(open)();
    }, 200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentHeight]);

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
          <GestureDetector
            gesture={Gesture.Exclusive(overlayPanHandler, tapHandler)}>
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
              <Animated.View style={{height: heightPixel(25)}}>
                <View style={styles.handle} />
              </Animated.View>
            </GestureDetector>

            <GestureDetector
              gesture={Gesture.Simultaneous(
                scrollViewGesture,
                scrollPanHandler,
              )}>
              <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEnabled={scrollEnabled}
                contentContainerStyle={{
                  paddingBottom:
                    contentHeight > SCREEN_HEIGHT ? pixelSizeVertical(90) : 0,
                }}
                onContentSizeChange={handleContentLayout}>
                {children}
              </Animated.ScrollView>
            </GestureDetector>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    // flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: colors.Gray60Color,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default ReanimatedBottomsheet;
