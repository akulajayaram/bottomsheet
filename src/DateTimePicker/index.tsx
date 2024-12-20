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
  useDerivedValue,
} from 'react-native-reanimated';
import WheelPicker from '../wheelpicker';
import TimeSelector from '../TimePicker/TimeSelector';

const {height} = Dimensions.get('window');
const ITEM_HEIGHT = 35; // Height of each item
const VISIBLE_ITEMS = 5; // Total visible items

// const RenderItem: React.FC<{
//   item: string | number;
//   index: number;
//   scrollValue: SharedValue<number>;
// }> = React.memo(({item, index, scrollValue}) => {
//   // Helper function to check if the item is in the visible range
//   const isInRange = (): boolean => {
//     'worklet';
//     const scrollOffset = scrollValue.value;

//     // Start and end of the visible range
//     const visibleStart = scrollOffset;
//     const visibleEnd = scrollOffset + VISIBLE_ITEMS * ITEM_HEIGHT;

//     // Position of the current item
//     const itemPosition = index * ITEM_HEIGHT;

//     return itemPosition >= visibleStart && itemPosition <= visibleEnd;
//   };

//   const animatedTextStyle = useAnimatedStyle(() => {
//     if (!isInRange()) {
//       return {opacity: 0, transform: [{rotateX: '90deg'}]}; // Return empty object if not in range
//     }

//     const scrollOffset = scrollValue.value;

//     // Center of the visible range
//     const centerPosition = scrollOffset + 2 * ITEM_HEIGHT;

//     // Item position
//     const itemPosition = index * ITEM_HEIGHT;

//     // Calculate distance from the center
//     const distanceFromCenter = Math.abs(centerPosition - itemPosition);

//     // Interpolate rotation and opacity
//     const rotateX = interpolate(
//       distanceFromCenter,
//       [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],
//       [0, 90], // Rotate from 0° in the center to 90° at the boundaries
//       Extrapolation.EXTEND,
//     );

//     const opacity = interpolate(
//       distanceFromCenter,
//       [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],
//       [1, 0.5], // Fully visible at the center, fades to 0 at the boundaries
//       Extrapolation.CLAMP,
//     );
//     const scale = interpolate(
//       distanceFromCenter,
//       [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],
//       [1, 0.8], // Fully visible at the center, fades to 0 at the boundaries
//       Extrapolation.CLAMP,
//     );

//     return {
//       opacity,
//       transform: [{rotateX: `${rotateX}deg`}, {scale}],
//     };
//   });

//   return (
//     <Animated.View style={[styles.itemContainer, animatedTextStyle]}>
//       <Animated.Text style={[styles.itemText]}>{item}</Animated.Text>
//     </Animated.View>
//   );
// });

const RenderItem: React.FC<{
  item: string | number;

  index: number;

  scrollValue: SharedValue<number>;
}> = React.memo(({item, index, scrollValue}) => {
  const animatedStyle = useAnimatedStyle(() => {
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

      [0, 90],

      Extrapolation.EXTEND,
    );

    const opacity = interpolate(
      distanceFromCenter,

      [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],

      [1, 0.5],

      Extrapolation.CLAMP,
    );

    const scale = interpolate(
      distanceFromCenter,

      [0, ITEM_HEIGHT * (VISIBLE_ITEMS / 2)],

      [1, 0.8],

      Extrapolation.CLAMP,
    );

    return {
      opacity,

      transform: [{rotateX: `${rotateX}deg`}, {scale}],
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, animatedStyle]}>
      <Animated.Text style={[styles.itemText]}>{item}</Animated.Text>
    </Animated.View>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date of Birth</Text>

      <View style={styles.pickerContainer}>
        <WheelPicker
          itemTextStyle={{fontSize: 18}}
          wheelType="left"
          selectedIndex={1}
          visibleRest={3}
          options={days.map(day => day.toString())}
          containerStyle={{backgroundColor: 'white', width: '15%'}}
          onChange={() => {}}
        />
        <WheelPicker
          itemTextStyle={{fontSize: 18}}
          wheelType="middle"
          visibleRest={3}
          selectedIndex={1}
          options={[
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
          ]}
          containerStyle={{backgroundColor: 'white', width: '32%'}}
          onChange={() => {}}
        />

        <WheelPicker
          itemTextStyle={{fontSize: 18}}
          wheelType="right"
          selectedIndex={4}
          visibleRest={3}
          options={years.map(year => year.toString())}
          containerStyle={{backgroundColor: 'white', width: '20%'}}
          onChange={() => {}}
        />
      </View>
      <TimeSelector />
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
    height: ITEM_HEIGHT * 9,
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
