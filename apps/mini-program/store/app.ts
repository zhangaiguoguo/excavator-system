import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { ACCESS_TOKEN } from "@/common/util/constants.js";
import { User } from "@excavator/types";

interface AppState {
  token: string | null;
  userInfo: User;
  /** 当前定位地址，标题栏展示（如美团） */
  currentAddress: string;
}

const appStore = defineStore("app", () => {
  const state = reactive<AppState>({
    token: null,
    userInfo: {} as User,
    currentAddress: "",
  });
  const tokenStatus = ref(0);

  function setToken(token: string | null) {
    state.token = token;
    tokenStatus.value = token ? 1 : 0;
    if (token) {
      uni.setStorageSync(ACCESS_TOKEN, token);
    } else {
      uni.removeStorageSync(ACCESS_TOKEN);
    }
  }

  function setUser(user: any) {
    state.userInfo = user;
    if (user) {
      uni.setStorageSync("userInfo", user);
    } else {
      uni.removeStorageSync("userInfo");
    }
  }

  function setCurrentAddress(addr: string) {
    state.currentAddress = addr || "";
    if (addr) uni.setStorageSync("currentAddress", addr);
    else uni.removeStorageSync("currentAddress");
  }

  function outLogin() {
    return new Promise((resolve, reject) => {
      setUser(null);
      resolve(true);
    });
  }

  return { state, setUser, setToken, setCurrentAddress, outLogin };
});

export default appStore;
