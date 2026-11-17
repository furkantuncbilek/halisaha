import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg, getPlayerForm } from '../utils/storage'

const tipStyle = {
  background: '#0d1f14',
  border: '1px solid rgba(184,245,58,0.25)',
  borderRadius: 10,
  color: '#f0f4e8',
  fontSize: 12,
}

export default function Stats({ players, matches }) {
  const averages = players
    .map((p) => ({
      id: p.id,
      name: p.name.length > 10 ? `${p.name.slice(0, 9)}…` : p.name,
      fullName: p.name,
      avg: getPlayerAvg(p.id, matches),
    }))
    .filter((x) => x.avg != null)
    .sort((a, b) => b.avg - a.avg)

  const topPlayer = averages[0]
  const formSeries = topPlayer
    ? getPlayerForm(topPlayer.id, matches, 8).map((x) => ({
        name: x.match.length > 12 ? `${x.match.slice(0, 11)}…` : x.match,
        rating: x.rating,
      }))
    : []

  const teamAvg =
    averages.length > 0
      ? averages.reduce((s, x) => s + x.avg, 0) / averages.length
      : null

  if (matches.length === 0 || averages.length === 0) {
    return (
      <section className="panel">
        <div className="panel-head">
          <h2>Grafikler</h2>
        </div>
        <p className="muted">
          Maç maç reyting girince ortalama, form ve sıralama burada görünecek.
        </p>
      </section>
    )
  }

  return (
    <section className="panel stats-panel">
      <div className="panel-head">
        <h2>Grafikler</h2>
        <span className="chip">ort. {formatRating(teamAvg)}</span>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">Takım ort.</span>
          <strong style={{ color: ratingColor(teamAvg) }}>{formatRating(teamAvg)}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">En formda</span>
          <strong style={{ color: ratingColor(topPlayer?.avg) }}>
            {topPlayer?.fullName || '—'}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Maç sayısı</span>
          <strong>{matches.length}</strong>
        </div>
      </div>

      <div className="chart-block">
        <h3>Oyuncu ortalamaları</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={averages} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(240,244,232,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(240,244,232,0.55)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: 'rgba(240,244,232,0.45)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tipStyle}
                formatter={(v, _, item) => [Number(v).toFixed(2), item.payload.fullName]}
              />
              <Bar dataKey="avg" fill="#b8f53a" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {formSeries.length > 1 && (
        <div className="chart-block">
          <h3>{topPlayer.fullName} — form</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={formSeries} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(240,244,232,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(240,244,232,0.55)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: 'rgba(240,244,232,0.45)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tipStyle} formatter={(v) => [Number(v).toFixed(1), 'Reyting']} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#b8f53a"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#b8f53a', stroke: '#0d1f14', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="leaderboard">
        <h3>Sıralama</h3>
        <ol>
          {averages.map((p, i) => (
            <li key={p.id}>
              <span className="rank">#{i + 1}</span>
              <span className="lb-name">{p.fullName}</span>
              <span className="lb-avg" style={{ color: ratingColor(p.avg) }}>
                {formatRating(p.avg)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
