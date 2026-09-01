import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  static async getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | null> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.length === 0) return null;
    const typeMap: Record<number, 'fingerprint' | 'face' | 'iris'> = {
      1: 'fingerprint',
      2: 'face',
      3: 'iris',
    };
    return typeMap[types[0]] ?? null;
  }

  static async authenticate(
    reason: string,
  ): Promise<{ success: boolean; error?: string; biometricType: string | null }> {
    const biometricType = await this.getBiometricType();
    if (!biometricType)
      return { success: false, error: 'Biometric not available', biometricType: null };
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });
      return { success: result.success, biometricType };
    } catch (error: any) {
      return { success: false, error: error.message, biometricType };
    }
  }

  static async storeCredentials(username: string, password: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(username, password, {
        service: 'com.ojchat.auth',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      });
      return true;
    } catch {
      return false;
    }
  }

  static async retrieveCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'com.ojchat.auth',
        authenticationPrompt: {
          title: 'Authenticate to sign in',
          subtitle: 'Verify your identity',
          cancel: 'Cancel',
        },
      });
      return credentials ? credentials : null;
    } catch {
      return null;
    }
  }

  static async deleteCredentials(): Promise<boolean> {
    try {
      return await Keychain.resetGenericPassword({ service: 'com.ojchat.auth' });
    } catch {
      return false;
    }
  }
}
