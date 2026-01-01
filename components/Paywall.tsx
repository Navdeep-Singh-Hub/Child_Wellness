// import { cancelSubscription, createSubscription, getSubscriptionStatus, verifyPayment, type SubscriptionStatus } from '@/utils/api';
import { getSubscriptionStatus, type SubscriptionStatus } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Paywall Component
 * Shows subscription options and handles Razorpay checkout
 * Displays when user's trial expires or subscription is inactive
 */
export default function Paywall({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Load subscription status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setCheckingStatus(true);
      const currentStatus = await getSubscriptionStatus();
      setStatus(currentStatus);
    } catch (error: any) {
      console.error('Failed to load subscription status:', error);
      Alert.alert('Error', 'Failed to load subscription status. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubscribe = async () => {
    // Razorpay checkout process commented out
    Alert.alert('Info', 'Subscription feature is currently disabled.');
    setLoading(false);
    
    // // Step 1: Create subscription on backend
    // const subscriptionData = await createSubscription();
    // console.log('Subscription created:', subscriptionData);

    // // Check if user has free access (shouldn't create subscription)
    // if ((subscriptionData as any).hasFreeAccess) {
    //   Alert.alert('Info', 'You have free access. No subscription needed.');
    //   setLoading(false);
    //   loadStatus();
    //   onSuccess?.();
    //   return;
    // }

    // // Step 2: Open Razorpay checkout
    // // For React Native, we'll use Razorpay's React Native SDK or web checkout
    // // This is a simplified version - in production, use @razorpay/react-native
    // 
    // if (Platform.OS === 'web') {
    //   // Web: Use Razorpay Checkout
    //   await openRazorpayWebCheckout(subscriptionData);
    // } else {
    //   // Mobile: Use Razorpay React Native SDK
    //   await openRazorpayMobileCheckout(subscriptionData);
    // }
  };

  // /**
  //  * Open Razorpay checkout for web
  //  */
  // const openRazorpayWebCheckout = async (subscriptionData: any) => {
  //   // For web, we'll use Razorpay's checkout.js
  //   if (typeof window === 'undefined') {
  //     Alert.alert('Error', 'Web checkout is only available on web platform.');
  //     setLoading(false);
  //     return;
  //   }

  //   // Check if Razorpay is already loaded
  //   if ((window as any).Razorpay) {
  //     openCheckout();
  //   } else {
  //     // Load Razorpay script
  //     const script = document.createElement('script');
  //     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //     script.onload = openCheckout;
  //     script.onerror = () => {
  //       Alert.alert('Error', 'Failed to load Razorpay checkout. Please try again.');
  //       setLoading(false);
  //     };
  //     document.body.appendChild(script);
  //   }

  //   function openCheckout() {
  //     const options = {
  //       key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '', // Your Razorpay key
  //       subscription_id: subscriptionData.subscriptionId,
  //       name: 'Therapy Progress',
  //       description: 'Monthly subscription for Therapy Progress access',
  //       image: '', // Optional: your logo URL
  //       prefill: {
  //         email: '', // Get from user profile
  //         contact: '', // Get from user profile
  //       },
  //       theme: {
  //         color: '#8B5CF6',
  //       },
  //       handler: async function (response: any) {
  //         // Payment successful
  //         try {
  //           await verifyPayment({
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_subscription_id: response.razorpay_subscription_id,
  //             razorpay_signature: response.razorpay_signature,
  //           });

  //           Alert.alert('Success', 'Subscription activated successfully!', [
  //             {
  //               text: 'OK',
  //               onPress: () => {
  //                 loadStatus();
  //                 onSuccess?.();
  //               },
  //             },
  //           ]);
  //         } catch (err: any) {
  //           console.error('Payment verification error:', err);
  //           Alert.alert('Error', 'Payment verification failed. Please contact support.');
  //         } finally {
  //           setLoading(false);
  //         }
  //       },
  //       modal: {
  //         ondismiss: () => {
  //           setLoading(false);
  //         },
  //       },
  //     };

  //     const razorpay = new (window as any).Razorpay(options);
  //     razorpay.open();
  //   }
  // };

  // /**
  //  * Open Razorpay checkout for mobile
  //  * Note: This requires @razorpay/react-native package
  //  */
  // const openRazorpayMobileCheckout = async (subscriptionData: any) => {
  //   // For mobile, you would use:
  //   // import RazorpayCheckout from '@razorpay/react-native';
  //   // 
  //   // RazorpayCheckout.open({
  //   //   key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
  //   //   subscription_id: subscriptionData.subscriptionId,
  //   //   // ... other options
  //   // });
  //   
  //   // For now, show alert that mobile checkout needs to be implemented
  //   Alert.alert(
  //     'Mobile Checkout',
  //     'Mobile checkout requires @razorpay/react-native package. Please implement using Razorpay React Native SDK.',
  //     [{ text: 'OK', onPress: () => setLoading(false) }]
  //   );
  // };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (checkingStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading subscription status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isTrialExpired = status?.isTrial && !status?.isActive;
  const daysRemaining = status?.trialEndDate
    ? Math.ceil((new Date(status.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Status Card */}
          {status?.isTrial && status?.isActive && (
            <View style={[styles.card, styles.trialCard]}>
              <Ionicons name="gift" size={48} color="#10B981" />
              <Text style={styles.cardTitle}>Free Trial Active</Text>
              <Text style={styles.cardSubtitle}>
                {daysRemaining > 0
                  ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                  : 'Trial ending soon'}
              </Text>
              <Text style={styles.cardDescription}>
                Your free trial ends on {formatDate(status.trialEndDate)}
              </Text>
            </View>
          )}

          {isTrialExpired && (
            <View style={[styles.card, styles.expiredCard]}>
              <Ionicons name="time-outline" size={48} color="#EF4444" />
              <Text style={styles.cardTitle}>Trial Expired</Text>
              <Text style={styles.cardSubtitle}>
                Your free trial ended on {formatDate(status.trialEndDate)}
              </Text>
              <Text style={styles.cardDescription}>
                Subscribe now to continue accessing Therapy Progress
              </Text>
            </View>
          )}

          {status?.status === 'past_due' && (
            <View style={[styles.card, styles.errorCard]}>
              <Ionicons name="alert-circle" size={48} color="#F59E0B" />
              <Text style={styles.cardTitle}>Payment Failed</Text>
              <Text style={styles.cardSubtitle}>
                Your last payment could not be processed
              </Text>
              <Text style={styles.cardDescription}>
                Please update your payment method to continue
              </Text>
            </View>
          )}

          {/* Subscription Plan Card */}
          <View style={[styles.card, styles.planCard]}>
            <Text style={styles.planTitle}>Monthly Subscription</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹299</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.planDescription}>
              Access to all Therapy Progress features
            </Text>

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Unlimited therapy sessions</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Progress tracking & insights</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>All therapy types included</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Cancel anytime</Text>
              </View>
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              Subscription auto-renews monthly. Cancel anytime.
            </Text>
          </View>

          {/* Active Subscription Info */}
          {status?.status === 'active' && status?.subscriptionEndDate && (
            <View style={[styles.card, styles.activeCard]}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.cardTitle}>Subscription Active</Text>
              <Text style={styles.cardSubtitle}>
                Next billing: {formatDate(status.nextBillingDate)}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={async () => {
                  // Razorpay cancel subscription commented out
                  Alert.alert('Info', 'Cancel subscription feature is currently disabled.');
                  
                  // Alert.alert(
                  //   'Cancel Subscription',
                  //   'Are you sure you want to cancel your subscription? You will lose access after the current billing period.',
                  //   [
                  //     { text: 'No', style: 'cancel' },
                  //     {
                  //       text: 'Yes, Cancel',
                  //       style: 'destructive',
                  //       onPress: async () => {
                  //         try {
                  //           await cancelSubscription();
                  //           Alert.alert('Success', 'Subscription cancelled successfully.');
                  //           loadStatus();
                  //         } catch (error: any) {
                  //           Alert.alert('Error', error.message || 'Failed to cancel subscription.');
                  //         }
                  //       },
                  //     },
                  //   ]
                  // );
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trialCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  expiredCard: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  errorCard: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  planCard: {
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  planTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  pricePeriod: {
    fontSize: 20,
    color: '#6B7280',
    marginLeft: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  subscribeButton: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
