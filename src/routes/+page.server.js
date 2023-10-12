import { error } from '@sveltejs/kit';

const { VITE_PRODUCTS_BASE_URL } = import.meta.env;

export const load = async () => {
	try {
		const res = await fetch(VITE_PRODUCTS_BASE_URL);
		const products = await res.json();
		return products;
	} catch (e) {
		throw error(e?.statusCode || 500, e?.message || e);
	}
};
