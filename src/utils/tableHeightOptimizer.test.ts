import { TableHeightOptimizer } from "./tableHeightOptimizer";

// 模拟表格实例
const createMockTableRef = () => {
  let updateCount = 0;

  const mockSetAdaptive = () => {
    updateCount++;
  };

  return {
    value: {
      $el: {
        parentElement: {
          getBoundingClientRect: () => ({
            top: 100
          })
        },
        querySelector: (selector: string) => {
          if (selector === ".el-table__header-wrapper") {
            return { offsetHeight: 50 };
          }
          if (selector === ".el-pagination") {
            return { offsetHeight: 40 };
          }
          if (selector === ".el-table__body-wrapper") {
            return {
              style: {
                maxHeight: ""
              }
            };
          }
          return null;
        }
      },
      setAdaptive: mockSetAdaptive,
      updateCount: () => updateCount
    }
  };
};

// 测试表格高度优化器的性能
describe("TableHeightOptimizer Performance Test", () => {
  let tableRef: any;
  let optimizer: TableHeightOptimizer;

  beforeEach(() => {
    tableRef = createMockTableRef();
    optimizer = new TableHeightOptimizer(tableRef, { offsetBottom: 45 });
  });

  test("calculateHeight should be efficient", () => {
    const startTime = performance.now();

    // 模拟多次调用计算高度
    for (let i = 0; i < 100; i++) {
      optimizer.calculateHeight();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`100次高度计算耗时: ${duration.toFixed(2)}毫秒`);
    expect(duration).toBeLessThan(100); // 100次计算应该在100毫秒内完成
  });

  test("should not update height when change is small", () => {
    // 模拟窗口高度
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 800
    });

    // 第一次计算
    optimizer.calculateHeight();
    const initialUpdateCount = tableRef.value.updateCount();

    // 小幅改变窗口高度（小于10px）
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 805
    });

    // 再次计算
    optimizer.calculateHeight();
    const finalUpdateCount = tableRef.value.updateCount();

    // 应该不会更新高度
    expect(finalUpdateCount).toBe(initialUpdateCount);
  });

  test("should update height when change is significant", () => {
    // 模拟窗口高度
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 800
    });

    // 第一次计算
    optimizer.calculateHeight();
    const initialUpdateCount = tableRef.value.updateCount();

    // 大幅改变窗口高度（大于10px）
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 900
    });

    // 再次计算
    optimizer.calculateHeight();
    const finalUpdateCount = tableRef.value.updateCount();

    // 应该更新高度
    expect(finalUpdateCount).toBeGreaterThan(initialUpdateCount);
  });
});

// 性能对比测试
const runPerformanceComparison = () => {
  console.log("=== 表格高度计算性能对比测试 ===");

  // 测试优化前的性能（模拟原始实现）
  const testOriginalPerformance = () => {
    const startTime = performance.now();

    // 模拟原始实现：每次都重新计算并更新
    for (let i = 0; i < 100; i++) {
      // 模拟DOM操作
      const tableBody = document.createElement("div");
      tableBody.style.maxHeight = `${window.innerHeight - 200}px`;
    }

    const endTime = performance.now();
    return endTime - startTime;
  };

  // 测试优化后的性能
  const testOptimizedPerformance = () => {
    const tableRef = createMockTableRef();
    const optimizer = new TableHeightOptimizer(tableRef);

    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      optimizer.calculateHeight();
    }

    const endTime = performance.now();
    return endTime - startTime;
  };

  const originalTime = testOriginalPerformance();
  const optimizedTime = testOptimizedPerformance();
  const improvement = ((originalTime - optimizedTime) / originalTime) * 100;

  console.log(`优化前耗时: ${originalTime.toFixed(2)}毫秒`);
  console.log(`优化后耗时: ${optimizedTime.toFixed(2)}毫秒`);
  console.log(`性能提升: ${improvement.toFixed(2)}%`);

  return {
    originalTime,
    optimizedTime,
    improvement
  };
};

// 运行性能对比测试
if (typeof window !== "undefined") {
  runPerformanceComparison();
}

export { runPerformanceComparison };
