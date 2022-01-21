import { twoWayEventEmitter } from "./utils";

export const spawnEvents = twoWayEventEmitter<
  { workflowName: string; startFromStep: number },
  { success: boolean; message?: string }
>();

export const pauseEvents =
  twoWayEventEmitter<{ workflowName: string; paused: boolean }>();

export const terminationEvents = twoWayEventEmitter<{ workflowName: string }>();
