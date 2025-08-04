import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const privacyPolicyMarkdown = `# Privacy Policy

Effective Date: July 9, 2025

Crawls ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "App").

## 1. Information We Collect
- **Personal Information:** When you sign in, we collect your name, email address, and profile image via our authentication provider (Clerk).
- **Usage Data:** We collect information about your use of the App, such as crawl progress, history, and preferences.
- **Device Information:** We may collect device type, operating system, and unique device identifiers for analytics and security.
- **Location Data:** If you grant permission, we access your device's location to show your position on the crawl map.

## 2. How We Use Your Information
- To provide and maintain the App's features and services.
- To personalize your experience and display relevant content.
- To improve the App and analyze usage trends.
- To communicate with you about updates or support.

## 3. How We Share Your Information
- **Service Providers:** We use third-party services (Clerk for authentication, Supabase for backend data storage) to operate the App. These providers have access to your information only to perform tasks on our behalf.
- **Legal Requirements:** We may disclose your information if required by law or to protect our rights.
- **No Sale of Data:** We do not sell your personal information to third parties.

## 4. Data Security
We use industry-standard security measures to protect your information, including secure storage and encrypted communications. However, no method of transmission or storage is 100% secure.

## 5. Your Rights and Choices
- You can access, update, or delete your profile information via the App.
- You can revoke location permissions at any time in your device settings.
- You may contact us at vamsikurakula@gmail.com for privacy-related requests.

## 6. Children's Privacy
The App is not intended for children under 13. We do not knowingly collect data from children under 13.

## 7. Changes to This Policy
We may update this Privacy Policy from time to time. Changes will be posted in the App and/or on our website.

## 8. Contact Us
If you have questions about this Privacy Policy, contact us at: vamsikurakula@gmail.com

---

**By using the Crawls app, you agree to this Privacy Policy.**`;

const PrivacyPolicyScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const markdownStyles = {
    body: { color: theme.text.primary },
    heading1: { color: theme.text.primary },
    heading2: { color: theme.text.primary },
    heading3: { color: theme.text.primary },
    heading4: { color: theme.text.primary },
    heading5: { color: theme.text.primary },
    heading6: { color: theme.text.primary },
    paragraph: { color: theme.text.primary },
    list_item: { color: theme.text.primary },
    bullet_list: { color: theme.text.primary },
    ordered_list: { color: theme.text.primary },
    strong: { color: theme.text.primary },
    em: { color: theme.text.primary },
    link: { color: theme.button.primary },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: theme.text.secondary }]}>← Back</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Markdown style={markdownStyles}>{privacyPolicyMarkdown}</Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: 16 },
  backButtonText: { fontSize: 16 },
  scrollView: { flex: 1 },
  content: { padding: 16 },
});

export default PrivacyPolicyScreen; 
