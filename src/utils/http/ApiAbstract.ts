/**
 * API响应抽象类
 * @template T - 响应数据类型
 */
export class ApiAbstract<T = any> {
  /**
   * 响应状态码
   */
  public status: number;

  /**
   * 响应时间戳
   */
  public timestamp: Date;

  /**
   * 响应消息
   */
  public message: string;

  /**
   * 响应数据
   * 支持单对象、数组、分页数据或任意类型
   */
  public data: T | T[] | Page<T> | any;
}

/**
 * 分页数据类
 * @template T - 分页数据项类型
 */
export class Page<T> {
  /**
   * 分页数据内容
   */
  content: T[];

  /**
   * 总元素数量
   */
  totalElements?: number;
}

/**
 * 分页查询参数类
 */
export class PageQuery {
  /**
   * 页码，默认0
   */
  page?: number;

  /**
   * 创建时间范围
   */
  createTime?: Date[];

  /**
   * 每页大小，默认10
   */
  size?: number;

  /**
   * 排序规则，默认"id,asc"
   */
  sort?: string;

  /**
   * 构造函数，允许在初始化时设置属性值
   * @param page - 页码
   * @param size - 每页大小
   * @param sort - 排序规则
   */
  constructor(page?: number, size?: number, sort?: string) {
    this.page = page ?? 0;
    this.size = size ?? 10;
    this.sort = sort ?? "id,asc";
  }
}

/**
 * 版本实体类
 * 用于乐观锁
 */
export class VersionEntity {
  /**
   * 乐观锁版本号
   */
  version?: number;
}

/**
 * 基础实体类
 * 包含通用的审计字段
 */
export class BaseEntity extends VersionEntity {
  /**
   * 创建人
   */
  createBy?: string;

  /**
   * 创建时间
   */
  createTime?: Date;

  /**
   * 更新人
   */
  updateBy?: string;

  /**
   * 更新时间
   */
  updateTime?: Date;

  /**
   * 删除状态
   * 0: 未删除, 1: 已删除
   */
  deleted?: number;
}
