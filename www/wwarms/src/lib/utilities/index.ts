const intl = new Intl.NumberFormat('en-GB', { currency: 'GBP', style: 'currency' });
export function gbp(amount: number): string {
	return intl.format(amount);
}
