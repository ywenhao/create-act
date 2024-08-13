/**
 * 登录
 * @param params
 */
export function loginApi(params: any) {
  return $http.post('/login', params, {
    custom: {
      needLogin: false,
    },
  })
}
