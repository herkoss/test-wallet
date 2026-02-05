import { colors } from '@/constants/colors';
import { useAccount } from '@/contexts/account-context';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { ChevronLeft, Download, Wallet } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddAccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { setIsAddingAccount } = useAccount();

  const handleCreateAccount = () => {
    setIsAddingAccount(true);
    router.push('/wallet-setup/name-wallet');
  };

  const handleImportAccount = () => {
    setIsAddingAccount(true);
    router.push('/wallet-setup/import-wallet');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Add Account</Text>
        <Text style={styles.subtitle}>
          Create a new account or import an existing one using a seed phrase.
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleCreateAccount}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: 'rgba(255, 101, 1, 0.1)' }]}>
              <Wallet size={28} color={colors.primary} />
            </View>
            <Text style={styles.optionTitle}>Create Account</Text>
            <Text style={styles.optionDescription}>Generate a new seed phrase and account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleImportAccount}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <Download size={28} color={colors.success} />
            </View>
            <Text style={styles.optionTitle}>Import Account</Text>
            <Text style={styles.optionDescription}>
              Use an existing seed phrase to add an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  options: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
