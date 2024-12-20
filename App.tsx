/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import ReanimatedBottomsheet, {
  ReanimatedBottomsheetRef,
} from './src/Bottomsheet/ReanimatedBottomSheet2';
import {View, Button, StyleSheet} from 'react-native';
import DatePicker from './src/DateTimePicker';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WheelPicker from './src/wheelpicker';
import TimeSelector from './src/TimePicker/TimeSelector';

const App = () => {
  const bottomSheetRef = useRef<ReanimatedBottomsheetRef>(null);

  return (
    <View style={{flex: 1}}>
      <SafeAreaProvider>
        <Button
          title="Open BottomSheet"
          onPress={() => bottomSheetRef?.current?.present()}
        />
        <Button
          title="Close BottomSheet"
          onPress={() => bottomSheetRef?.current?.close()}
        />
        {/* <WheelPicker
          selectedIndex={4}
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
          containerStyle={{backgroundColor: 'white'}}
          onChange={() => {}}
        /> */}
        <DatePicker />
        <ReanimatedBottomsheet ref={bottomSheetRef}>
          <DatePicker />
        </ReanimatedBottomsheet>
      </SafeAreaProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
