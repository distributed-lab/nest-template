export const sleep = (timeout: number) => new Promise(ok => setTimeout(ok, timeout))
