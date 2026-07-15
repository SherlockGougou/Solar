/**
 * Right panel: detailed information about the selected celestial body.
 * On mobile, slides up as a bottom sheet instead of a right sidebar.
 */

import { useMemo } from 'react';
import { CELESTIAL_BODIES } from '../../data/celestial-bodies';
import { distanceFromSun } from '../../simulation/astronomy/orbital-elements';
import { useSimulationStore } from '../../simulation/state/simulation-store';
import { useSettingsStore } from '../../simulation/state/settings-store';
import {
  formatNumber,
  formatDistance,
  formatLightTime,
  formatPeriod,
  formatOrbitalPeriod,
} from '../../utils/formatting';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function InfoPanel() {
  const selectedBodyId = useSimulationStore((s) => s.selectedBodyId);
  const simTime = useSimulationStore((s) => s.simulationTimeUtcMs);
  const collapsed = useSettingsStore((s) => s.infoPanelCollapsed);
  const toggleInfoPanel = useSettingsStore((s) => s.toggleInfoPanel);
  const selectBody = useSimulationStore((s) => s.selectBody);
  const isMobile = useIsMobile();

  const body = useMemo(
    () => CELESTIAL_BODIES.find((b) => b.id === selectedBodyId),
    [selectedBodyId],
  );

  const distFromSunKm = useMemo(() => {
    if (!body || body.id === 'sun' || !body.orbit) return null;
    return distanceFromSun(body.orbit, simTime);
  }, [body, simTime]);

  if (!body) return null;

  const isSun = body.id === 'sun';
  const effectiveCollapsed = isMobile ? true : collapsed;

  // Mobile: bottom sheet layout
  if (isMobile) {
    return (
      <div
        className={`absolute left-0 right-0 z-20 transition-all duration-300 ${
          effectiveCollapsed ? 'bottom-10 h-0' : 'bottom-10 h-[45vh]'
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleInfoPanel}
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-gray-800/80 hover:bg-gray-700/80
                     border border-gray-600/50 rounded-t-md flex items-center justify-center
                     text-gray-300 z-30 cursor-pointer transition-colors"
          title={effectiveCollapsed ? '展开信息' : '收起信息'}
        >
          <ChevronLeft size={14} className={`transition-transform ${effectiveCollapsed ? 'rotate-[-90deg]' : 'rotate-90'}`} />
        </button>

        <div
          className={`w-full h-full bg-gray-900/90 backdrop-blur-md border-t border-gray-700/50
                       flex flex-col overflow-hidden transition-opacity ${
                         effectiveCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                       }`}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-700/50 flex items-center gap-2 flex-shrink-0">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: body.display.color }}
            />
            <h2 className="text-sm font-semibold text-white flex-1">
              {body.localizedName}
              <span className="text-xs text-gray-400 ml-1.5">{body.name}</span>
            </h2>
            <button
              onClick={() => selectBody(null)}
              className="text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Info list - compact for mobile */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            <InfoRow label="半径" value={`${formatNumber(body.radiusKm)} km`} />
            <InfoRow label="质量" value={`${body.massKg.toExponential(2)} kg`} />
            <InfoRow label="自转" value={formatPeriod(body.rotationPeriodHours)} />
            {!isSun && body.orbit && (
              <>
                <div className="border-t border-gray-700/50 pt-2">
                  <InfoRow label="半长轴" value={formatDistance(body.orbit.semiMajorAxisKm)} />
                  <InfoRow label="公转" value={formatOrbitalPeriod(body.orbit.orbitalPeriodDays)} />
                  {distFromSunKm !== null && (
                    <InfoRow label="距太阳" value={formatDistance(distFromSunKm)} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: right sidebar layout
  return (
    <div
      className={`absolute top-0 right-0 h-full z-20 transition-all duration-300 flex ${
        effectiveCollapsed ? 'w-10' : 'w-72'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleInfoPanel}
        className="absolute top-3 -left-3 w-6 h-12 bg-gray-800/80 hover:bg-gray-700/80
                   border border-gray-600/50 rounded-l-md flex items-center justify-center
                   text-gray-300 z-30 cursor-pointer transition-colors hover:border-gray-500/60"
        title={effectiveCollapsed ? '展开信息' : '收起信息'}
      >
        {effectiveCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Panel content */}
      <div
        className={`w-full bg-gray-900/80 backdrop-blur-md border-l border-gray-700/50
                     flex flex-col overflow-hidden transition-all duration-300 ml-auto ${
                       effectiveCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                     }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-700/50 flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
            style={{
              backgroundColor: body.display.color,
              boxShadow: `0 0 8px ${body.display.color}30`,
            }}
          />
          <h2 className="text-base font-semibold text-white flex-1">
            {body.localizedName}
            <span className="text-xs text-gray-400 ml-2">{body.name}</span>
          </h2>
          <button
            onClick={() => selectBody(null)}
            className="text-gray-400 hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
          <InfoRow label="类型" value={isSun ? '恒星' : '行星'} />
          <InfoRow label="半径" value={`${formatNumber(body.radiusKm)} km`} />
          <InfoRow label="直径" value={`${formatNumber(body.radiusKm * 2)} km`} />
          <InfoRow label="质量" value={`${body.massKg.toExponential(2)} kg`} />
          <InfoRow
            label="自转周期"
            value={formatPeriod(body.rotationPeriodHours)}
          />
          <InfoRow label="自转方向" value={body.rotationDirection === 'prograde' ? '顺行 ↺' : '逆行 ↻'} />
          <InfoRow label="轴倾角" value={`${body.axialTiltDeg}°`} />

          {!isSun && body.orbit && (
            <>
              <div className="border-t border-gray-700/50 pt-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">轨道参数</h3>
              </div>
              <InfoRow
                label="半长轴"
                value={formatDistance(body.orbit.semiMajorAxisKm)}
              />
              <InfoRow
                label="离心率"
                value={body.orbit.eccentricity.toFixed(4)}
              />
              <InfoRow
                label="轨道倾角"
                value={`${body.orbit.inclinationDeg.toFixed(2)}°`}
              />
              <InfoRow
                label="公转周期"
                value={formatOrbitalPeriod(body.orbit.orbitalPeriodDays)}
              />
              {distFromSunKm !== null && (
                <>
                  <InfoRow
                    label="当前距太阳"
                    value={formatDistance(distFromSunKm)}
                  />
                  <InfoRow
                    label="光行时间"
                    value={formatLightTime(distFromSunKm)}
                  />
                </>
              )}
            </>
          )}

          <div className="border-t border-gray-700/50 pt-3">
            <InfoRow label="数据来源" value={body.dataSource} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-100 text-right break-all font-medium">{value}</span>
    </div>
  );
}
