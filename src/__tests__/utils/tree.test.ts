import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractPathList,
  deleteChildren,
  buildHierarchyTree,
  getNodeByUniqueId,
  appendFieldByUniqueId,
  handleTree
} from "../../utils/tree";

// 模拟 console.warn
const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("tree 工具函数测试", () => {
  beforeEach(() => {
    consoleWarnSpy.mockClear();
  });

  describe("extractPathList 函数", () => {
    it("应该提取树中所有节点的 uniqueId", () => {
      const tree = [
        { uniqueId: "1", children: [{ uniqueId: "2" }] },
        { uniqueId: "3" }
      ];
      const result = extractPathList(tree);
      expect(result).toEqual(["2", "1", "3"]);
    });

    it("应该处理空数组", () => {
      const result = extractPathList([]);
      expect(result).toEqual([]);
    });

    it("应该处理非数组输入并返回空数组", () => {
      // @ts-ignore
      const result = extractPathList("not an array");
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("tree must be an array");
    });

    it("应该处理没有 children 的树", () => {
      const tree = [{ uniqueId: "1" }, { uniqueId: "2" }];
      const result = extractPathList(tree);
      expect(result).toEqual(["1", "2"]);
    });
  });

  describe("deleteChildren 函数", () => {
    it("应该删除只有一个子节点的 children 并生成 uniqueId", () => {
      const tree = [
        { children: [{ children: [{ name: "child" }] }] },
        { name: "node" }
      ];
      const result = deleteChildren(tree);
      expect(result[0].children).toBeUndefined();
      expect(result[0].uniqueId).toBe(0);
      expect(result[1].uniqueId).toBe(1);
    });

    it("应该处理空数组", () => {
      const result = deleteChildren([]);
      expect(result).toEqual([]);
    });

    it("应该处理非数组输入并返回空数组", () => {
      // @ts-ignore
      const result = deleteChildren("not an array");
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("menuTree must be an array");
    });

    it("应该为每个节点生成正确的层级关系", () => {
      const tree = [{ children: [{ children: [] }] }];
      const result = deleteChildren(tree);
      expect(result[0].id).toBe(0);
      expect(result[0].parentId).toBe(null);
      expect(result[0].pathList).toEqual([0]);
    });
  });

  describe("buildHierarchyTree 函数", () => {
    it("应该为树节点创建层级关系", () => {
      const tree = [{ children: [{ children: [] }] }];
      const result = buildHierarchyTree(tree);
      expect(result[0].id).toBe(0);
      expect(result[0].parentId).toBe(null);
      expect(result[0].pathList).toEqual([0]);
      expect(result[0].children[0].id).toBe(0);
      expect(result[0].children[0].parentId).toBe(0);
      expect(result[0].children[0].pathList).toEqual([0, 0]);
    });

    it("应该处理空数组", () => {
      const result = buildHierarchyTree([]);
      expect(result).toEqual([]);
    });

    it("应该处理非数组输入并返回空数组", () => {
      // @ts-ignore
      const result = buildHierarchyTree("not an array");
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("tree must be an array");
    });
  });

  describe("getNodeByUniqueId 函数", () => {
    it("应该根据 uniqueId 找到节点", () => {
      const tree = [
        {
          uniqueId: "1",
          name: "node1",
          children: [{ uniqueId: "2", name: "node2" }]
        }
      ];
      const result = getNodeByUniqueId(tree, "2");
      expect(result).toEqual({ uniqueId: "2", name: "node2" });
    });

    it("应该处理空数组", () => {
      const result = getNodeByUniqueId([], "1");
      expect(result).toEqual([]);
    });

    it("应该处理非数组输入并返回空数组", () => {
      // @ts-ignore
      const result = getNodeByUniqueId("not an array", "1");
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("menuTree must be an array");
    });

    it("应该在找不到节点时继续搜索子节点", () => {
      const tree = [
        {
          uniqueId: "1",
          children: [{ uniqueId: "2", children: [{ uniqueId: "3" }] }]
        }
      ];
      const result = getNodeByUniqueId(tree, "3");
      expect(result).toEqual({ uniqueId: "3" });
    });

    it("应该在树中不存在该 uniqueId 时返回空数组", () => {
      const tree = [{ uniqueId: "1" }];
      const result = getNodeByUniqueId(tree, "999");
      expect(result).toEqual([]);
    });
  });

  describe("appendFieldByUniqueId 函数", () => {
    it("应该向指定 uniqueId 的节点追加字段", () => {
      const tree = [
        { uniqueId: "1", name: "node1" },
        { uniqueId: "2", name: "node2" }
      ];
      const fields = { newField: "value" };
      const result = appendFieldByUniqueId(tree, "1", fields);
      expect(result[0].newField).toBe("value");
      expect(result[1].newField).toBeUndefined();
    });

    it("应该处理空数组", () => {
      const result = appendFieldByUniqueId([], "1", { field: "value" });
      expect(result).toEqual([]);
    });

    it("应该处理非数组输入并返回空数组", () => {
      // @ts-ignore
      const result = appendFieldByUniqueId("not an array", "1", {
        field: "value"
      });
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("menuTree must be an array");
    });

    it("应该处理非对象类型的 fields", () => {
      const tree = [{ uniqueId: "1" }];
      // @ts-ignore
      const result = appendFieldByUniqueId(tree, "1", "not an object");
      expect(result[0]).not.toHaveProperty("not an object");
    });

    it("应该在嵌套树中追加字段", () => {
      const tree = [{ uniqueId: "1", children: [{ uniqueId: "2" }] }];
      const fields = { test: "value" };
      const result = appendFieldByUniqueId(tree, "2", fields);
      expect(result[0].children[0].test).toBe("value");
    });
  });

  describe("handleTree 函数", () => {
    it("应该构造树型结构数据", () => {
      const data = [
        { id: 1, parentId: 0, name: "root" },
        { id: 2, parentId: 1, name: "child1" },
        { id: 3, parentId: 1, name: "child2" }
      ];
      const result = handleTree(data);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("root");
      expect(result[0].children).toHaveLength(2);
    });

    it("应该处理空数组", () => {
      const result = handleTree([]);
      expect(result).toEqual([]);
    });

    it("应该处理非数组输入并返回空数组", () => {
      // @ts-ignore
      const result = handleTree("not an array");
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("data must be an array");
    });

    it("应该支持自定义字段名", () => {
      const data = [
        { uid: 1, pid: 0, name: "root" },
        { uid: 2, pid: 1, name: "child" }
      ];
      const result = handleTree(data, "uid", "pid", "kids");
      expect(result[0].kids).toHaveLength(1);
    });

    it("应该处理没有父节点的情况", () => {
      const data = [{ id: 1, parentId: null, name: "root" }];
      const result = handleTree(data);
      expect(result).toHaveLength(1);
    });
  });
});
