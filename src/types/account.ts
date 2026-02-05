export interface AccountProfile {
  id: string;
  name: string;
  isPrimary: boolean;
  createdAt: number;
  avatarId: number;
}

export interface AccountRegistryData {
  accounts: AccountProfile[];
  activeAccountId: string;
  version: number;
}

export const STORAGE_KEYS = {
  ACCOUNT_REGISTRY: 'account_registry',
  ACCOUNT_SEED_PREFIX: 'account_seed_',
  ACCOUNT_AVATAR_PREFIX: 'wallet_avatar_',
  LEGACY_AVATAR: 'wallet_avatar',
} as const;
