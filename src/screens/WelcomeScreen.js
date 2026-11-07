// AI-assisted: see docs/AI_LOG.md #40
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import FormScrollView from '../components/FormScrollView';
import {
  loginDriver,
  mapAuthError,
  normalizeLoginEmail,
} from '../services/authService';
import { validateEmail } from '../validation/registerValidators';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * @param {string} value
 * @returns {string|null}
 */
function validateLoginPassword(value) {
  const password = value ?? '';
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  return null;
}

/**
 * Auth entry screen: login and navigation to registration.
 * @param {{ navigation: { navigate: Function } }} props
 */
export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const emailError = useMemo(() => validateEmail(email), [email]);
  const passwordError = useMemo(() => validateLoginPassword(password), [password]);

  const onChangeEmail = (value) => {
    setFormError(null);
    setEmail(normalizeLoginEmail(value).replace(/\s/g, ''));
  };

  const onChangePassword = (value) => {
    setFormError(null);
    setPassword(value);
  };

  const onLogin = async () => {
    if (submitting) return;

    setTouched({ email: true, password: true });
    setFormError(null);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validateLoginPassword(password);
    if (nextEmailError || nextPasswordError) {
      return;
    }

    setSubmitting(true);
    try {
      await loginDriver(email, password);
    } catch (error) {
      setFormError(mapAuthError(error));
      setSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, spacing.sm) + spacing.lg,
        },
      ]}
    >
      {/* AI-assisted: see docs/AI_LOG.md #40 */}
      <View style={styles.hero}>
        <Text style={styles.brand}>UberClone</Text>
        <Text style={styles.tagline}>Versión conductor</Text>
      </View>

      <FormScrollView
        style={styles.panelScroll}
        contentContainerStyle={[
          styles.panel,
          { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xl },
        ]}
      >
        <Text style={commonStyles.title}>Iniciar sesión</Text>
        <Text style={[commonStyles.caption, styles.hint]}>
          Usa el correo y la contraseña de tu cuenta de conductor
        </Text>

        <FormField
          label="Correo"
          value={email}
          onChangeText={onChangeEmail}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          placeholder="correo@ejemplo.com"
          error={touched.email ? emailError : null}
        />
        <FormField
          label="Contraseña"
          value={password}
          onChangeText={onChangePassword}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          secureTextEntry
          showPasswordToggle
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          placeholder="Tu contraseña"
          error={touched.password ? passwordError : null}
        />

        {formError ? <Text style={commonStyles.fieldError}>{formError}</Text> : null}

        <Pressable
          style={[commonStyles.primaryButton, submitting && commonStyles.buttonDisabled]}
          onPress={onLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Entrar</Text>
          )}
        </Pressable>

        <Pressable
          style={[commonStyles.outlineButton, submitting && commonStyles.buttonDisabled]}
          onPress={() => navigation.navigate('Register')}
          disabled={submitting}
        >
          <Text style={commonStyles.outlineButtonText}>Crear cuenta</Text>
        </Pressable>
      </FormScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  brand: {
    color: colors.onPrimary,
    fontSize: 34,
    fontWeight: '800',
  },
  tagline: {
    color: colors.textOnPrimaryMuted,
    marginTop: spacing.xs,
    fontSize: 15,
  },
  panelScroll: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  panel: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  hint: {
    marginBottom: spacing.xs,
  },
});
