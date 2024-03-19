import React, { useEffect } from 'react';

export default function CookieBar({ store, customer_id = 0, trackingConsent = () => {}}) {
    useEffect(() => {
        window.Shopify = {};
        window.iSenseAppSettings = {
            shop: store,
            customer_id: customer_id || 0,
            AdminBarInjector: true,
            setTrackingConsent: (value) => {
                if (value) {
                    console.log('valid consent');
                } else {
                    console.log('invalid consent')
                }
            }
        }
        // Load script here
        const script = document.createElement('script');
        script.src = 'https://gdpr.apps.isenselabs.com/webroot/js/solidjs/dist/bundle.js';
        document.body.appendChild(script);

        // Clean up function to remove the script when component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div id="solidjs_render_here" style={{"position": 'fixed', 'bottom': '0px', 'width': '100%','textAlign': 'center','zIndex': 99999999}}></div>
        )
    ; 
}