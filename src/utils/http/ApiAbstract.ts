export class ApiAbstract<T = any> {
  public status: number;
  public timestamp: Date;
  public message: string;
  public data: T | T[] | Page<T> | any;
}

export class Page<T> {
  content: T[];
  totalElements?: number;
}

export class PageQuery {
  page?: number;
  size?: number;
  sort?: string;
  // 构造函数，允许在初始化时改变属性值
  constructor(page?: number, size?: number, sort?: string) {
    this.page = page ?? 10;
    this.size = size ?? 1;
    this.sort = sort ?? "id,asc";
  }
}

export class VersionEntity {
  /**
   * 乐观锁
   */
  version?: number;
}

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
   */
  deleted?: number;
}
