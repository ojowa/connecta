import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const TIPS = [
  {
    id: '1',
    icon: '\uD83D\uDCCD',
    title: 'Meet in public places',
    description:
      'Always meet in a public place for your first few dates',
  },
  {
    id: '2',
    icon: '\uD83D\uDE0A',
    title: 'Tell a friend',
    description:
      "Let a friend know where you're going and who you're meeting",
  },
  {
    id: '3',
    icon: '\uD83D\uDCB3',
    title: "Don't share financial info",
    description:
      "Never send money or share financial details with someone you haven't met",
  },
  {
    id: '4',
    icon: '\uD83D\uDCA1',
    title: 'Trust your instincts',
    description:
      'If something feels off, it probably is. Trust your gut',
  },
];

interface SafetyTipsProps {
  navigation: any;
}

const SafetyTips: React.FC<SafetyTipsProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Safety Tips</Text>

        {TIPS.map((tip) => (
          <View key={tip.id} style={styles.card}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{tip.icon}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        ))}

        <Button
          title="Got it"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  tipTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tipDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.md,
  },
});

export default SafetyTips;
