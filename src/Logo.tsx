import { Gum, GUM } from 'react-gum-jsx'
import { tan, d2r, range, white, black, none, type ThemeName } from 'gum-jsx'

const { Box, Group, Rect, Circle, Shape } = GUM

const innerAspect = 1.1456
const planetSize = 0.52
const ringHeight = 0.0225
const ringGap = 0.025
const ringAngle = 15
const edgeAngle = 38
const chunkPos: [number, number] = [0.62, 0.28]
const chunkSize = 0.08

const rings: [number, number][] = [
  [0.17, 0.85],
  [0.02, 0.95],
  [0.15, 0.84],
  [0.21, 0.98],
]

type RingProps = { x1: number; x2: number; yc: number; h: number; fill: string }

function Ring({ x1, x2, yc, h, fill }: RingProps) {
  const tanE = tan(edgeAngle * d2r)
  const dyPerDx = tan(ringAngle * d2r)
  const hI = h / (1 - tanE * dyPerDx)
  const dx = hI * tanE
  const yL = yc + (x1 - 0.5) * dyPerDx
  const yR = yc + (x2 - 0.5) * dyPerDx
  const points: [number, number][] = [
    [x1 - dx / 2, yL - hI / 2],
    [x2 - dx / 2, yR - hI / 2],
    [x2 + dx / 2, yR + hI / 2],
    [x1 + dx / 2, yL + hI / 2],
  ]
  return <Shape points={points} fill={fill} stroke={none} />
}

function Mask({ h }: { h: number }) {
  return (
    <Group>
      <Rect fill={white} stroke={none} />
      <Ring x1={-0.1} x2={1.1} yc={0.5} h={h} fill={black} />
      <Circle pos={chunkPos} size={chunkSize} fill={black} stroke={none} />
    </Group>
  )
}

const offsets = range(rings.length).map((i: number) => i - (rings.length - 1) / 2)
const ringCenters = offsets.map((i: number) => 0.5 + i * (ringHeight + ringGap))
const maskHeight = rings.length * ringHeight + (rings.length + 1) * ringGap

type LogoProps = {
  size?: number | [number, number]
  theme?: ThemeName
  aspect?: number
  className?: string
}

export default function Logo({ theme = 'dark', aspect = 1 }: LogoProps) {
  const fill = theme === 'dark' ? white : black
  const background = theme === 'dark' ? '#1f1f1f' : white
  return <Box fill={background} aspect={aspect}>
    <Group aspect={innerAspect}>
      <Group mask={<Mask h={maskHeight} />}>
        <Circle size={planetSize} fill={fill} stroke={none} />
      </Group>
      {rings.map(([x1, x2], i) => (
        <Ring key={i} x1={x1} x2={x2} yc={ringCenters[i]} h={ringHeight} fill={fill} />
      ))}
    </Group>
  </Box>
}
