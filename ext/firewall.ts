import { createExtension } from '../mod.ts'

let vpnList: string[]
let datacenterList: string[]

type FirewallOptions = {
  blockVPN?: boolean
  blockDatacenter?: boolean
  customRanges?: string[]
}

export const firewall = createExtension<FirewallOptions>({
  async onPlugIn() {
    await update()
  },
  onRequest({ _: opts, app }) {
    if (opts?.blockVPN && vpnList.find((range) => isIpInRange(app.ip, range))) {
      return new Response(null, { status: 403 })
    }
    if (
      opts?.blockDatacenter &&
      datacenterList.find((range) => isIpInRange(app.ip, range))
    ) return new Response(null, { status: 403 })
    if (
      opts?.customRanges &&
      opts.customRanges.find((range) => isIpInRange(app.ip, range))
    ) return new Response(null, { status: 403 })
  },
})

async function update() {
  vpnList = (await (await fetch(
    'https://cdn.jsdelivr.net/gh/X4BNet/lists_vpn/output/vpn/ipv4.txt',
  )).text()).split('\n')
  datacenterList = (await (await fetch(
    'https://cdn.jsdelivr.net/gh/X4BNet/lists_vpn/output/datacenter/ipv4.txt',
  )).text()).split('\n')
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
