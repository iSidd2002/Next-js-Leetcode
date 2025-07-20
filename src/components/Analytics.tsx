import type { Problem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import { format, subDays } from 'date-fns';
import ClientOnly from './client-only';

interface AnalyticsProps {
  problems: Problem[];
}

const Analytics = ({ problems }: AnalyticsProps) => {
  const { theme } = useTheme();

  const leetcodeProblems = problems.filter((p) => p.platform === 'leetcode');
  const codeforcesProblems = problems.filter((p) => p.platform === 'codeforces');

  const difficultyData = [
    { name: 'Easy', value: leetcodeProblems.filter((p) => p.difficulty === 'Easy').length, color: 'hsl(var(--success))' },
    { name: 'Medium', value: leetcodeProblems.filter((p) => p.difficulty === 'Medium').length, color: 'hsl(var(--warning))' },
    { name: 'Hard', value: leetcodeProblems.filter((p) => p.difficulty === 'Hard').length, color: 'hsl(var(--destructive))' },
  ];

  const platformData = [
    { name: 'LeetCode', value: leetcodeProblems.length, color: 'hsl(var(--primary))' },
    { name: 'Codeforces', value: codeforcesProblems.length, color: 'hsl(var(--secondary))' },
  ];

  const getCodeforcesDifficulty = (rating: number) => {
    if (rating < 1200) return { name: 'Newbie', color: '#808080' }; // Grey
    if (rating < 1400) return { name: 'Pupil', color: '#008000' }; // Green
    if (rating < 1600) return { name: 'Specialist', color: '#00FFFF' }; // Cyan
    if (rating < 1900) return { name: 'Expert', color: '#0000FF' }; // Blue
    if (rating < 2100) return { name: 'Candidate Master', color: '#FF00FF' }; // Magenta
    return { name: 'Master+', color: '#FF0000' }; // Red
  };

  const codeforcesDifficultyData = Object.values(
    codeforcesProblems.reduce((acc, p) => {
      const rating = parseInt(p.difficulty, 10);
      if (isNaN(rating)) return acc;

      const group = getCodeforcesDifficulty(rating);
      if (!acc[group.name]) {
        acc[group.name] = { name: group.name, value: 0, color: group.color };
      }
      acc[group.name].value += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>)
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
  const submissionData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'MMM d'),
      count: problems.filter(p => format(new Date(p.dateSolved), 'yyyy-MM-dd') === dateStr).length,
    }
  });

  const topicsData = Object.entries(
    problems.reduce((acc, p) => {
      if (p.topics && Array.isArray(p.topics)) {
        p.topics.forEach(topic => {
          acc[topic] = (acc[topic] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));


  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>LeetCode Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{leetcodeProblems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Codeforces Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{codeforcesProblems.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Problems by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" stroke={theme === 'dark' ? '#fff' : '#000'} />
                  <YAxis type="category" dataKey="name" stroke={theme === 'dark' ? '#fff' : '#000'} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submissions in the Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#fff' : '#000'} />
                  <YAxis allowDecimals={false} stroke={theme === 'dark' ? '#fff' : '#000'}/>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LeetCode Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Codeforces Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={codeforcesDifficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {codeforcesDifficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
      </div>

      {problems.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-500">Start adding problems to see your analytics!</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
