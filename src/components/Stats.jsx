import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg, getPlayerForm, getTeamAvg } from '../utils/storage'

const tipStyle = {
  background: '#0d1f14',
  border: '1px solid rgba(184,245,58,0.25)',
  borderRadius: 10,
  color: '#f0f4e8',
  fontSize: 12,
}

const HOME_COLOR = '#b8f53a'
const AWAY_COLOR = '#5ec8ff'

function teamAverages(players, matches) {
  return players
    .map((p) => ({
      id: p.id,
      name: p.name.length > 10 ? `${p.name.slice(0, 9)}…` : p.name,
      fullName: p.name,
      avg: getPlayerAvg(p.id, matches),
    }))
    .filter((x) => x.avg != null)
    .sort((a, b) => b.avg - a.avg)
}

export default function Stats({ home, away, matches }) {
  const homeAvg = teamAverages(home.players, matches)
  const awayAvg = teamAverages(away.players, matches)
  const homeTeam = getTeamAvg(home.players, matches)
  const awayTeam = getTeamAvg(away.players, matches)

  const combined = [
    ...homeAvg.map((p) => ({ ...p, team: home.name, fill: HOME_COLOR })),
    ...awayAvg.map((p) => ({ ...p, team: away.name, fill: AWAY_COLOR })),
  ].sort((a, b) => b.avg - a.avg)

  const topPlayer = combined[0]
  const formSeries = topPlayer
    ? getPlayerForm(topPlayer.id, matches, 8).map((x) => ({
        name: x.match.length > 12 ? `${x.match.slice(0, 11)}…` : x.match,
        rating: x.rating,
      }))
    : []

  const compareData = [
    { name: home.name, ort: homeTeam != null ? Number(homeTeam.toFixed(2)) : 0, fill: HOME_COLOR },
    { name: away.name, ort: awayTeam != null ? Number(awayTeam.toFixed(2)) : 0, fill: AWAY_COLOR },
  ]

  if (matches.length === 0 || combined.length === 0) {
    return (
      <section className="panel">
        <div className="panel-head">
          <h2>Grafikler</h2>
        </div>
        <p className="muted">
          Her iki takıma maç maç reyting girince karşılaştırma ve form burada çıkar.
        </p>
      </section>
    )
  }

  return (
    <section className="panel stats-panel">
      <div className="panel-head">
        <h2>Grafikler</h2>
        <span className="chip">{matches.length} maç</span>
      </div>

      <div className="stat-cards">
        <div className="stat-card stat-card--home">
          <span className="stat-label">{home.name}</span>
          <strong style={{ color: ratingColor(homeTeam) }}>{formatRating(homeTeam)}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">En formda</span>
          <strong style={{ color: ratingColor(topPlayer?.avg) }}>
            {topPlayer?.fullName || '—'}
          </strong>
        </div>
        <div className="stat-card stat-card--away">
          <span className="stat-label">{away.name}</span>
          <strong style={{ color: ratingColor(awayTeam) }}>{formatRating(awayTeam)}</strong>
        </div>
      </div>

      <div className="chart-block">
        <h3>Takım ortalaması</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={compareData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
              <Tooltip contentStyle={tipStyle} formatter={(v) => [Number(v).toFixed(2), 'Ort.']} />
              <Bar dataKey="ort" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {compareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h3>Oyuncu ortalamaları</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={combined} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(240,244,232,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(240,244,232,0.55)', fontSize: 10 }}
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
                formatter={(v, _, item) => [
                  Number(v).toFixed(2),
                  `${item.payload.fullName} (${item.payload.team})`,
                ]}
              />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {combined.map((entry) => (
                  <Cell key={entry.id} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="chart-legend">
          <span className="legend-home">{home.name}</span>
          <span className="legend-away">{away.name}</span>
        </p>
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
                  stroke={topPlayer.fill}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: topPlayer.fill, stroke: '#0d1f14', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="leaderboard">
        <h3>Genel sıralama</h3>
        <ol>
          {combined.map((p, i) => (
            <li key={p.id}>
              <span className="rank">#{i + 1}</span>
              <span className="lb-name">
                {p.fullName}
                <small className={p.fill === HOME_COLOR ? 'tag-home' : 'tag-away'}> {p.team}</small>
              </span>
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
