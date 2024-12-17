import React, {createContext, useContext, useState} from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';

type ToastType = 'success' | 'error';

type ToastContextType = {
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const toastOpacity = useSharedValue(0);
  const [timeRef, setTimeRef] = useState<NodeJS.Timeout | undefined>(undefined);

  const show = (msg: string, toastType: ToastType = 'success') => {
    setMessage(msg);
    setType(toastType);
    toastOpacity.value = withTiming(1, {duration: 300}, () => {
      runOnJS(startHideTimeout)();
    });
  };

  const startHideTimeout = () => {
    const time = setTimeout(() => {
      hide();
    }, 2500);
    setTimeRef(time);
  };

  const hide = () => {
    if (timeRef) {
      clearTimeout(timeRef);
      setTimeRef(undefined);
    }
    toastOpacity.value = withTiming(0, {duration: 300});
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{translateY: toastOpacity.value === 0 ? -50 : 0}],
  }));

  return (
    <ToastContext.Provider value={{show, hide}}>
      {children}
      <Animated.View
        style={[
          styles.toastContainer,
          type === 'success' ? styles.success : styles.error,
          animatedStyle,
        ]}>
        <View style={styles.content}>
          <Text
            style={[
              styles.toastText,
              type === 'success' ? styles.successText : styles.errorText,
            ]}>
            {message}
          </Text>
          <TouchableOpacity onPress={hide} style={styles.closeIcon}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18"
                stroke={type === 'success' ? '#155724' : '#721c24'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M6 6L18 18"
                stroke={type === 'success' ? '#155724' : '#721c24'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 76,
    left: 20,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 10, // Adjusted for flexible height
    borderRadius: 5,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center', // Ensure content is vertically centered
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  error: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1, // Allow text to take up available space
    flexWrap: 'wrap', // Allow text to wrap if it's too long
  },
  closeIcon: {
    padding: 5,
    marginLeft: 10,
  },
  successText: {
    color: '#155724',
  },
  errorText: {
    color: '#721c24',
  },
});
