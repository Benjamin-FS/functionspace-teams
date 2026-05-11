export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (seconds < 45) return 'moments ago';
  const minutes = seconds / 60;
  if (minutes < 1.5) return 'a minute ago';
  if (minutes < 60) return `${Math.round(minutes)} min ago`;
  const hours = minutes / 60;
  if (hours < 1.5) return 'an hour ago';
  if (hours < 24) return `${Math.round(hours)} hours ago`;
  const days = hours / 24;
  if (days < 1.5) return 'yesterday';
  if (days < 30) return `${Math.round(days)} days ago`;
  const months = days / 30;
  if (months < 1.5) return 'a month ago';
  if (months < 12) return `${Math.round(months)} months ago`;
  const years = months / 12;
  return years < 1.5 ? 'a year ago' : `${Math.round(years)} years ago`;
}
