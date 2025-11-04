import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import PillTabBar from "../comonents/PillTabBar";


const TabIcon = ({ focused, title, iconName, color }: { focused: boolean; title: string; iconName: keyof typeof Ionicons.glyphMap; color: string }) => {
  if (focused) {
    return (
      <LinearGradient
        colors={["#E0EAFF", "#F5F3FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 120,
          height: Platform.OS === 'web' ? 44 : 40,
          borderRadius: 999,
          paddingHorizontal: 14,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Ionicons name={iconName} size={18} color={'#111827'} />
        <Text style={{ marginLeft: 6, fontWeight: '700', color: '#111827' }}>{title}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
      <Ionicons name={iconName} size={18} color={color} />
    </View>
  );
};
const _Layout=()=>{
  // TODO: use Auth0 useAuth for session checks
  // const {isLoaded, isSignedIn,userId, sessionId,getToken} = useAuth();
  // if(!isLoaded) {
  //   return (
  //     <View className="flex-1 items-center justify-center">
  //       <ActivityIndicator size={"large"} color={"#0f0D23"}/>
  //     </View>
  // )
  // }
  return (
    <>
    {/* TODO: Replace session redirects with Auth0 logic */}
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
      tabBar={(props) => (
        <PillTabBar
          {...props}
          // this shows the little black logo circle like the demo
          logo={require("../../assets/images/logo.png")}
          railColor="#000000"
          pillFill="#FFFFFF"
          pillBorder="#000000"
          activeFill="#000000"
          labelColor="#000000"
          hoverLabelColor="#FFFFFF"
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} iconName={focused ? 'home' : 'home-outline'} title="Home" color={color as string} />
          )
        }}
      />
      <Tabs.Screen
        name="Games"
        options={{
          title: "Games",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} iconName={focused ? 'game-controller' : 'game-controller-outline'} title="Games" color={color as string} />
          )
        }}
      />
      <Tabs.Screen
          name="AACgrid"
          options={{
            title: "Grids",
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon focused={focused} iconName={focused ? 'grid' : 'grid-outline'} title="Grids" color={color as string} />
            )
          }}
      />

      
      <Tabs.Screen
            name="Profile"
            options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon focused={focused} iconName={focused ? 'person' : 'person-outline'} title="Profile" color={color as string} />
            )
          }}
      />
        
    </Tabs>
    </>
  )
}
export default _Layout