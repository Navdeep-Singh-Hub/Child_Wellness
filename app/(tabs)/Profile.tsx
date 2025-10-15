import { useAuth, useUser } from '@clerk/clerk-expo';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
	const { signOut } = useAuth();
	const { user } = useUser();

	return (
		<View className="flex-1">
			<View className="px-6 pt-10 pb-6 bg-white border-b border-gray-200">
				<View className="flex-row items-center">
					{user?.imageUrl ? (
						<Image source={{ uri: user.imageUrl }} className="w-16 h-16 rounded-full" />
					) : (
						<View className="w-16 h-16 rounded-full bg-gray-200" />
					)}
					<View className="ml-4">
						<Text className="text-xl font-semibold">
							{user?.fullName || user?.username || 'User'}
						</Text>
						<Text className="text-gray-500">
							{user?.primaryEmailAddress?.emailAddress || 'Signed in'}
						</Text>
					</View>
					<TouchableOpacity onPress={() => signOut()} className="ml-auto px-4 py-2 rounded-full bg-red-500">
						<Text className="text-white font-medium">Sign Out</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View className="flex-1 items-center justify-center p-6">
				<Text className="font-bold text-3xl text-blue-400">Profile</Text>
				<Text className="text-gray-500 mt-2">Your games, streaks, and points will appear here.</Text>
			</View>
		</View>
	);
}
