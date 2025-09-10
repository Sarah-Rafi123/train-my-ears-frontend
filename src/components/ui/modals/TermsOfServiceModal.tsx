import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({ visible, onClose }: TermsOfServiceModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using the Train My Ear mobile application (the "App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Train My Ear is a music education application that helps users develop their ability to recognize musical chords by ear through interactive training exercises.
          </Text>

          <Text style={styles.subTitle}>Free Features</Text>
          <Text style={styles.paragraph}>
            • Basic chord recognition training{'\n'}
            • Limited game levels{'\n'}
            • Guest mode access{'\n'}
            • Basic progress tracking{'\n'}
            • Detailed accuracy and streak tracking{'\n'}
            • Chord progression training{'\n'}
            • Leaderboard rankings and competitions
          </Text>

          <Text style={styles.subTitle}>Premium Features (Subscription Required)</Text>
          <Text style={styles.paragraph}>
            • Access to all chord levels
          </Text>

          <Text style={styles.sectionTitle}>3. Account Registration</Text>
          <Text style={styles.subTitle}>Account Creation</Text>
          <Text style={styles.paragraph}>
            • You may create a free account using email/password or social login (Google, Facebook, Apple){'\n'}
            • You must provide accurate and complete information{'\n'}
            • You are responsible for maintaining the confidentiality of your account credentials
          </Text>

          <Text style={styles.subTitle}>Account Responsibilities</Text>
          <Text style={styles.paragraph}>
            • You are responsible for all activities under your account{'\n'}
            • Notify us immediately of any unauthorized use of your account{'\n'}
            • We reserve the right to suspend or terminate accounts that violate these Terms
          </Text>

          <Text style={styles.sectionTitle}>4. Subscription Terms</Text>
          <Text style={styles.subTitle}>Subscription Plans</Text>
          <Text style={styles.paragraph}>
            • Monthly Subscription: $2.99/month{'\n'}
            • Annual Subscription: $19.99/year (Save 67%)
          </Text>

          <Text style={styles.subTitle}>Auto-Renewal Terms</Text>
          <Text style={styles.paragraph}>
            • Subscriptions automatically renew unless auto-renewal is disabled at least 24 hours before the current period ends{'\n'}
            • Your Apple ID account will be charged for renewal within 24 hours prior to the end of the current period{'\n'}
            • You can manage subscriptions in your Apple ID Account Settings{'\n'}
            • No cancellation of current subscriptions is allowed during the active period{'\n'}
            • Any unused portion of a free trial period will be forfeited when purchasing a subscription
          </Text>

          <Text style={styles.sectionTitle}>5. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree NOT to:{'\n'}
            • Use the App for unauthorized commercial purposes{'\n'}
            • Attempt to reverse engineer or disassemble the App{'\n'}
            • Interfere with or disrupt the App's functionality{'\n'}
            • Create fake accounts or manipulate leaderboard rankings{'\n'}
            • Share account credentials with others
          </Text>

          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            • The App and all its content are owned by us and protected by intellectual property laws{'\n'}
            • You receive a limited, non-exclusive license to use the App for personal, non-commercial purposes{'\n'}
            • You may not use our intellectual property without written permission
          </Text>

          <Text style={styles.sectionTitle}>7. Privacy</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </Text>

          <Text style={styles.sectionTitle}>8. Disclaimers</Text>
          <Text style={styles.paragraph}>
            • The App is provided "as is" and "as available" without warranties{'\n'}
            • We do not guarantee the App will be error-free or uninterrupted{'\n'}
            • Musical training results may vary and we make no guarantees about learning outcomes{'\n'}
            • Our liability is limited to the maximum extent permitted by law
          </Text>

          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            • You may stop using the App at any time{'\n'}
            • You may delete your account through App settings or by emailing Bob@ExperientialRetreats.com{'\n'}
            • We may terminate your access for violating these Terms{'\n'}
            • Subscription cancellation must be done through your Apple ID Account Settings
          </Text>

          <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms from time to time. We will notify you of material changes through:{'\n'}
            • Email notifications to your registered email address{'\n\n'}
            Continued use of the App after changes constitutes acceptance of the updated Terms.
          </Text>

          <Text style={styles.sectionTitle}>16. Entire Agreement</Text>
          <Text style={styles.paragraph}>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the App and supersede all prior agreements and understandings.
          </Text>

          <Text style={styles.sectionTitle}>17. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms, please contact us:{'\n'}
            • Email: Bob@ExperientialRetreats.com{'\n'}
            • App Support: Available through the App's settings menu{'\n'}
            • Account Deletion: To permanently delete your account, email Bob@ExperientialRetreats.com
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
    fontSize: 18,
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