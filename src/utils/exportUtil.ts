import { message } from "./message";
import {
  type ExportError,
  type ExportErrorHandlerConfig,
  handleExportError,
  validateExportParams
} from "./exportErrorHandler";

/**
 * 导出配置接口
 */
export interface ExportConfig {
  /** 导出API函数 */
  api: (params: any, format: string) => Promise<Blob>;
  /** 导出参数 */
  params?: any;
  /** 导出格式 */
  format: string;
  /** 文件名 */
  fileName?: string;
  /** 错误处理配置 */
  errorHandlerConfig?: ExportErrorHandlerConfig;
  /** 成功回调 */
  onSuccess?: () => void;
  /** 失败回调 */
  onError?: (error: ExportError) => void;
  /** 加载状态回调 */
  onLoading?: (loading: boolean) => void;
}

/**
 * 导出工具类
 */
export class ExportUtil {
  /**
   * 执行导出
   * @param config - 导出配置
   */
  static async export(config: ExportConfig): Promise<void> {
    const {
      api,
      params,
      format,
      fileName = `export_${new Date().getTime()}`,
      errorHandlerConfig = {},
      onSuccess,
      onError,
      onLoading
    } = config;

    // 调用加载状态回调
    if (onLoading) {
      onLoading(true);
    }

    try {
      // 验证导出参数
      const validationResult = validateExportParams(params, format);
      if (!validationResult.valid && validationResult.error) {
        throw validationResult.error;
      }

      // 调用导出API
      const response = await api(params, format);

      // 处理导出结果
      this.handleExportResponse(response, format, fileName);

      // 显示成功消息
      message("导出成功", { type: "success" });

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // 处理导出错误
      const exportError = handleExportError(error, errorHandlerConfig, {
        format,
        fileName,
        params: JSON.stringify(params)
      });

      // 显示错误消息
      if (errorHandlerConfig.showMessage !== false) {
        message(exportError.message, { type: "error" });
      }

      // 调用失败回调
      if (onError) {
        onError(exportError);
      }
    } finally {
      // 调用加载状态回调
      if (onLoading) {
        onLoading(false);
      }
    }
  }

  /**
   * 处理导出响应
   * @param response - 导出响应
   * @param format - 导出格式
   * @param fileName - 文件名
   */
  private static handleExportResponse(
    response: Blob,
    format: string,
    fileName: string
  ): void {
    // 根据格式确定文件扩展名
    const extension = this.getFileExtension(format);
    const fullFileName = `${fileName}.${extension}`;

    // 创建下载链接
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(response);

    a.href = url;
    a.download = fullFileName;
    a.style.display = "none";
    document.body.appendChild(a);

    // 触发下载
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * 获取文件扩展名
   * @param format - 导出格式
   * @returns 文件扩展名
   */
  private static getFileExtension(format: string): string {
    const extensionMap: Record<string, string> = {
      excel: "xlsx",
      csv: "csv",
      pdf: "pdf"
    };

    return extensionMap[format] || format;
  }

  /**
   * 导出Excel文件
   * @param config - 导出配置
   */
  static async exportExcel(
    config: Omit<ExportConfig, "format">
  ): Promise<void> {
    await this.export({ ...config, format: "excel" });
  }

  /**
   * 导出CSV文件
   * @param config - 导出配置
   */
  static async exportCSV(config: Omit<ExportConfig, "format">): Promise<void> {
    await this.export({ ...config, format: "csv" });
  }

  /**
   * 导出PDF文件
   * @param config - 导出配置
   */
  static async exportPDF(config: Omit<ExportConfig, "format">): Promise<void> {
    await this.export({ ...config, format: "pdf" });
  }
}
