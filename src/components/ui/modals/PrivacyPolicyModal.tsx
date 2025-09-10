import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <Text style={styles.paragraph}>
            <Text style={styles.subTitle}>Effective Date:</Text> Mon 8 Sept, 2025{'\n'}
            <Text style={styles.subTitle}>Last Updated:</Text> Mon 8 Sept, 2025
          </Text>

          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Train My Ear ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application Train My Ear (the "App").
          </Text>

          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.subTitle}>Personal Information You Provide</Text>
          <Text style={styles.paragraph}>
            • Account Information: When you create an account, we collect your email address and any profile information you choose to provide{'\n'}
            • Payment Information: Processed securely through Apple's In-App Purchase system and RevenueCat (we do not store payment details){'\n'}
            • Social Login Data: If you sign in via Google, Facebook, or Apple, we receive basic profile information as permitted by those services
          </Text>

          <Text style={styles.subTitle}>Automatically Collected Information</Text>
          <Text style={styles.paragraph}>
            • Usage Data: Game scores, progress, accuracy statistics, streak information, and gameplay patterns{'\n'}
            • Device Information: Device type, operating system version, unique device identifiers{'\n'}
            • App Performance Data: Crash reports, performance metrics, and diagnostic information{'\n'}
            • Audio Data: Temporary audio processing for chord recognition (not stored or transmitted)
          </Text>

          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use collected information to:{'\n'}
            • Provide and maintain the App's functionality{'\n'}
            • Process and manage your account and subscriptions{'\n'}
            • Track your musical training progress and provide personalized experiences{'\n'}
            • Enable leaderboard and competitive features{'\n'}
            • Send important updates about your account or the App{'\n'}
            • Improve the App's performance and user experience{'\n'}
            • Comply with legal obligations and protect our rights
          </Text>

          <Text style={styles.sectionTitle}>Information Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share information in these circumstances:
          </Text>

          <Text style={styles.subTitle}>Service Providers</Text>
          <Text style={styles.paragraph}>
            • RevenueCat: For subscription and payment processing{'\n'}
            • Clerk: For user authentication and account management{'\n'}
            • Supabase: For secure data storage and backend services{'\n'}
            • Apple: For app distribution, analytics, and in-app purchases
          </Text>

          <Text style={styles.subTitle}>Legal Requirements</Text>
          <Text style={styles.paragraph}>
            We may disclose information if required by law or to:{'\n'}
            • Comply with legal processes or government requests{'\n'}
            • Protect our rights, privacy, safety, or property{'\n'}
            • Enforce our Terms of Service
          </Text>

          <Text style={styles.subTitle}>Business Transfers</Text>
          <Text style={styles.paragraph}>
            In case of merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.
          </Text>

          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures including:{'\n'}
            • Encryption of data in transit and at rest{'\n'}
            • Secure authentication through established providers{'\n'}
            • Regular security assessments and updates{'\n'}
            • Limited access to personal information by authorized personnel only
          </Text>

          <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
          <Text style={styles.paragraph}>
            • Access and update your profile information{'\n'}
            • Delete your account and associated data (email Bob@ExperientialRetreats.com){'\n'}
            • Manage subscription settings through your Apple ID{'\n'}
            • Request a copy of your data{'\n'}
            • Opt out of promotional emails
          </Text>

          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Train My Ear is suitable for users of all ages.
          </Text>

          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information as long as:{'\n'}
            • Your account remains active{'\n'}
            • Needed to provide services you've requested{'\n'}
            • Required for legal, business, or regulatory purposes{'\n\n'}
            You may request account deletion at any time through the App settings or by contacting us.
          </Text>

          <Text style={styles.sectionTitle}>International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be processed in countries other than your residence. We ensure appropriate safeguards are in place for international transfers in compliance with applicable privacy laws.
          </Text>

          <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy periodically. We will notify you of material changes through:{'\n'}
            • Email notifications{'\n\n'}
            Continued use of the App after changes constitutes acceptance of the updated policy.
          </Text>

          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about this Privacy Policy or your personal information, please contact us:{'\n\n'}
            • Email: Bob@ExperientialRetreats.com{'\n'}
            • App Support: Available through the App's settings menu{'\n'}
            • Account Deletion Requests: To delete your account and all associated data, please send your request to Bob@ExperientialRetreats.com{'\n'}
            • Mailing Address: Bob@TrainMyEar.com
          </Text>

          <Text style={styles.sectionTitle}>State-Specific Rights</Text>
          <Text style={styles.subTitle}>California Residents (CCPA)</Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n'}
            • Know what personal information we collect and how it's used{'\n'}
            • Request deletion of your personal information{'\n'}
            • Opt out of the sale of personal information (we do not sell personal information){'\n'}
            • Non-discrimination for exercising your rights
          </Text>

          <Text style={styles.subTitle}>European Users (GDPR)</Text>
          <Text style={styles.paragraph}>
            You have additional rights including:{'\n'}
            • Right to access your personal data{'\n'}
            • Right to rectification of inaccurate data{'\n'}
            • Right to erasure ("right to be forgotten"){'\n'}
            • Right to restrict processing{'\n'}
            • Right to data portability{'\n'}
            • Right to object to processing{'\n'}
            • Right to withdraw consent{'\n\n'}
            To exercise these rights, contact us at Bob@ExperientialRetreats.com
          </Text>

          <Text style={styles.paragraph}>
            <Text style={{ fontStyle: 'italic', color: '#6b7280' }}>
              This Privacy Policy was last updated on Mon 8 Sept, 2025. Please review it regularly for any changes.
            </Text>
          </Text>

          <View style={styles.footer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003049',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003049',
    marginTop: 25,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
    marginBottom: 15,
  },
  footer: {
    height: 50,
  },
});