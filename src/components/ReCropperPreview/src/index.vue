<script setup lang="tsx">
import { ref, onMounted } from "vue";
import ImgCutter from "vue-img-cutter";
import { formatBytes } from "@pureadmin/utils";

defineOptions({
  name: "ReCropperPreview"
});

const props = defineProps<{ imgSrc: string }>();
const imgSrc1 = ref<string>("");

const emit = defineEmits(["cropper"]);

function onCropper({ dataURL, blob, file }) {
  emit("cropper", { dataURL, blob, file });
}
interface Info {
  width?: number | string;
  height?: number | string;
  size?: number;
}
const infos = ref<Info>({
  width: "0",
  height: "0",
  size: 0
});
const showPopover = ref(false);
const childComponentRef = ref(null);

function forIe9() {
  childComponentRef.value?.handleOpen({
    name: "1.png",
    src: props.imgSrc
  });
}
function imageLoadComplete(ref) {
  infos.value.width = ref?.width;
  infos.value.height = ref?.height;
}
function cutDown(data) {
  onCropper(data);
}
function handlePrintImg(data) {
  onCropper(data);
  infos.value.size = data?.blob?.size;
  imgSrc1.value = data?.dataURL;
  const file = data?.file;

  const reader = new FileReader();

  reader.onload = function (e) {
    const dataUrl = e.target.result;
    // --- 关键代码：new Image() ---
    const img = new Image();
    img.onload = function () {
      infos.value.width = img.naturalWidth;
      infos.value.height = img.naturalHeight;
    };
    if (typeof dataUrl === "string") {
      img.src = dataUrl;
    }
    // --- 关键代码结束 ---
  };
  reader.readAsDataURL(file);
}
onMounted(() => {
  // 组件加载完成后执行
  forIe9(); // 例如自动打开裁剪远程图片
});
</script>

<template>
  <el-row>
    <el-col :span="12">
      <div class="w-[18vw]">
        <ImgCutter
          ref="childComponentRef"
          rate="1:1"
          :isModal="false"
          :boxWidth="373"
          @onImageLoadComplete="imageLoadComplete"
          @cutDown="cutDown"
          @onPrintImg="handlePrintImg"
        />
        <p v-show="showPopover" class="mt-1 text-center">
          温馨提示：右键上方裁剪区可开启功能菜单
        </p>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="w-[18vw] justify-center items-center text-center">
        <el-image :src="imgSrc1" toolBgc="#fff" fit="cover" />
        <div class="mt-1">
          <p>
            图像大小：{{ parseInt(infos.width) }} ×
            {{ parseInt(infos.height) }}像素
          </p>
          <p>
            文件大小：{{ formatBytes(infos.size) }}（{{ infos.size }} 字节）
          </p>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>
/*
  覆盖并隐藏子组件中的 .i-dialog-footer
  使用 :deep() 选择器穿透 scoped 样式
  .child-component-wrapper 是为了更精确地定位到子组件内的元素
*/
:deep(.i-dialog-footer) {
  display: none !important; /* 使用 !important 确保覆盖 */
}
</style>
