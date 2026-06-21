import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import { Task, EmotionOption } from '@/types';

const difficultyMap: Record<string, string> = {
  easy: '🌟 简单',
  medium: '⭐ 中等',
  hard: '🔥 困难'
};

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const {
    tasks,
    eyeCareMode,
    completeTask,
    resetTask,
    updateTaskTargets,
    updateTaskColorZones,
    linkRecordingToTask,
    recordings
  } = useApp();

  const taskId = router.params.id;
  console.log('[TaskDetail] 页面加载，taskId:', taskId);

  const task: Task | undefined = useMemo(() => {
    return tasks.find(t => t.id === taskId);
  }, [tasks, taskId]);

  const [retellText, setRetellText] = useState('');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [showRecordingPicker, setShowRecordingPicker] = useState(false);
  const [emotionResult, setEmotionResult] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    option?: EmotionOption;
  }>({ status: 'idle' });
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (task?.completed) {
      console.log('[TaskDetail] 任务已完成，直接显示祝贺');
      setShowCongrats(true);
    }
  }, [task?.completed]);

  useEffect(() => {
    if (task?.type === 'retell' && task.retellPrompt) {
      console.log('[TaskDetail] 复述任务，提示:', task.retellPrompt);
    }
    if (task?.type === 'color' && task.colorPalettes && task.colorPalettes.length > 0) {
      setSelectedPaletteId(task.colorPalettes[0].id);
      console.log('[TaskDetail] 涂色任务，默认选中调色板:', task.colorPalettes[0].name);
    }
  }, [task?.id]);

  const isCompleteEnabled = useMemo(() => {
    if (!task) return false;

    switch (task.type) {
      case 'retell':
        const textEnabled = retellText.trim().length >= 10;
        const hasLinkedRecording = !!task.linkedRecordingId;
        const enabled = textEnabled || hasLinkedRecording;
        console.log('[TaskDetail] 复述完成条件检查:', enabled, '文本长度:', retellText.trim().length, '关联录音:', hasLinkedRecording);
        return enabled;
      case 'find':
        const allFound = task.findScene?.targets.every(t => t.found) ?? false;
        const foundCount = task.findScene?.targets.filter(t => t.found).length ?? 0;
        const total = task.findScene?.targets.length ?? 0;
        console.log('[TaskDetail] 找一找完成条件检查:', allFound, `(${foundCount}/${total})`);
        return allFound;
      case 'emotion':
        const emotionPassed = emotionResult.status === 'correct';
        console.log('[TaskDetail] 情绪完成条件检查:', emotionPassed);
        return emotionPassed;
      case 'color':
        const allFilled = task.colorZones?.every(z => z.filled) ?? false;
        const filledCount = task.colorZones?.filter(z => z.filled).length ?? 0;
        const totalZones = task.colorZones?.length ?? 0;
        console.log('[TaskDetail] 涂色完成条件检查:', allFilled, `(${filledCount}/${totalZones})`);
        return allFilled;
      default:
        return false;
    }
  }, [task, retellText, emotionResult.status, task?.linkedRecordingId]);

  const foundCount = useMemo(() => {
    if (!task?.findScene) return 0;
    return task.findScene.targets.filter(t => t.found).length;
  }, [task?.findScene]);

  const totalTargets = useMemo(() => {
    return task?.findScene?.targets.length ?? 0;
  }, [task?.findScene]);

  const handleComplete = () => {
    if (!task || !isCompleteEnabled) return;
    console.log('[TaskDetail] 点击完成按钮，taskId:', task.id, 'type:', task.type);
    completeTask(task.id);
    setShowCongrats(true);

    setTimeout(() => {
      console.log('[TaskDetail] 2秒后返回上一页');
      Taro.navigateBack();
    }, 2000);
  };

  const handleReset = () => {
    if (!task) return;
    console.log('[TaskDetail] 重置任务:', task.id);
    resetTask(task.id);
    setRetellText('');
    setSelectedPaletteId(
      task.colorPalettes && task.colorPalettes.length > 0
        ? task.colorPalettes[0].id
        : null
    );
    setEmotionResult({ status: 'idle' });
    setShowCongrats(false);
    Taro.showToast({
      title: '任务已重置',
      icon: 'none'
    });
  };

  const handleGoRecord = () => {
    console.log('[TaskDetail] 跳转到录音页面');
    Taro.switchTab({
      url: '/pages/recording/index'
    });
  };

  const handleTargetClick = (targetId: string) => {
    if (!task?.findScene) return;
    const target = task.findScene.targets.find(t => t.id === targetId);
    if (!target || target.found) return;

    console.log('[TaskDetail] 找到目标:', target.label);
    const newTargets = task.findScene.targets.map(t =>
      t.id === targetId ? { ...t, found: true } : t
    );
    updateTaskTargets(task.id, newTargets);
    Taro.showToast({
      title: '找到了！',
      icon: 'success',
      duration: 800
    });
  };

  const handleEmotionClick = (option: EmotionOption) => {
    console.log('[TaskDetail] 选择情绪选项:', option.label, 'correct:', option.correct);

    if (option.correct) {
      setEmotionResult({ status: 'correct', option });
    } else {
      setEmotionResult({ status: 'wrong', option });
    }
  };

  const handlePaletteSelect = (paletteId: string) => {
    if (!task?.colorPalettes) return;
    const palette = task.colorPalettes.find(p => p.id === paletteId);
    console.log('[TaskDetail] 选择调色板:', palette?.name, palette?.color);
    setSelectedPaletteId(paletteId);
  };

  const handleZoneClick = (zoneId: string) => {
    if (!task?.colorZones || !task.colorPalettes || !selectedPaletteId) {
      console.log('[TaskDetail] 无法涂色：缺少调色板选择或区域数据');
      if (!selectedPaletteId) {
        Taro.showToast({
          title: '请先选择颜色',
          icon: 'none'
        });
      }
      return;
    }

    const selectedPalette = task.colorPalettes.find(p => p.id === selectedPaletteId);
    if (!selectedPalette) return;

    const zone = task.colorZones.find(z => z.id === zoneId);
    console.log('[TaskDetail] 涂色区域:', zone?.label, '颜色:', selectedPalette.name);

    const isEraser = selectedPalette.color === '#FFFFFF';
    const newZones = task.colorZones.map(z =>
      z.id === zoneId
        ? {
            ...z,
            filled: !isEraser,
            color: isEraser ? 'transparent' : selectedPalette.color
          }
        : z
    );
    updateTaskColorZones(task.id, newZones);
  };

  const linkedRecording = useMemo(() => {
    if (!task?.linkedRecordingId) return null;
    return recordings.find(r => r.id === task.linkedRecordingId) || null;
  }, [task?.linkedRecordingId, recordings]);

  const renderRetellTask = () => {
    if (!task) return null;
    return (
      <View className={classnames(styles.typeRetell)}>
        <View className={styles.contentCard}>
          <View className={styles.retellPrompt}>
            <Text className={styles.promptLabel}>💡 复述小提示</Text>
            <Text className={styles.promptText}>
              {task.retellPrompt || '用你自己的话，讲讲这个故事吧~'}
            </Text>
          </View>

          <textarea
            className={styles.retellTextarea}
            placeholder="在这里输入你想讲的内容..."
            value={retellText}
            onInput={e => {
              const value = e.detail.value;
              console.log('[TaskDetail] 复述文本输入:', value.length, '字');
              setRetellText(value);
            }}
            maxlength={500}
            autoHeight
          />

          <View className={styles.recordHint}>
            🎙️ 不想打字？录一段音频或者选一段已保存的录音吧~
          </View>

          {linkedRecording ? (
            <View className={styles.linkedRecording}>
              <View className={styles.linkedInfo}>
                <Text className={styles.linkedIcon}>🎙️</Text>
                <View className={styles.linkedDetail}>
                  <Text className={styles.linkedTitle}>{linkedRecording.title}</Text>
                  <Text className={styles.linkedDuration}>
                    {Math.floor(linkedRecording.duration / 60)}:{String(linkedRecording.duration % 60).padStart(2, '0')}
                  </Text>
                </View>
              </View>
              <Button
                className={styles.unlinkBtn}
                onClick={() => {
                  console.log('[TaskDetail] 取消关联录音');
                  linkRecordingToTask(task.id, null);
                }}
              >
                ✕ 取消关联
              </Button>
            </View>
          ) : (
            <View className={styles.recordingActions}>
              <Button className={styles.goRecordBtn} onClick={handleGoRecord}>
                🎤 去录音室录一段
              </Button>
              {recordings.length > 0 && (
                <Button
                  className={styles.selectRecordingBtn}
                  onClick={() => {
                    console.log('[TaskDetail] 打开录音选择器');
                    setShowRecordingPicker(true);
                  }}
                >
                  📋 选择已有录音
                </Button>
              )}
            </View>
          )}

          {showRecordingPicker && (
            <View className={styles.recordingPicker}>
              <View className={styles.pickerHeader}>
                <Text className={styles.pickerTitle}>选择一段录音</Text>
                <Button
                  className={styles.pickerClose}
                  onClick={() => setShowRecordingPicker(false)}
                >
                  ✕
                </Button>
              </View>
              {recordings.length > 0 ? (
                <View className={styles.pickerList}>
                  {recordings.map(rec => (
                    <Button
                      key={rec.id}
                      className={classnames(
                        styles.pickerItem,
                        task.linkedRecordingId === rec.id && styles.active
                      )}
                      onClick={() => {
                        console.log('[TaskDetail] 关联录音:', rec.title);
                        linkRecordingToTask(task.id, rec.id);
                        setShowRecordingPicker(false);
                        Taro.showToast({ title: '已关联录音', icon: 'success' });
                      }}
                    >
                      <Text className={styles.pickerItemTitle}>{rec.title}</Text>
                      <Text className={styles.pickerItemDuration}>
                        {Math.floor(rec.duration / 60)}:{String(rec.duration % 60).padStart(2, '0')}
                      </Text>
                    </Button>
                  ))}
                </View>
              ) : (
                <View className={styles.pickerEmpty}>
                  还没有录音，先去录音室录一段吧~
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFindTask = () => {
    if (!task?.findScene) return null;
    return (
      <View className={classnames(styles.typeFind)}>
        <View className={styles.contentCard}>
          <View className={styles.findProgress}>
            <Text className={styles.progressLabel}>已找到目标</Text>
            <Text className={styles.progressValue}>
              {foundCount} / {totalTargets}
            </Text>
          </View>

          <View className={styles.findScene}>
            <Image src={task.findScene.image} mode="widthFix" />
            {task.findScene.targets.map(target => (
              <Button
                key={target.id}
                className={classnames(
                  styles.findTarget,
                  target.found && styles.found
                )}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.width}%`,
                  height: `${target.width}%`
                }}
                onClick={() => handleTargetClick(target.id)}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderEmotionTask = () => {
    if (!task?.emotionQuestion) return null;
    return (
      <View className={classnames(styles.typeEmotion)}>
        <View className={styles.contentCard}>
          <View className={styles.emotionScene}>
            📖 {task.emotionQuestion.scene}
          </View>

          <View className={styles.emotionOptions}>
            {task.emotionQuestion.options.map(option => {
              let stateClass = '';
              if (emotionResult.status === 'correct' && emotionResult.option?.id === option.id) {
                stateClass = styles.correct;
              } else if (emotionResult.status === 'wrong' && emotionResult.option?.id === option.id) {
                stateClass = styles.wrong;
              }
              return (
                <Button
                  key={option.id}
                  className={classnames(styles.emotionOption, stateClass)}
                  onClick={() => handleEmotionClick(option)}
                >
                  <Text className={styles.emoji}>{option.emoji}</Text>
                  <Text className={styles.label}>{option.label}</Text>
                </Button>
              );
            })}
          </View>

          {emotionResult.status !== 'idle' && emotionResult.option && (
            <View
              className={classnames(
                styles.emotionFeedback,
                emotionResult.status === 'correct' ? styles.success : styles.fail
              )}
            >
              <Text className={styles.feedbackEmoji}>
                {emotionResult.status === 'correct' ? '🎉' : '🤔'}
              </Text>
              <Text className={styles.feedbackTitle}>
                {emotionResult.status === 'correct' ? '太棒了！' : '再想想~'}
              </Text>
              <Text className={styles.feedbackText}>
                {emotionResult.option.feedback}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderColorTask = () => {
    if (!task?.colorPalettes || !task?.colorZones) return null;
    return (
      <View className={classnames(styles.typeColor)}>
        <View className={styles.contentCard}>
          <View className={styles.colorCanvas} />

          <View className={styles.colorPalettes}>
            {task.colorPalettes.map(palette => (
              <Button
                key={palette.id}
                className={classnames(
                  styles.paletteColor,
                  selectedPaletteId === palette.id && styles.selected
                )}
                style={{ backgroundColor: palette.color }}
                onClick={() => handlePaletteSelect(palette.id)}
              />
            ))}
          </View>

          <View className={styles.colorZoneBtns}>
            {task.colorZones.map(zone => (
              <Button
                key={zone.id}
                className={classnames(
                  styles.colorZone,
                  zone.filled && styles.filled
                )}
                onClick={() => handleZoneClick(zone.id)}
              >
                <View
                  className={styles.zoneColor}
                  style={{
                    backgroundColor: zone.filled ? zone.color : 'transparent'
                  }}
                />
                <Text className={styles.zoneLabel}>{zone.label}</Text>
              </Button>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTaskContent = () => {
    if (!task) {
      return (
        <View style={{ textAlign: 'center', padding: '80rpx 0' }}>
          <Text style={{ fontSize: '32rpx', color: '#A1887F' }}>
            任务不存在或已删除
          </Text>
        </View>
      );
    }

    switch (task.type) {
      case 'retell':
        return renderRetellTask();
      case 'find':
        return renderFindTask();
      case 'emotion':
        return renderEmotionTask();
      case 'color':
        return renderColorTask();
      default:
        return null;
    }
  };

  if (!task) {
    return (
      <View
        className={styles.pageContainer}
        style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
      >
        {renderTaskContent()}
      </View>
    );
  }

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.taskTitle}>{task.title}</Text>
        <Text className={styles.taskDesc}>{task.description}</Text>
        <View className={styles.taskMeta}>
          <View className={styles.bookTag}>📚 {task.bookTitle}</View>
          <View className={styles.difficultyTag}>
            {difficultyMap[task.difficulty]}
          </View>
        </View>
        {task.hint && (
          <View className={styles.hintBox}>💡 {task.hint}</View>
        )}
      </View>

      {renderTaskContent()}

      <Button
        className={classnames(
          styles.completeBtn,
          !isCompleteEnabled && styles.disabled
        )}
        onClick={handleComplete}
        disabled={!isCompleteEnabled}
      >
        {task.completed ? '✅ 已完成' : '🎉 完成任务'}
      </Button>

      {showCongrats && (
        <View className={styles.congratsCard}>
          <View className={styles.checkIcon}>✓</View>
          <Text className={styles.congratsTitle}>太棒啦！</Text>
          <Text className={styles.congratsText}>
            你完成了「{task.title}」{'\n'}继续加油，小朋友！
          </Text>
          <Button className={styles.resetBtn} onClick={handleReset}>
            🔄 再玩一次
          </Button>
        </View>
      )}
    </View>
  );
};

export default TaskDetailPage;
