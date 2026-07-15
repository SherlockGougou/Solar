/**
 * Top bar: scale controls and status display.
 *
 * Shows current scale mode, body size multiplier, orbit distance multiplier,
 * time speed, and orbit model info. Responsive for mobile.
 */

import { useState } from 'react';
import { useSimulationStore, type ScaleMode, type CameraMode } from '../../simulation/state/simulation-store';
import { formatMultiplier } from '../../utils/formatting';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SlidersHorizontal, ChevronDown, Eye, Orbit, ArrowUpFromDot, Scan, Maximize2, RotateCcw } from 'lucide-react';

const SCALE_MODES: { id: ScaleMode; label: string; desc: string }[] = [
  { id: 'realistic', label: '真实比例', desc: '尺寸与距离均为 1×' },
  { id: 'enhanced', label: '增强可见', desc: '尺寸放大，距离真实' },
  { id: 'educational', label: '教学演示', desc: '尺寸与距离均压缩' },
];

export default function ScaleControls() {
  const {
    scaleMode,
    bodySizeMultiplier,
    orbitDistanceMultiplier,
    cameraMode,
    setCameraMode,
    resetCamera,
    setScaleMode,
    setBodySizeMultiplier,
    setOrbitDistanceMultiplier,
    lightingMode,
    setLightingMode,
    showOrbitLines,
    setShowOrbitLines,
    showLabels,
    setShowLabels,
  } = useSimulationStore();

  const [showPanel, setShowPanel] = useState(false);
  const isMobile = useIsMobile();

  const currentModeLabel = SCALE_MODES.find((m) => m.id === scaleMode)?.label || '自定义';

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      {/* Scale mode banner for non-realistic modes */}
      {scaleMode !== 'realistic' && (
        <div className={`mx-auto w-fit mt-2 px-3 py-1.5 bg-amber-900/70 backdrop-blur-md border border-amber-600/50 rounded-full text-amber-200 text-center ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
          {scaleMode === 'enhanced'
            ? `当前天体尺寸已放大 ${formatMultiplier(bodySizeMultiplier)}，轨道距离保持真实比例。`
            : `当前为教学演示模式，天体尺寸和轨道距离均非真实比例。`}
        </div>
      )}

      {/* Controls bar */}
      <div className={`absolute pointer-events-auto ${isMobile ? 'top-1.5 right-2' : 'top-2 right-20'}`}>
        <div className="relative">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className={`flex items-center gap-1.5 bg-gray-800/80 backdrop-blur-md
                       border border-gray-600/50 rounded-lg hover:bg-gray-700/80
                       text-gray-300 transition-all cursor-pointer
                       hover:border-gray-500/60 hover:shadow-lg hover:shadow-black/20
                       ${isMobile ? 'px-2.5 py-2 text-xs' : 'px-3 py-1.5 text-xs'}`}
          >
            <SlidersHorizontal size={isMobile ? 16 : 14} />
            <span>{currentModeLabel}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showPanel ? 'rotate-180' : ''}`} />
          </button>

          {showPanel && (
            <div className={`absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-lg shadow-2xl shadow-black/40 p-4 space-y-4 animate-in ${isMobile ? 'w-[calc(100vw-1rem)] max-w-80' : 'w-72'}`}>
              {/* Scale mode presets */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">比例模式</label>
                <div className="flex gap-1">
                  {SCALE_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setScaleMode(mode.id)}
                      className={`flex-1 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                        scaleMode === mode.id
                          ? 'bg-blue-600/60 text-white ring-1 ring-blue-400/40 shadow-md shadow-blue-500/10'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                      }`}
                      title={mode.desc}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body size multiplier */}
              <div>
                <label className="text-xs text-gray-400 flex justify-between mb-1">
                  <span>天体尺寸倍率</span>
                  <span className="text-blue-300 font-medium">{formatMultiplier(bodySizeMultiplier)}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10000}
                  step={1}
                  value={bodySizeMultiplier}
                  onChange={(e) => setBodySizeMultiplier(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                             [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-500/30
                             [&::-webkit-slider-thumb]:hover:bg-blue-400 [&::-webkit-slider-thumb]:transition-colors"
                />
              </div>

              {/* Orbit distance multiplier */}
              <div>
                <label className="text-xs text-gray-400 flex justify-between mb-1">
                  <span>轨道距离倍率</span>
                  <span className="text-blue-300 font-medium">{formatMultiplier(orbitDistanceMultiplier)}</span>
                </label>
                <input
                  type="range"
                  min={0.01}
                  max={2}
                  step={0.01}
                  value={orbitDistanceMultiplier}
                  onChange={(e) => setOrbitDistanceMultiplier(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                             [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-500/30
                             [&::-webkit-slider-thumb]:hover:bg-blue-400 [&::-webkit-slider-thumb]:transition-colors"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 block">显示选项</label>
                <ToggleRow
                  label="轨道线"
                  checked={showOrbitLines}
                  onChange={setShowOrbitLines}
                />
                <ToggleRow
                  label="天体标签"
                  checked={showLabels}
                  onChange={setShowLabels}
                />
              </div>

              {/* Lighting mode */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">光照模式</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLightingMode('scientific')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      lightingMode === 'scientific'
                        ? 'bg-blue-600/60 text-white ring-1 ring-blue-400/40'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                    }`}
                  >
                    科学光照
                  </button>
                  <button
                    onClick={() => setLightingMode('assisted')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      lightingMode === 'assisted'
                        ? 'bg-blue-600/60 text-white ring-1 ring-blue-400/40'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                    }`}
                  >
                    辅助光照
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status info + camera modes (hidden on mobile) */}
      {!isMobile && (
        <div className="absolute top-2 left-56 pointer-events-auto flex items-center gap-2">
          {/* Camera mode buttons */}
          <div className="flex gap-0.5 bg-gray-800/80 backdrop-blur-md border border-gray-600/50 rounded-lg p-1">
            {[
              { id: 'free' as CameraMode, label: '自由', Icon: Orbit },
              { id: 'follow' as CameraMode, label: '跟随', Icon: Eye },
              { id: 'topdown' as CameraMode, label: '俯视', Icon: ArrowUpFromDot },
              { id: 'surface' as CameraMode, label: '近看', Icon: Scan },
              { id: 'overview' as CameraMode, label: '总览', Icon: Maximize2 },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setCameraMode(id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                  cameraMode === id
                    ? 'bg-blue-600/60 text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                }`}
                title={`${label}视角`}
              >
                <Icon size={12} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Reset camera button */}
          <button
            onClick={resetCamera}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800/80 backdrop-blur-md
                       border border-gray-600/50 rounded-lg hover:bg-gray-700/80
                       text-gray-400 hover:text-gray-200 text-xs transition-all cursor-pointer
                       hover:border-gray-500/60"
            title="重置视角"
          >
            <RotateCcw size={12} />
            <span>重置</span>
          </button>

          <div className="flex gap-3 text-xs text-gray-500 pointer-events-none">
            <span>尺寸: <span className="text-gray-400">{formatMultiplier(bodySizeMultiplier)}</span></span>
            <span>距离: <span className="text-gray-400">{formatMultiplier(orbitDistanceMultiplier)}</span></span>
            <span>模型: <span className="text-gray-400">开普勒近似</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">{label}</span>
      <div
        className={`w-9 h-5 rounded-full transition-all relative ${
          checked ? 'bg-blue-600 shadow-inner shadow-blue-800/30' : 'bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </label>
  );
}
