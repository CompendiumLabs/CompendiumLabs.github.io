// Compendium Labs logo icon: stylized planet with jagged parallelogram rings

// figure parameters
const aspect = 1.1456 // aspect ratio of the figure
const ringHeight = 0.0225 // vertical extent of each ring
const ringGap = 0.025 // gap between rings
const ringAngle = 15 // degrees clockwise (long edges vs. horizontal)
const edgeAngle = 38 // degrees counterclockwise (short edges vs. vertical)
const chunkPos = [0.62, 0.28] // position of the top-right chunk of the planet
const chunkSize = 0.08 // size of the top-right chunk of the planet

// get fill color from theme
const fill = theme === 'dark' ? white : black
const background = theme === 'dark' ? '#1F1F1F' : none

// per-ring horizontal extents: [x1, x2]
const rings = [
  [0.17, 0.85],
  [0.02, 0.95],
  [0.15, 0.84],
  [0.21, 0.98],
]

// ring component — x1/x2 are the x-coords of the left/right short-edge centers;
// yc is the y-coord of the ring midline at x=0.5; h is the visual vertical
const Ring = ({ x1, x2, yc, h, fill }) => {
  const tanE = tan(edgeAngle * d2r)
  const dyPerDx = tan(ringAngle * d2r)
  const hI = h / (1 - tanE * dyPerDx)
  const dx = hI * tanE
  const yL = yc + (x1 - 0.5) * dyPerDx
  const yR = yc + (x2 - 0.5) * dyPerDx
  const points = [
    [x1 - dx / 2, yL - hI / 2],
    [x2 - dx / 2, yR - hI / 2],
    [x2 + dx / 2, yR + hI / 2],
    [x1 + dx / 2, yL + hI / 2],
  ]
  return <Shape points={points} fill={fill} stroke={none} />
}

// make a mask for the rings (plus a bite out of the planet's top-right)
const Mask = ({ h }) => {
  return <Group>
    <Rect fill={white} stroke={none} />
    <Ring x1={-0.1} x2={1.1} yc={0.5} h={h} fill={black} />
    <Circle pos={chunkPos} size={chunkSize} fill={black} stroke={none} />
  </Group>
}

// compute ring centers evenly spaced around y=0.5
const offsets = range(rings.length).map(i => i - (rings.length - 1) / 2)
const ringCenters = offsets.map(i => 0.5 + i * (ringHeight + ringGap))
const maskHeight = rings.length * ringHeight + (rings.length + 1) * ringGap

// render the figure
return <Box aspect rounded={0.2} fill={background}>
  <Group aspect={aspect}>
    <Group mask={<Mask h={maskHeight} />}>
      <Circle pos={[0.5, 0.5]} size={0.52} fill={fill} stroke={none} />
    </Group>
    {rings.map(([x1, x2], i) => <Ring x1={x1} x2={x2} yc={ringCenters[i]} h={ringHeight} fill={fill} />)}
  </Group>
</Box>