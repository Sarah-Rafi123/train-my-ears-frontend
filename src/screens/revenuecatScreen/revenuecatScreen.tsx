import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Purchases, { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { revenueCatService } from '../../services/revenueCatService';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrivacyPolicyModal from '../../components/ui/modals/PrivacyPolicyModal';
import TermsOfServiceModal from '../../components/ui/modals/TermsOfServiceModal';

export default function RevenueCatScreen() {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    getOfferings();
  }, []);

  const getOfferings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎁 Fetching offerings...');
      
      const offerings = await Purchases.getOfferings();
      console.log('🎁 Offerings received:', JSON.stringify(offerings, null, 2));
      
      if (offerings.current !== null) {
        setOfferings(offerings);
        console.log('✅ Current offering found:', offerings.current.identifier);
      } else {
        console.warn('⚠️ No current offering available');
        setError('No subscription plans available at the moment.');
      }
    } catch (e) {
      console.error('❌ Error fetching offerings:', e);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleManualSetup = async () => {
    console.log('🔧 [RevenueCatScreen] Manual setup triggered');
    await revenueCatService.setupRevenueCatUser();
    // Refresh offerings after setup
    await getOfferings();
  };

  const handleDebugWebhook = async () => {
    console.log('🔍 [RevenueCatScreen] Debug webhook triggered');
    await revenueCatService.debugWebhookSetup();
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(packageToPurchase.identifier);
      console.log('💳 [RevenueCatScreen] Starting subscription purchase/upgrade for:', packageToPurchase.identifier);
      
      // Use the upgrade/downgrade service method
      const result = await revenueCatService.upgradeOrDowngradeSubscription(packageToPurchase);
      
      if (result.success) {
        console.log('✅ [RevenueCatScreen] Subscription operation completed:', result.message);
        // Navigate back after successful purchase
        navigation.goBack();
      } else {
        console.error('❌ [RevenueCatScreen] Subscription operation failed:', result.message);
        if (result.message !== 'Purchase cancelled by user') {
          setError(result.message);
        }
      }
    } catch (error: any) {
      console.error('❌ [RevenueCatScreen] Unexpected error during purchase:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setPurchasing('restore');
      console.log('🔄 [RevenueCatScreen] Restoring purchases...');
      
      const purchaserInfo = await Purchases.restorePurchases();
      console.log('✅ [RevenueCatScreen] Purchases restored!', purchaserInfo.entitlements);
      
      // Navigate back after successful restore
      navigation.goBack();
    } catch (error: any) {
      console.error('❌ [RevenueCatScreen] Restore failed:', error);
      setError('Failed to restore purchases. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003049" />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getOfferings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={handleManualSetup}>
            <Text style={styles.retryButtonText}>Setup User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={handleDebugWebhook}>
            <Text style={styles.retryButtonText}>Debug Webhook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!offerings?.current) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No subscription plans available</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleGoBack}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>More Chords. More Progress.</Text>
          <Text style={styles.subtitle}>Get access to more chords and track your progress as you improve.</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium Features:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎵</Text>
            <Text style={styles.featureText}>Access all levels</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Track accuracy & streaks</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Chord progression training</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>Leaderboard rankings</Text>
          </View>
        </View>

        {/* Subscription Packages */}
        <View style={styles.packagesContainer}>
          {offerings.current?.availablePackages.map((pkg: PurchasesPackage) => {
            const isPopular = pkg.packageType === 'ANNUAL';
            const isPurchasing = purchasing === pkg.identifier;
            
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.packageCard, isPopular && styles.popularPackage]}
                onPress={() => handlePurchase(pkg)}
                disabled={isPurchasing || purchasing !== null}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <Text style={[styles.packageTitle, isPopular && { color: '#ffffff' }]}>
                  {pkg.packageType === 'ANNUAL' ? 'Annual Plan: $19.99/year' : 'Monthly Plan: $2.99/month'}
                </Text>
                
                {pkg.packageType === 'ANNUAL' && (
                  <Text style={[styles.savingsText, isPopular && { color: '#10b981' }]}>(Save 67%)</Text>
                )}
                
                <Text style={[styles.packageDescription, isPopular && { color: '#d1d5db' }]}>
                  {pkg.product.description || 'Full access to all premium features'}
                </Text>

                {isPurchasing ? (
                  <ActivityIndicator color={isPopular ? "#ffffff" : "#003049"} size="small" />
                ) : (
                  <Text style={[styles.packageButtonText, isPopular && { color: '#ffffff' }]}>
                    {pkg.packageType === 'ANNUAL' ? 'Start Annual Plan' : 'Start Monthly Plan'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Restore Purchases Button */}
        {/* <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          disabled={purchasing !== null}
        >
          {purchasing === 'restore' ? (
            <ActivityIndicator color="#003049" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          )}
        </TouchableOpacity> */}

        {/* Debug Buttons - Only show in DEV mode */}
        {/* {__DEV__ && (
          <View style={styles.debugContainer}>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={handleManualSetup}
              disabled={purchasing !== null}
            >
              <Text style={styles.debugButtonText}>🔧 Setup User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={handleDebugWebhook}
              disabled={purchasing !== null}
            >
              <Text style={styles.debugButtonText}>🔍 Debug Webhook</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Terms and Privacy */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            Subscriptions auto-renew unless cancelled. Cancel anytime in Settings.
          </Text>
          <View style={styles.legalLinksContainer}>
            <Text style={styles.legalText}>By continuing, you agree to our </Text>
            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}> and </Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}>.</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Modals */}
      <PrivacyPolicyModal 
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsOfServiceModal 
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003049',
    marginBottom: 8,
    marginTop:16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003049',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  packagesContainer: {
    marginBottom: 30,
  },
  packageCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  popularPackage: {
    backgroundColor: '#003049',
    borderColor: '#003049',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#003049',
  },
  savingsText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  packageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#003049',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#003049',
  },
  legalContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  legalText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 12,
    color: '#003049',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#003049',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#003049',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  debugButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  debugButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});