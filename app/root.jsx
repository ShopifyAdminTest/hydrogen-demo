import {defer} from '@shopify/remix-oxygen';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from '@remix-run/react';
import {ShopifySalesChannel, Seo} from '@shopify/hydrogen';
import {Layout} from '~/components';
import CookieBar from '~/components/CookieBar';
import {GenericError} from './components/GenericError';
import {NotFound} from './components/NotFound';
import styles from './styles/app.css';
import favicon from '../public/favicon.svg';
import {seoPayload} from '~/lib/seo.server';
import {DEFAULT_LOCALE, parseMenu, getCartId} from './lib/utils';
import invariant from 'tiny-invariant';
import {useAnalytics} from './hooks/useAnalytics';

export const links = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export async function loader({request, context}) {
  const cartId = getCartId(request);
  const [customerAccessToken, layout] = await Promise.all([
    context.session.get('customerAccessToken'),
    getLayoutData(context),
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  return defer({
    isLoggedIn: Boolean(customerAccessToken),
    layout,
    selectedLocale: context.storefront.i18n,
    cart: cartId ? getCart(context, cartId) : undefined,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: layout.shop.id,
    },
    seo,
  });
}

export default function App() {
  const data = useLoaderData();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useAnalytics(hasUserConsent, locale);

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script dangerouslySetInnerHTML={{__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-T3CWJ7KV');`}} />

        <script dangerouslySetInnerHTML={{__html: `window.isenseRules = {};
  window.isenseRules.gcm = {
      gcmVersion: 2,
      integrationVersion: 2,
      initialState: 7,
      customChanges: false,
      consentUpdated: false,
      adsDataRedaction: true,
      urlPassthrough: false,
      storage: { ad_personalization: "granted", ad_storage: "granted", ad_user_data: "granted", analytics_storage: "granted", functionality_storage: "granted", personalization_storage: "granted", security_storage: "granted", wait_for_update: 500 }
  };
  window.isenseRules.initializeGcm = function (rules) {
    let initialState = rules.initialState;
    let analyticsBlocked = initialState === 0 || initialState === 3 || initialState === 6 || initialState === 7;
    let marketingBlocked = initialState === 0 || initialState === 2 || initialState === 5 || initialState === 7;
    let functionalityBlocked = initialState === 4 || initialState === 5 || initialState === 6 || initialState === 7;

    let gdprCache = localStorage.getItem('gdprCache') ? JSON.parse(localStorage.getItem('gdprCache')) : null;
    if (gdprCache && typeof gdprCache.updatedPreferences !== "undefined") {
      let updatedPreferences = gdprCache && typeof gdprCache.updatedPreferences !== "undefined" ? gdprCache.updatedPreferences : null;
      analyticsBlocked = parseInt(updatedPreferences.indexOf('analytics')) > -1;
      marketingBlocked = parseInt(updatedPreferences.indexOf('marketing')) > -1;
      functionalityBlocked = parseInt(updatedPreferences.indexOf('functionality')) > -1;

      rules.consentUpdated = true;
    }
    
    isenseRules.gcm = {
      ...rules,
      storage: {
        ad_personalization: marketingBlocked ? "denied" : "granted",
        ad_storage: marketingBlocked ? "denied" : "granted",
        ad_user_data: marketingBlocked ? "denied" : "granted",
        analytics_storage: analyticsBlocked ? "denied" : "granted",
        functionality_storage: functionalityBlocked ? "denied" : "granted",
        personalization_storage: functionalityBlocked ? "denied" : "granted",
        security_storage: "granted",
        wait_for_update: 500
      },
    };
  }

  // Google Consent Mode - initialization start
  window.isenseRules.initializeGcm({
    ...window.isenseRules.gcm,
    adsDataRedaction: true,
    urlPassthrough: false,
    initialState: 7
  });

  /*
  * initialState acceptable values:
  * 0 - Set both ad_storage and analytics_storage to denied
  * 1 - Set all categories to granted
  * 2 - Set only ad_storage to denied
  * 3 - Set only analytics_storage to denied
  * 4 - Set only functionality_storage to denied
  * 5 - Set both ad_storage and functionality_storage to denied
  * 6 - Set both analytics_storage and functionality_storage to denied
  * 7 - Set all categories to denied
  */

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "default", isenseRules.gcm.storage);
  isenseRules.gcm.adsDataRedaction && gtag("set", "ads_data_redaction", isenseRules.gcm.adsDataRedaction);
  isenseRules.gcm.urlPassthrough && gtag("set", "url_passthrough", isenseRules.gcm.urlPassthrough);`}} />
        <Seo />
        <Meta />
        <Links />
        
      </head>
      <body>
        <div id="solidjs_render_here"></div>

        <CookieBar
          store={'shoesforuse.myshopify.com'}
          customer_id={data.isLoggedIn}
          trackingConsent={() => {}}
        />
        <Layout
          layout={data.layout}
          key={`${locale.language}-${locale.country}`}
        >
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({error}) {
  const [root] = useMatches();
  const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>

        <Layout
          layout={root?.data?.layout}
          key={`${locale.language}-${locale.country}`}
        >
          {isRouteError ? (
            <>
              {routeError.status === 404 ? (
                <NotFound type={pageType} />
              ) : (
                <GenericError
                  error={{message: `${routeError.status} ${routeError.data}`}}
                />
              )}
            </>
          ) : (
            <GenericError error={error instanceof Error ? error : undefined} />
          )}
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layoutMenus(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      id
      name
      description
      primaryDomain {
        url
      }
      brand {
       logo {
         image {
          url
         }
       }
     }
    }
    headerMenu: menu(handle: $headerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
  }
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
`;

async function getLayoutData({storefront}) {
  const HEADER_MENU_HANDLE = 'main-menu';
  const FOOTER_MENU_HANDLE = 'footer';

  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: HEADER_MENU_HANDLE,
      footerMenuHandle: FOOTER_MENU_HANDLE,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  /*
        Modify specific links/routes (optional)
        @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
        e.g here we map:
          - /blogs/news -> /news
          - /blog/news/blog-post -> /news/blog-post
          - /collections/all -> /products
      */
  const customPrefixes = {BLOG: '', CATALOG: 'products'};

  const headerMenu = data?.headerMenu
    ? parseMenu(data.headerMenu, customPrefixes)
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(data.footerMenu, customPrefixes)
    : undefined;

  return {shop: data.shop, headerMenu, footerMenu};
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

export async function getCart({storefront}, cartId) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
