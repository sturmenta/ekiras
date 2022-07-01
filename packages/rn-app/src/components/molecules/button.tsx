import React, {ReactElement} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  TextStyle,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {useTheme} from '@react-navigation/native';

import {CustomIcon, IconType, TextByScale} from '_atoms';
import {
  parseStyle,
  themedStyleSheet,
  MyThemeInterfaceColors,
  fontSizeScales,
  getPercentageInHex,
} from '_utils';

// props with eslint disable are used in the end of file inside of themedStyleSheet
interface ButtonProps {
  onPress: any;
  // ────────────────────────────────────────────────────────────────────────────────
  text?: string;
  style?: StyleProp<ViewStyle>;
  // eslint-disable-next-line react/no-unused-prop-types
  textStyle?: StyleProp<TextStyle>;
  textScale?: fontSizeScales;
  icon?: string;
  iconType?: IconType;
  loading?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  autoWidth?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  background?: string;
  color?: string;
  size?: 'xs' | 'small' | 'medium' | 'large';
  children?: ReactElement;
  iconSize?: number;
  locked?: boolean;
  disabled?: boolean;
}

const sizes = {
  xs: {height: 30, fontSize: 'body2'},
  small: {height: 48, fontSize: 'body1'},
  medium: {height: 52, fontSize: 'body1'},
  large: {height: 56, fontSize: 'h6'},
};

export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const colors = useTheme().colors as unknown as MyThemeInterfaceColors;

  const {
    color = colors.text,
    onPress,
    style,
    text,
    textScale,
    iconType,
    icon,
    loading,
    children,
    iconSize,
    locked,
    disabled,
  } = props;
  const styles = useStyles(props);

  const buttonContent = () => {
    const {size} = props;

    if (loading) return <ActivityIndicator size="small" color="white" />;
    else {
      return (
        <>
          {(!!icon || !!locked) && (
            <CustomIcon
              name={icon || 'lock'}
              size={iconSize}
              color={color}
              type={iconType as IconType}
              style={{marginRight: 5}}
            />
          )}
          {!!text && (
            <TextByScale
              scale={
                textScale || (sizes[size || 'large'].fontSize as fontSizeScales)
              }
              numberOfLines={1}
              style={styles.buttonText}
              color={color || colors.text2}
              bold>
              {text}
            </TextByScale>
          )}
          {children}
        </>
      );
    }
  };

  return Platform.OS === 'ios' ? (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={loading || disabled ? undefined : onPress}>
      <View
        style={{
          ...styles.buttonContainer,
          marginVertical: 8,
          ...(parseStyle(style) as object),
        }}>
        {buttonContent()}
      </View>
    </TouchableOpacity>
  ) : (
    <View style={styles.androidWrapper}>
      <TouchableNativeFeedback
        onPress={loading || disabled ? undefined : onPress}
        background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.08)', false)}>
        <View style={styles.buttonContainer}>{buttonContent()}</View>
      </TouchableNativeFeedback>
    </View>
  );
};

const useStyles = themedStyleSheet(
  (colors: MyThemeInterfaceColors, props: ButtonProps) => ({
    androidWrapper: {
      borderRadius: 50,
      overflow: 'hidden',
      marginVertical: 8,
      ...(parseStyle(props.style) as object),
    },
    buttonContainer: {
      height: sizes[props.size || 'large'].height,
      borderRadius: 50,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      alignSelf: props.autoWidth ? 'auto' : 'center',
      backgroundColor:
        props.locked || props.disabled
          ? colors.primary + getPercentageInHex(60)
          : props.background || colors.button_bg,
    },
    buttonText: {
      // fontFamily: DEFAULT_FONT,
      textAlign: 'center',
      marginLeft: props.icon ? 8 : 0,
      ...(parseStyle(props.textStyle) as object),
    },
  }),
);

Button.defaultProps = {
  text: '',
  icon: '',
  iconType: undefined,
  textScale: undefined,
  style: {},
  textStyle: {},
  loading: false,
  background: undefined,
  color: undefined,
  children: undefined,
  autoWidth: true,
  size: 'large',
  iconSize: 18,
  locked: false,
  disabled: false,
};