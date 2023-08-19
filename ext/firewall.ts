import { createExtension } from "../mod.ts";

let vpnList: string[];
let datacenterList: string[];
let customList: string[];

type FirewallOptions = {
  blockVPN?: boolean;
  blockDatacenter?: boolean;
  customRange?: string[];
  /** a list of urls that return a list of ip ranges to block in plaintext separated by newlines */
  customLists?: string[];
}

export const firewall = createExtension<FirewallOptions>({
  async onPlugIn({settings: opts}) {
    await update(opts);
    // setInterval(() => {update(opts)}, 300000);
  },
  onRequest({_: opts, app}) {
    if (opts?.blockVPN && vpnList.find((range) => isIpInRange(app.ip, range))) return new Response(null, {status: 403});
    if (opts?.blockDatacenter && datacenterList.find((range) => isIpInRange(app.ip, range))) return new Response(null, {status: 403});
    if (opts?.customRange && opts.customRange.find((range) => isIpInRange(app.ip, range))) return new Response(null, {status: 403});
    if (customList.find((range) => isIpInRange(app.ip, range))) return new Response(null, {status: 403});
  }
})

async function update(args?: FirewallOptions) {
  vpnList = (await (await fetch("https://cdn.jsdelivr.net/gh/X4BNet/lists_vpn/output/vpn/ipv4.txt")).text()).split('\n');
  datacenterList = (await (await fetch("https://cdn.jsdelivr.net/gh/X4BNet/lists_vpn/output/datacenter/ipv4.txt")).text()).split('\n');
  if (args?.customLists) customList = (await Promise.all(args.customLists.map((url) => fetch(url).then((res) => res.text())))).join('\n').split('\n');
}

function isIpInRange(ip: string, range: string) {
  const [rangeIp, rangeMask] = range.split("/");
  const rangeStart = ipToNumber(rangeIp) >>> 0;
  const rangeEnd = rangeStart + ((1 << (32 - parseInt(rangeMask))) - 1);
  const numIp = ipToNumber(ip);
  return numIp >= rangeStart && numIp <= rangeEnd;
}

function ipToNumber(ip: string) {
  return ip.split(".").reduce((acc, val) => (acc << 8) | parseInt(val), 0) >>> 0;
}