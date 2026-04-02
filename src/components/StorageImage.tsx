import React, { useState, useEffect, type CSSProperties } from "react";
import { API_URL } from "../config";
import { Loader2 } from "lucide-react";

type StorageImageProps = {
  fileKey: string | null | undefined;
  alt: string;
  style?: CSSProperties;
  fallbackName?: string;
};

export default function StorageImage({ fileKey, alt, style, fallbackName }: StorageImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileKey) {
      setError(true);
      return;
    }
    if (fileKey.startsWith("blob:") || fileKey.startsWith("http")) {
      setUrl(fileKey);
      return;
    }

    let isMounted = true;
    const token = localStorage.getItem("token");
    const loginType = localStorage.getItem("loginType") || "school";
    const apiBase = loginType === "platform" ? "platform" : "schools";

    fetch(`${API_URL}/${apiBase}/storage/view?key=${encodeURIComponent(fileKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("R2 Error");
        return r.json();
      })
      .then((d) => {
        if (isMounted) {
          if (d.url) setUrl(d.url);
          else setError(true);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [fileKey]);

  if (error || !url) {
    if (url === null && !error) {
      return (
        <div
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.05)",
          }}
        >
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      );
    }
    const avatar =
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(fallbackName || alt || "NN") +
      "&background=random";
    return <img src={avatar} alt={alt} style={style} />;
  }

  return (
    <img
      src={url}
      alt={alt}
      referrerPolicy="no-referrer"
      style={style}
      onError={() => setError(true)}
    />
  );
}
