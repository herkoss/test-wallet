import * as accountStorage from '@/services/account-storage';
import { AccountProfile, AccountRegistryData } from '@/types/account';
import { useWallet, WDKService } from '@tetherto/wdk-react-native-provider';
import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';

interface AccountContextState {
  accounts: AccountProfile[];
  activeAccountId: string | null;
  isSwitching: boolean;
  isAccountsLoaded: boolean;
  isAddingAccount: boolean;
}

interface AccountContextType extends AccountContextState {
  activeAccount: AccountProfile | null;
  switchAccount: (accountId: string) => Promise<void>;
  addAccount: (params: {
    name: string;
    mnemonic: string;
    avatarId: number;
    setActive?: boolean;
  }) => Promise<AccountProfile>;
  setIsAddingAccount: (value: boolean) => void;
  getAccountCount: () => number;
}

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { wallet, createWallet, clearWallet, isUnlocked } = useWallet();
  const [state, setState] = useState<AccountContextState>({
    accounts: [],
    activeAccountId: null,
    isSwitching: false,
    isAccountsLoaded: false,
    isAddingAccount: false,
  });

  const migrationAttempted = useRef(false);
  const recoveryAttempted = useRef(false);

  // Load account registry on mount
  useEffect(() => {
    loadAccountRegistry();
  }, []);

  // Migration: existing single-wallet user with no registry
  // Must run AFTER unlock so WDKService.retrieveSeed works
  useEffect(() => {
    if (
      state.isAccountsLoaded &&
      state.accounts.length === 0 &&
      wallet &&
      isUnlocked &&
      !migrationAttempted.current
    ) {
      migrationAttempted.current = true;
      migrateExistingWallet();
    }
  }, [state.isAccountsLoaded, state.accounts.length, wallet, isUnlocked]);

  // Crash recovery: registry exists but no WDK wallet (app crashed mid-switch)
  useEffect(() => {
    if (
      state.isAccountsLoaded &&
      state.activeAccountId &&
      !wallet &&
      !state.isSwitching &&
      !recoveryAttempted.current
    ) {
      recoveryAttempted.current = true;
      recoverActiveAccount();
    }
  }, [state.isAccountsLoaded, state.activeAccountId, wallet, state.isSwitching]);

  const loadAccountRegistry = async () => {
    try {
      const registry = await accountStorage.getAccountRegistry();
      if (registry) {
        setState((prev) => ({
          ...prev,
          accounts: registry.accounts,
          activeAccountId: registry.activeAccountId,
          isAccountsLoaded: true,
        }));
      } else {
        setState((prev) => ({ ...prev, isAccountsLoaded: true }));
      }
    } catch (error) {
      console.error('Failed to load account registry:', error);
      setState((prev) => ({ ...prev, isAccountsLoaded: true }));
    }
  };

  const migrateExistingWallet = async () => {
    try {
      const prf = await getUniqueId();
      const mnemonic = await WDKService.retrieveSeed(prf);
      if (!mnemonic) {
        console.warn('Migration: could not retrieve seed');
        return;
      }

      const accountId = Crypto.randomUUID();
      const legacyAvatarId = await accountStorage.getLegacyAvatarId();

      // Store seed in our external keychain
      await accountStorage.storeSeed(accountId, mnemonic);

      // Copy avatar
      await accountStorage.setAccountAvatar(accountId, legacyAvatarId);

      const profile: AccountProfile = {
        id: accountId,
        name: wallet!.name,
        isPrimary: true,
        createdAt: Date.now(),
        avatarId: legacyAvatarId,
      };

      const registry: AccountRegistryData = {
        accounts: [profile],
        activeAccountId: accountId,
        version: 1,
      };

      await accountStorage.saveAccountRegistry(registry);

      setState((prev) => ({
        ...prev,
        accounts: [profile],
        activeAccountId: accountId,
      }));
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const recoverActiveAccount = async () => {
    try {
      const account = state.accounts.find((a) => a.id === state.activeAccountId);
      if (!account) return;

      const mnemonic = await accountStorage.retrieveSeed(account.id);
      if (!mnemonic) {
        console.error('Recovery: seed not found for active account');
        return;
      }

      setState((prev) => ({ ...prev, isSwitching: true }));
      await createWallet({ name: account.name, mnemonic });
      setState((prev) => ({ ...prev, isSwitching: false }));
    } catch (error) {
      console.error('Recovery failed:', error);
      setState((prev) => ({ ...prev, isSwitching: false }));
    }
  };

  const switchAccount = useCallback(
    async (targetAccountId: string) => {
      if (targetAccountId === state.activeAccountId) return;

      const targetAccount = state.accounts.find((a) => a.id === targetAccountId);
      if (!targetAccount) throw new Error('Account not found');

      setState((prev) => ({ ...prev, isSwitching: true }));

      try {
        // 1. Retrieve target seed
        const targetSeed = await accountStorage.retrieveSeed(targetAccountId);
        if (!targetSeed) throw new Error('Seed not found for account');

        // 2. Clear current WDK session
        await clearWallet();

        // 3. Small delay for cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 4. Create wallet with target seed
        await createWallet({ name: targetAccount.name, mnemonic: targetSeed });

        // 5. Update registry
        const registry: AccountRegistryData = {
          accounts: state.accounts,
          activeAccountId: targetAccountId,
          version: 1,
        };
        await accountStorage.saveAccountRegistry(registry);

        // 6. Update state
        setState((prev) => ({
          ...prev,
          activeAccountId: targetAccountId,
          isSwitching: false,
        }));
      } catch (error) {
        console.error('Failed to switch account:', error);
        setState((prev) => ({ ...prev, isSwitching: false }));
        throw error;
      }
    },
    [state.activeAccountId, state.accounts, clearWallet, createWallet]
  );

  const addAccount = useCallback(
    async (params: {
      name: string;
      mnemonic: string;
      avatarId: number;
      setActive?: boolean;
    }): Promise<AccountProfile> => {
      const accountId = Crypto.randomUUID();

      const profile: AccountProfile = {
        id: accountId,
        name: params.name,
        isPrimary: state.accounts.length === 0,
        createdAt: Date.now(),
        avatarId: params.avatarId,
      };

      // Store seed securely
      await accountStorage.storeSeed(accountId, params.mnemonic);

      // Store avatar
      await accountStorage.setAccountAvatar(accountId, params.avatarId);

      const newAccounts = [...state.accounts, profile];
      const activeId = params.setActive ? accountId : state.activeAccountId;

      if (params.setActive && state.activeAccountId) {
        // Switch to the new account
        setState((prev) => ({ ...prev, isSwitching: true }));
        try {
          await clearWallet();
          await new Promise((resolve) => setTimeout(resolve, 100));
          await createWallet({ name: params.name, mnemonic: params.mnemonic });
        } finally {
          setState((prev) => ({ ...prev, isSwitching: false }));
        }
      }
      // If setActive && no activeAccountId, createWallet was already called by the setup flow

      const registry: AccountRegistryData = {
        accounts: newAccounts,
        activeAccountId: activeId!,
        version: 1,
      };
      await accountStorage.saveAccountRegistry(registry);

      setState((prev) => ({
        ...prev,
        accounts: newAccounts,
        activeAccountId: activeId!,
        isAddingAccount: false,
      }));

      return profile;
    },
    [state.accounts, state.activeAccountId, clearWallet, createWallet]
  );

  const setIsAddingAccount = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isAddingAccount: value }));
  }, []);

  const activeAccount = state.accounts.find((a) => a.id === state.activeAccountId) || null;

  return (
    <AccountContext.Provider
      value={{
        ...state,
        activeAccount,
        switchAccount,
        addAccount,
        setIsAddingAccount,
        getAccountCount: () => state.accounts.length,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

export default AccountContext;
