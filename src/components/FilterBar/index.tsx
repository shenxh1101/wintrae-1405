import React from 'react';
import { View, Text, Button, Slider } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { FilterOption } from '@/types';
import { useApp } from '@/store/AppContext';

interface FilterBarProps {
  ageOptions: FilterOption[];
  themeOptions: FilterOption[];
  durationOptions: FilterOption[];
  selectedAge: string;
  selectedTheme: string;
  selectedDuration: string;
  onAgeChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onDurationChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  ageOptions,
  themeOptions,
  durationOptions,
  selectedAge,
  selectedTheme,
  selectedDuration,
  onAgeChange,
  onThemeChange,
  onDurationChange
}) => {
  const { brightness, setBrightness, eyeCareMode, toggleEyeCareMode } = useApp();

  const handleBrightnessChange = (e: { detail: { value: number } }) => {
    console.log('[FilterBar] 调整亮度:', e.detail.value);
    setBrightness(e.detail.value);
  };

  const handleEyeCareToggle = () => {
    console.log('[FilterBar] 切换护眼模式:', !eyeCareMode);
    toggleEyeCareMode();
  };

  return (
    <View className={styles.filterBar}>
      <View className={styles.filterRow}>
        <Text className={styles.filterLabel}>适合年龄</Text>
        <View className={styles.filterOptions}>
          {ageOptions.map(option => (
            <Button
              key={option.value}
              className={classnames(styles.optionBtn, selectedAge === option.value && styles.active)}
              onClick={() => onAgeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.filterRow}>
        <Text className={styles.filterLabel}>绘本主题</Text>
        <View className={styles.filterOptions}>
          {themeOptions.map(option => (
            <Button
              key={option.value}
              className={classnames(styles.optionBtn, selectedTheme === option.value && styles.active)}
              onClick={() => onThemeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.filterRow}>
        <Text className={styles.filterLabel}>阅读时长</Text>
        <View className={styles.filterOptions}>
          {durationOptions.map(option => (
            <Button
              key={option.value}
              className={classnames(styles.optionBtn, selectedDuration === option.value && styles.active)}
              onClick={() => onDurationChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.settingsRow}>
        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>亮度</Text>
          <Slider
            className={styles.brightnessSlider}
            min={0}
            max={100}
            value={brightness}
            activeColor="#FF8A65"
            backgroundColor="#FFE0B2"
            blockColor="#FF8A65"
            blockSize={24}
            onChange={handleBrightnessChange}
          />
          <Text className={styles.settingLabel}>{brightness}%</Text>
        </View>
        <Button
          className={classnames(styles.eyeCareBtn, eyeCareMode && styles.active)}
          onClick={handleEyeCareToggle}
        >
          {eyeCareMode ? '🌙 护眼中' : '☀️ 护眼模式'}
        </Button>
      </View>
    </View>
  );
};

export default FilterBar;
