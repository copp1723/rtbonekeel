declare module 'keyRotationService' {
  export interface RotationOptions {
    deleteOldKeys?: boolean;
    minKeyAgeDays?: number;
  }

  export function rotateKeys(options?: RotationOptions): Promise<void>;
  export function getActiveKeyId(): Promise<string>;
  export function initializeKeyRotation(): Promise<void>;
}
