const number = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
export function formatRand(value) {
  return `R${number.format(Number(value)).replace(/[\s\u00a0\u202f]/g, ',')}`;
}
export function toCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Invalid price.');
  return Math.round(amount * 100);
}
