import {Dimensions, Modal, StyleSheet, View} from 'react-native';
import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useEffect,
} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedScrollHandler,
  AnimatedScrollViewProps,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import BackDrop from './BackDrop';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props extends AnimatedScrollViewProps {
  snapPoints?: number[];
  backgroundColor: string;
  backDropColor: string;
}

export interface BottomSheetMethods {
  present: () => void;
  close: () => void;
}
const {height: closeHeight} = Dimensions.get('screen');

const BottomSheetScrollView = forwardRef<BottomSheetMethods, Props>(
  (
    {
      snapPoints = [
        0,
        closeHeight / 4,
        closeHeight / 3,
        closeHeight / 2,
        closeHeight * 0.6,
        closeHeight * 0.8,
        closeHeight * 0.95,
      ],
      children,
      backgroundColor = 'white',
      backDropColor = 'black',
      ...rest
    }: Props,
    ref,
  ) => {
    const inset = useSafeAreaInsets();

    // const percentage = parseFloat(snapTo.replace('%', '')) / 100;
    // const [openHeight, setOpenHeight] = useState(0);

    const topAnimation = useSharedValue(closeHeight);
    const context = useSharedValue(0);
    const scrollBegin = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const snapToIndex = useSharedValue(0);
    const [enableScroll, setEnableScroll] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [openHeight, setOpenHeight] = useState(0);

    const open = useCallback(
      (snapIndex = -1) => {
        'worklet';
        snapToIndex.value = snapIndex;
        if (openHeight === 0) {
          setIsVisible(true);
          return;
        }

        let targetSnapPoint: number;
        runOnJS(setIsVisible)(true);

        if (snapIndex === -1) {
          const closestIndex = snapPoints.reduce((prevIndex, curr, index) => {
            const prevDistance = Math.abs(openHeight - snapPoints[prevIndex]);
            const currDistance = Math.abs(openHeight - curr);
            return currDistance < prevDistance ? index : prevIndex;
          }, 0);

          targetSnapPoint =
            snapPoints[closestIndex + 1] || snapPoints[closestIndex];
        } else {
          targetSnapPoint = snapPoints[snapIndex] || snapPoints[0];
        }

        topAnimation.value = withSpring(closeHeight - targetSnapPoint, {
          damping: 15,
          stiffness: 100,
          mass: 1,
        });
      },
      [openHeight, topAnimation],
    );

    const close = useCallback(() => {
      'worklet';
      topAnimation.value = withSpring(
        closeHeight,
        {
          damping: 15,
          stiffness: 100,
          mass: 1,
        },
        () => {
          'worklet';
          runOnJS(setIsVisible)(false);
        },
      );
    }, [closeHeight, topAnimation]);

    useImperativeHandle(
      ref,
      () => ({
        present: open,
        close,
      }),
      [open, close],
    );

    const animationStyle = useAnimatedStyle(() => {
      const top = topAnimation.value;
      return {
        top,
      };
    });

    const snapToNearestPoint = () => {
      'worklet';
      const distances = snapPoints.map(point =>
        Math.abs(topAnimation.value - (closeHeight - point)),
      );
      const closestIndex = distances.indexOf(Math.min(...distances));

      if (snapPoints[closestIndex] === 0) {
        runOnJS(close)();
      } else {
        topAnimation.value = withSpring(closeHeight - snapPoints[closestIndex]);
      }
    };

    const pan = Gesture.Pan()
      .onBegin(() => {
        context.value = topAnimation.value;
      })
      .onUpdate(event => {
        console.log('111111111111111');

        // if (event.translationY < 0) {
        //   topAnimation.value = withSpring(openHeight, {
        //     // damping: 100,
        //     // stiffness: 400,
        //     damping: 15,
        //     stiffness: 100,
        //     mass: 1,
        //   });
        // } else {
        //   topAnimation.value = withSpring(context.value + event.translationY, {
        //     // damping: 100,
        //     // stiffness: 400,
        //     damping: 15,
        //     stiffness: 100,
        //     mass: 1,
        //   });
        // }
        const newTranslateY = context.value + event.translationY;
        topAnimation.value = Math.max(
          Math.min(newTranslateY, closeHeight),
          closeHeight - snapPoints[snapPoints.length - 1],
        );
      })
      .onEnd(event => {
        const isMovingDown = event.translationY > 0;
        const isFastMovement = Math.abs(event.velocityY) > 1000;

        if (isMovingDown && isFastMovement) {
          runOnJS(close)();
        } else {
          snapToNearestPoint();
        }
      });

    const onScroll = useAnimatedScrollHandler({
      onBeginDrag: event => {
        scrollBegin.value = event.contentOffset.y;
      },
      onScroll: event => {
        scrollY.value = event.contentOffset.y;
      },
    });

    const panScroll = Gesture.Pan()
      .onBegin(() => {
        context.value = topAnimation.value;
      })
      .onUpdate(event => {
        if (event.translationY < 0) {
          topAnimation.value = withSpring(openHeight, {
            // damping: 100,
            // stiffness: 400,
            damping: 15,
            stiffness: 100,
            mass: 1,
          });
        } else if (event.translationY > 0 && scrollY.value === 0) {
          runOnJS(setEnableScroll)(false);
          topAnimation.value = withSpring(
            Math.max(
              context.value + event.translationY - scrollBegin.value,
              openHeight,
            ),
            {
              damping: 100,
              stiffness: 400,
            },
          );
        }
      })
      .onEnd(() => {
        runOnJS(setEnableScroll)(true);
        if (topAnimation.value > openHeight + 50) {
          topAnimation.value = withSpring(closeHeight, {
            // damping: 100,
            // stiffness: 400,
            damping: 15,
            stiffness: 100,
            mass: 1,
          });
        } else {
          topAnimation.value = withSpring(openHeight, {
            // damping: 100,
            // stiffness: 400,
            damping: 15,
            stiffness: 100,
            mass: 1,
          });
        }
      });

    const scrollViewGesture = Gesture.Native();

    const handleContentLayout = (_: number, height: number) => {
      runOnJS(setOpenHeight)(height);
    };

    useEffect(() => {
      if (openHeight > 0) {
        open(snapToIndex.value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openHeight]);

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={close}>
        <GestureHandlerRootView>
          <BackDrop
            topAnimation={topAnimation}
            backDropColor={backDropColor}
            closeHeight={closeHeight}
            openHeight={openHeight}
            close={close}
          />
          <Animated.View
            style={[
              styles.container,
              animationStyle,
              {
                backgroundColor: backgroundColor,
                paddingBottom: inset.bottom,
              },
            ]}>
            <GestureDetector gesture={pan}>
              <View style={styles.lineContainer}>
                <View style={styles.line} />
              </View>
            </GestureDetector>
            <GestureDetector gesture={Gesture.Simultaneous(scrollViewGesture)}>
              <Animated.ScrollView
                {...rest}
                scrollEnabled={enableScroll}
                bounces={false}
                scrollEventThrottle={16}
                onContentSizeChange={handleContentLayout}
                onScroll={onScroll}>
                {children}
              </Animated.ScrollView>
            </GestureDetector>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    );
  },
);

export default BottomSheetScrollView;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  lineContainer: {
    alignItems: 'center',
    height: 20,
  },
  line: {
    width: 50,
    height: 4,
    backgroundColor: 'black',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
