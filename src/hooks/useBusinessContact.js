import { useEffect, useState } from 'react';
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '../config/socials.js';
import { useFirebase } from '../firebase/FirebaseProvider.jsx';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

export function useBusinessContact() {
  const [contactPhone, setContactPhone] = useState(WHATSAPP_DISPLAY);
  const [whatsAppHref, setWhatsAppHref] = useState(WHATSAPP_LINK);
  const { menuSDK, isInitialized } = useFirebase();

  useEffect(() => {
    let isMounted = true;

    const loadBusinessContact = async () => {
      if (!menuSDK) {
        return;
      }

      try {
        const businessInfo = await menuSDK.getBusinessInfo();
        const configuredPhone = businessInfo?.contactInfo;
        const configuredLink = buildWhatsAppLink(configuredPhone);

        if (!isMounted || !configuredPhone || !configuredLink) {
          return;
        }

        setContactPhone(configuredPhone);
        setWhatsAppHref(configuredLink);
      } catch (error) {
        console.error('Error loading business contact info:', error);
      }
    };

    loadBusinessContact();

    return () => {
      isMounted = false;
    };
  }, [menuSDK]);

  return {
    contactPhone,
    whatsAppHref,
    isInitialized,
  };
}