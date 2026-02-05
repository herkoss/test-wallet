import { colors } from '@/constants/colors';
import { useAccount } from '@/contexts/account-context';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { pricingService } from '../services/pricing-service';

export default function Index() {
  const { wallet, isInitialized, isUnlocked } = useWallet();
  const { isAccountsLoaded } = useAccount();
  const [isPricingReady, setIsPricingReady] = useState(false);

  const initializePricing = async () => {
    try {
      await pricingService.initialize();
      setIsPricingReady(true);
    } catch (error) {
      console.error('Failed to initialize pricing service:', error);
      setIsPricingReady(true);
    }
  };

  useEffect(() => {
    initializePricing();
  }, []);

  // Wait for WDK, pricing, and account registry to be ready
  if (!isInitialized || !isPricingReady || !isAccountsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!wallet) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={isUnlocked ? '/wallet' : '/authorize'} />;
}
