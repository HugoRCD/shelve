import { isIP } from 'node:net'
import type { H3Event } from 'h3'

/** Longest textual IP address (an IPv4-mapped IPv6 address written out in full), and the width of the IP columns. */
const MAX_IP_LENGTH = 45

function isValidIp(value: string | undefined): value is string {
  return !!value && value.length <= MAX_IP_LENGTH && isIP(value) !== 0
}

/**
 * The client IP for rate limits, audit logs and token allowlists. A forwarded value that isn't
 * an IP address is ignored in favour of the connection's own address.
 */
export function getClientIp(event: H3Event): string | null {
  const forwarded = getRequestIP(event, { xForwardedFor: true })
  if (isValidIp(forwarded)) return forwarded
  const direct = getRequestIP(event)
  return isValidIp(direct) ? direct : null
}

function parseIpv4(ip: string): number[] | null {
  const parts = ip.split('.')
  if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null
  const [a, b, c, d] = parts.map(Number) as [number, number, number, number]
  return [(a << 8) | b, (c << 8) | d]
}

function parseIpv6(ip: string): number[] | null {
  if (isIP(ip) !== 6 || ip.includes('%')) return null

  // Rewrite a trailing dotted IPv4 part (`::ffff:192.0.2.1`) as two hex groups.
  let text = ip
  if (text.includes('.')) {
    const lastColon = text.lastIndexOf(':')
    const ipv4 = parseIpv4(text.slice(lastColon + 1))
    if (!ipv4) return null
    text = `${text.slice(0, lastColon + 1)}${ipv4[0]!.toString(16)}:${ipv4[1]!.toString(16)}`
  }

  const [left, right, extra] = text.split('::')
  if (extra !== undefined) return null
  const head = left ? left.split(':') : []
  const tail = right ? right.split(':') : []
  const missing = 8 - head.length - tail.length
  if (right === undefined ? missing !== 0 : missing < 1) return null

  const groups = [...head, ...Array<string>(right === undefined ? 0 : missing).fill('0'), ...tail]
  if (groups.some(group => !/^[0-9a-f]{1,4}$/i.test(group))) return null
  return groups.map(group => Number.parseInt(group, 16))
}

/** An address as 16-bit groups: 2 for IPv4, 8 for IPv6. IPv4-mapped IPv6 addresses (`::ffff:a.b.c.d`) read as IPv4. */
function parseIp(ip: string): number[] | null {
  const ipv4 = parseIpv4(ip)
  if (ipv4) return ipv4
  const ipv6 = parseIpv6(ip)
  if (!ipv6) return null
  // A dual-stack server reports IPv4 clients this way.
  if (ipv6.slice(0, 5).every(group => group === 0) && ipv6[5] === 0xffff) return ipv6.slice(6)
  return ipv6
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, prefixRaw, extra] = cidr.split('/')
  if (!range || !prefixRaw || extra !== undefined || !/^\d{1,3}$/.test(prefixRaw)) return false

  const address = parseIp(ip)
  const network = parseIp(range)
  if (!address || !network || address.length !== network.length) return false

  let prefix = Number(prefixRaw)
  // A range written as an IPv4-mapped IPv6 address counts its prefix in IPv6 bits.
  if (network.length === 2 && range.includes(':')) prefix -= 96
  if (prefix < 0 || prefix > network.length * 16) return false

  for (let i = 0; i < network.length && prefix > 0; i++, prefix -= 16) {
    const mask = (0xffff << (16 - Math.min(prefix, 16))) & 0xffff
    if ((address[i]! & mask) !== (network[i]! & mask)) return false
  }
  return true
}
