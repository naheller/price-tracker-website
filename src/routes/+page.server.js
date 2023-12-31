import { error, fail } from '@sveltejs/kit';

const { VITE_PRODUCTS_BASE_URL } = import.meta.env;

const getSortedProducts = (products) => {
	return products.sort((a, b) => {
		const dateA = new Date(a.dateCreated);
		const dateB = new Date(b.dateCreated);
		return dateB.getTime() - dateA.getTime();
	});
};

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ fetch }) => {
	try {
		const res = await fetch(VITE_PRODUCTS_BASE_URL);
		const resJson = await res.json();
		return { products: resJson?.products ? getSortedProducts(resJson.products) : [] };
	} catch (e) {
		error(500, { message: 'Could not load products' });
	}
};

/** @type {import('./$types').Actions} */
export const actions = {
	addProduct: async ({ request, fetch }) => {
		try {
			const formData = await request.formData();
			const productUrl = formData.get('productUrl');

			if (!productUrl) {
				return fail(400, { productUrl, missing: true });
			}

			await fetch(VITE_PRODUCTS_BASE_URL, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					url: productUrl
				})
			});

			return { success: true };
		} catch (e) {
			error(500, { message: 'Could not add product' });
		}
	},
	deleteProduct: async ({ request, fetch }) => {
		try {
			const formData = await request.formData();
			const productId = formData.get('productId');

			await fetch(`${VITE_PRODUCTS_BASE_URL}/${productId}`, {
				method: 'DELETE'
			});

			return { success: true };
		} catch (e) {
			error(500, { message: 'Could not delete product' });
		}
	}
};
