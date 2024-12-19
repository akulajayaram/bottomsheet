/* eslint-disable react-native/no-inline-styles */
import React, {useMemo, useEffect, useRef} from 'react';
import {Text, StyleSheet, Dimensions, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  interpolate,
  Extrapolation,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

const {height} = Dimensions.get('window');
const ITEM_HEIGHT = 40; // Height of each item
const VISIBLE_ITEMS = 5; // Total visible items

const RenderItem: React.FC<{
  item: string | number;
  index: number;
  scrollValue: SharedValue<number>;
}> = React.memo(({item, index, scrollValue}) => {
  const animatedTextStyle = useAnimatedStyle(() => {
    const scrollOffset = scrollValue.value;

    // Center of the visible range
    const centerPosition = scrollOffset + 2 * ITEM_HEIGHT;

    // Item position
    const itemPosition = index * ITEM_HEIGHT;

    // Calculate distance from the center
    const distanceFromCenter = Math.abs(centerPosition - itemPosition);

    // Interpolate rotation and opacity
    const rotateX = interpolate(
      distanceFromCenter,
      [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],
      [0, 90], // Rotate from 0° in the center to 90° at the boundaries
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      distanceFromCenter,
      [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],
      [1, 0], // Fully visible at the center, fades to 0 at the boundaries
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{rotateX: `${rotateX}deg`}],
    };
  });

  return (
    <View style={styles.itemContainer}>
      <Animated.Text style={[styles.itemText, animatedTextStyle]}>
        {item}
      </Animated.Text>
    </View>
  );
});

const useScrollHandler = (sharedValue: SharedValue<number>) => {
  return useAnimatedScrollHandler({
    onScroll: event => {
      sharedValue.value = event.contentOffset.y;
    },
  });
};

const CircularDatePicker = () => {
  const currentDate = new Date();
  const todayDay = currentDate.getDate();
  const todayMonth = currentDate.getMonth();
  const todayYear = currentDate.getFullYear();

  const days = useMemo(
    () => ['', '', ...Array.from({length: 31}, (_, i) => i + 1), '', ''],
    [],
  );
  const months = useMemo(
    () => [
      '',
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
      '',
      '',
    ],
    [],
  );
  const years = useMemo(
    () => [
      '',
      '',
      ...Array.from({length: 100}, (_, i) => todayYear - 50 + i),
      '',
      '',
    ],
    [todayYear],
  );

  const scrollDay = useSharedValue(todayDay * ITEM_HEIGHT);
  const scrollMonth = useSharedValue(todayMonth * ITEM_HEIGHT);
  const scrollYear = useSharedValue(50 * ITEM_HEIGHT);

  const dayListRef = useRef<Animated.FlatList<number>>(null);
  const monthListRef = useRef<Animated.FlatList<string>>(null);
  const yearListRef = useRef<Animated.FlatList<number>>(null);

  useEffect(() => {
    const centerItem = (
      ref: React.RefObject<Animated.FlatList<any>>,
      index: number,
    ) => {
      'worklet';
      if (ref.current) {
        ref.current.scrollToOffset({
          offset: (index - 1) * ITEM_HEIGHT, // Directly scroll to the target item's offset
          animated: true,
        });
      }
    };

    // Calculate the actual indices
    const dayIndex = todayDay; // Add 2 to account for the two padding elements
    const monthIndex = todayMonth + 1; // Add 2 to account for the two padding elements
    const yearIndex = 51; // Current year is at the center of 100 years, with padding

    console.log(dayIndex, monthIndex, yearIndex);

    // setTimeout(() => {
    centerItem(dayListRef, dayIndex);
    centerItem(monthListRef, monthIndex);
    centerItem(yearListRef, yearIndex);
    // }, 5000);
  }, [todayDay, todayMonth, todayYear]);

  const dayScrollHandler = useScrollHandler(scrollDay);
  const monthScrollHandler = useScrollHandler(scrollMonth);
  const yearScrollHandler = useScrollHandler(scrollYear);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date of Birth</Text>

      <View style={styles.pickerContainer}>
        <View
          style={[
            styles.mark,
            {
              top: 2 * ITEM_HEIGHT,
              height: ITEM_HEIGHT,
              width: '100%',
              borderBottomWidth: 1,
              borderTopWidth: 1,
              marginRight: 0,
              borderColor: '#22215B',
            },
          ]}
        />
        <Animated.FlatList
          ref={dayListRef}
          data={days}
          keyExtractor={(item, index) => `${item}-${index}-day`}
          renderItem={({item, index}) => (
            <RenderItem item={item} index={index} scrollValue={scrollDay} />
          )}
          onScroll={dayScrollHandler}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialNumToRender={VISIBLE_ITEMS}
          maxToRenderPerBatch={VISIBLE_ITEMS}
          windowSize={days.length}
        />

        <Animated.FlatList
          ref={monthListRef}
          data={months}
          keyExtractor={(item, index) => `${item}-${index}-month`}
          renderItem={({item, index}) => (
            <RenderItem item={item} index={index} scrollValue={scrollMonth} />
          )}
          onScroll={monthScrollHandler}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialNumToRender={VISIBLE_ITEMS}
          maxToRenderPerBatch={VISIBLE_ITEMS}
          windowSize={months.length}
        />

        <Animated.FlatList
          ref={yearListRef}
          data={years}
          keyExtractor={(item, index) => `${item}-${index}-year`}
          renderItem={({item, index}) => (
            <RenderItem item={item} index={index} scrollValue={scrollYear} />
          )}
          onScroll={yearScrollHandler}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialNumToRender={VISIBLE_ITEMS}
          maxToRenderPerBatch={VISIBLE_ITEMS}
          windowSize={years.length}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  mark: {
    position: 'absolute',
    // borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: height / 5,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'semibold',
    color: '#333',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
  },
});

export default CircularDatePicker;
