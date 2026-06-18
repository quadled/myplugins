export type LogEntry = {
  id: string;
  component: string;
  props: string;
  time: string;
};

// Temporärer Log-Speicher (wird beim App-Neustart geleert)
export const internalLogs: LogEntry[] = [];
let logUpdateCallback: (() => void) | undefined;

export function addLog(component: string, propsObj: any) {
  const time = new Date().toLocaleTimeString();
  const id = Math.random().toString(36).substr(2, 9);
  
  // Nur die neuesten 50 Logs behalten, damit das Handy nicht laggt
  if (internalLogs.length > 50) internalLogs.shift();
  
  internalLogs.push({
    id,
    component,
    props: JSON.stringify(propsObj),
    time
  });

  // UI benachrichtigen, falls aktiv
  if (logUpdateCallback) logUpdateCallback();
}

export function clearLogs() {
  internalLogs.length = 0;
  if (logUpdateCallback) logUpdateCallback();
}

export function registerLogListener(callback: () => void) {
  logUpdateCallback = callback;
}

export function unregisterLogListener() {
  logUpdateCallback = undefined;
}