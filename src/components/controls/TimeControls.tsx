/**
 * Bottom bar: time playback controls.
 *
 * Play/pause, time scale selector, date input, go-to-now,
 * forward/reverse, step forward/backward, current time display.
 * Responsive for mobile.
 */

import { useState, useCallback } from 'react';
import { useSimulationStore } from '../../simulation/state/simulation-store';
import { useSettingsStore } from '../../simulation/state/settings-store';
import { TIME_SCALES, SEC_PER_DAY } from '../../simulation/astronomy/time';
import { formatDateTime, formatDateTimeUTC } from '../../utils/formatting';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
} from 'lucide-react';

export default function TimeControls() {
  const {
    simulationTimeUtcMs,
    timeScale,
    paused,
    timeDirection,
    setTimeScale,
    togglePause,
    setTimeDirection,
    goToNow,
    stepTime,
    setSimulationTime,
  } = useSimulationStore();

  const useUTC = useSettingsStore((s) => s.useUTC);
  const setUseUTC = useSettingsStore((s) => s.setUseUTC);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const isMobile = useIsMobile();

  const simDate = new Date(simulationTimeUtcMs);
  const displayTime = useUTC ? formatDateTimeUTC(simDate) : formatDateTime(simDate);

  // Shorter time format for mobile
  const mobileDisplayTime = simDate.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Date input handler
  const handleDateInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value) {
        const ms = new Date(value).getTime();
        if (!isNaN(ms)) {
          setSimulationTime(ms);
        }
      }
    },
    [setSimulationTime],
  );

  // Format for datetime-local input
  const dateInputValue = simDate.toISOString().slice(0, 19);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="bg-gray-900/90 backdrop-blur-md border-t border-gray-700/50">
        <div className={`flex items-center gap-2 justify-center flex-wrap ${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'}`}>
          {/* Playback controls group */}
          <div className={`flex items-center gap-1 ${isMobile ? '' : 'bg-gray-800/50 rounded-lg px-1 py-0.5'}`}>
            {/* Time direction */}
            <button
              onClick={() => setTimeDirection(timeDirection === 1 ? -1 : 1)}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                timeDirection === -1
                  ? 'bg-amber-600/50 text-amber-200 shadow-md shadow-amber-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={timeDirection === 1 ? '正向时间' : '反向时间'}
            >
              {timeDirection === 1 ? <ChevronRight size={isMobile ? 18 : 16} /> : <ChevronLeft size={isMobile ? 18 : 16} />}
            </button>

            {/* Step backward */}
            <button
              onClick={() => stepTime(-SEC_PER_DAY)}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="后退 1 天"
            >
              <SkipBack size={isMobile ? 18 : 16} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePause}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                paused
                  ? 'bg-green-600/80 text-white hover:bg-green-500/80 shadow-lg shadow-green-500/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={paused ? '播放' : '暂停'}
            >
              {paused ? <Play size={isMobile ? 20 : 18} /> : <Pause size={isMobile ? 20 : 18} />}
            </button>

            {/* Step forward */}
            <button
              onClick={() => stepTime(SEC_PER_DAY)}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="前进 1 天"
            >
              <SkipForward size={isMobile ? 18 : 16} />
            </button>

            {/* Go to now */}
            <button
              onClick={goToNow}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="回到现在"
            >
              <RotateCcw size={isMobile ? 18 : 16} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-600 to-transparent mx-0.5" />

          {/* Current time display */}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer ${isMobile ? 'px-1.5 py-1' : 'px-2 py-1'}`}
            title="点击选择日期"
          >
            <Clock size={14} className="text-gray-400" />
            <span className="text-xs text-gray-300 font-mono">{isMobile ? mobileDisplayTime : displayTime}</span>
          </button>

          {/* UTC/Local toggle - hidden on mobile */}
          {!isMobile && (
            <button
              onClick={() => setUseUTC(!useUTC)}
              className={`px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer transition-all ${
                useUTC
                  ? 'bg-blue-600/50 text-blue-200 ring-1 ring-blue-400/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
              title={useUTC ? '切换为本地时间' : '切换为 UTC'}
            >
              {useUTC ? 'UTC' : '本地'}
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-600 to-transparent mx-0.5" />

          {/* Time speed selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className={`flex items-center gap-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${isMobile ? 'px-1.5 py-1' : 'px-2 py-1'}`}
              title="时间倍率"
            >
              <span className={`text-gray-300 font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {TIME_SCALES.find((t) => t.value === timeScale)?.label || `${timeScale}×`}
              </span>
              <ChevronUp
                size={12}
                className={`text-gray-500 transition-transform duration-200 ${
                  showSpeedMenu ? '' : 'rotate-180'
                }`}
              />
            </button>

            {showSpeedMenu && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-lg shadow-2xl shadow-black/40 overflow-hidden ${isMobile ? 'min-w-[120px]' : 'min-w-[140px]'}`}>
                {TIME_SCALES.map((ts) => (
                  <button
                    key={ts.value}
                    onClick={() => {
                      setTimeScale(ts.value);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      timeScale === ts.value
                        ? 'bg-blue-600/50 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {ts.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date picker (hidden, toggled) */}
          {showDatePicker && (
            <input
              type="datetime-local"
              value={dateInputValue}
              onChange={handleDateInput}
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-600/50 rounded text-gray-200
                         focus:border-blue-500/50 focus:outline-none transition-colors"
              onBlur={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
