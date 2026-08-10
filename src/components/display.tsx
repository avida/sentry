import React, { useState } from "react";
import {
  getInitialLocale,
  type Locale,
  type LockState,
  translations,
} from "../i18n";
import WebrtcPlayer from "./WebrtcPlayer";

interface DisplayProps {
  lockState: LockState;
  targetConfidence: number;
  rangeGate: number;
  /**
   * Optional WebSocket signaling URL for establishing a WebRTC session.
   * Expected server flow: client sends {type: 'watch'}; server sends {type: 'offer', offer};
   * client responds with {type: 'answer', answer}; ICE candidates exchanged via {type: 'candidate'} messages.
   */
  signalingUrl?: string;
}

export const Display: React.FC<DisplayProps> = ({
  lockState,
  targetConfidence,
  rangeGate,
  signalingUrl,
}) => {
  const [locale] = useState<Locale>(getInitialLocale);
  const t = translations[locale];

  // WebRTC playback delegated to `WebrtcPlayer` component.

  return (
    <div className="display-root" style={{ position: "relative" }}>
      <h2 className="overlay-title">{t.targetingHud}</h2>
      <div className="display-viewport">
        {/* background video element handled by WebrtcPlayer */}
        <WebrtcPlayer
          signalingUrl={signalingUrl}
          className="display-bg-video"
        />

        {/* Overlay: HUD elements placed over the video */}
        <div className="display-overlay">
          <div className="reticle-wrap overlay-reticle">
            <div className="reticle">
              <div className="reticle-sweep" aria-hidden="true" />
              <div className="crosshair horizontal" aria-hidden="true" />
              <div className="crosshair vertical" aria-hidden="true" />
              <div className="target-dot" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* HUD readout stays below the video */}
      <div className="hud-readout below-viewport">
        <div>
          <span>{t.lockStatus}</span>
          <strong>{t.lockStates[lockState]}</strong>
        </div>
        <div>
          <span>{t.confidence}</span>
          <strong>{targetConfidence}%</strong>
        </div>
        <div>
          <span>{t.rangeGate}</span>
          <strong>
            {rangeGate} {t.units.meters}
          </strong>
        </div>
      </div>
    </div>
  );
};
