'use dom';

import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
  useConversationMode,
  useConversationClientTool,
} from '@elevenlabs/react';
import { useCallback, useEffect } from 'react';

async function requestMicrophonePermission(): Promise<boolean> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error('Microphone permission denied');
    return false;
  }
}

interface VoiceAgentProps {
  dom?: import('expo/dom').DOMProps;
  agentId: string;
  workoutName: string;
  workoutPlan: string;
  onStatusChange: (status: string) => void;
  onTranscript: (role: string, message: string) => void;
  onModeChange: (isSpeaking: boolean) => void;
  completeSet: (params: any) => Promise<string>;
  getWorkoutStatus: (params: any) => Promise<string>;
  startRestTimer: (params: any) => Promise<string>;
}

function VoiceAgentInner({
  onStatusChange,
  onTranscript,
  onModeChange,
  completeSet,
  getWorkoutStatus,
  startRestTimer,
}: Omit<VoiceAgentProps, 'dom' | 'agentId' | 'workoutName' | 'workoutPlan'>) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();

  // Register client tools via hooks (same as agent dashboard config)
  useConversationClientTool('complete_set', completeSet);
  useConversationClientTool('get_workout_status', getWorkoutStatus);
  useConversationClientTool('start_rest_timer', startRestTimer);

  const isConnected = status === 'connected';

  useEffect(() => {
    onModeChange(isSpeaking);
  }, [isSpeaking]);

  useEffect(() => {
    onStatusChange(status);
  }, [status]);

  const handleStart = useCallback(async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      onStatusChange('no_permission');
      return;
    }

    try {
      await startSession({
        connectionType: 'websocket',
        onConnect: () => {
          console.log('ElevenLabs connected');
          onStatusChange('connected');
        },
        onDisconnect: () => {
          console.log('ElevenLabs disconnected');
          onStatusChange('disconnected');
        },
        onMessage: ({ source, message }: { source: string; message: string }) => {
          onTranscript(source === 'ai' ? 'agent' : 'user', message);
        },
        onError: (msg: string) => {
          console.error('ElevenLabs error:', msg);
          onStatusChange('error');
        },
      });
    } catch (err) {
      console.error('Failed to start session:', err);
      onStatusChange('error');
    }
  }, [startSession]);

  const toggleConversation = useCallback(async () => {
    if (isConnected) {
      await endSession();
    } else {
      await handleStart();
    }
  }, [isConnected, handleStart, endSession]);

  const statusColor = isConnected
    ? isSpeaking
      ? '#FF3B30'
      : '#30D158'
    : status === 'connecting'
      ? '#FF9500'
      : '#6B7280';
  const statusText = isConnected
    ? isSpeaking
      ? 'TRAINER SPEAKING'
      : 'LISTENING'
    : status === 'connecting'
      ? 'CONNECTING...'
      : 'TAP TO START';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <button
        onClick={toggleConversation}
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          border: `3px solid ${statusColor}`,
          backgroundColor: isConnected ? `${statusColor}22` : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: isConnected
            ? `0 0 30px ${statusColor}44, 0 0 60px ${statusColor}22`
            : 'none',
          outline: 'none',
          WebkitAppearance: 'none' as any,
          padding: 0,
        }}
      >
        {isConnected && isSpeaking ? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
          color: statusColor,
          textTransform: 'uppercase' as const,
        }}
      >
        {statusText}
      </div>
    </div>
  );
}

export default function VoiceAgent(props: VoiceAgentProps) {
  const { dom, agentId, workoutName, workoutPlan, ...innerProps } = props;
  return (
    <ConversationProvider
      agentId={agentId}
      connectionType="websocket"
      dynamicVariables={{
        workout_name: workoutName,
        workout_plan: workoutPlan,
      }}
    >
      <VoiceAgentInner {...innerProps} />
    </ConversationProvider>
  );
}
