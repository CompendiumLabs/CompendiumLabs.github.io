// Compendium Labs logo icon: stylized planet with jagged parallelogram rings

// figure parameters
const aspect = 1.1456 // aspect ratio of the figure
const ringHeight = 0.045 // vertical extent of each ring
const ringGap = 0.015 // gap between rings
const ringAngle = 15 // degrees clockwise (long edges vs. horizontal)
const edgeAngle = 42 // degrees counterclockwise (short edges vs. vertical)

// per-ring horizontal extents: [x1, x2]
const rings = [
  [0.17, 0.85],
  [0.02, 0.95],
  [0.15, 0.84],
  [0.21, 0.98],
]

// inferred parameters

// ring component — x1/x2 are the x-coords of the left/right short-edge centers;
// yc is the y-coord of the ring midline at x=0.5, so ring spacing is invariant to x1/x2
const Ring = ({ x1, x2, yc, h, ...attr }) => {
  const dx = h * tan(edgeAngle * d2r)
  const dyPerDx = tan(ringAngle * d2r)
  const yL = yc + (x1 - 0.5) * dyPerDx
  const yR = yc + (x2 - 0.5) * dyPerDx
  const points = [
    [x1 - dx / 2, yL - h / 2],
    [x2 - dx / 2, yR - h / 2],
    [x2 + dx / 2, yR + h / 2],
    [x1 + dx / 2, yL + h / 2],
  ]
  return <Shape points={points} fill={black} stroke={none} {...attr} />
}

// compute ring centers evenly spaced around y=0.5
const offsets = linspace(-(rings.length - 1) / 2, (rings.length - 1) / 2, rings.length)
const ringCenters = offsets.map(i => 0.5 + i * (ringHeight + ringGap))

// render the figure
return <Group aspect={aspect}>
  <Circle pos={[0.5, 0.5]} size={0.52} fill={black} stroke={none} />
  {rings.map(([x1, x2], i) => <Ring x1={x1} x2={x2} yc={ringCenters[i]} h={ringHeight} />)}
</Group>
