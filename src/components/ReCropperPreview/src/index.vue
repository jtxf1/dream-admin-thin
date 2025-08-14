<script setup lang="tsx">
import { ref, onMounted } from "vue";
import ImgCutter from "vue-img-cutter";
import { formatBytes } from "@pureadmin/utils";

defineOptions({
  name: "ReCropperPreview"
});

const props = defineProps<{ imgSrc: string }>();

const emit = defineEmits(["cropper"]);
interface Info {
  width?: string;
  height?: string;
  size?: number;
}
const infos = ref<Info>({
  width: "0",
  height: "0",
  size: 0
});
const popoverRef = ref();
const showPopover = ref(false);
const childComponentRef = ref(null);

function hidePopover() {
  popoverRef.value.hide();
}
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
  console.log(data);

  emit("cropper", data);
  hidePopover();
}
function handlePrintImg(data) {
  infos.value.size = data?.file?.size;
  console.log("打印图片", data);
}
onMounted(() => {
  // 组件加载完成后执行
  forIe9(); // 例如自动打开裁剪远程图片
});
defineExpose({ hidePopover });
</script>

<template>
  <el-row>
    <el-col :span="12">
      <div class="w-[18vw]">
        <ImgCutter
          ref="childComponentRef"
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
        <el-image
          :src="props.imgSrc"
          toolBgc="#fff"
          :preview-src-list="Array.of(props.imgSrc)"
          fit="cover"
        />
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
