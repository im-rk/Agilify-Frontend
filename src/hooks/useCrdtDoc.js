import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { toast } from 'sonner';
import keycloak from '@/lib/keycloak';
import api from '@/api';
import { applyTextDiff } from '@/lib/textDiff';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8082';

/**
 * Owns the Y.Doc + WebSocket for one collaborative doc. The server (CrdtDocWebSocketHandler)
 * never parses the binary it relays — all CRDT merge logic runs here, client-side, via Yjs.
 *
 * ponytail: the token is read once at connect time; Keycloak's default token lifetime is
 * short (~5 min), so a long editing session can outlive it and the socket will just drop.
 * Reconnect-with-fresh-token is the natural next step if that turns out to matter in practice.
 */
export function useCrdtDoc(projectKey, docId) {
  const [text, setLocalText] = useState('');
  const [connected, setConnected] = useState(false);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!docId) return undefined;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('content');
    ydocRef.current = ydoc;
    ytextRef.current = ytext;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/docs/${docId}?token=${keycloak.token}`);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => toast.error('Lost connection to the doc — reload to reconnect.');
    ws.onmessage = (event) => {
      Y.applyUpdate(ydoc, new Uint8Array(event.data), 'remote');
    };

    const onYUpdate = (update, origin) => {
      setLocalText(ytext.toString());
      if (origin !== 'remote' && ws.readyState === WebSocket.OPEN) {
        ws.send(update);
      }
    };
    ydoc.on('update', onYUpdate);

    return () => {
      ydoc.off('update', onYUpdate);
      ws.close();
      ydoc.destroy();
    };
  }, [docId]);

  function setText(newValue) {
    if (ytextRef.current) {
      applyTextDiff(ytextRef.current, text, newValue);
    }
  }

  async function saveSnapshot() {
    const fullState = Y.encodeStateAsUpdate(ydocRef.current);
    await api.post(`/projects/${projectKey}/docs/${docId}/compact`, fullState, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    toast.success('Saved a compact snapshot.');
  }

  return { text, setText, connected, saveSnapshot };
}
