import React, {useMemo} from 'react';
import {Text, StyleSheet, Dimensions, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  interpolate,
  Extrapolation,
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';

const {height} = Dimensions.get('window');
const ITEM_HEIGHT = 50; // Height of each item
const VISIBLE_ITEMS = 5; // Total visible items

const RenderItem: React.FC<{
  item: string | number;
  index: number;
  scrollValue: SharedValue<number>;
  contentHeight: SharedValue<number>;
}> = ({item, index, scrollValue}) => {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';

    const scrollOffset = scrollValue.value;

    // Determine the start and end index of visible items
    const visibleStart = Math.floor(scrollOffset / ITEM_HEIGHT);
    const visibleEnd = visibleStart + VISIBLE_ITEMS;

    // If the current item is outside the visible range, return no animation
    if (index < visibleStart - 1 || index > visibleEnd + 1) {
      return {opacity: 0};
    }

    console.log('*****************', item, visibleStart, visibleEnd, index);

    // Calculate the position of the item relative to the visible area
    const itemPosition = index * ITEM_HEIGHT;
    const distanceFromVisibleStart = Math.abs(scrollOffset - itemPosition);

    // Interpolate opacity, scale, and rotation based on distance from visibleStart
    const opacity = interpolate(
      distanceFromVisibleStart,
      [0, 2 * ITEM_HEIGHT, ITEM_HEIGHT * 4],
      [0.5, 1, 0.5], // Smoothed opacity transition
      Extrapolation.CLAMP,
    );

    const scale = interpolate(
      distanceFromVisibleStart,
      [0, 2 * ITEM_HEIGHT, 4 * ITEM_HEIGHT],
      [0.8, 1, 0.8], // Smoother scaling effect
      Extrapolation.CLAMP,
    );

    const rotateX = interpolate(
      distanceFromVisibleStart,
      [0, 2 * ITEM_HEIGHT, 4 * ITEM_HEIGHT],
      [30, 0, 30], // More subtle rotation
      Extrapolation.CLAMP,
    );

    return {
      opacity: withTiming(opacity),
      transform: [
        {scale: withTiming(scale)},
        {rotateX: withTiming(`${rotateX}deg`)},
      ],
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, animatedStyle]}>
      <Text style={styles.itemText}>{item}</Text>
    </Animated.View>
  );
};

const CircularDatePicker = () => {
  const currentDate = new Date();
  const todayDay = currentDate.getDate();
  const todayMonth = currentDate.getMonth();
  const todayYear = currentDate.getFullYear();

  const days = useMemo(() => Array.from({length: 31}, (_, i) => i + 1), []);

  const months = useMemo(
    () => [
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
    ],
    [],
  );

  const years = useMemo(
    () => Array.from({length: 100}, (_, i) => todayYear - 50 + i),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const scrollDay = useSharedValue(todayDay * ITEM_HEIGHT);
  const scrollMonth = useSharedValue(todayMonth * ITEM_HEIGHT);
  const scrollYear = useSharedValue(50 * ITEM_HEIGHT);

  const contentHeightDay = useSharedValue(ITEM_HEIGHT * days.length);
  const contentHeightMonth = useSharedValue(ITEM_HEIGHT * months.length);
  const contentHeightYear = useSharedValue(ITEM_HEIGHT * years.length);

  const dayScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollDay.value = event.contentOffset.y;
    },
  });

  const monthScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollMonth.value = event.contentOffset.y;
    },
  });

  const yearScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollYear.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date of Birth</Text>

      <View style={styles.pickerContainer}>
        <Animated.FlatList
          data={days}
          keyExtractor={item => item.toString()}
          renderItem={({item, index}) => (
            <RenderItem
              item={item}
              index={index}
              scrollValue={scrollDay}
              contentHeight={contentHeightDay}
            />
          )}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onScroll={dayScrollHandler}
          initialScrollIndex={todayDay - 1}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        />
        <Animated.FlatList
          data={months}
          keyExtractor={item => item}
          renderItem={({item, index}) => (
            <RenderItem
              item={item}
              index={index}
              scrollValue={scrollMonth}
              contentHeight={contentHeightMonth}
            />
          )}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onScroll={monthScrollHandler}
          initialScrollIndex={todayMonth}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        />
        <Animated.FlatList
          data={years}
          keyExtractor={item => item.toString()}
          renderItem={({item, index}) => (
            <RenderItem
              item={item}
              index={index}
              scrollValue={scrollYear}
              contentHeight={contentHeightYear}
            />
          )}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onScroll={yearScrollHandler}
          initialScrollIndex={50}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
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
    fontWeight: '300',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'semibold',
    color: '#333',
  },
});

export default CircularDatePicker;
