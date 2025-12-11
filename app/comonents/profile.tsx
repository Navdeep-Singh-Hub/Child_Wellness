import { useAuth } from '@/app/providers/AuthProvider';
import React from 'react';
import { Image, Text, View } from 'react-native';

const Profile = () => {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  const user = session.profile;

  return (
    <View className="items-center p-4">
      {user?.picture && (
        <Image source={{ uri: user.picture }} className="w-24 h-24 rounded-full mb-4" />
      )}
      {user?.name && <Text className="text-2xl font-bold text-gray-900 mb-2">{user.name}</Text>}
      {user?.email && <Text className="text-gray-600">{user.email}</Text>}
    </View>
  );
};

export default Profile;