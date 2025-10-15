const IST = 'Asia/Kolkata';

export function todayInIST() {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date()); // YYYY-MM-DD
}
