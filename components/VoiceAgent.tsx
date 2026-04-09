'use dom';

import { ConversationProvider, useConversation } from '@elevenlabs/react';
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
  exerciseName: string;
  totalSets: number;
  targetReps: number;
  weight: number;
  autoStart?: boolean;
  onStatusChange: (status: string) => void;
  onTranscript: (role: string, message: string) => void;
  onModeChange: (isSpeaking: boolean) => void;
  completeSet: (params: { reps: number }) => Promise<string>;
  getWorkoutStatus: () => Promise<string>;
  startRestTimer: (params: { seconds: number }) => Promise<string>;
}

function VoiceAgentInner({
  agentId,
  exerciseName,
  totalSets,
  targetReps,
  weight,
  autoStart,
  onStatusChange,
  onTranscript,
  onModeChange,
  completeSet,
  getWorkoutStatus,
  startRestTimer,
}: Omit<VoiceAgentProps, 'dom'>) {
  const conversation = useConversation({
    onConnect: () => onStatusChange('connected'),
    onDisconnect: () => onStatusChange('disconnected'),
    onMessage: ({ source, message }: { source: string; message: string }) => {
      onTranscript(source === 'ai' ? 'agent' : 'user', message);
    },
    onError: (message: string) => {
      console.error('ElevenLabs error:', message);
      onStatusChange('error');
    },
  });

  useEffect(() => {
    onModeChange(conversation.isSpeaking);
  }, [conversation.isSpeaking]);

  const startConversation = useCallback(async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      onStatusChange('no_permission');
      return;
    }

    onStatusChange('connecting');

    conversation.startSession({
      agentId,
      dynamicVariables: {
        exercise_name: exerciseName,
        total_sets: String(totalSets),
        target_reps: String(targetReps),
        weight: String(weight),
      },
      clientTools: {
        complete_set: completeSet,
        get_workout_status: getWorkoutStatus,
        start_rest_timer: startRestTimer,
      },
    });
  }, [conversation, agentId, exerciseName, totalSets, targetReps, weight]);

  const toggleConversation = useCallback(async () => {
    if (conversation.status === 'connected') {
      conversation.endSession();
    } else {
      await startConversation();
    }
  }, [conversation.status, startConversation]);

  useEffect(() => {
    if (autoStart && agentId) {
      startConversation();
    }
  }, []);

  const isConnected = conversation.status === 'connected';
  const statusColor = isConnected
    ? conversation.isSpeaking
      ? '#FF3B30'
      : '#30D158'
    : conversation.status === 'connecting'
      ? '#FF9500'
      : '#6B7280';
  const statusText = isConnected
    ? conversation.isSpeaking
      ? 'TRAINER SPEAKING'
      : 'LISTENING'
    : conversation.status === 'connecting'
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
        {isConnected && conversation.isSpeaking ? (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={statusColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={statusColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
  const { dom, ...innerProps } = props;
  return (
    <ConversationProvider>
      <VoiceAgentInner {...innerProps} />
    </ConversationProvider>
  );
}
