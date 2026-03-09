import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { ACCESS_TOKEN } from "@/common/util/constants.js";
import { User } from "@excavator/types";

interface AppState {
  token: string | null;
  userInfo: User;
}

const appStore = defineStore("app", () => {
  const state = reactive<AppState>({
    token: null,
    userInfo: {} as User,
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

  function outLogin() {
    return new Promise((resolve, reject) => {
      // setToken(null); //token 跟登录无关
      setUser(null);
      resolve(true);
    });
  }

  return { state, setUser, setToken, outLogin };
});

export default appStore;
