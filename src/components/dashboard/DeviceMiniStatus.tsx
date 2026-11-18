import React from 'react';
import { Cpu, Wifi, HardDrive, Zap, RefreshCw, Server, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DeviceMiniStatus: React.FC = () => {
  const { device, refreshDeviceStatus, setActivePage } = useApp();

  const psramPercent = Math.round(
    ((device.telemetry.totalPsramBytes - device.telemetry.freePsramBytes) /
      device.telemetry.totalPsramBytes) *
      100
  );

  const heapPercent = Math.round(
    ((device.telemetry.totalHeapBytes - device.telemetry.freeHeapBytes) /
      device.telemetry.totalHeapBytes) *
      100
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              ESP32 Edge Device Telemetry
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Model: {device.type}
            </p>
          </div>
        </div>

        <button
          onClick={refreshDeviceStatus}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Refresh Device State"
          aria-label="Refresh Device State"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Device Specs & Metrics */}
      <div className="p-4 space-y-3.5 text-xs font-mono">
        {/* Hardware Identity Row */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Device Node ID</div>
            <div className="font-bold text-slate-200">{device.deviceId}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Firmware</div>
            <div className="text-cyan-400">{device.firmwareVersion}</div>
          </div>
        </div>

        {/* Network & Power Status */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase">Wi-Fi (802.11 b/g/n)</div>
              <div className="text-slate-200 truncate">{device.ipAddress}</div>
              <div className="text-[10px] text-emerald-400">{device.telemetry.wifiRssiDbm} dBm (Good)</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase">Xtensa Dual-Core</div>
              <div className="text-slate-200">{device.telemetry.cpuFreqMhz} MHz</div>
              <div className="text-[10px] text-slate-400">Core Temp: {device.telemetry.temperatureCelsius}°C</div>
            </div>
          </div>
        </div>

        {/* Memory Gauges (PSRAM & Internal SRAM Heap) */}
        <div className="space-y-2">
          {/* PSRAM (N16R8 Octal SPI 8MB) */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                Octal PSRAM (8 MB)
              </span>
              <span className="text-slate-300">
                {(device.telemetry.freePsramBytes / (1024 * 1024)).toFixed(2)} MB Free ({100 - psramPercent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${psramPercent}%` }}
              />
            </div>
          </div>

          {/* Internal Heap (320 KB) */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Server className="w-3 h-3 text-purple-400" />
                SRAM Heap (320 KB)
              </span>
              <span className="text-slate-300">
                {Math.round(device.telemetry.freeHeapBytes / 1024)} KB Free ({100 - heapPercent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${heapPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer link to dedicated devices page */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 text-[11px]">Flash Storage: 16 MB QSPI</span>
        <button
          onClick={() => setActivePage('devices')}
          className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 transition-colors"
        >
          Device Diagnostics <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
