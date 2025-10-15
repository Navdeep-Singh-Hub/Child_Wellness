import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
	const { isSignedIn, isLoaded } = useAuth();
	if (!isLoaded) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator />
			</View>
		);
	}
	if (isSignedIn) {
		return <Redirect href="/(tabs)" />;
	}
	return <Redirect href="/(auth)/sign-in" />;
}
