import { createExtension } from '../mod.ts'

let VPN_LIST: string[] = []
let DATACENTER_LIST: string[] = []
let LAST_UPDATE = 0

type FirewallOptions = {
  blockVPN?: boolean
  blockDatacenter?: boolean
  customRanges?: string[]
}

export const firewall = createExtension<FirewallOptions>({
  async onRequest({ _: opts, app }) {
    await checkUpdate()
    if (
      opts?.blockVPN && VPN_LIST.find((range) => isIpInRange(app.ip, range))
    ) {
      return new Response(null, { status: 403 })
    }
    if (
      opts?.blockDatacenter &&
      DATACENTER_LIST.find((range) => isIpInRange(app.ip, range))
    ) return new Response(null, { status: 403 })
    if (
      opts?.customRanges &&
      opts.customRanges.find((range) => isIpInRange(app.ip, range))
    ) return new Response(null, { status: 403 })
  },
})

async function checkUpdate() {
  if (!(Date.now() - LAST_UPDATE > 9e5 /* 15 minutes */)) return
  VPN_LIST = (await (await fetch(
    'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/vpn/ipv4.txt',
  )).text()).split('\n')
  DATACENTER_LIST = (await (await fetch(
    'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/datacenter/ipv4.txt',
  )).text()).split('\n')
  LAST_UPDATE = Date.now()
}

function isIpInRange(ip: string, range: string) {
  const [rangeIp, rangeMask] = range.split('/')
  const rangeStart = ipToNumber(rangeIp) >>> 0
  const rangeEnd = rangeStart + ((1 << (32 - parseInt(rangeMask))) - 1)
  const numIp = ipToNumber(ip)
  return numIp >= rangeStart && numIp <= rangeEnd
}

function ipToNumber(ip: string) {
  return ip.split('.').reduce((acc, val) => (acc << 8) | parseInt(val), 0) >>> 0
}
