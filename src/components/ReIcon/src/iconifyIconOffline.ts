import { h, defineComponent } from "vue";
import { Icon, addIcon, type IconifyIcon } from "@iconify/vue/dist/offline";

// Iconify Icon在Vue里本地使用（用于内网环境）
export default defineComponent({
  name: "IconifyIconOffline",
  components: { Icon },
  props: {
    name: {
      type: String,
      default: ""
    },
    icon: {
      type: [String, Object] as PropType<string | IconifyIcon>,
      default: null
    }
  },
  render() {
    if (typeof this.icon === "object") addIcon(this.name, this.icon);
    const attrs = this.$attrs;
    if (typeof this.icon === "string") {
      return h(
        Icon,
        {
          icon: this.icon,
          "aria-hidden": false,
          style: attrs?.style
            ? Object.assign(attrs.style, { outline: "none" })
            : { outline: "none" },
          ...attrs
        },
        {
          default: () => []
        }
      );
    } else {
      return h(
        this.icon,
        {
          "aria-hidden": false,
          style: attrs?.style
            ? Object.assign(attrs.style, { outline: "none" })
            : { outline: "none" },
          ...attrs
        },
        {
          default: () => []
        }
      );
    }
  }
});
