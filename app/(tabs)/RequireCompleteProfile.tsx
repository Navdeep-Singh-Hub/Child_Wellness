import { useAuth } from "@/app/_layout";
import { getMyProfile } from "@/utils/api";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const hasMinPhone = (p: any) => String(p?.phoneNumber || "").replace(/\D/g, "").length >= 10;

export default function RequireCompleteProfile({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [status, setStatus] = useState<"waiting-auth" | "checking" | "ok" | "incomplete">("waiting-auth");

  useEffect(() => {
    let alive = true;
    if (!session) {
      return;
    }
    setStatus("checking");
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
  }, [session]);

  if (status === "waiting-auth" || status === "checking") {
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

