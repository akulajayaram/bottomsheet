/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  DimensionValue,
} from 'react-native';

import {LinearGradient} from 'react-native-linear-gradient';

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  height,
  width,
  fontSize,
  textColor,
  startYear,
  endYear,
  markColor,
  markHeight,
  markWidth,
  fadeColor,
  format,
}) => {
  const [days, setDays] = useState<number[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const end = endYear || new Date().getFullYear();
    const start = !startYear || startYear > end ? end - 100 : startYear;

    const _days = [...Array(31)].map((_, index) => index + 1);
    const _months = [
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
    ];
    const _years = [...Array(end - start + 1)].map((_, index) => start + index);

    setDays(_days);
    setMonths(_months);
    setYears(_years);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickerHeight: number = Math.round(
    height || Dimensions.get('window').height / 3.5,
  );
  const pickerWidth: number | string = width || '100%';

  const unexpectedDate: Date = new Date(years[0], 0, 1);
  const date = new Date(value || unexpectedDate);

  const changeHandle = (type: string, digit: number | string): void => {
    switch (type) {
      case 'day':
        date.setDate(Number(digit));
        break;
      case 'month':
        const monthIndex = months.indexOf(digit as string);
        if (monthIndex >= 0) {
          date.setMonth(monthIndex);
        }
        break;
      case 'year':
        date.setFullYear(Number(digit));
        break;
    }

    onChange(date);
  };

  const getOrder = () => {
    return (format || 'dd-mm-yyyy').split('-').map((type, index) => {
      switch (type) {
        case 'dd':
          return {name: 'day', digits: days, value: date.getDate()};
        case 'mm':
          return {
            name: 'month',
            digits: months,
            value: months[date.getMonth()],
          };
        case 'yyyy':
          return {name: 'year', digits: years, value: date.getFullYear()};
        default:
          console.warn(
            `Invalid date picker format prop: found "${type}" in ${format}. Please read documentation!`,
          );
          return {
            name: ['day', 'month', 'year'][index],
            digits: [days, months, years][index],
            value: [
              date.getDate(),
              months[date.getMonth()],
              date.getFullYear(),
            ][index],
          };
      }
    });
  };

  return (
    <View
      style={[
        styles.picker,
        {height: pickerHeight, width: pickerWidth as DimensionValue},
      ]}>
      {getOrder().map((el, index) => {
        return (
          <DateBlock
            digits={el.digits}
            value={el.value}
            onChange={changeHandle}
            height={pickerHeight}
            fontSize={fontSize}
            textColor={textColor}
            markColor={markColor}
            markHeight={markHeight}
            markWidth={markWidth}
            fadeColor={fadeColor}
            type={el.name}
            key={index}
          />
        );
      })}
    </View>
  );
};

const DateBlock: React.FC<DateBlockProps> = ({
  value,
  digits,
  type,
  onChange,
  height,
  fontSize,
  textColor,
  markColor,
  markHeight,
  markWidth,
  fadeColor,
}) => {
  const dHeight: number = Math.round(height / 4);

  const mHeight: number = markHeight || Math.min(dHeight, 150);
  const mWidth: number | string = markWidth || '70%';

  const offsets = digits.map((_: number, index: number) => index * dHeight);

  const fadeFilled: string = hex2rgba(fadeColor || '#ffffff', 1);
  const fadeTransparent: string = hex2rgba(fadeColor || '#ffffff', 0);

  const scrollRef = useRef<any>(null);

  const snapScrollToIndex = (index: number) => {
    scrollRef?.current?.scrollTo({y: dHeight * index, animated: true});
  };

  useEffect(() => {
    snapScrollToIndex(value - digits[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef.current]);

  const handleMomentumScrollEnd = ({nativeEvent}: any) => {
    const digit = Math.round(nativeEvent.contentOffset.y / dHeight + digits[0]);
    onChange(type, digit);
  };

  console.log(type === 'mm' ? {backgroundColor: 'pink'} : {}, type);

  return (
    <View style={styles.block}>
      <View
        style={[
          styles.mark,
          {
            top: (height - mHeight) / 2,
            // backgroundColor: markColor || 'rgba(0, 0, 0, 0.05)',
            height: mHeight,
            width: '100%',
            borderBottomWidth: 1,
            borderTopWidth: 1,
            marginRight: 0,
            borderColor: '#22215B',
            // borderColor: 'red',
          },
        ]}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        snapToOffsets={offsets}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={0}
        onMomentumScrollEnd={handleMomentumScrollEnd}>
        {digits.map((value1: number | string, index: number) => {
          return (
            <TouchableOpacity
              key={index}
              style={{alignItems: 'center', justifyContent: 'center'}}
              onPress={() => {
                onChange(type, digits[index]);
                snapScrollToIndex(index);
              }}>
              <Text
                style={[
                  styles.digit,
                  {
                    fontSize: fontSize || 22,
                    color: textColor || '#000000',
                    marginBottom:
                      index === digits.length - 1
                        ? height / 2 - dHeight / 2
                        : 0,
                    marginTop: index === 0 ? height / 2 - dHeight / 2 : 0,
                    lineHeight: dHeight,
                    height: dHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    // marginBottom:20
                  },
                ]}>
                {value1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <LinearGradient
        style={[styles.gradient, {bottom: 0, height: height / 5}]}
        colors={[fadeTransparent, fadeFilled]}
        pointerEvents={'none'}
      />
      <LinearGradient
        style={[styles.gradient, {top: 0, height: height / 5}]}
        colors={[fadeFilled, fadeTransparent]}
        pointerEvents={'none'}
      />
    </View>
  );
};

const hex2rgba = (hex: string, alpha: number): string => {
  hex = hex.replace('#', '');

  const r: number = parseInt(
    hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2),
    16,
  );
  const g: number = parseInt(
    hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4),
    16,
  );
  const b: number = parseInt(
    hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6),
    16,
  );

  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
};

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    width: '100%',
  },
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scroll: {
    width: '100%',
  },
  digit: {
    fontSize: 20,
    textAlign: 'center',
  },
  mark: {
    position: 'absolute',
    // borderRadius: 10,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
  },
});

export interface DatePickerProps {
  value: Date | null | undefined;
  height?: number;
  width?: number | string;
  fontSize?: number;
  textColor?: string;
  startYear?: number;
  endYear?: number;
  markColor?: string;
  markHeight?: number;
  markWidth?: number | string;
  fadeColor?: string;
  format?: string;

  onChange(value: Date): void;
}

export interface DateBlockProps {
  digits: number[] | string[];
  value: number | string;
  type: string;
  height: number;
  fontSize?: number;
  textColor?: string;
  markColor?: string;
  markHeight?: number;
  markWidth?: number | string;
  fadeColor?: string;

  onChange(type: string, digit: number): void;
}

export default DatePicker;
