export type LogEntry = {
  id: string;
  component: string;
  props: string;
  time: string;
};

export const internalLogs: LogEntry[] = [];
let logUpdateCallback: (() => void) | undefined;

export function addLog(component: string, propsObj: any) {
  const time = new Date().toLocaleTimeString();
  const id = Math.random().toString(36).substring(2, 11);
  
  if (internalLogs.length > 50) internalLogs.shift();
  
  internalLogs.push({
    id,
    component,
    props: JSON.stringify(propsObj),
    time
  });

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