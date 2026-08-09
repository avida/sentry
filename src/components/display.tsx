import React, { useEffect, useRef, useState } from "react";
import { getInitialLocale, type Locale, type LockState, translations } from "../i18n";

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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (!signalingUrl) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (ev) => {
      const stream = ev.streams && ev.streams[0];
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    };

    pc.onicecandidate = (ev) => {
      const ws = wsRef.current;
      if (ev.candidate && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "candidate", candidate: ev.candidate }));
      }
    };

    // If signalingUrl starts with http(s), use go2rtc HTTP POST flow (create offer, POST, receive SDP answer).
    const url = signalingUrl;
    const isHttp = url.startsWith("http://") || url.startsWith("https://");

    let ws: WebSocket | null = null;

    async function startHttpFlow() {
      try {
        // Indicate we want to receive video
        pc.addTransceiver("video", { direction: "recvonly" });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp,
        });
        if (!resp.ok) throw new Error("signaling POST failed: " + resp.status);
        const answerSdp = await resp.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      } catch (err) {
        console.warn("HTTP signaling failed", err);
      }
    }

    function startWsFlow(wsUrl: string) {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        try {
          ws && ws.send(JSON.stringify({ type: "watch" }));
        } catch (e) {
          console.warn("signaling send failed", e);
        }
      };

      ws.onmessage = async (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "offer" && msg.offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
            const ans = await pc.createAnswer();
            await pc.setLocalDescription(ans);
            ws && ws.send(JSON.stringify({ type: "answer", answer: ans }));
          } else if (msg.type === "candidate" && msg.candidate) {
            try {
              await pc.addIceCandidate(msg.candidate);
            } catch (err) {
              console.warn("failed to add remote ICE candidate", err);
            }
          }
        } catch (err) {
          console.warn("invalid signaling message", err);
        }
      };

      ws.onerror = (e) => console.warn("signaling ws error", e as any);
    }

    if (isHttp) {
      startHttpFlow();
    } else {
      // accept ws:// and wss://; if given without ws scheme, assume ws
      let wsUrl = url;
      if (url.startsWith("http://")) {
        wsUrl = "ws://" + url.slice("http://".length);
      } else if (url.startsWith("https://")) {
        wsUrl = "wss://" + url.slice("https://".length);
      }
      startWsFlow(wsUrl);
    }

    return () => {
      try {
        if (ws) ws.close();
      } catch {}
      try {
        wsRef.current && wsRef.current.close();
      } catch {}
      try {
        pc.getSenders().forEach((s) => s.track && s.track.stop());
      } catch {}
      try {
        pc.close();
      } catch {}
      if (videoRef.current) videoRef.current.srcObject = null;
      pcRef.current = null;
      wsRef.current = null;
    };
  }, [signalingUrl]);

  return (
    <div style={{ position: "relative", minHeight: 1 }}>
      {/* background video element */}
      <video ref={videoRef} autoPlay playsInline muted className="display-bg-video" />

      <h2>{t.targetingHud}</h2>
      <div className="reticle-wrap">
        <div className="reticle">
          <div className="reticle-sweep" aria-hidden="true" />
          <div className="crosshair horizontal" aria-hidden="true" />
          <div className="crosshair vertical" aria-hidden="true" />
          <div className="target-dot" aria-hidden="true" />
        </div>
      </div>

      <div className="hud-readout">
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
