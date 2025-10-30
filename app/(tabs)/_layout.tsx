import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Image, ImageBackground, Text, View } from "react-native";


const TabIcon=({ focused, title, icon }: any)=>{

  if(focused)
    {
            return(
               <ImageBackground 
                  source={images.highlight} 
                  className="flex flex-row w-full flex-1 min-w-[112px] min-h-14 justify-center items-center rounded-full overflow-hidden pt-1 pb-1 "
              >

                <Image 
                  source={icon}
                  tintColor= '#151312'
                  className="size-5"
                 />
                <Text
                  className="text-secondary text-base font-semibold ml-1"
                  >
                  {title}
                </Text>
              </ImageBackground>
            )
     }
     return(
      <View className="size-full justify-center items-center mt-4 rounded-full">
        <Image source={icon} tintColor='#A8B5DB' className="size-5" />
      </View>
     )
}
const _Layout=()=>{

  const {isLoaded, isSignedIn,userId, sessionId,getToken} = useAuth();
  if(!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={"large"} color={"#0f0D23"}/>
      </View>
    )
  }
  return (
    <>
    <SignedOut>
      <Redirect href={"/(auth)/sign-in" as any} />
    </SignedOut>
    <SignedIn>
    <Tabs
      screenOptions={{
        tabBarShowLabel:false,
        tabBarItemStyle:{
          width:'100%',
          height:'100%',
          justifyContent:'center',
          alignItems:'center'
        },
        tabBarStyle:{
          backgroundColor:'#0f0D23',
          borderRadius:50,
          marginHorizontal:15,
          marginBottom:36,
          height:52,
          position:"absolute",
          overflow:'hidden',
          borderWidth:1,
          borderColor:'#0f0d23'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({focused})=>(
            <TabIcon 
              focused={focused}
              icon={icons.home}
              title="Home"
            />
          )
        }}
      />
      <Tabs.Screen
        name="Games"
        options={{
          title: "Games",
          headerShown: false,
          tabBarIcon: ({focused})=>(
            <TabIcon 
              focused={focused}
              icon={icons.games}
              title="Games"
            />
          )
        }}
      />
      <Tabs.Screen
          name="AACgrid"
          options={{
            title: "Grid Section",
            headerShown: false,
            tabBarIcon: ({focused})=>(
            <TabIcon 
              focused={focused}
              icon={icons.motor}
              title="Grids"
            />
          )
          }}
      />

      
      <Tabs.Screen
            name="Profile"
            options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({focused})=>(
              <TabIcon 
                  focused={focused}
                  icon={icons.person}
                  title="Profile"
              />
          )
          }}
      />
        
    </Tabs>
    </SignedIn>
    </>
  )
}
export default _Layout