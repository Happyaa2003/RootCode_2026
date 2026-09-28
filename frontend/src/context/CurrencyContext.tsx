import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CurrencyCode } from '../types';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  toggleCurrency: () => void;
  fxRate: number; // 1 USD = 312.50 LKR
  formatPrice: (usdAmount: number, options?: { compact?: boolean; includeSign?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Market conversion rate: 1 USD = 312.50 LKR
export const USD_TO_LKR_RATE = 312.50;

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('waypoint-currency') as CurrencyCode) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('waypoint-currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'USD' ? 'LKR' : 'USD'));
  };

  const formatPrice = (usdAmount: number, options?: { compact?: boolean; includeSign?: boolean }): string => {
    const isLKR = currency === 'LKR';
    const amount = isLKR ? usdAmount * USD_TO_LKR_RATE : usdAmount;
    const signPrefix = options?.includeSign && usdAmount > 0 ? '+' : '';

    if (options?.compact) {
      if (isLKR) {
        if (Math.abs(amount) >= 1_000_000) {
          return `${signPrefix}Rs. ${(amount / 1_000_000).toFixed(1)}M`;
        }
        if (Math.abs(amount) >= 1_000) {
          return `${signPrefix}Rs. ${(amount / 1_000).toFixed(1)}k`;
        }
        return `${signPrefix}Rs. ${Math.round(amount).toLocaleString()}`;
      } else {
        if (Math.abs(amount) >= 1_000_000) {
          return `${signPrefix}$${(amount / 1_000_000).toFixed(1)}M`;
        }
        if (Math.abs(amount) >= 1_000) {
          return `${signPrefix}$${(amount / 1_000).toFixed(1)}k`;
        }
        return `${signPrefix}$${amount.toFixed(0)}`;
      }
    }

    if (isLKR) {
      return `${signPrefix}Rs. ${Math.round(amount).toLocaleString()}`;
    } else {
      return `${signPrefix}$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        fxRate: USD_TO_LKR_RATE,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
