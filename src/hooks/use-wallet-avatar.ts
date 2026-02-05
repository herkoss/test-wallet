import avatarOptions, { getAccountAvatar, getAvatar } from '@/config/avatar-options';
import { useAccount } from '@/contexts/account-context';
import { useEffect, useState } from 'react';

const useWalletAvatar = () => {
  const { activeAccountId } = useAccount();
  const [avatar, setAvatar] = useState<string>(avatarOptions[0].emoji);

  useEffect(() => {
    if (activeAccountId) {
      getAccountAvatar(activeAccountId).then(a => setAvatar(a.emoji));
    } else {
      // Fallback to legacy avatar for pre-migration state
      getAvatar().then(a => setAvatar(a.emoji));
    }
  }, [activeAccountId]);

  return avatar;
};

export default useWalletAvatar;
