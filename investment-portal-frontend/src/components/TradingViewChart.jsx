import React, { useEffect, useRef, memo } from 'react';

const TradingViewChart = ({ symbol = "NASDAQ:AAPL", interval = "D", theme = "light", height = 600 }) => {
  const containerRef = useRef();
  const widgetId = useRef(`tradingview_${Math.random().toString(36).substring(2, 15)}`);

  useEffect(() => {
    // Ensure the TradingView script is not already loaded
    if (document.getElementById('tradingview-widget-script')) {
      // If already loaded, just re-initialize the widget if container exists
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          "width": "100%",
          "height": height,
          "symbol": symbol,
          "interval": interval,
          "timezone": "Etc/UTC",
          "theme": theme,
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": widgetId.current,
        });
      }
      return;
    }

    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.id = 'tradingview-widget-script'; // Add an ID to prevent duplicate loading

    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          "width": "100%",
          "height": height,
          "symbol": symbol,
          "interval": interval,
          "timezone": "Etc/UTC",
          "theme": theme,
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": widgetId.current,
        });
      }
    };

    // Append the script to the body
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      if (containerRef.current) {
        // Optional: Clean up the widget instance if TradingView provides a destroy method
        // For most TradingView widgets, simply removing the container is sufficient
        // as they don't leave global side effects that need explicit cleanup.
        // If you encounter issues, you might need to find a way to destroy the widget.
      }
      // Remove the script if it was added by this component instance
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval, theme, height]); // Re-run effect if these props change

  return (
    <div className="tradingview-widget-container">
      <div id={widgetId.current} ref={containerRef} className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewChart);

