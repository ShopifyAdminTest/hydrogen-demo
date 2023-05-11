import React, { useEffect } from 'react';

export default function CookieBar({ store, customer_id = 0, trackingConsent = () => {}}) {
    useEffect(() => {
        window.iSenseAppSettings = {
            shop: store,
            customer_id: customer_id || 0,
            setTrackingConsent: (value) => {
            if (value) {
                alert('valid consent');
            } else {
                alert('invalid consent')
            }
            }
        }
        }, [])
  
    return (
       <script src="https://gdprcdn.b-cdn.net/js/gdpr_cookie_consent_headless.min.js"></script>
    )
  }