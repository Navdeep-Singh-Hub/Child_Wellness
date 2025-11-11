// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import React from "react";
import RequireCompleteProfile from "./RequireCompleteProfile";
import { Animated, Dimensions, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = 280;
// Ensure the hidden drawer sits fully off-screen to avoid any visible sliver
const CLOSED_OFFSET = MENU_WIDTH + 16;

function SlideOutMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = React.useState(false);

  const slideAnim = React.useRef(new Animated.Value(CLOSED_OFFSET)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  

  React.useEffect(() => {
    if (open) {
      // Slide menu in from right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide menu out to right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: CLOSED_OFFSET,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  // Show menu on all tabs, including AACgrid, for consistent UX

  const menuItems = [
    { title: "Home", route: "/(tabs)", icon: "home-outline" },
    { title: "Games", route: "/(tabs)/Games", icon: "game-controller-outline" },
    { title: "Grids", route: "/(tabs)/AACgrid", icon: "grid-outline" },
    { title: "Profile", route: "/(tabs)/Profile", icon: "person-outline" },
    { title: "Contact Us", route: "/(tabs)/Contact", icon: "mail-outline" },
    { title: "Add Tile", route: "/(tabs)/AACgrid?addTile=true", icon: "add-circle-outline", isAction: true },
  ];

  const navigateTo = (route: string) => {
    setOpen(false);
    setTimeout(() => {
      router.navigate(route as any);
    }, 100);
  };

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.9}
        style={{
          position: "absolute",
          right: 16,
          top: Platform.select({
            web: pathname?.includes('/(tabs)/AACgrid') ? 64 : 16,
            ios: pathname?.includes('/(tabs)/AACgrid') ? insets.top + 56 : insets.top + 8,
            android: pathname?.includes('/(tabs)/AACgrid') ? insets.top + 56 : insets.top + 8,
            default: 16,
          }),
          zIndex: 1000,
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
        accessibilityLabel="Open menu"
      >
        <Ionicons name="menu" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Overlay */}
      {open && (
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              opacity: overlayOpacity,
            }}
          />
        </Pressable>
      )}

      {/* Slide-out Menu (right side) */}
      <Animated.View
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: MENU_WIDTH,
          backgroundColor: "#FFFFFF",
          zIndex: 1001,
          transform: [{ translateX: slideAnim }],
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: -4, height: 0 },
          elevation: 15,
          paddingTop: insets.top + 20,
        }}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}>Menu</Text>
            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F3F4F6",
              }}
            >
              <Ionicons name="close" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingTop: 12 }}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.route || (item.route === "/(tabs)" && pathname === "/");
            const isAction = (item as any).isAction;
            return (
              <TouchableOpacity
                key={item.title}
                onPress={() => navigateTo(item.route)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  backgroundColor: isActive ? "#F0F9FF" : (isAction ? "#EEF2FF" : "transparent"),
                  borderLeftWidth: isActive ? 4 : 0,
                  borderLeftColor: "#2563EB",
                  marginTop: isAction ? 8 : 0,
                  borderTopWidth: isAction ? 1 : 0,
                  borderTopColor: "#E5E7EB",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={isActive ? "#2563EB" : (isAction ? "#6366F1" : "#6B7280")}
                  style={{ marginRight: 16 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: isActive ? "700" : (isAction ? "700" : "600"),
                    color: isActive ? "#2563EB" : (isAction ? "#6366F1" : "#374151"),
                  }}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* No content wrapper; we overlay above existing content only when open */}
    </>
  );
}

export default function Layout() {
  const pathname = usePathname();
  // Hide global menu on AACgrid screen (it has its own GridMenu)
  const showGlobalMenu = !(pathname?.includes('AACgrid') || pathname?.includes('/AACgrid'));
  return (
    <RequireCompleteProfile>
      <Stack screenOptions={{ headerShown: false }} />
      {showGlobalMenu ? <SlideOutMenu /> : null}
    </RequireCompleteProfile>
  );
}
