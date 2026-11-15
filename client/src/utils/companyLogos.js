import React, { useState } from 'react';

// Domain mapping for real corporate and startup logos
const COMPANY_DOMAINS = {
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com',
  'goldman sachs': 'goldmansachs.com',
  'uber': 'uber.com',
  'atlassian': 'atlassian.com',
  'cisco': 'cisco.com',
  'salesforce': 'salesforce.com',
  'razorpay': 'razorpay.com',
  'cred': 'cred.club',
  'zerodha': 'zerodha.com',
  'swiggy': 'swiggy.com',
  'browserstack': 'browserstack.com',
  'adobe': 'adobe.com',
  'zomato': 'zomato.com',
  'nvidia': 'nvidia.com',
  'apple': 'apple.com',
  'stripe': 'stripe.com',
  'meta': 'meta.com',
  'netflix': 'netflix.com',
  'openai': 'openai.com',
  'github': 'github.com',
  'oracle': 'oracle.com',
  'flipkart': 'flipkart.com',
  'tata': 'tata.com',
  'tata sons': 'tata.com',
  'zepto': 'zeptonow.com',
  'worldquant': 'worldquant.com',
  'mu sigma': 'mu-sigma.com',
  'swiss re': 'swissre.com',
  'fractal': 'fractal.ai',
  'fractal analytics': 'fractal.ai',
  'zoho': 'zoho.com',
  'groww': 'groww.in',
  'cuemath': 'cuemath.com',
  'slice': 'slice.com',
  'urban company': 'urbancompany.com',
  'dukaan': 'mydukaan.io',
  'phonepe': 'phonepe.com',
  'paytm': 'paytm.com',
  'inmobi': 'inmobi.com',
  'postman': 'postman.com',
  'devrev': 'devrev.ai',
  'sarvam ai': 'sarvam.ai',
  'invideo': 'invideo.io',
  'garuda aerospace': 'garudaaerospace.com'
};

// Explicit high-resolution CDN logos for special brand assets
const EXPLICIT_LOGOS = {
  'anshumat foundation': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  'khatabook': 'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png',
  'slice': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Slice_logo.svg',
  'garuda aerospace': 'https://cdn-icons-png.flaticon.com/512/995/995343.png'
};

export const getCompanyLogoUrl = (orgName) => {
  if (!orgName) return null;
  const lower = orgName.trim().toLowerCase();

  if (EXPLICIT_LOGOS[lower]) {
    return EXPLICIT_LOGOS[lower];
  }

  // Find matching domain
  for (const [key, domain] of Object.entries(COMPANY_DOMAINS)) {
    if (lower.includes(key)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
  }

  // Generic fallback using sanitized domain name
  const cleanName = lower.replace(/[^a-z0-9]/g, '');
  return `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=128`;
};

// Distinctive brand theme colors
const BRAND_COLORS = {
  'google': '#EA4335',
  'microsoft': '#00A4EF',
  'amazon': '#FF9900',
  'goldman sachs': '#1D4ED8',
  'uber': '#000000',
  'atlassian': '#0052CC',
  'cisco': '#049FD9',
  'salesforce': '#00A1E0',
  'razorpay': '#0C2340',
  'cred': '#1B2533',
  'zerodha': '#387ED1',
  'swiggy': '#FC8019',
  'zomato': '#E23744',
  'nvidia': '#76B900',
  'apple': '#000000',
  'stripe': '#635BFF',
  'meta': '#0668E1',
  'netflix': '#E50914',
  'flipkart': '#2874F0',
  'zepto': '#7C3AED',
  'worldquant': '#0F172A',
  'zoho': '#EA4335',
  'groww': '#00D09C',
  'cuemath': '#F59E0B'
};

export const getBrandColor = (orgName) => {
  if (!orgName) return '#00B289';
  const lower = orgName.trim().toLowerCase();
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#00B289';
};

/**
 * CompanyLogo
 * Renders real corporate/startup logos with transparent containment
 * and graceful fallback to crisp brand initial typography.
 */
export const CompanyLogo = ({ organization, size = 44, style = {}, className = '' }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const logoUrl = getCompanyLogoUrl(organization);
  const firstLetter = (organization || 'I').charAt(0).toUpperCase();
  const brandColor = getBrandColor(organization);

  return (
    <div
      className={`company-logo-badge ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: size > 40 ? '12px' : '8px',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '5px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        position: 'relative',
        flexShrink: 0,
        ...style
      }}
    >
      {!loadFailed && logoUrl ? (
        <img
          src={logoUrl}
          alt={organization}
          loading="lazy"
          onError={() => setLoadFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      ) : (
        <span
          style={{
            fontWeight: 800,
            fontSize: `${Math.round(size * 0.42)}px`,
            color: brandColor,
            fontFamily: 'inherit'
          }}
        >
          {firstLetter}
        </span>
      )}
    </div>
  );
};

export default CompanyLogo;
