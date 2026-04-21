
// report error to admin
export const reportError = async (e: Error) => {
  // todo: reports errors to admin
  console.error(e, e?.stack)
}
