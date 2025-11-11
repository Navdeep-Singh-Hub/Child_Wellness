import React, { useEffect, useState } from "react";
import { getMyProfile } from "@/utils/api";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const hasMinPhone = (p: any) => String(p?.phoneNumber || "").replace(/\D/g, "").length >= 10;

export default function RequireCompleteProfile({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "incomplete">("checking");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const p = await getMyProfile();
        if (p?.firstName && p?.dob && hasMinPhone(p)) {
          if (alive) setStatus("ok");
        } else {
          if (alive) setStatus("incomplete");
        }
      } catch {
        if (alive) setStatus("incomplete");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (status === "incomplete") {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  return <>{children}</>;
}

