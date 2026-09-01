const SUPABASE_PROJECT_REF = 'lenivohgxznlrsqghxrg';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dalRTRYrY1c2QE6pUBkvcg_d5613SEU';
const REALTIME_URL = `wss://${SUPABASE_PROJECT_REF}.supabase.co/realtime/v1/websocket?apikey=${encodeURIComponent(SUPABASE_PUBLISHABLE_KEY)}&vsn=1.0.0`;

export type RealtimeTable = 'incidents' | 'soc_settings';

interface RealtimeMessage {
  topic?: string;
  event?: string;
  payload?: unknown;
  ref?: string | null;
  join_ref?: string | null;
}

export const subscribeToSupabaseChanges = (
  table: RealtimeTable,
  onChange: () => void,
  onConnectionChange?: (connected: boolean) => void
) => {
  let socket: WebSocket | null = null;
  let heartbeat: number | null = null;
  let reconnectTimer: number | null = null;
  let closedByClient = false;
  let refCounter = 1;

  const nextRef = () => String(refCounter++);
  const topic = `realtime:public:${table}`;

  const clearTimers = () => {
    if (heartbeat !== null) window.clearInterval(heartbeat);
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
    heartbeat = null;
    reconnectTimer = null;
  };

  const send = (message: RealtimeMessage) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const connect = () => {
    clearTimers();
    socket = new WebSocket(REALTIME_URL);

    socket.onopen = () => {
      const joinRef = nextRef();
      send({
        topic,
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { ack: false, self: false },
            presence: { enabled: false },
            postgres_changes: [{ event: '*', schema: 'public', table }],
            private: false,
          },
          access_token: SUPABASE_PUBLISHABLE_KEY,
        },
        ref: joinRef,
        join_ref: joinRef,
      });

      heartbeat = window.setInterval(() => {
        send({
          topic: 'phoenix',
          event: 'heartbeat',
          payload: {},
          ref: nextRef(),
          join_ref: null,
        });
      }, 25000);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as RealtimeMessage;

        if (message.event === 'phx_reply' && message.topic === topic) {
          const payload = message.payload as { status?: string } | undefined;
          if (payload?.status === 'ok') onConnectionChange?.(true);
        }

        if (message.event === 'system' && message.topic === topic) {
          const payload = message.payload as { status?: string } | undefined;
          if (payload?.status === 'ok') onConnectionChange?.(true);
        }

        if (message.event === 'postgres_changes' && message.topic === topic) {
          onChange();
        }
      } catch (error) {
        console.warn('Supabase realtime message could not be parsed.', error);
      }
    };

    socket.onerror = () => {
      onConnectionChange?.(false);
    };

    socket.onclose = () => {
      onConnectionChange?.(false);
      clearTimers();
      if (!closedByClient) {
        reconnectTimer = window.setTimeout(connect, 2500);
      }
    };
  };

  connect();

  return () => {
    closedByClient = true;
    clearTimers();
    if (socket && socket.readyState <= WebSocket.OPEN) {
      send({
        topic,
        event: 'phx_leave',
        payload: {},
        ref: nextRef(),
        join_ref: null,
      });
      socket.close();
    }
  };
};
