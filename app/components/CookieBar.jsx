import React, { useEffect } from 'react';

export default function CookieBar({ store, customer_id = 0, trackingConsent = () => {}}) {
    useEffect(() => {
        window.consentmoAppSettings = {
            shop: store,
            customer_id: customer_id || 0,
            setTrackingConsent: (value) => {
            if (value) {
                console.log('valid consent');
            } else {
                console.log('invalid consent')
            }
            }
        }
        }, [])
  
    return (
       <script src="https://gdpr.apps.isenselabs.com/js/gdpr_cookie_consent_headless.original.js"></script>
    )
  }