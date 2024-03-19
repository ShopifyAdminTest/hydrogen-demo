import React, { useEffect } from 'react';

export default function CookieBar({ store, customer_id = 0, trackingConsent = () => {}}) {
    useEffect(() => {
        window.iSenseAppSettings = {
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
        <>
            <div id="solidjs_render_here" style="position: fixed;bottom: 0; width: 100%;text-align: center;z-index: 99999999"></div>
            <script src="https://gdpr.apps.isenselabs.com/webroot/js/solidjs/dist/bundle.js"></script>
        </>
    )
  }