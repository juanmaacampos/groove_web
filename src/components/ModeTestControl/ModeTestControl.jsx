import React, { useEffect, useRef, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import './modeTestControl.css';

const TOOLTIP_DURATION_MS = 3200;

const formatHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

const ModeTestControl = ({ visualMode, onToggleMode, dayStartHour = 12, dayEndHour = 19 }) => {
  const [showScheduleHint, setShowScheduleHint] = useState(false);
  const hideTimeoutRef = useRef(null);

  const handleSwitchClick = () => {
    onToggleMode();
    setShowScheduleHint(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowScheduleHint(false);
      hideTimeoutRef.current = null;
    }, TOOLTIP_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="mode-test-switch-container">
      <div className={`mode-test-schedule-tooltip ${showScheduleHint ? 'is-visible' : ''}`} role="status" aria-live="polite">
        <strong>Solo testing</strong>
        <span>TARDE (modo día): {formatHour(dayStartHour)} a {formatHour(dayEndHour)}</span>
        <span>NOCHE (modo bar): {formatHour(dayEndHour)} a {formatHour(dayStartHour)}</span>
      </div>

      <button
        type="button"
        className={`mode-test-switch-fab ${visualMode === 'bar' ? 'is-bar' : 'is-day'}`}
        aria-pressed={visualMode === 'bar'}
        aria-label="Cambiar entre modo día y modo noche (solo testing)"
        title="Solo testing: este control no estará en la web final"
        onClick={handleSwitchClick}
      >
        <span className="mode-test-switch-fab__track" aria-hidden="true">
          <FaSun className="mode-test-switch-fab__sun" />
          <FaMoon className="mode-test-switch-fab__moon" />
          <span className="mode-test-switch-fab__thumb" />
        </span>
      </button>
    </div>
  );
};

export default ModeTestControl;
