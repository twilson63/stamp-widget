import Arweave from 'https://cdn.skypack.dev/arweave'
import { WarpWebFactory, LoggerFactory } from 'https://unpkg.com/warp-contracts@1.1.14/bundles/esm.bundle.js'

const STAMPCOIN = '9nDWI3eHrMQbrfs9j8_YPfLbYJmBodgn7cBCG8bii4o'
const CACHE = 'https://stamp-cache.onrender.com'
// const CACHE = 'https://warp-cache.hyper.io/' + STAMPCOIN
let host = `${window.location.host.split('.').reverse()[1] || ''}.${window.location.host.split('.').reverse()[0] || 'localhost'}`
if (['gitpod.io', 'localhost'].includes(host)) {
  host = 'arweave.net'
}

const arweave = Arweave.init({
  host,
  port: 443,
  protocol: 'https'
})
LoggerFactory.INST.logLevel('fatal')
const warp = WarpWebFactory.memCached(arweave)

export const getCount = (txId) =>
  fetch(CACHE)
    .then(res => res.ok ? res.json() : Promise.reject(new Error(res.status)))
    .catch(() => readState())
    .then(state => Object.values(state.stamps).filter(s => s.asset === txId))
    .then(stamps => stamps.length)

export const stamp = (txId, addr) => {
  // is vouched?
  return isVouched(addr).then(_ =>
    warp.contract(STAMPCOIN)
      .connect('use_wallet')
      .bundleInteraction({
        function: 'stamp',
        asset: txId,
        timestamp: Date.now()
      })
  )
}

function readState() {
  return warp
    .contract(STAMPCOIN)
    .setEvaluationOptions({
      allowUnsafeClient: true,
      allowBigInt: true
    })
    .readState()
}

function isVouched(addr) {
  return arweave.api.post('graphql', {
    query: `
query {
  transactions(tags: { name: "Vouch-For", values: ["${addr}"]}) {
    edges {
      node {
        id
      }
    }
  }
}
  `})
    .then(result => result?.data?.data?.transactions?.edges || [])
    .then(edges => edges.length > 0 ? true : Promise.reject(new Error('is not vouched!')))
}