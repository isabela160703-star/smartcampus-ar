import React, { useState } from 'react';
import { X, Sun, Moon, Smartphone, Move, Footprints } from 'lucide-react';

/**
 * SensorSimulatorDrawer - Panel flotante para simular sensores en PC
 * - Simular movimiento (Caminando/Quieto, Shake)
 * - Simular nivel de luz (Normal, Oscuro, Sol directo)
 * - Slider de 0° a 360° para rotar la brújula
 * - Contador de pasos manual
 */
const SensorSimulatorDrawer = ({ isOpen, onClose, onSimulatorChange, onAddSteps }) => {
  const [isWalking, setIsWalking] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [lightMode, setLightMode] = useState('normal');
  const [alpha, setAlpha] = useState(0);
  const [gamma, setGamma] = useState(0);

  const handleToggleWalking = () => {
    const newValue = !isWalking;
    setIsWalking(newValue);
    onSimulatorChange({ isWalking: newValue, alpha, gamma, lightMode, isShake });
  };

  const handleShake = () => {
    setIsShake(true);
    onSimulatorChange({ isWalking, alpha, gamma, lightMode, isShake: true });
    setTimeout(() => {
      setIsShake(false);
      onSimulatorChange({ isWalking, alpha, gamma, lightMode, isShake: false });
    }, 500);
  };

  const handleLightModeChange = (mode) => {
    setLightMode(mode);
    onSimulatorChange({ isWalking, alpha, gamma, lightMode: mode, isShake });
  };

  const handleAlphaChange = (e) => {
    const value = parseInt(e.target.value);
    setAlpha(value);
    onSimulatorChange({ isWalking, alpha: value, gamma, lightMode, isShake });
  };

  const handleGammaChange = (e) => {
    const value = parseInt(e.target.value);
    setGamma(value);
    onSimulatorChange({ isWalking, alpha, gamma: value, lightMode, isShake });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Simulador de Sensores</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Simulación de Movimiento */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Movimiento
          </h3>
          <div className="space-y-3">
            {/* Caminando/Quieto */}
            <button
              onClick={handleToggleWalking}
              className={`w-full p-4 rounded-xl font-bold transition-all ${
                isWalking
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isWalking ? '🚶 Caminando' : '🧍 Quieto'}
            </button>

            {/* Shake */}
            <button
              onClick={handleShake}
              className={`w-full p-4 rounded-xl font-bold transition-all ${
                isShake
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Move className="w-5 h-5" />
                Agitar (Shake)
              </span>
            </button>
          </div>
        </div>

        {/* Simulación de Luz */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Nivel de Luz
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLightModeChange('normal')}
              className={`p-3 rounded-xl font-bold transition-all ${
                lightMode === 'normal'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleLightModeChange('dark')}
              className={`p-3 rounded-xl font-bold transition-all ${
                lightMode === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Moon className="w-4 h-4" />
                Oscuro
              </span>
            </button>
            <button
              onClick={() => handleLightModeChange('solar')}
              className={`p-3 rounded-xl font-bold transition-all ${
                lightMode === 'solar'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              ☀️ Sol
            </button>
          </div>
        </div>

        {/* Simulación de Brújula (Alpha) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Brújula (Alpha): {alpha}°
          </h3>
          <input
            type="range"
            min="0"
            max="360"
            value={alpha}
            onChange={handleAlphaChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0° (N)</span>
            <span>90° (E)</span>
            <span>180° (S)</span>
            <span>270° (O)</span>
            <span>360°</span>
          </div>
        </div>

        {/* Botón de cierre */}
          <p className="text-xs text-gray-500 mt-2">
            También cuenta automáticamente mientras el modo "Caminando" esté activo
          </p>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Footprints className="w-5 h-5 text-yellow-500" />
            Contador de Pasos (sesión)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddSteps && onAddSteps(1)}
              className="p-3 rounded-xl font-bold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
            >
              +1 paso
            </button>
            <button
              onClick={() => onAddSteps && onAddSteps(10)}
              className="p-3 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
            >
              +10 pasos
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            También cuenta automáticamente mientras el modo "Caminando" esté activo
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full p-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          Cerrar Simulador
        </button>
      </div>
    </div>
  );
};

export default SensorSimulatorDrawer;
