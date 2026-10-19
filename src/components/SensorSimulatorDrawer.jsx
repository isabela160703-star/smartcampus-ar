import React, { useState } from 'react';
import { X, Sun, Moon, Smartphone, Move } from 'lucide-react';

/**
 * SensorSimulatorDrawer - Panel flotante para simular sensores en PC
 * - Simular movimiento (Caminando/Quieto, Shake)
 * - Simular nivel de luz (Normal, Oscuro, Sol directo)
 * - Slider de 0° a 360° para rotar la brújula
 */
const SensorSimulatorDrawer = ({ isOpen, onClose, onSimulatorChange }) => {
  const [isWalking, setIsWalking] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [lightMode, setLightMode] = useState('normal');
  const [alpha, setAlpha] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [magnitud, setMagnitud] = useState(40);

  const handleToggleWalking = () => {
    const newValue = !isWalking;
    setIsWalking(newValue);
    onSimulatorChange({ isWalking: newValue, alpha, gamma, lightMode, isShake, magnitud });
  };

  const handleShake = () => {
    setIsShake(true);
    onSimulatorChange({ isWalking, alpha, gamma, lightMode, isShake: true, magnitud });
    setTimeout(() => {
      setIsShake(false);
      onSimulatorChange({ isWalking, alpha, gamma, lightMode, isShake: false, magnitud });
    }, 500);
  };

  const handleLightModeChange = (mode) => {
    setLightMode(mode);
    onSimulatorChange({ isWalking, alpha, gamma, lightMode: mode, isShake, magnitud });
  };

  const handleAlphaChange = (e) => {
    const value = parseInt(e.target.value);
    setAlpha(value);
    onSimulatorChange({ isWalking, alpha: value, gamma, lightMode, isShake, magnitud });
  };

  const handleGammaChange = (e) => {
    const value = parseInt(e.target.value);
    setGamma(value);
    onSimulatorChange({ isWalking, alpha, gamma: value, lightMode, isShake, magnitud });
  };

  const handleMagnitudChange = (e) => {
    const value = parseInt(e.target.value);
    setMagnitud(value);
    onSimulatorChange({ isWalking, alpha, gamma, lightMode, isShake, magnitud: value });
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

        {/* Simulación de Inclinación (Gamma) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Inclinación (Gamma): {gamma}°
          </h3>
          <input
            type="range"
            min="-90"
            max="90"
            value={gamma}
            onChange={handleGammaChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-90° (Izq)</span>
            <span>0°</span>
            <span>+90° (Der)</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Inclina más de 25° para cambiar de tarjeta
          </p>
        </div>

        {/* Simulación de Campo Magnético (Módulo 5) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-purple-600">🧲</span>
            Campo Magnético: {magnitud} µT
          </h3>
          <input
            type="range"
            min="10"
            max="130"
            value={magnitud}
            onChange={handleMagnitudChange}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              magnitud > 55 ? 'bg-red-500' : 'bg-purple-300'
            }`}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 µT</span>
            <span>40 µT (base ambiental)</span>
            <span>130 µT</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supera los 55 µT (base + 15) para activar la detección de metal en el HUD AR
          </p>
        </div>

        {/* Botón de cierre */}
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
