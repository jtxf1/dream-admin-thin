// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { getSvgInfo } from "@pureadmin/utils";
import { addIcon } from "@iconify/vue/dist/offline";

// https://icon-sets.iconify.design/ep/?keyword=ep
// ~icons/ep
import Menu from "~icons/ep/menu";
import Edit from "~icons/ep/edit";
import SetUp from "~icons/ep/set-up";
import Guide from "~icons/ep/guide";
import Monitor from "~icons/ep/monitor";
import Lollipop from "~icons/ep/lollipop";
import Histogram from "~icons/ep/histogram";
import HomeFilled from "~icons/ep/home-filled";
import EpHomeFilled from "~icons/ep/home-filled?raw";

// https://icon-sets.iconify.design/ri/?keyword=ri
// ~icons/ri
import Tag from "~icons/ri/bookmark-2-line";
import Ppt from "~icons/ri/file-ppt-2-line";
import Card from "~icons/ri/bank-card-line";
import Role from "~icons/ri/admin-fill";
import Info from "~icons/ri/file-info-line";
import Dept from "~icons/ri/git-branch-line";
import Table from "~icons/ri/table-line";
import Links from "~icons/ri/links-fill";
import Search from "~icons/ri/search-line";
import FlUser from "~icons/ri/admin-line";
import Setting from "~icons/ri/settings-3-line";
import BarChart from "~icons/ri/bar-chart-horizontal-line";
import LoginLog from "~icons/ri/window-line";
import Artboard from "~icons/ri/artboard-line";
import SystemLog from "~icons/ri/file-search-line";
import ListCheck from "~icons/ri/list-check";
import UbuntuFill from "~icons/ri/ubuntu-fill";
import OnlineUser from "~icons/ri/user-voice-line";
import EditBoxLine from "~icons/ri/edit-box-line";
import OperationLog from "~icons/ri/history-fill";
import InformationLine from "~icons/ri/information-line";
import TerminalWindowLine from "~icons/ri/terminal-window-line";
import CheckboxCircleLine from "~icons/ri/checkbox-circle-line";
import RiSearchLine from "~icons/ri/search-line?raw";
import RiInformationLine from "~icons/ri/information-line?raw";

const icons = [
  // Element Plus Icon: https://github.com/element-plus/element-plus-icons
  ["ep/home-filled", EpHomeFilled],
  // Remix Icon: https://github.com/Remix-Design/RemixIcon
  ["ri/search-line", RiSearchLine],
  ["ri/information-line", RiInformationLine],
  ["ep:menu", Menu],
  ["ep:edit", Edit],
  ["ep:set-up", SetUp],
  ["ep:guide", Guide],
  ["ep:monitor", Monitor],
  ["ep:lollipop", Lollipop],
  ["ep:histogram", Histogram],
  ["ep:home-filled", HomeFilled],
  ["ri:bookmark-2-line", Tag],
  ["ri:file-ppt-2-line", Ppt],
  ["ri:bank-card-line", Card],
  ["ri:admin-fill", Role],
  ["ri:file-info-line", Info],
  ["ri:git-branch-line", Dept],
  ["ri:links-fill", Links],
  ["ri:table-line", Table],
  ["ri:search-line", Search],
  ["ri:admin-line", FlUser],
  ["ri:settings-3-line", Setting],
  ["ri:bar-chart-horizontal-line", BarChart],
  ["ri:window-line", LoginLog],
  ["ri:file-search-line", SystemLog],
  ["ri:artboard-line", Artboard],
  ["ri:list-check", ListCheck],
  ["ri:ubuntu-fill", UbuntuFill],
  ["ri:user-voice-line", OnlineUser],
  ["ri:edit-box-line", EditBoxLine],
  ["ri:history-fill", OperationLog],
  ["ri:information-line", InformationLine],
  ["ri:terminal-window-line", TerminalWindowLine],
  ["ri:checkbox-circle-line", CheckboxCircleLine]
];

// 本地菜单图标，后端在路由的 icon 中返回对应的图标字符串并且前端在此处使用 addIcon 添加即可渲染菜单图标
icons.forEach(([name, icon]) => {
  addIcon(name as string, getSvgInfo(icon as string));
});
