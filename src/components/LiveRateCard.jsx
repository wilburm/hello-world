import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function LiveRateCard({ currency, rate, change, isLoading }) {
  const formatRate = (rateValue) => {
    return parseFloat(rateValue).toFixed(4);
  };

  const formatChange = (changeValue) => {
    const formatted = (changeValue * 100).toFixed(2);
    return `${changeValue >= 0 ? '+' : ''}${formatted}%`;
  };

  const getChangeIcon = (changeValue) => {
    if (Math.abs(changeValue) < 0.0001) {
      return <Minus className="icon-sm" aria-hidden="true" />;
    }
    return changeValue > 0 ? (
      <TrendingUp className="icon-sm" aria-hidden="true" />
    ) : (
      <TrendingDown className="icon-sm" aria-hidden="true" />
    );
  };

  const getChangeClass = (changeValue) => {
    if (Math.abs(changeValue) < 0.0001) return 'neutral';
    return changeValue > 0 ? 'positive' : 'negative';
  };

  const getCurrencyInfo = (curr) => {
    const currencyMap = {
      USD: { name: 'US Dollar', flag: '🇺🇸' },
      EUR: { name: 'Euro', flag: '🇪🇺' },
      GBP: { name: 'British Pound', flag: '🇬🇧' },
    };
    return currencyMap[curr] || { name: curr, flag: '💱' };
  };

  const currencyInfo = getCurrencyInfo(currency);

  if (isLoading) {
    return (
      <div className="card rate-card" role="region" aria-labelledby={`rate-${currency}`}>
        <div className="card-body">
          <div className="rate-currency">
            <span className="currency-flag" aria-hidden="true">
              {currencyInfo.flag}
            </span>
            {currency}
          </div>
          <div className="rate-value">
            <div className="spinner" aria-label="Loading rate" />
          </div>
          <div className="rate-change neutral">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card rate-card" 
      role="region" 
      aria-labelledby={`rate-${currency}`}
      aria-describedby={`rate-${currency}-description`}
    >
      <div className="card-body">
        <div className="rate-currency" id={`rate-${currency}`}>
          <span className="currency-flag" aria-hidden="true">
            {currencyInfo.flag}
          </span>
          {currency}
        </div>
        
        <div className="rate-value" aria-live="polite" aria-atomic="true">
          {formatRate(rate)}
        </div>
        
        <div 
          className={`rate-change ${getChangeClass(change)}`}
          id={`rate-${currency}-description`}
          aria-label={`${currencyInfo.name} rate ${formatChange(change)}`}
        >
          {getChangeIcon(change)}
          {formatChange(change)}
        </div>
        
        <div className="rate-currency-name">
          {currencyInfo.name}
        </div>
      </div>
    </div>
  );
}

export default LiveRateCard;