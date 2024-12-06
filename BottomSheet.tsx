import React, {useRef, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type BottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: number[];
};

export type BottomSheetRef = {
  open: (snapIndex?: number) => void;
  close: () => void;
};

const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      snapPoints = [
        SCREEN_HEIGHT / 4,
        SCREEN_HEIGHT / 3,
        SCREEN_HEIGHT / 2,
        SCREEN_HEIGHT * 0.6,
        SCREEN_HEIGHT * 0.8,
        SCREEN_HEIGHT,
      ],
    },
    ref,
  ) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const scrollOffset = useRef(0);
    const isDragging = useRef(false);
    const gestureStartY = useRef(0);
    const currentTranslateY = useRef(SCREEN_HEIGHT);

    translateY.addListener(({value}) => {
      currentTranslateY.current = value;
    });

    useImperativeHandle(ref, () => ({
      open: (snapIndex = 0) => {
        const targetSnapPoint = snapPoints[snapIndex] || snapPoints[0];
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - targetSnapPoint,
          useNativeDriver: true,
        }).start();
      },
      close: () => {
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
        }).start();
      },
    }));

    const bottomSheetPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isDraggingDown = gestureState.dy > 0;
        const isDraggingUp = gestureState.dy < 0;

        return (
          (scrollOffset.current <= 0 && isDraggingDown) ||
          (scrollOffset.current > 0 && isDraggingUp)
        );
      },
      onPanResponderGrant: () => {
        gestureStartY.current = currentTranslateY.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (
          (scrollOffset.current <= 0 && gestureState.dy > 0) || // Allow downward drag
          (scrollOffset.current === 0 && gestureState.dy < 0) // Allow upward drag
        ) {
          isDragging.current = true;
          const newTranslateY = gestureStartY.current + gestureState.dy;
          translateY.setValue(
            Math.max(
              Math.min(newTranslateY, SCREEN_HEIGHT),
              SCREEN_HEIGHT - snapPoints[snapPoints.length - 1],
            ),
          );
        }
      },
      onPanResponderRelease: () => {
        snapToNearestPoint();
      },
    });

    const handlePanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gestureStartY.current = currentTranslateY.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newTranslateY = gestureStartY.current + gestureState.dy;
        translateY.setValue(
          Math.max(
            Math.min(newTranslateY, SCREEN_HEIGHT),
            SCREEN_HEIGHT - snapPoints[snapPoints.length - 1],
          ),
        );
      },
      onPanResponderRelease: () => {
        snapToNearestPoint();
      },
    });

    const snapToNearestPoint = () => {
      const currentY = currentTranslateY.current;

      // Find the closest snap point
      const distances = snapPoints.map(point =>
        Math.abs(currentY - (SCREEN_HEIGHT - point)),
      );
      const closestIndex = distances.indexOf(Math.min(...distances));

      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - snapPoints[closestIndex],
        useNativeDriver: true,
      }).start(() => {
        isDragging.current = false;
      });
    };

    const handleScroll = (e: {nativeEvent: {contentOffset: {y: number}}}) => {
      scrollOffset.current = e.nativeEvent.contentOffset.y;
    };

    const handleScrollBeginDrag = () => {
      isDragging.current = false;
    };

    // Dynamically calculate bottom padding based on currentTranslateY
    const dynamicPaddingBottom = translateY.interpolate({
      inputRange: [
        SCREEN_HEIGHT - currentTranslateY.current, // Fully expanded
        SCREEN_HEIGHT, // Fully closed
      ],
      outputRange: [
        20, // Minimal padding when fully expanded
        currentTranslateY.current + 20, // Max padding when fully closed
      ],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.container, {transform: [{translateY}]}]}>
        <Animated.View {...handlePanResponder.panHandlers}>
          <View style={styles.handle} />
        </Animated.View>
        <Animated.View {...bottomSheetPanResponder.panHandlers}>
          <Animated.ScrollView
            contentContainerStyle={{
              paddingBottom: dynamicPaddingBottom,
            }}
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            scrollEventThrottle={16}>
            {children}
          </Animated.ScrollView>
        </Animated.View>
      </Animated.View>
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

export default BottomSheet;
