/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {View, Button, StyleSheet, Text} from 'react-native';
import {BottomSheetRef} from './BottomSheet';
import ReanimatedBottomsheet from './ReanimatedBottomsheet';

const App = () => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  return (
    <View style={{flex: 1}}>
      <Button
        title="Open BottomSheet"
        onPress={() => bottomSheetRef?.current?.open()}
      />
      <Button
        title="Close BottomSheet"
        onPress={() => bottomSheetRef?.current?.close()}
      />
      <ReanimatedBottomsheet ref={bottomSheetRef}>
        <View style={{height: 'auto'}}>
          <Text>Scrollable Content</Text>
          {[...Array(60)].map((_, index) => (
            <Text key={index} style={styles.item}>
              Item {index + 1}
            </Text>
          ))}
        </View>
      </ReanimatedBottomsheet>
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
