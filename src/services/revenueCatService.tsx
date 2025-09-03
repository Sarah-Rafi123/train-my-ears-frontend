import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/urls.constant';

interface RevenueCatConfig {
  androidKey: string;
  iosKey: string;
}

class RevenueCatService {
  private isConfigured = false;
  private config: RevenueCatConfig = {
    androidKey: 'goog_zmsWciJZLfxQLjjHAkEaJalaKtx', // Your existing Android key
    iosKey: 'appl_HMvsrsUNrKZzXXlfuIyAAFUPRAi', // Your existing iOS key
  };

  /**
   * Setup RevenueCat user when authenticated
   * Equivalent to your Dart setupRevenueCatUser function
   */
  async setupRevenueCatUser(): Promise<void> {
    try {
      console.log('🔍 [RevenueCat Service] Starting setupRevenueCatUser...');
      
      const user = await this.retrieveUser();
      const token = await this.retrieveAuthToken();

      console.log('🔍 [RevenueCat Service] Retrieved data:', {
        hasUser: !!user,
        userId: user?.id || user?.userId,
        hasToken: !!token,
        tokenLength: token?.length || 0
      });

      const apiKey = Platform.OS === 'android' 
        ? this.config.androidKey 
        : this.config.iosKey;

      console.log('🔍 [RevenueCat Service] Using API key for:', Platform.OS);

      if (user != null) {
        const userId = user.id ? user.id.toString() : user.userId?.toString();

        if (!userId) {
          console.warn('⚠️ [RevenueCat Service] User ID is null or undefined, skipping RevenueCat setup.');
          console.log('🔍 [RevenueCat Service] User object:', JSON.stringify(user, null, 2));
          return;
        }

        console.log(`🎁 [RevenueCat Service] Setting up RevenueCat for user: ${userId}`);

        // Check current RevenueCat state before setup
        try {
          const currentCustomerInfo = await Purchases.getCustomerInfo();
          console.log('🔍 [RevenueCat Service] Current customer before setup:', currentCustomerInfo.originalAppUserId);
        } catch (e) {
          console.log('🔍 [RevenueCat Service] No current customer info available');
        }

        // 1. Configure RevenueCat with custom app user ID
        if (!this.isConfigured) {
          console.log('🔧 [RevenueCat Service] Configuring RevenueCat with user ID:', userId);
          await Purchases.configure({ 
            apiKey,
            appUserID: userId 
          });
          this.isConfigured = true;
          console.log('✅ [RevenueCat Service] RevenueCat configured with app user ID:', userId);
        } else {
          console.log('📋 [RevenueCat Service] RevenueCat already configured, proceeding with login...');
        }

        // 2. Explicit login (ensures user is properly linked)
        try {
          console.log('🔐 [RevenueCat Service] Attempting to log in user:', userId);
          const loginResult = await Purchases.logIn(userId);
          const loggedInUserId = loginResult.customerInfo.originalAppUserId;
          console.log('✅ [RevenueCat Service] User logged into RevenueCat successfully!');
          console.log('🎯 [RevenueCat Service] Logged in as:', loggedInUserId);
          console.log('🔍 [RevenueCat Service] Login result details:', {
            originalAppUserId: loggedInUserId,
            created: loginResult.created,
            hasActiveEntitlements: Object.keys(loginResult.customerInfo.entitlements.active).length > 0
          });
        } catch (loginError) {
          console.error('❌ [RevenueCat Service] RevenueCat login failed:', loginError);
          console.log('🔍 [RevenueCat Service] Login error details:', JSON.stringify(loginError, null, 2));
        }

        // 3. Fetch customer info to verify final state
        const customerInfo = await Purchases.getCustomerInfo();
        const appUserId = customerInfo.originalAppUserId;
        console.log('🎯 [RevenueCat Service] Final RevenueCat user ID:', appUserId);
        console.log('🔍 [RevenueCat Service] Is anonymous?', appUserId.includes('$RCAnonymousID'));

        // 4. Store appUserId in backend for webhook handling (critical step)
        if (token && token.trim() !== '') {
          try {
            await this.storeAppUserIdInBackend(userId, appUserId, token);
            console.log('✅ [RevenueCat Service] Backend integration completed successfully');
          } catch (backendError) {
            console.error('💥 [RevenueCat Service] Critical: Failed to store appUserId in backend');
            console.error('🚨 [RevenueCat Service] This may cause webhook processing issues');
            console.error('🔍 [RevenueCat Service] Backend error details:', backendError);
            
            // Don't throw here - we want RevenueCat setup to succeed even if backend fails
            // But log it prominently so it can be addressed
            console.error('⚠️ [RevenueCat Service] RevenueCat is configured but backend sync failed');
          }
        } else {
          console.error('🚨 [RevenueCat Service] Critical: No token available for backend integration');
          console.error('⚠️ [RevenueCat Service] AppUserId will not be stored - webhooks may fail');
        }

        console.log('✅ [RevenueCat Service] RevenueCat setup completed for user:', appUserId);

      } else {
        console.warn('⚠️ [RevenueCat Service] User is null, skipping RevenueCat setup.');
      }

    } catch (error) {
      console.error('❌ [RevenueCat Service] Error setting up RevenueCat user:', error);
      console.log('🔍 [RevenueCat Service] Full error:', JSON.stringify(error, null, 2));
    }
  }

  /**
   * Configure RevenueCat for anonymous users
   */
  async setupAnonymousRevenueCat(): Promise<void> {
    try {
      const apiKey = Platform.OS === 'android' 
        ? this.config.androidKey 
        : this.config.iosKey;

      if (!this.isConfigured) {
        await Purchases.configure({ apiKey });
        this.isConfigured = true;
        console.log('✅ RevenueCat configured for anonymous user');
      }
    } catch (error) {
      console.error('❌ Error setting up anonymous RevenueCat:', error);
    }
  }

  /**
   * Logout user from RevenueCat
   */
  async logoutRevenueCatUser(): Promise<void> {
    try {
      const customerInfo = await Purchases.logOut();
      console.log('✅ User logged out from RevenueCat:', customerInfo.originalAppUserId);
    } catch (error) {
      console.error('❌ Error logging out RevenueCat user:', error);
    }
  }

  /**
   * Retrieve user data from AsyncStorage
   * Equivalent to your retrieveUser() function
   */
  private async retrieveUser(): Promise<any | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        console.log('👤 Retrieved user from storage:', { id: user.id, email: user.email });
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving user from storage:', error);
      return null;
    }
  }

  /**
   * Retrieve auth token from AsyncStorage
   * Equivalent to your retrieveAuthToken() function
   */
  private async retrieveAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        console.log('🔑 Retrieved auth token from storage (length):', token.length);
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving auth token from storage:', error);
      return null;
    }
  }

  /**
   * Store appUserId in backend for webhook handling
   * Critical for proper webhook processing when subscriptions change
   */
  private async storeAppUserIdInBackend(userId: string, appUserId: string, token: string): Promise<void> {
    try {
      console.log('💾 [RevenueCat Service] Storing appUserId in backend for user:', userId);
      console.log('🔍 [RevenueCat Service] AppUserId to store:', appUserId);
      
      const response = await fetch(`${BASE_URL}api/users/${userId}/app-user-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          appUserId: appUserId,
        }),
      });

      console.log('📊 [RevenueCat Service] Store appUserId response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ [RevenueCat Service] AppUserId successfully stored in backend');
        console.log('📥 [RevenueCat Service] Backend response:', responseData);
      } else {
        // Log response details for debugging
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        
        console.error('❌ [RevenueCat Service] Failed to store appUserId in backend');
        console.error('📊 [RevenueCat Service] Response status:', response.status);
        console.error('📊 [RevenueCat Service] Response data:', errorData);
        
        // This is critical for webhooks, so we should throw an error
        throw new Error(`Failed to store appUserId in backend: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('💥 [RevenueCat Service] Error storing appUserId in backend:', error);
      
      // Re-throw the error since this is critical for webhook handling
      // The calling code should handle this appropriately
      throw error;
    }
  }

  /**
   * Manually store appUserId in backend (useful for retry scenarios)
   * Call this if the initial setup failed to store the appUserId
   */
  async manuallyStoreAppUserId(): Promise<boolean> {
    try {
      console.log('🔄 [RevenueCat Service] Manually storing appUserId...');
      
      const user = await this.retrieveUser();
      const token = await this.retrieveAuthToken();
      
      if (!user || !token) {
        console.error('❌ [RevenueCat Service] Cannot store appUserId: missing user or token');
        return false;
      }
      
      const userId = user.id ? user.id.toString() : user.userId?.toString();
      if (!userId) {
        console.error('❌ [RevenueCat Service] Cannot store appUserId: invalid user ID');
        return false;
      }
      
      const customerInfo = await Purchases.getCustomerInfo();
      const appUserId = customerInfo.originalAppUserId;
      
      if (appUserId.includes('$RCAnonymousID')) {
        console.error('❌ [RevenueCat Service] Cannot store anonymous appUserId');
        return false;
      }
      
      await this.storeAppUserIdInBackend(userId, appUserId, token);
      console.log('✅ [RevenueCat Service] AppUserId manually stored successfully');
      return true;
      
    } catch (error) {
      console.error('💥 [RevenueCat Service] Failed to manually store appUserId:', error);
      return false;
    }
  }

  /**
   * Check if user has active subscription
   */
  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      console.log('💳 Subscription status:', hasActiveSubscription ? 'Active' : 'Inactive');
      return hasActiveSubscription;
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get current offerings
   */
  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      console.log('🎁 Current offerings:', offerings.current?.identifier || 'None');
      return offerings;
    } catch (error) {
      console.error('❌ Error getting offerings:', error);
      throw error;
    }
  }

  /**
   * Check if user has an active subscription and get details
   */
  async getActiveSubscriptionInfo(): Promise<{
    hasSubscription: boolean;
    productId?: string;
    purchaseDate?: Date;
    canCancel: boolean;
    canDowngradeFromYearly: boolean;
    daysSincePurchase?: number;
    isYearlySubscription?: boolean;
  }> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = customerInfo.entitlements.active;
      
      if (Object.keys(activeEntitlements).length === 0) {
        return { 
          hasSubscription: false, 
          canCancel: false,
          canDowngradeFromYearly: false,
          isYearlySubscription: false
        };
      }

      // Get the first active entitlement (assuming one subscription at a time)
      const entitlementKey = Object.keys(activeEntitlements)[0];
      const entitlement = activeEntitlements[entitlementKey];
      
      const purchaseDate = new Date(entitlement.originalPurchaseDate);
      const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      const canCancel = daysSincePurchase <= 7;
      
      // Check if it's a yearly subscription based on product identifier
      const isYearlySubscription = entitlement.productIdentifier.toLowerCase().includes('annual') || 
                                   entitlement.productIdentifier.toLowerCase().includes('yearly') ||
                                   entitlement.productIdentifier.toLowerCase().includes('year');
      
      // Allow downgrade from yearly to monthly only within 30 days
      const canDowngradeFromYearly = isYearlySubscription && daysSincePurchase <= 30;

      console.log('💳 [RevenueCat Service] Active subscription info:', {
        productId: entitlement.productIdentifier,
        purchaseDate: purchaseDate.toISOString(),
        daysSincePurchase,
        canCancel,
        isYearlySubscription,
        canDowngradeFromYearly
      });

      return {
        hasSubscription: true,
        productId: entitlement.productIdentifier,
        purchaseDate,
        canCancel,
        canDowngradeFromYearly,
        daysSincePurchase,
        isYearlySubscription
      };
    } catch (error) {
      console.error('❌ [RevenueCat Service] Error getting subscription info:', error);
      return { 
        hasSubscription: false, 
        canCancel: false,
        canDowngradeFromYearly: false,
        isYearlySubscription: false
      };
    }
  }

  /**
   * Cancel active subscription (iOS specific - directs to Settings)
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      console.log('🚫 [RevenueCat Service] Initiating subscription cancellation...');
      
      // On iOS, we need to direct users to Settings to cancel
      // RevenueCat doesn't have direct cancellation API
      const { Linking } = require('react-native');
      
      if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
        console.log('📱 [RevenueCat Service] Redirected to iOS subscription settings');
        return true;
      } else {
        // For Android, direct to Google Play subscriptions
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
        console.log('🤖 [RevenueCat Service] Redirected to Google Play subscription settings');
        return true;
      }
    } catch (error) {
      console.error('❌ [RevenueCat Service] Error opening subscription settings:', error);
      return false;
    }
  }

  /**
   * Handle subscription upgrade/downgrade with proper cancellation and window validation
   */
  async upgradeOrDowngradeSubscription(newPackage: any): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 [RevenueCat Service] Checking for existing subscription...');
      
      const currentSubscription = await this.getActiveSubscriptionInfo();
      
      if (currentSubscription.hasSubscription) {
        console.log('⚠️ [RevenueCat Service] User has active subscription, validating upgrade/downgrade...');
        console.log('🔍 [RevenueCat Service] Current subscription details:', {
          productId: currentSubscription.productId,
          isYearly: currentSubscription.isYearlySubscription,
          daysSincePurchase: currentSubscription.daysSincePurchase
        });
        console.log('🔍 [RevenueCat Service] New package details:', {
          packageType: newPackage.packageType,
          identifier: newPackage.identifier,
          productId: newPackage.product?.identifier
        });
        
        // Check if this is a downgrade from yearly to monthly
        const isDowngradeFromYearlyToMonthly = currentSubscription.isYearlySubscription && 
                                               (newPackage.packageType === 'MONTHLY' || 
                                                newPackage.identifier.toLowerCase().includes('monthly'));
        
        if (isDowngradeFromYearlyToMonthly) {
          if (!currentSubscription.canDowngradeFromYearly) {
            const daysRemaining = 30 - (currentSubscription.daysSincePurchase || 0);
            return {
              success: false,
              message: `You can only downgrade from yearly to monthly within 30 days of purchase. ${daysRemaining > 0 ? `Please try again in ${Math.abs(daysRemaining)} days.` : 'Downgrade period has expired.'}`
            };
          }
          
          console.log('✅ [RevenueCat Service] Downgrade from yearly to monthly allowed within 30-day window');
        }
        
        // Get customer info before purchase attempt
        try {
          const preCustomerInfo = await Purchases.getCustomerInfo();
          console.log('🔍 [RevenueCat Service] Pre-purchase customer info:', {
            originalAppUserId: preCustomerInfo.originalAppUserId,
            activeEntitlements: Object.keys(preCustomerInfo.entitlements.active)
          });
        } catch (infoError) {
          console.error('❌ [RevenueCat Service] Error getting pre-purchase customer info:', infoError);
        }
        
        // RevenueCat handles subscription changes automatically
        // When user purchases a new subscription, it will replace the old one
        console.log('🛒 [RevenueCat Service] Attempting subscription change...');
        
        try {
          // First attempt: Direct package purchase (RevenueCat should handle replacement)
          await Purchases.purchasePackage(newPackage);
          console.log('✅ [RevenueCat Service] Subscription upgraded/downgraded successfully');
        } catch (purchaseError: any) {
          // If we get PG-GEMF-02, this might be a subscription conflict
          if (purchaseError.code === 'PG-GEMF-02' || purchaseError.message?.includes('PG-GEMF-02')) {
            console.log('⚠️ [RevenueCat Service] Got PG-GEMF-02, attempting alternative approach...');
            
            // Alternative approach: Try to restore purchases first, then attempt purchase
            try {
              console.log('🔄 [RevenueCat Service] Restoring purchases before retry...');
              await Purchases.restorePurchases();
              
              // Wait a moment for RevenueCat to sync
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              console.log('🔄 [RevenueCat Service] Retrying subscription change after restore...');
              await Purchases.purchasePackage(newPackage);
              console.log('✅ [RevenueCat Service] Subscription change successful after restore');
            } catch (retryError) {
              console.error('❌ [RevenueCat Service] Retry after restore also failed:', retryError);
              throw purchaseError; // Throw original error
            }
          } else {
            throw purchaseError; // Re-throw non-PG-GEMF-02 errors immediately
          }
        }
        
        return { 
          success: true, 
          message: isDowngradeFromYearlyToMonthly ? 
            'Successfully downgraded to monthly plan!' : 
            'Subscription updated successfully!' 
        };
      } else {
        // No existing subscription, proceed with normal purchase
        await Purchases.purchasePackage(newPackage);
        console.log('✅ [RevenueCat Service] New subscription purchased successfully');
        
        return { 
          success: true, 
          message: 'Subscription activated successfully!' 
        };
      }
    } catch (error: any) {
      console.error('❌ [RevenueCat Service] Subscription change failed:', error);
      console.error('🔍 [RevenueCat Service] Error details:', {
        code: error.code,
        message: error.message,
        domain: error.domain,
        userInfo: error.userInfo,
        underlyingErrorMessage: error.underlyingErrorMessage
      });
      
      if (error.userCancelled) {
        return { success: false, message: 'Purchase cancelled by user' };
      }
      
      // Handle specific RevenueCat error codes
      let errorMessage = 'Failed to update subscription. Please try again.';
      
      if (error.code === 'PG-GEMF-02' || error.message?.includes('PG-GEMF-02')) {
        errorMessage = 'Unable to process subscription change. This may be due to an existing subscription conflict. Please try canceling your current subscription first or contact support.';
      } else if (error.code === 'PURCHASE_NOT_ALLOWED') {
        errorMessage = 'Purchase not allowed. Please check your payment method and try again.';
      } else if (error.code === 'PAYMENT_PENDING') {
        errorMessage = 'Payment is pending. Please wait for the current transaction to complete.';
      } else if (error.code === 'INVALID_CREDENTIALS') {
        errorMessage = 'Invalid credentials. Please try logging out and back in.';
      } else if (error.message) {
        errorMessage = `Subscription update failed: ${error.message}`;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }
}

export const revenueCatService = new RevenueCatService();