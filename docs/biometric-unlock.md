# Biometric Unlock (Face ID / Touch ID)

## Goal
Allow users to unlock (log in to) the wallet using **biometric authentication** (Face ID / Touch ID / device biometrics), if supported by the device.

Biometric unlock is **optional** and can be:
- enabled during initial wallet creation, or
- enabled / disabled later in Settings.

Biometrics act as a convenience layer and **do not replace the wallet secret (PIN / password / seed)**.

---

## Supported Platforms

- iOS: Face ID / Touch ID
- Android: BiometricPrompt (fingerprint / face, depending on device)

Biometric availability must be detected at runtime.

---

## Key Concepts

- **Biometric Unlock**: Using device biometrics to unlock access to the wallet.
- **Wallet Secret**: The primary secret (PIN / password) used to encrypt wallet data.
- **Biometric Key**: A key stored in Secure Enclave / Keystore, unlocked only after successful biometric authentication.

---

## User Flows

### 1. Wallet Creation
During initial wallet setup:
- User is prompted: **“Enable Biometric Unlock?”**
- Options:
  - Enable biometrics
  - Skip

Rules:
- If enabled → biometric key is created and linked to wallet encryption.
- If skipped → wallet uses PIN/password only.

---

### 2. Unlocking the Wallet
On app launch or lock state:
- If biometric unlock is enabled and available:
  - Trigger biometric prompt
  - On success → unlock wallet
  - On failure / cancel → fallback to PIN/password
- If biometric unlock is disabled:
  - Show PIN/password screen directly

---

### 3. Settings Management
In **Settings → Security**:
- Toggle: **Biometric Unlock**
  - OFF → ON
  - ON → OFF

Rules:
- Enabling requires successful PIN/password confirmation.
- Disabling removes biometric key but keeps wallet data intact.
- Changes apply immediately.

---

## State Model

```ts
BiometricState {
  isSupported: boolean   // device capability
  isEnabled: boolean     // user preference
}
```

Persistent flags:
- `biometricEnabled: boolean`

---

## Storage & Security Rules

- Biometrics MUST NOT store seed phrases or private keys directly.
- Wallet secrets remain encrypted using the primary encryption key.
- Biometric unlock:
  - protects access to the encryption key
  - or decrypts a secondary key stored in Secure Storage
- All biometric-protected keys MUST:
  - be hardware-backed
  - be invalidated if biometrics change (OS-level)

---

## Enable Biometric Unlock (Flow)

1. Check device biometric support
2. Prompt user for PIN/password
3. Generate biometric-protected key
4. Store key in Secure Storage with biometric access control
5. Set `biometricEnabled = true`

---

## Disable Biometric Unlock (Flow)

1. Prompt user for PIN/password
2. Delete biometric-protected key
3. Set `biometricEnabled = false`

---

## Error Handling

- Device has no biometric support:
  - Hide biometric options
- Biometrics temporarily unavailable:
  - Show fallback PIN/password
- Biometric lockout (too many attempts):
  - Force PIN/password unlock
- OS biometric change detected:
  - Invalidate biometric key
  - Require PIN/password and re-enable biometrics manually

---

## Acceptance Criteria

- User can enable biometric unlock during wallet creation
- User can enable biometric unlock later in Settings
- User can disable biometric unlock at any time
- Wallet always falls back to PIN/password if biometrics fail
- No sensitive secrets are stored in plaintext
- App works correctly on devices without biometrics

---

## Out of Scope

- Biometric-only wallets (no PIN/password)
- Cross-device biometric sync
- Recovery via biometrics

---

## Notes

Biometric unlock is a **UX convenience feature**, not a recovery mechanism.
Loss of biometric access MUST NOT result in loss of wallet funds.
