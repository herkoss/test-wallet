import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import avatarOptions from '@/config/avatar-options';
import { AccountRegistryData, STORAGE_KEYS } from '@/types/account';

// --- Registry (AsyncStorage) ---

export async function getAccountRegistry(): Promise<AccountRegistryData | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_REGISTRY);
  if (!raw) return null;
  return JSON.parse(raw) as AccountRegistryData;
}

export async function saveAccountRegistry(data: AccountRegistryData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNT_REGISTRY, JSON.stringify(data));
}

// --- Seed (react-native-keychain) ---

export async function storeSeed(accountId: string, mnemonic: string): Promise<void> {
  await Keychain.setGenericPassword(accountId, mnemonic, {
    service: `${STORAGE_KEYS.ACCOUNT_SEED_PREFIX}${accountId}`,
  });
}

export async function retrieveSeed(accountId: string): Promise<string | null> {
  const result = await Keychain.getGenericPassword({
    service: `${STORAGE_KEYS.ACCOUNT_SEED_PREFIX}${accountId}`,
  });
  if (!result) return null;
  return result.password;
}

export async function deleteSeed(accountId: string): Promise<void> {
  await Keychain.resetGenericPassword({
    service: `${STORAGE_KEYS.ACCOUNT_SEED_PREFIX}${accountId}`,
  });
}

// --- Per-account avatar (AsyncStorage) ---

export async function getAccountAvatar(accountId: string) {
  const key = `${STORAGE_KEYS.ACCOUNT_AVATAR_PREFIX}${accountId}`;
  const stored = await AsyncStorage.getItem(key);
  if (stored) {
    const id = parseInt(stored, 10);
    return avatarOptions[id - 1] || avatarOptions[0];
  }
  return avatarOptions[0];
}

export async function setAccountAvatar(accountId: string, avatarId: number): Promise<void> {
  const key = `${STORAGE_KEYS.ACCOUNT_AVATAR_PREFIX}${accountId}`;
  await AsyncStorage.setItem(key, JSON.stringify(avatarId));
}

export async function clearAccountAvatar(accountId: string): Promise<void> {
  const key = `${STORAGE_KEYS.ACCOUNT_AVATAR_PREFIX}${accountId}`;
  await AsyncStorage.removeItem(key);
}

// --- Legacy avatar (for migration) ---

export async function getLegacyAvatarId(): Promise<number> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_AVATAR);
  if (stored) return parseInt(stored, 10);
  return 1;
}
