import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const termsOfServiceMarkdown = `# Terms of Service

Effective Date: July 9, 2025

Welcome to Crawls! By using our mobile application (the "App"), you agree to these Terms of Service ("Terms"). Please read them carefully.

## 1. Use of the App
- You must be at least 13 years old to use the App.
- You agree to use the App only for lawful purposes and in accordance with these Terms.

## 2. User Accounts
- You are responsible for maintaining the confidentiality of your account credentials.
- You agree not to share your account or allow others to access the App using your credentials.

## 3. Acceptable Use
- You may not use the App to harass, abuse, or harm others.
- You may not attempt to gain unauthorized access to any part of the App or its data.
- You may not use the App for any illegal or unauthorized purpose.

## 4. Intellectual Property
- All content, features, and functionality in the App are owned by City Crawler or its licensors.
- You may not copy, modify, or distribute any part of the App without our written permission.

## 5. Third-Party Services
- The App uses third-party services (Clerk for authentication, Supabase for backend data storage). Your use of these services is subject to their terms and privacy policies.

## 6. Disclaimer and Limitation of Liability
- The App is provided "as is" without warranties of any kind.
- We are not liable for any damages arising from your use of the App.

## 7. Changes to These Terms
- We may update these Terms from time to time. Changes will be posted in the App and/or on our website.

## 8. Contact Us
If you have questions about these Terms, contact us at: vamsikurakula@gmail.com

---

**By using the Crawls app, you agree to these Terms of Service.**`;

const TermsOfServiceScreen: React.FC = () => {
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: theme.text.secondary }]}>← Back</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Markdown style={markdownStyles}>{termsOfServiceMarkdown}</Markdown>
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

export default TermsOfServiceScreen; 