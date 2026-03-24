import React, {useMemo, useState} from 'react';
import {WebView} from 'react-native-webview';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen = 'home' | 'google' | 'youtube' | 'eval';

const WEB_SOURCES = {
  google: {
    title: 'Google',
    uri: 'https://www.google.com',
  },
  youtube: {
    title: 'YouTube',
    uri: 'https://www.youtube.com',
  },
} as const;

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function MenuButton({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('home');
  const [code, setCode] = useState('2 + 2');
  const [result, setResult] = useState('Ready. Enter JavaScript and tap Run.');
  const [settingsMessage, setSettingsMessage] = useState('Security settings shortcut is available from the menu.');

  const webSource = useMemo(() => {
    if (screen === 'google' || screen === 'youtube') {
      return WEB_SOURCES[screen];
    }

    return null;
  }, [screen]);

  const openSecuritySettings = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Unavailable', 'Security settings shortcut is only available on Android.');
      return;
    }

    try {
      await Linking.sendIntent('android.settings.SECURITY_SETTINGS');
      setSettingsMessage('Opened Android security settings.');
    } catch (error) {
      try {
        await Linking.openSettings();
        setSettingsMessage('Security settings were unavailable, so app settings were opened instead.');
      } catch {
        const message = error instanceof Error ? error.message : 'Unable to open settings.';
        setSettingsMessage(message);
        Alert.alert('Settings failed', message);
      }
    }
  };

  const runEval = () => {
    try {
      let value: unknown;

      try {
        // eslint-disable-next-line no-new-func
        value = Function(`"use strict"; return (${code});`)();
      } catch {
        // eslint-disable-next-line no-new-func
        value = Function(`"use strict";\n${code}`)();
      }

      setResult(formatValue(value));
    } catch (error) {
      setResult(error instanceof Error ? `Error: ${error.message}` : 'Error: Unknown failure');
    }
  };

  if (webSource) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable onPress={() => setScreen('home')} style={({pressed}) => [styles.backButton, pressed && styles.menuButtonPressed]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{webSource.title}</Text>
            <Text style={styles.headerSubtitle}>{webSource.uri}</Text>
          </View>
        </View>
        <WebView
          domStorageEnabled={true}
          javaScriptEnabled={true}
          source={{uri: webSource.uri}}
          startInLoadingState={true}
          style={styles.webview}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'eval') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.evalScreen}>
          <View style={styles.header}>
            <Pressable onPress={() => setScreen('home')} style={({pressed}) => [styles.backButton, pressed && styles.menuButtonPressed]}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>Eval</Text>
              <Text style={styles.headerSubtitle}>Run JavaScript inside the app runtime.</Text>
            </View>
          </View>

          <View style={styles.evalCard}>
            <Text style={styles.sectionLabel}>Source</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              onChangeText={setCode}
              placeholder="Type JavaScript here"
              placeholderTextColor="#7b858f"
              style={styles.editor}
              textAlignVertical="top"
              value={code}
            />
            <Pressable onPress={runEval} style={({pressed}) => [styles.primaryButton, pressed && styles.menuButtonPressed]}>
              <Text style={styles.primaryButtonText}>Run</Text>
            </Pressable>
          </View>

          <View style={styles.evalCard}>
            <Text style={styles.sectionLabel}>Output</Text>
            <Text style={styles.output}>{result}</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.homeScreen}>
        <View style={styles.hero}>
          <Text style={styles.appTitle}>Calculator</Text>
          <Text style={styles.appSubtitle}>Choose a shortcut.</Text>
        </View>

        <View style={styles.menuGrid}>
          <MenuButton
            onPress={() => setScreen('google')}
            subtitle="Open google.com in WebView"
            title="Google"
          />
          <MenuButton
            onPress={() => setScreen('youtube')}
            subtitle="Open youtube.com in WebView"
            title="YouTube"
          />
          <MenuButton
            onPress={() => setScreen('eval')}
            subtitle="Evaluate JavaScript input"
            title="Eval"
          />
          <MenuButton
            onPress={openSecuritySettings}
            subtitle="Open Android security settings"
            title="Settings"
          />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionLabel}>Status</Text>
          <Text style={styles.statusText}>{settingsMessage}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eef2f7',
    flex: 1,
  },
  homeScreen: {
    flex: 1,
    gap: 20,
    padding: 20,
  },
  hero: {
    backgroundColor: '#101820',
    borderRadius: 24,
    padding: 24,
  },
  appTitle: {
    color: '#f7f9fb',
    fontSize: 30,
    fontWeight: '700',
  },
  appSubtitle: {
    color: '#a7b4c0',
    fontSize: 15,
    marginTop: 6,
  },
  menuGrid: {
    gap: 14,
  },
  menuButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#101820',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  menuButtonPressed: {
    opacity: 0.8,
  },
  menuTitle: {
    color: '#101820',
    fontSize: 18,
    fontWeight: '700',
  },
  menuSubtitle: {
    color: '#5d6a76',
    fontSize: 14,
    marginTop: 6,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
  },
  sectionLabel: {
    color: '#6a7480',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusText: {
    color: '#101820',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: '#101820',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#5d6a76',
    fontSize: 13,
    marginTop: 3,
  },
  backButton: {
    backgroundColor: '#101820',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  evalScreen: {
    flex: 1,
    gap: 14,
    paddingBottom: 18,
  },
  evalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
  },
  editor: {
    backgroundColor: '#f4f7fa',
    borderRadius: 14,
    color: '#101820',
    fontSize: 15,
    minHeight: 180,
    marginTop: 10,
    padding: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0b84f3',
    borderRadius: 14,
    marginTop: 14,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  output: {
    color: '#101820',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  webview: {
    flex: 1,
  },
});

export default App;
