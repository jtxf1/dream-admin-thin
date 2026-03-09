import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import { debounce } from "@pureadmin/utils";

/**
 * 表格高度优化器
 * 提供防抖、缓存和批量更新功能，减少不必要的DOM操作和重排重绘
 */
export class TableHeightOptimizer {
  private tableRef: any;
  private adaptiveConfig: any;
  private lastHeight: number = 0;
  private resizeHandler: any;
  private isCalculating: boolean = false;

  /**
   * 构造函数
   * @param tableRef 表格实例引用
   * @param adaptiveConfig 自适应配置
   */
  constructor(tableRef: any, adaptiveConfig: any = {}) {
    this.tableRef = tableRef;
    this.adaptiveConfig = adaptiveConfig;
    this.resizeHandler = debounce(this.handleResize.bind(this), 100);
  }

  /**
   * 初始化
   */
  public init() {
    window.addEventListener("resize", this.resizeHandler);
    // 初始计算
    this.calculateHeight();
  }

  /**
   * 销毁
   */
  public destroy() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  /**
   * 处理窗口 resize 事件
   */
  private handleResize() {
    this.calculateHeight();
  }

  /**
   * 计算表格高度
   */
  public calculateHeight() {
    if (this.isCalculating || !this.tableRef.value) return;

    this.isCalculating = true;

    nextTick(() => {
      try {
        const tableEl = this.tableRef.value.$el;
        if (!tableEl) return;

        // 获取容器高度
        const container = tableEl.parentElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // 计算可用高度
        let availableHeight = windowHeight - containerRect.top;

        // 应用底部偏移
        if (this.adaptiveConfig.offsetBottom) {
          availableHeight -= this.adaptiveConfig.offsetBottom;
        }

        // 计算表格头部和分页高度
        const tableHeader = tableEl.querySelector(".el-table__header-wrapper");
        const tablePagination = tableEl.querySelector(".el-pagination");

        let headerHeight = 0;
        let paginationHeight = 0;

        if (tableHeader) {
          headerHeight = tableHeader.offsetHeight;
        }

        if (tablePagination) {
          paginationHeight = tablePagination.offsetHeight;
        }

        // 计算表格主体高度
        const tableBodyHeight =
          availableHeight - headerHeight - paginationHeight - 20; // 20px 为安全边距

        // 避免高度过小
        const finalHeight = Math.max(tableBodyHeight, 200);

        // 只有当高度变化超过10px时才更新，减少不必要的DOM操作
        if (Math.abs(finalHeight - this.lastHeight) > 10) {
          this.lastHeight = finalHeight;

          // 使用requestAnimationFrame优化重排重绘
          requestAnimationFrame(() => {
            if (this.tableRef.value.setAdaptive) {
              this.tableRef.value.setAdaptive();
            } else {
              // 直接设置表格高度
              const tableBody = tableEl.querySelector(
                ".el-table__body-wrapper"
              );
              if (tableBody) {
                tableBody.style.maxHeight = `${finalHeight}px`;
              }
            }
          });
        }
      } catch (error) {
        console.error("表格高度计算失败:", error);
      } finally {
        this.isCalculating = false;
      }
    });
  }

  /**
   * 强制更新表格高度
   */
  public forceUpdate() {
    this.lastHeight = 0;
    this.calculateHeight();
  }
}

/**
 * 表格高度优化组合式函数
 * @param tableRef 表格实例引用
 * @param adaptiveConfig 自适应配置
 * @returns 优化器实例和方法
 */
export function useTableHeightOptimizer(
  tableRef: any,
  adaptiveConfig: any = {}
) {
  const optimizer = ref<TableHeightOptimizer | null>(null);

  onMounted(() => {
    optimizer.value = new TableHeightOptimizer(tableRef, adaptiveConfig);
    optimizer.value.init();
  });

  onBeforeUnmount(() => {
    if (optimizer.value) {
      optimizer.value.destroy();
    }
  });

  return {
    optimizer,
    calculateHeight: () => optimizer.value?.calculateHeight(),
    forceUpdate: () => optimizer.value?.forceUpdate()
  };
}
