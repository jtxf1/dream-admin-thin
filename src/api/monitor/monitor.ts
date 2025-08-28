import { http } from "@/utils/http";
import type { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

class CpuInfo {
  name: string;
  package: string;
  core: string;
  coreNumber: number;
  logic: string;
  used: string;
  idle: string;
}

class DiskInfo {
  total: string;
  available: string;
  used: string;
  usageRate: string;
}

class MemoryInfo {
  total: string;
  available: string;
  used: string;
  usageRate: string;
}

class SwapInfo {
  total: string;
  used: string;
  available: string;
  usageRate: string;
}

class SysInfo {
  os: string;
  day: string;
  ip: string;
}
class GpuInfo {
  name: string;
  vRam: string;
}

export class Monitor {
  cpu?: CpuInfo;
  disk?: DiskInfo;
  memory?: MemoryInfo;
  swap?: SwapInfo;
  sys?: SysInfo;
  time?: string;
  gpu?: GpuInfo;
}
export const getMonitor = () => {
  return http.request<ApiAbstract<Monitor>>("get", baseUrlApi("monitor"));
};
