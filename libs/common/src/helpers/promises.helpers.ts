type ObjectType<T> = T extends true ? Error : string

export const handlePromiseAllSettled = <T = any, U extends boolean = false>(
  promiseResults: PromiseSettledResult<T>[],
  returnRawErrors?: U,
): [T[], ObjectType<U>[]] => {
  const data: T[] = []
  const errors: ObjectType<U>[] = []

  for (const r of promiseResults) {
    if (r.status === 'fulfilled') {
      data.push(r.value)
      continue
    }

    // TODO: This looses all stack traces, and sometimes serializes errors as '[Object object]'
    errors.push(returnRawErrors ? r.reason : r.reason.toString())
  }

  return [data, errors]
}
