import { $t, transformI18n } from "@/plugins/i18n";
import { REGEXP_PWD, REGEXP_SIX } from "./rule";
import { isPhone } from "@pureadmin/utils";

export interface LoginFormData {
  username: string;
  password: string;
  verifyCode: string;
}

export interface PhoneFormData {
  phone: string;
  verifyCode: string;
}

export interface RegisterFormData {
  username: string;
  phone: string;
  verifyCode: string;
  password: string;
  repeatPassword: string;
}

export interface UpdatePasswordFormData {
  phone: string;
  verifyCode: string;
  password: string;
  repeatPassword: string;
}

export function validateUsername(username: string): string | null {
  if (!username) {
    return transformI18n($t("login.usernameReg"));
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return transformI18n($t("login.passwordReg"));
  }
  if (!REGEXP_PWD.test(password)) {
    return transformI18n($t("login.passwordRuleReg"));
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) {
    return transformI18n($t("login.phoneReg"));
  }
  if (!isPhone(phone)) {
    return transformI18n($t("login.phoneCorrectReg"));
  }
  return null;
}

export function validateVerifyCode(
  code: string,
  requireSix = false
): string | null {
  if (!code) {
    return transformI18n($t("login.verifyCodeReg"));
  }
  if (requireSix && !REGEXP_SIX.test(code)) {
    return transformI18n($t("login.verifyCodeSixReg"));
  }
  return null;
}

export function validatePasswordMatch(
  password: string,
  repeatPassword: string
): string | null {
  if (!repeatPassword) {
    return transformI18n($t("login.passwordSureReg"));
  }
  if (password !== repeatPassword) {
    return transformI18n($t("login.passwordDifferentReg"));
  }
  return null;
}

export function validateLoginForm(data: LoginFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const verifyCodeError = validateVerifyCode(data.verifyCode);
  if (verifyCodeError) errors.verifyCode = verifyCodeError;

  return errors;
}

export function validatePhoneLoginForm(
  data: PhoneFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const verifyCodeError = validateVerifyCode(data.verifyCode);
  if (verifyCodeError) errors.verifyCode = verifyCodeError;

  return errors;
}

export function validateRegisterForm(
  data: RegisterFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const verifyCodeError = validateVerifyCode(data.verifyCode);
  if (verifyCodeError) errors.verifyCode = verifyCodeError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const matchError = validatePasswordMatch(data.password, data.repeatPassword);
  if (matchError) errors.repeatPassword = matchError;

  return errors;
}

export function validateUpdatePasswordForm(
  data: UpdatePasswordFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const verifyCodeError = validateVerifyCode(data.verifyCode, true);
  if (verifyCodeError) errors.verifyCode = verifyCodeError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const matchError = validatePasswordMatch(data.password, data.repeatPassword);
  if (matchError) errors.repeatPassword = matchError;

  return errors;
}

export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
