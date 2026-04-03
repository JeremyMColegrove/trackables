const EMPTY_MODULE_URL = "data:text/javascript,export {}"

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      format: "module",
      shortCircuit: true,
      url: EMPTY_MODULE_URL,
    }
  }

  return nextResolve(specifier, context)
}
