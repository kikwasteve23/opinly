"use client";

import { useEffect, useState } from "react";

const KEY = "opinly_device";

export function DeviceTokenField() {
  const [token, setToken] = useState("");
  useEffect(() => {
    try {
      let id = window.localStorage.getItem(KEY) ?? "";
      if (!/^[a-z0-9-]{8,80}$/i.test(id)) {
        id = crypto.randomUUID();
        window.localStorage.setItem(KEY, id);
      }
      setToken(id);
    } catch {
      /* ignore */
    }
  }, []);
  return <input type="hidden" name="deviceToken" value={token} />;
}
