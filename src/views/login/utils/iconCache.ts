import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const iconCache = new Map<string, any>();

export const useCachedRenderIcon = (icon: any): any => {
  const key =
    typeof icon === "string" ? icon : icon.name || JSON.stringify(icon);

  if (!iconCache.has(key)) {
    const renderedIcon = useRenderIcon(icon);
    iconCache.set(key, renderedIcon);
  }

  return iconCache.get(key);
};

export const clearIconCache = () => {
  iconCache.clear();
};
