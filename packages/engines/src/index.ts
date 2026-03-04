import { Debug } from '@prisma/debug'
import { enginesVersion } from '@prisma/engines-version'
import type { BinaryPaths, DownloadOptions } from '@prisma/fetch-engine'
import { BinaryType } from '@prisma/fetch-engine'
import type { BinaryTarget } from '@prisma/get-platform'
import path from 'path'

const debug = Debug('prisma:engines')
export function getEnginesPath() {
  return path.join(__dirname, '../')
}
export const DEFAULT_CLI_QUERY_ENGINE_BINARY_TYPE = BinaryType.QueryEngineLibrary
/**
 * Checks if the env override `PRISMA_CLI_QUERY_ENGINE_TYPE` is set to `library` or `binary`
 * Otherwise returns the default
 */
export function getCliQueryEngineBinaryType(clientEngineType = process.env.PRISMA_CLI_QUERY_ENGINE_TYPE): BinaryType {
  if (clientEngineType === 'binary') {
    return BinaryType.QueryEngineBinary
  }
  return DEFAULT_CLI_QUERY_ENGINE_BINARY_TYPE
}

type EnsureSomeBinariesExistInput = {
  clientEngineType: 'library' | 'binary' | 'client'
  hasMigrateAdapterInConfig: boolean
  download: (options: DownloadOptions) => Promise<BinaryPaths>
}

export async function ensureNeededBinariesExist({
  clientEngineType,
  download,
  hasMigrateAdapterInConfig,
}: EnsureSomeBinariesExistInput) {
  const binaryDir = path.join(__dirname, '../')

  // Check if a custom query engine binary is bundled (JuisciAdmin/prisma-engines fork).
  const fs = await import('fs')
  const hasBundledEngine = fs
    .readdirSync(binaryDir)
    .some((f: string) => f.startsWith('libquery_engine-') && f.endsWith('.node'))

  const binaries = {} as Record<BinaryType, string>

  if (!hasMigrateAdapterInConfig) {
    binaries[BinaryType.SchemaEngineBinary] = binaryDir
  }

  // Skip query engine download if a custom binary is bundled — it should not be
  // overwritten by the official download. Schema engine is still downloaded normally.
  const usesQueryCompiler = clientEngineType === 'client'

  if (!usesQueryCompiler && !hasBundledEngine) {
    const cliQueryEngineBinaryType = getCliQueryEngineBinaryType(clientEngineType)
    binaries[cliQueryEngineBinaryType] = binaryDir
  } else if (hasBundledEngine) {
    debug('Custom query engine binary found in package, skipping query engine download.')
  }

  debug(`binaries to download ${Object.keys(binaries).join(', ')}`)

  const binaryTargets = process.env.PRISMA_CLI_BINARY_TARGETS
    ? (process.env.PRISMA_CLI_BINARY_TARGETS.split(',') as BinaryTarget[])
    : undefined

  await download({
    binaries: binaries,
    showProgress: true,
    version: enginesVersion,
    failSilent: false,
    binaryTargets,
  })
}

export { enginesVersion } from '@prisma/engines-version'

/**
 * This annotation is used for `node-file-trace`
 * See https://github.com/zeit/node-file-trace/issues/104
 * It's necessary to run this package standalone or within the sdk in Vercel
 * And needed for https://github.com/vercel/pkg#detecting-assets-in-source-code
 */

path.join(__dirname, '../query-engine-darwin')
path.join(__dirname, '../query-engine-darwin-arm64')
path.join(__dirname, '../query-engine-debian-openssl-1.0.x')
path.join(__dirname, '../query-engine-debian-openssl-1.1.x')
path.join(__dirname, '../query-engine-debian-openssl-3.0.x')
path.join(__dirname, '../query-engine-linux-static-x64')
path.join(__dirname, '../query-engine-linux-static-arm64')
path.join(__dirname, '../query-engine-rhel-openssl-1.0.x')
path.join(__dirname, '../query-engine-rhel-openssl-1.1.x')
path.join(__dirname, '../query-engine-rhel-openssl-3.0.x')

// Node API
path.join(__dirname, '../libquery_engine-darwin.dylib.node')
path.join(__dirname, '../libquery_engine-darwin-arm64.dylib.node')
path.join(__dirname, '../libquery_engine-debian-openssl-1.0.x.so.node')
path.join(__dirname, '../libquery_engine-debian-openssl-1.1.x.so.node')
path.join(__dirname, '../libquery_engine-debian-openssl-3.0.x.so.node')
path.join(__dirname, '../libquery_engine-linux-arm64-openssl-1.0.x.so.node')
path.join(__dirname, '../libquery_engine-linux-arm64-openssl-1.1.x.so.node')
path.join(__dirname, '../libquery_engine-linux-arm64-openssl-3.0.x.so.node')
path.join(__dirname, '../libquery_engine-linux-musl.so.node')
path.join(__dirname, '../libquery_engine-linux-musl-openssl-3.0.x.so.node')
path.join(__dirname, '../libquery_engine-rhel-openssl-1.0.x.so.node')
path.join(__dirname, '../libquery_engine-rhel-openssl-1.1.x.so.node')
path.join(__dirname, '../libquery_engine-rhel-openssl-3.0.x.so.node')
path.join(__dirname, '../query_engine-windows.dll.node')
