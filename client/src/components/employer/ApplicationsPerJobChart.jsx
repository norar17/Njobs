import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-300/60 bg-paper-100 px-3 py-2 text-xs shadow-card-hover dark:border-dark-600 dark:bg-dark-800">
      <p className="font-medium text-ink dark:text-paper-100">{label}</p>
      <p className="text-brand-500">{payload[0].value} applicant{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const ApplicationsPerJobChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-ink-400 dark:text-ink-300">
        No applicants yet — this chart fills in once people start applying.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} className="dark:opacity-20" />
        <XAxis
          dataKey="job"
          tick={{ fill: '#8A8D99', fontSize: 11 }}
          axisLine={{ stroke: '#E8E6E0' }}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fill: '#8A8D99', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,118,110,0.08)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((_, i) => (
            <Cell key={i} fill="#0F766E" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ApplicationsPerJobChart;
