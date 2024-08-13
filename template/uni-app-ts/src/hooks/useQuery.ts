// export type Query = NonNullable<Parameters<Parameters<typeof onLoad>[0]>[0]>
export type Query = Record<string, any>

/**
 * 获取query参数
 * @returns Ref<T>
 *
 * @example
 * ```ts
 * const query = useQuery()
 * const query = useQuery<{ id: string }>()
 * ```
 */
export function useQuery<T extends Query>() {
  const query = shallowRef({} as T)

  onLoad((data) => {
    if (typeof data === 'object') {
      for (const key in data) {
        if (typeof data[key] === 'string') {
          data[key] = decodeURIComponent(data[key])
        }
      }
    }
    query.value = data as T
  })

  return readonly(query)
}
