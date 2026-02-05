import avatarOptions from '@/config/avatar-options';
import { colors } from '@/constants/colors';
import { useAccount } from '@/contexts/account-context';
import { AccountProfile } from '@/types/account';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Check, Plus } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';

interface AccountSwitcherProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onAddAccount: () => void;
}

export default function AccountSwitcher({ bottomSheetRef, onAddAccount }: AccountSwitcherProps) {
  const { accounts, activeAccountId, switchAccount } = useAccount();

  const handleSelectAccount = async (account: AccountProfile) => {
    if (account.id === activeAccountId) {
      bottomSheetRef.current?.close();
      return;
    }

    bottomSheetRef.current?.close();

    try {
      await switchAccount(account.id);
    } catch {
      toast.error('Failed to switch account');
    }
  };

  const handleAddAccount = () => {
    bottomSheetRef.current?.close();
    onAddAccount();
  };

  const getAvatarEmoji = (avatarId: number) => {
    const option = avatarOptions[avatarId - 1];
    return option?.emoji || avatarOptions[0].emoji;
  };

  const getAvatarColor = (avatarId: number) => {
    const option = avatarOptions[avatarId - 1];
    return option?.color || avatarOptions[0].color;
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Accounts</Text>

        {accounts.map(account => {
          const isActive = account.id === activeAccountId;
          return (
            <TouchableOpacity
              key={account.id}
              style={[styles.accountRow, isActive && styles.accountRowActive]}
              onPress={() => handleSelectAccount(account)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarCircle, { backgroundColor: getAvatarColor(account.avatarId) }]}>
                <Text style={styles.avatarEmoji}>{getAvatarEmoji(account.avatarId)}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {account.name}
                </Text>
              </View>
              {isActive && <Check size={20} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount} activeOpacity={0.7}>
          <View style={styles.addIconCircle}>
            <Plus size={20} color={colors.primary} />
          </View>
          <Text style={styles.addButtonText}>Add Account</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.card,
  },
  handleIndicator: {
    backgroundColor: colors.textTertiary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  accountRowActive: {
    backgroundColor: 'rgba(255, 101, 1, 0.08)',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  accountInfo: {
    flex: 1,
    marginRight: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDark,
    marginVertical: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  bottomPadding: {
    height: 32,
  },
});
