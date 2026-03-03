import { isPhone, isEmail } from "@pureadmin/utils";

/**
 * 验证规则工具类
 * 提供常用的表单验证规则
 */

/**
 * 创建必填项验证规则
 * @param message - 错误提示信息
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createRequiredRule(message: string, trigger: string = "blur") {
  return {
    required: true,
    message,
    trigger
  };
}

/**
 * 创建手机号验证规则
 * @param required - 是否必填，默认为true
 * @param message - 错误提示信息，默认为"请输入正确的手机号码格式"
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createPhoneRule(
  required: boolean = true,
  message: string = "请输入正确的手机号码格式",
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error("手机号为必填项"));
      } else if (!isPhone(value)) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建邮箱验证规则
 * @param required - 是否必填，默认为true
 * @param message - 错误提示信息，默认为"请输入正确的邮箱格式"
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createEmailRule(
  required: boolean = true,
  message: string = "请输入正确的邮箱格式",
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error("邮箱为必填项"));
      } else if (!isEmail(value)) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建密码验证规则
 * @param required - 是否必填，默认为true
 * @param min - 最小长度，默认为6
 * @param max - 最大长度，默认为18
 * @param message - 错误提示信息，默认为"密码长度不符合要求"
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createPasswordRule(
  required: boolean = true,
  min: number = 6,
  max: number = 18,
  message: string = "密码长度不符合要求",
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error("密码为必填项"));
      } else if (value.length < min || value.length > max) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建重复密码验证规则
 * @param passwordField - 密码字段名，默认为"password"
 * @param required - 是否必填，默认为true
 * @param message - 错误提示信息，默认为"两次输入的密码不一致"
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createRepeatPasswordRule(
  passwordField: string = "password",
  required: boolean = true,
  message: string = "两次输入的密码不一致",
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any, form: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error("确认密码为必填项"));
      } else if (form[passwordField] !== value) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建验证码验证规则
 * @param required - 是否必填，默认为true
 * @param length - 验证码长度，默认为6
 * @param message - 错误提示信息，默认为"验证码长度不符合要求"
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createVerifyCodeRule(
  required: boolean = true,
  length: number = 6,
  message: string = "验证码长度不符合要求",
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error("验证码为必填项"));
      } else if (value.length !== length) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建长度验证规则
 * @param min - 最小长度
 * @param max - 最大长度
 * @param message - 错误提示信息
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createLengthRule(
  min: number,
  max: number,
  message: string,
  trigger: string = "blur"
) {
  return {
    min,
    max,
    message,
    trigger
  };
}
