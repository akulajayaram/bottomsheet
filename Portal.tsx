import React from 'react';
import {View, StyleSheet, Modal} from 'react-native';

type PortalProps = {
  children: React.ReactNode;
  isVisible?: boolean;
};

const Portal: React.FC<PortalProps> = ({isVisible, children}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      hardwareAccelerated>
      <View style={styles.overlay}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Portal;
