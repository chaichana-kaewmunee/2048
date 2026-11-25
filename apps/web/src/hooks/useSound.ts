import { useCallback, useState } from 'react';
import { soundManager, type SoundConfig } from '../lib/audio';

export function useSound(): {
  config: SoundConfig;
  toggleSound: () => void;
  setVolume: (v: number) => void;
  playMove: () => void;
  playMerge: (val?: number) => void;
  playWin: () => void;
  playGameOver: () => void;
  playUndo: () => void;
} {
  const [config, setConfig] = useState<SoundConfig>(() => soundManager.getConfig());

  const toggleSound = useCallback(() => {
    const next = !config.enabled;
    soundManager.setEnabled(next);
    setConfig(soundManager.getConfig());
  }, [config.enabled]);

  const setVolume = useCallback((v: number) => {
    soundManager.setVolume(v);
    setConfig(soundManager.getConfig());
  }, []);

  return {
    config,
    toggleSound,
    setVolume,
    playMove: useCallback(() => soundManager.playMove(), []),
    playMerge: useCallback((val?: number) => soundManager.playMerge(val), []),
    playWin: useCallback(() => soundManager.playWin(), []),
    playGameOver: useCallback(() => soundManager.playGameOver(), []),
    playUndo: useCallback(() => soundManager.playUndo(), []),
  };
}
