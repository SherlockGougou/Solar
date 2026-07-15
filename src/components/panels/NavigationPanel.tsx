/**
 * Left sidebar: list of all celestial bodies with focus buttons.
 * Collapsible on mobile.
 */

import { CELESTIAL_BODIES } from '../../data/celestial-bodies';
import { useSimulationStore } from '../../simulation/state/simulation-store';
import { useSettingsStore } from '../../simulation/state/settings-store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavigationPanel() {
  const selectedBodyId = useSimulationStore((s) => s.selectedBodyId);
  const selectBody = useSimulationStore((s) => s.selectBody);
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);

  return (
    <div
      className={`absolute top-0 left-0 h-full z-20 transition-all duration-300 flex ${
        collapsed ? 'w-10' : 'w-52'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-3 -right-3 w-6 h-12 bg-gray-800/80 hover:bg-gray-700/80
                   border border-gray-600/50 rounded-r-md flex items-center justify-center
                   text-gray-300 z-30 cursor-pointer"
        title={collapsed ? '展开导航' : '收起导航'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Panel content */}
      <div
        className={`w-full bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50
                     flex flex-col overflow-hidden transition-opacity ${
                       collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                     }`}
      >
        <div className="p-3 border-b border-gray-700/50">
          <h2 className="text-sm font-semibold text-gray-200 tracking-wide">天体导航</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {CELESTIAL_BODIES.map((body) => {
            const isSelected = selectedBodyId === body.id;
            return (
              <button
                key={body.id}
                onClick={() => selectBody(body.id)}
                className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer
                  ${isSelected
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                  }`}
              >
                {/* Color dot */}
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: body.display.color }}
                />

                <span className="text-sm font-medium">{body.localizedName}</span>
                <span className="text-xs text-gray-500 ml-auto">{body.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
