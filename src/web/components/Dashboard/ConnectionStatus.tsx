import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  onReconnect: () => void;
}

export default function ConnectionStatus({
  isConnected,
  isConnecting,
  error,
  onReconnect,
}: ConnectionStatusProps): React.ReactElement {
  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isConnected ? 'bg-green-100 text-green-800' :
        isConnecting ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        <span className={`mr-1.5 h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' :
          isConnecting ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500'
        }`} />
        {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
      </span>
      {!isConnected && !isConnecting && (
        <button
          onClick={onReconnect}
          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Reconnect
        </button>
      )}
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}