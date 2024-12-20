import React, {useCallback} from 'react';
import {Text, View, StyleSheet} from 'react-native';
// import {useCalendarContext} from '../CalendarContext';
import Wheel from '../wheelpicker/index';
import {CALENDAR_HEIGHT} from './enums';
import {getParsedDate, getDate, getFormated} from './utils';
import WheelPicker from '../wheelpicker/index';

function createNumberList(num: number) {
  return new Array(num)
    .fill(0)
    .map((_, index) =>
      index < 10 ? `0${index.toString()}` : index.toString(),
    );
}

const hours = createNumberList(24);
const minutes = createNumberList(60);

const TimeSelector = () => {
  // const {date, onSelectDate, theme} = useCalendarContext();
  // const {hour, minute} = getParsedDate(new Date());

  // const handleChangeHour = useCallback(
  //   (value: number) => {
  //     const newDate = getDate(date).hour(value);
  //     onSelectDate(getFormated(newDate));
  //   },
  //   [date, onSelectDate],
  // );

  // const handleChangeMinute = useCallback(
  //   (value: number) => {
  //     const newDate = getDate(date).minute(value);
  //     onSelectDate(getFormated(newDate));
  //   },
  //   [date, onSelectDate],
  // );

  return (
    <View style={styles.container} testID="time-selector">
      <View style={styles.timePickerContainer}>
        <View style={styles.wheelContainer}>
          <WheelPicker
            selectedIndex={0}
            options={hours}
            onChange={() => {}}
            containerStyle={{
              backgroundColor: 'white',
              width: '100%',
              flex: 1,
              ...styles.container,
            }}
            // containerStyle={{
            //   ...styles.container,
            //   ...theme?.timePickerContainerStyle,
            // }}
            itemHeight={45}
            itemTextStyle={{
              ...styles.timePickerText,
              // ...theme?.timePickerTextStyle,
            }}
            selectedIndicatorStyle={{}}
          />
        </View>
        <Text
          style={{
            marginHorizontal: 5,
            // ...styles.timePickerText,
            // ...theme?.timePickerTextStyle,
          }}>
          :
        </Text>
        <View style={styles.wheelContainer}>
          <WheelPicker
            selectedIndex={0}
            options={minutes}
            containerStyle={{
              backgroundColor: 'white',
              width: '100%',
              flex: 1,
              ...styles.container,
            }}
            itemHeight={45}
            onChange={() => {}}
            itemTextStyle={{
              ...styles.timePickerText,
              // ...theme?.timePickerTextStyle,
            }}
            selectedIndicatorStyle={{}}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
  },
  timePickerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // container: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  wheelContainer: {
    flex: 1,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: CALENDAR_HEIGHT / 2,
    height: CALENDAR_HEIGHT / 2,
  },
});

export default TimeSelector;
