# HTTP请求防抖功能使用指南

## 1. 功能概述

HTTP请求防抖功能是一种优化技术，用于减少频繁触发的HTTP请求，提高系统性能和用户体验。通过延迟执行和合并相同请求，有效避免重复请求和服务器过载。

## 2. 核心特性

- **差异化延迟**：根据请求类型自动设置不同的防抖延迟时间
- **请求合并**：相同参数的请求会被自动合并，避免重复发送
- **开关控制**：支持全局和单个请求级别的防抖开关
- **日志记录**：详细的防抖处理日志，便于调试和性能分析
- **内存管理**：自动清理完成的请求，避免内存泄漏

## 3. 默认配置

| 请求方法 | 默认延迟时间 | 说明                           |
| -------- | ------------ | ------------------------------ |
| GET      | 500ms        | 查询接口，响应较快             |
| POST     | 800ms        | 数据提交接口，需要更多处理时间 |
| PUT      | 800ms        | 数据更新接口                   |
| DELETE   | 800ms        | 数据删除接口                   |
| PATCH    | 800ms        | 部分更新接口                   |
| HEAD     | 500ms        | 只获取头部信息                 |
| OPTIONS  | 500ms        | 预检请求                       |

## 4. 使用方法

### 4.1 基本使用

默认情况下，所有HTTP请求都会启用防抖功能：

```typescript
import { http } from "@/utils/http";

// 自动启用防抖，GET请求延迟500ms
const response = await http.get("/api/users");

// 自动启用防抖，POST请求延迟800ms
const response = await http.post("/api/users", { name: "John" });
```

### 4.2 单个请求配置

可以为单个请求配置防抖选项：

```typescript
// 禁用单个请求的防抖
const response = await http.get(
  "/api/users",
  {},
  {
    debounce: {
      enabled: false
    }
  }
);

// 自定义防抖延迟时间
const response = await http.get(
  "/api/search",
  { params: { q: "keyword" } },
  {
    debounce: {
      wait: 300 // 自定义延迟时间
    }
  }
);

// 禁用请求合并
const response = await http.post(
  "/api/submit",
  { data: { id: 1 } },
  {
    debounce: {
      merge: false // 禁用请求合并
    }
  }
);
```

### 4.3 全局控制

可以通过静态方法控制全局防抖开关：

```typescript
import { PureHttp } from "@/utils/http/index";

// 禁用全局防抖
PureHttp.setGlobalDebounceEnabled(false);

// 启用全局防抖
PureHttp.setGlobalDebounceEnabled(true);

// 获取当前全局防抖状态
const isEnabled = PureHttp.getGlobalDebounceEnabled();

// 清除所有防抖请求
PureHttp.clearDebounceRequests();
```

## 5. 最佳实践

### 5.1 搜索场景

对于搜索输入框，建议使用较短的防抖延迟，提高用户体验：

```typescript
// 搜索请求，使用300ms延迟
const search = async (keyword: string) => {
  const response = await http.get(
    "/api/search",
    { params: { q: keyword } },
    {
      debounce: {
        wait: 300
      }
    }
  );
  return response;
};
```

### 5.2 表单提交

对于表单提交，建议使用默认的800ms延迟，确保用户有足够的时间完成输入：

```typescript
// 表单提交，使用默认800ms延迟
const submitForm = async (formData: any) => {
  const response = await http.post("/api/submit", formData);
  return response;
};
```

### 5.3 实时数据

对于需要实时更新的数据，建议禁用防抖：

```typescript
// 实时数据更新，禁用防抖
const getRealTimeData = async () => {
  const response = await http.get(
    "/api/realtime",
    {},
    {
      debounce: {
        enabled: false
      }
    }
  );
  return response;
};
```

## 6. 常见问题与解决方案

### 6.1 防抖导致请求延迟

**问题**：用户感觉请求响应变慢

**解决方案**：根据具体场景调整防抖延迟时间，对于需要快速响应的场景可以使用较短的延迟或禁用防抖

### 6.2 请求合并导致数据不一致

**问题**：多个相同参数的请求被合并，可能导致数据更新不及时

**解决方案**：对于需要立即响应的操作，禁用请求合并功能

### 6.3 内存泄漏

**问题**：长时间运行后内存占用增加

**解决方案**：系统会自动清理完成的请求，无需手动处理。如果需要，可以使用 `PureHttp.clearDebounceRequests()` 手动清理

## 7. 性能优化建议

1. **合理设置延迟时间**：根据请求类型和业务场景选择合适的延迟时间
2. **启用请求合并**：对于相同参数的请求，启用合并功能减少服务器负载
3. **按需禁用防抖**：对于实时性要求高的请求，禁用防抖功能
4. **监控防抖效果**：通过控制台日志监控防抖处理情况，优化配置

## 8. 日志说明

系统会在控制台输出详细的防抖处理日志，格式如下：

- `[HTTP] 请求 GET /api/test，防抖配置: { enabled: true, wait: 500, merge: true }` - 请求开始，显示防抖配置
- `[HTTP] 合并相同请求 GET:/api/test:{"params":{"id":1}}` - 合并相同请求
- `[HTTP] 取消之前的防抖请求 GET:/api/test:{"params":{"id":1}}` - 取消之前的防抖请求
- `[HTTP] 请求完成，清理映射表 GET:/api/test:{"params":{"id":1}}` - 请求完成，清理映射表
- `[HTTP] 直接执行请求 GET /api/test` - 直接执行请求，未使用防抖
- `[HTTP] 全局防抖开关已禁用` - 全局防抖开关状态变更
- `[HTTP] 已清除所有防抖请求` - 清除所有防抖请求

## 9. 总结

HTTP请求防抖功能是一种有效的性能优化技术，可以显著减少重复请求，提高系统响应速度和用户体验。通过合理配置和使用，可以在不影响功能的前提下，大幅提升系统性能。

建议在以下场景使用防抖功能：

- 搜索输入
- 表单提交
- 频繁触发的查询请求
- 数据统计和分析请求

在以下场景禁用防抖功能：

- 实时数据更新
- 紧急操作
- 需要立即响应的请求

通过本文档的指导，您可以根据具体业务场景灵活配置和使用防抖功能，获得最佳的性能优化效果。
