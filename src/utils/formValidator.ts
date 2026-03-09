import type { FormRules } from "element-plus";

/**
 * 表单验证工具类
 * 提供统一的验证规则和错误提示
 */

// 正则表达式
const REGEXP = {
  // 用户名：3-20个字符，支持英文、数字和下划线
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  // 密码：6-18个字符，支持字母、数字和特殊字符
  PASSWORD: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,18}$/,
  // 昵称：2-20个字符，支持中英文、数字和下划线
  NICKNAME: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/,
  // 手机号
  PHONE: /^1[3-9]\d{9}$/,
  // 邮箱
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // 验证码：6位数字
  VERIFY_CODE: /^\d{6}$/,
  // IP地址
  IP: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  // 端口号：1-65535
  PORT: /^([1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5][0-5][0-3][0-5])$/,
  // URL
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

/**
 * 错误提示信息
 */
const ERROR_MESSAGES = {
  // 必填项
  REQUIRED: (field: string) => `${field}为必填项`,
  // 用户名
  USERNAME: {
    INVALID: "用户名长度应在3-20个字符之间，支持英文、数字和下划线",
    EMPTY: "用户名称为必填项"
  },
  // 密码
  PASSWORD: {
    INVALID: "密码长度应在6-18个字符之间，支持字母、数字和特殊字符",
    EMPTY: "用户密码为必填项",
    MISMATCH: "两次输入的密码不一致"
  },
  // 昵称
  NICKNAME: {
    INVALID: "昵称长度应在2-20个字符之间，支持中英文、数字和下划线",
    EMPTY: "用户昵称为必填项"
  },
  // 手机号
  PHONE: {
    INVALID: "请输入正确的手机号码格式",
    EMPTY: "手机号码为必填项"
  },
  // 邮箱
  EMAIL: {
    INVALID: "请输入正确的邮箱格式",
    EMPTY: "邮箱为必填项"
  },
  // 验证码
  VERIFY_CODE: {
    INVALID: "验证码长度为6位",
    EMPTY: "验证码为必填项"
  },
  // IP地址
  IP: {
    INVALID: "请输入正确的IP地址格式",
    EMPTY: "IP地址为必填项"
  },
  // 端口号
  PORT: {
    INVALID: "请输入正确的端口号（1-65535）",
    EMPTY: "端口为必填项"
  },
  // URL
  URL: {
    INVALID: "请输入正确的URL格式",
    EMPTY: "URL为必填项"
  },
  // 长度限制
  LENGTH: (min: number, max: number) => `长度应在${min}-${max}个字符之间`,
  // 最小值
  MIN: (min: number) => `最小值为${min}`,
  // 最大值
  MAX: (max: number) => `最大值为${max}`
};

/**
 * 创建必填项验证规则
 * @param field - 字段名称
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createRequiredRule(field: string, trigger: string = "blur") {
  return {
    required: true,
    message: ERROR_MESSAGES.REQUIRED(field),
    trigger
  };
}

/**
 * 创建用户名验证规则
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createUsernameRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.USERNAME.EMPTY));
      } else if (!REGEXP.USERNAME.test(value)) {
        callback(new Error(ERROR_MESSAGES.USERNAME.INVALID));
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
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createPasswordRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.PASSWORD.EMPTY));
      } else if (!REGEXP.PASSWORD.test(value)) {
        callback(new Error(ERROR_MESSAGES.PASSWORD.INVALID));
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
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createRepeatPasswordRule(
  passwordField: string = "password",
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any, form: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error("确认密码为必填项"));
      } else if (value !== form[passwordField]) {
        callback(new Error(ERROR_MESSAGES.PASSWORD.MISMATCH));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建昵称验证规则
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createNicknameRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.NICKNAME.EMPTY));
      } else if (!REGEXP.NICKNAME.test(value)) {
        callback(new Error(ERROR_MESSAGES.NICKNAME.INVALID));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建手机号验证规则
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createPhoneRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.PHONE.EMPTY));
      } else if (!REGEXP.PHONE.test(value)) {
        callback(new Error(ERROR_MESSAGES.PHONE.INVALID));
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
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createEmailRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.EMAIL.EMPTY));
      } else if (!REGEXP.EMAIL.test(value)) {
        callback(new Error(ERROR_MESSAGES.EMAIL.INVALID));
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
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createVerifyCodeRule(
  required: boolean = true,
  length: number = 6,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.VERIFY_CODE.EMPTY));
      } else if (value.length !== length) {
        callback(new Error(ERROR_MESSAGES.VERIFY_CODE.INVALID));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建IP地址验证规则
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createIPRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.IP.EMPTY));
      } else if (!REGEXP.IP.test(value)) {
        callback(new Error(ERROR_MESSAGES.IP.INVALID));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建端口号验证规则
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createPortRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string | number, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "" || value === undefined || value === null) {
        callback(new Error(ERROR_MESSAGES.PORT.EMPTY));
      } else if (!REGEXP.PORT.test(String(value))) {
        callback(new Error(ERROR_MESSAGES.PORT.INVALID));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建URL验证规则
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createURLRule(
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.URL.EMPTY));
      } else if (!REGEXP.URL.test(value)) {
        callback(new Error(ERROR_MESSAGES.URL.INVALID));
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
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createLengthRule(
  min: number,
  max: number,
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: string, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === "") {
        callback(new Error(ERROR_MESSAGES.REQUIRED(rule.field || "此字段")));
      } else if (value.length < min || value.length > max) {
        callback(new Error(ERROR_MESSAGES.LENGTH(min, max)));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 创建数值范围验证规则
 * @param min - 最小值
 * @param max - 最大值
 * @param required - 是否必填，默认为true
 * @param trigger - 触发方式，默认为"blur"
 * @returns 验证规则对象
 */
export function createNumberRangeRule(
  min: number,
  max: number,
  required: boolean = true,
  trigger: string = "blur"
) {
  return {
    required,
    validator: (rule: any, value: number, callback: any) => {
      if (!required && !value) {
        callback();
      } else if (value === undefined || value === null) {
        callback(new Error(ERROR_MESSAGES.REQUIRED(rule.field || "此字段")));
      } else if (value < min) {
        callback(new Error(ERROR_MESSAGES.MIN(min)));
      } else if (value > max) {
        callback(new Error(ERROR_MESSAGES.MAX(max)));
      } else {
        callback();
      }
    },
    trigger
  };
}

/**
 * 实时验证规则生成器
 * @param rule - 原始验证规则
 * @returns 实时验证规则
 */
export function createRealTimeRule(rule: any) {
  return {
    ...rule,
    trigger: "input"
  };
}

/**
 * 生成实时验证规则
 * @param rules - 原始验证规则对象
 * @returns 实时验证规则对象
 */
export function createRealTimeRules(rules: FormRules): FormRules {
  const realTimeRules: FormRules = {};

  for (const [key, ruleList] of Object.entries(rules)) {
    if (Array.isArray(ruleList)) {
      realTimeRules[key] = ruleList.map(rule => createRealTimeRule(rule));
    } else {
      realTimeRules[key] = [createRealTimeRule(ruleList)];
    }
  }

  return realTimeRules;
}

export { REGEXP, ERROR_MESSAGES };
