import React, { useEffect, useRef } from "react";

type Props = {
  signalingUrl?: string;
  className?: string;
};

const WebrtcPlayer: React.FC<Props> = ({ signalingUrl, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
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

    // update CSS vars on parent to match the displayed video rectangle
    function updateVideoVars() {
      const video = videoRef.current;
      const wrapper = wrapperRef.current;
      if (!video || !wrapper) return;
      const parent = wrapper.parentElement as HTMLElement | null;
      if (!parent) return;

      const vw = video.videoWidth || 16;
      const vh = video.videoHeight || 9;
      const cw = wrapper.clientWidth;
      const ch = wrapper.clientHeight;
      const videoRatio = vw / vh;
      let displayW = cw;
      let displayH = ch;
      let offsetX = 0;
      let offsetY = 0;
      if (cw / ch > videoRatio) {
        // constrained by height
        displayH = ch;
        displayW = ch * videoRatio;
        offsetX = Math.round((cw - displayW) / 2);
      } else {
        // constrained by width
        displayW = cw;
        displayH = cw / videoRatio;
        offsetY = Math.round((ch - displayH) / 2);
      }

      parent.style.setProperty("--video-left", `${offsetX}px`);
      parent.style.setProperty("--video-top", `${offsetY}px`);
      parent.style.setProperty("--video-width", `${Math.round(displayW)}px`);
      parent.style.setProperty("--video-height", `${Math.round(displayH)}px`);
    }

    const ro = new ResizeObserver(() => updateVideoVars());
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    const onMeta = () => updateVideoVars();
    videoRef.current?.addEventListener("loadedmetadata", onMeta);

    pc.onicecandidate = (ev) => {
      const ws = wsRef.current;
      if (ev.candidate && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "candidate", candidate: ev.candidate }));
      }
    };

    const url = signalingUrl;
    const isHttp = url.startsWith("http://") || url.startsWith("https://");

    let ws: WebSocket | null = null;

    async function startHttpFlow() {
      try {
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
        ro.disconnect();
      } catch {}
      try {
        videoRef.current?.removeEventListener("loadedmetadata", onMeta);
      } catch {}
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
    <div ref={wrapperRef} style={{ position: "absolute", inset: 0 }}>
      <video ref={videoRef} autoPlay playsInline muted className={className} />
    </div>
  );
};

export default WebrtcPlayer;
