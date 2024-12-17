/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import ReanimatedBottomsheet, {
  ReanimatedBottomsheetRef,
} from './src/Bottomsheet/ReanimatedBottomSheet2';
import {View, Button, StyleSheet} from 'react-native';
import DatePicker from './src/DateTimePicker';
import {SafeAreaProvider} from 'react-native-safe-area-context';

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
        <DatePicker />
        <ReanimatedBottomsheet ref={bottomSheetRef}>
          {/* <View style={{height: 'auto'}}>
          <Text>Scrollable Content</Text>
          {[...Array(14)].map((_, index) => (
            <View key={index} style={{height: 80}}>
            <Text style={styles.item}>Item {index + 1}</Text>
            </View>
            ))}
        </View> */}
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
