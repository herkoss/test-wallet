import { colors } from '@/constants/colors';
import { useAccount } from '@/contexts/account-context';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

export default function AccountSwitchingOverlay() {
  const { isSwitching } = useAccount();

  if (!isSwitching) return null;

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.text}>Switching account...</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});
