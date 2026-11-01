import React, { useEffect, useRef } from "react";
import twemoji from "twemoji";

export default function Emoji({ symbol, className }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) {
      twemoji.parse(rootRef.current, {
        folder: "svg",
        ext: ".svg",
        base: "https://cloudflare.com" // 使用公共稳定 CDN 加载 SVG
      });
    }
  }, [symbol]);

  return (
    <span ref={rootRef} className={className} style={{ display: "inline-block" }}>
      {symbol}
    </span>
  );
}
