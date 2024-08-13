const initState: IUserInfo = { nickname: '', avatar: '' }

export const useLoginStore = defineStore('login', () => {
  const userInfo = ref<IUserInfo>({ ...initState })
  const token = computed(() => userInfo.value.token)

  const isLogin = computed(() => !!token.value)

  const reset = () => {
    userInfo.value = { ...initState }
  }

  return { userInfo, isLogin, token, reset }
}, {
  persist: true,
})
