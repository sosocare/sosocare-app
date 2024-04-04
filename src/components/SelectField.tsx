import React, { useState, useEffect } from 'react';
import {
  Select,
  ChevronDownIcon,
  ChevronUpIcon,
  FormControl,
} from 'native-base';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Ionicons from '@expo/vector-icons/Ionicons';

type optionType = {
  title: string,
  value: string;
};
interface SelectFieldProps {
  label: string;
  value?: string | null | undefined;
  icon?: string | null;
  hasIcon?: boolean;
  hide?: boolean;
  isDisabled?: boolean;
  options: Array<optionType>;
  handleChange: Function;
}

const SelectField: React.FC<SelectFieldProps> = (props: any) => {
  const {
    options = [],
    handleChange = () => {},
    icon,
    label,
    hasIcon = false,
    value,
    isDisabled = false
  } = props;

  const [open, setOpen] = useState(false);
  const [defaultValue, setValue] = useState('');
  useEffect(() => {
    if (value) {
      setValue(value);
      handleChange(value);
    }
  }, [value]);

  if (hasIcon && icon !== null) {
    return (
      <View style={[styles.iconContainer, { borderColor: open ? COLORS.primary : COLORS.gray, borderWidth: open ? 2 : 1 }]}>
        <Ionicons name={icon || 'person'} style={{ width: '5%', fontSize: SIZES.medium, marginRight: 10, padding: 0 }} color={COLORS.dark} />
        <Select
          selectedValue={defaultValue || undefined}
          variant="unstyled"
          accessibilityLabel={label}
          placeholder={label}
          bg={'transparent'}
          minWidth={'90%'}
          isDisabled={isDisabled}
          fontSize={SIZES.medium}
          fontFamily={FONTS.medium}
          borderColor={'transparent'}
          placeholderTextColor={COLORS.gray}
          _text={{
            color: COLORS.dark,
            fontSize: SIZES.medium,
            fontFamily: FONTS.medium,
          }}
          onOpen={() => setOpen(true)}
          height={55}
          _selectedItem={{
            bg: COLORS.primary,
            color: COLORS.white,
            _text: {
              color: COLORS.white,
            }
          }}
          dropdownCloseIcon={
            <ChevronDownIcon size="4" style={{ borderColor: 'transparent', paddingHorizontal: 0 }} color={COLORS.gray} />
          }
          dropdownOpenIcon={
            <ChevronUpIcon size="4" style={{ borderColor: 'transparent', paddingHorizontal: 0 }} color={COLORS.gray} />
          }
          onValueChange={(itemValue) => {
            if(!open) return
            setValue(itemValue)
            handleChange(itemValue)
            setOpen(false);
          }
          }
        >
          {options?.map((item: any, index: number) => (
            <Select.Item
              _pressed={{
                bg: COLORS.primary,
                color: COLORS.white,
                _text: {
                  color: COLORS.white,
                }
              }}
              key={index}
              pt="2"
              label={item.title}
              value={item.value.toString()}
              mb={index === options.length-1 ? 60: 0}
            />
          ))}
        </Select>
      </View>
    );
  }

  return (
    <View>
      <Select
        selectedValue={defaultValue || undefined}
        mb={'3'}
        variant="outline"
        accessibilityLabel={label}
        placeholder={label}
        isDisabled={isDisabled}
        bg={'transparent'}
        minWidth={'100%'}
        fontSize={SIZES.medium}
        fontFamily={FONTS.medium}
        borderRadius={10}
        borderWidth={open ? 2 : 1}
        borderColor={open ? COLORS.primary : COLORS.gray}
        _text={{
          color: COLORS.dark,
          fontSize: SIZES.medium,
          fontFamily: FONTS.medium,
        }}
        onOpen={() => setOpen(true)}
        height={60}
        placeholderTextColor={COLORS.gray}
        _selectedItem={{
          bg: COLORS.primary,
          color: COLORS.white,
          _text: {
            color: COLORS.white,
          }
        }}
        dropdownCloseIcon={
          <ChevronDownIcon size="4" mr="3" style={{ borderColor: 'transparent', paddingHorizontal: 0 }} color={COLORS.gray} />
        }
        dropdownOpenIcon={
          <ChevronUpIcon size="4" mr="3" style={{ borderColor: 'transparent', paddingHorizontal: 0 }} color={COLORS.gray} />
        }
        onValueChange={(itemValue) => {
          setValue(itemValue)
          handleChange(itemValue);
          setOpen(false);
        }}
      >
        {options?.map((item: any, index: number) => (
          <Select.Item
            _pressed={{
              bg: COLORS.primary,
              color: COLORS.white,
              _text: {
                color: COLORS.white,
              }
            }}
            key={index}
            pt="2"
            label={item.title}
            value={item.value.toString()}
            mb={index === options.length-1 ? 60: 0}
          />
        ))}
      </Select>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: 60,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingBottom: 60,
    marginBottom: 30
  },
  iconContainer: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 60,
    marginBottom: 30,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 20,
    width: '100%'
  },
  iconTextField: {
    flex: 1,
    height: 50,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  textField: {
    flex: 1,
    height: 50,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 20,
    width: '100%'
  },
  label: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray,
    marginBottom: 10
  }
});

export default SelectField;
