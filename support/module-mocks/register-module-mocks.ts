import { register } from "node:module"

const REGISTERED_MODULE_MOCKS = Symbol.for(
  "trackables.test.registered-module-mocks"
)

type ModuleMocksState = {
  registered: boolean
}

function getModuleMocksState(): ModuleMocksState {
  const globalState = globalThis as typeof globalThis & {
    [REGISTERED_MODULE_MOCKS]?: ModuleMocksState
  }

  if (!globalState[REGISTERED_MODULE_MOCKS]) {
    globalState[REGISTERED_MODULE_MOCKS] = {
      registered: false,
    }
  }

  return globalState[REGISTERED_MODULE_MOCKS]
}

export function registerModuleMocks() {
  const state = getModuleMocksState()

  if (state.registered) {
    return
  }

  register(new URL("./server-only-loader.mjs", import.meta.url))

  state.registered = true
}

export function registerServerOnlyMock() {
  registerModuleMocks()
}
