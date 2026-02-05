# Multi-Account Support (WDK)

## Goal
Add multi-account support to the wallet (similar to MetaMask / Trust Wallet) while **WDK supports only one active account (seed) at a time**.

The app manages multiple wallet profiles and re-initializes WDK when switching the active account.

---

## Key Concepts

- **Account**: A wallet profile backed by a single seed phrase.
- **Primary Account**: The first created account.
- **Active Account**: The currently selected account; only this account is connected to WDK.

---

## UI / UX

### Header
- Top-left header (account name + avatar) must include a **Chevron Down**.
- Tap opens **Account Switcher Modal**.

### Account Switcher Modal
- Displays a list of all accounts:
  - avatar
  - name
  - short address
  - active indicator
- Tapping an account:
  - closes modal
  - switches active account
- Bottom action:
  - **Add Account** → navigates to Create / Import screen

### Add Account Screen
Two actions:
- **Create Account** (generate new seed)
- **Import Account** (enter existing seed)

---

## Data Model

```ts
AccountProfile {
  id: string            // UUID
  name: string          // "Account 1", "Account 2", etc.
  isPrimary: boolean
  createdAt: number
  encryptedSeed: string // stored in secure storage
}
```

Global state:
- `accounts: AccountProfile[]`
- `activeAccountId: string`

---

## Storage Rules

- Seeds MUST be stored encrypted in **Secure Storage** (Keychain / Keystore).
- App storage MUST NOT contain plaintext seeds.
- Account list and activeAccountId may be stored separately.

---

## Account Switching Logic

When switching accounts:

1. Load and decrypt selected account seed
2. Dispose current WDK session
3. Re-initialize WDK with new seed:
   ```ts
   wdk = new WDK(seedPhrase)
   ```
4. Recreate all account-scoped services:
   - balances
   - transactions
   - addresses
   - caches
5. Update UI (show loader during switch)

Result: the entire app reflects the selected account.

---

## Add Account Flow

### Create Account
1. Generate new seed
2. Encrypt & store seed
3. Create AccountProfile
4. Add to accounts list
5. Optionally set as active

### Import Account
1. Validate seed phrase
2. Encrypt & store seed
3. Create AccountProfile
4. Add to accounts list
5. Optionally set as active

---

## Architecture Recommendation

### AccountStore
Single source of truth:
- `getAccounts()`
- `getActiveAccount()`
- `setActiveAccount(id)`
- `createAccount()`
- `importAccount(seed)`

### Wallet Session Manager
Responsible for:
- initializing WDK
- destroying previous session
- preventing service leaks on switch

---

## Loading & Errors

- Show blocking loader during account switch
- On seed decryption failure:
  - show error
  - keep previous active account
- Invalid import seed:
  - inline validation
  - disable continue

---

## Acceptance Criteria

- User can create multiple accounts
- User can import existing accounts
- User can switch accounts from header modal
- Switching accounts fully changes balances, addresses, and history
- App always has exactly **one active WDK instance**

---

## Out of Scope

- Account deletion
- Account renaming
- Exporting private keys / seeds
- Multiple derivation paths within a single seed

---

## Notes

This implementation treats **each account as a separate seed**.
Multi-account via derivation paths (MetaMask-style within one seed) is intentionally excluded.
