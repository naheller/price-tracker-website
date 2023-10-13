<script>
	import { invalidateAll } from '$app/navigation';
	export let data;

	const { VITE_PRODUCTS_BASE_URL } = import.meta.env;
	let sortedProducts = [];
	let productUrl = '';

	if (data?.products?.length) {
		sortedProducts = data.products.sort((a, b) => {
			const dateA = new Date(a.createdAt);
			const dateB = new Date(b.createdAt);
			return dateB.getTime() - dateA.getTime();
		});
	}

	const addProduct = async () => {
		try {
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
			invalidateAll();
		} catch (e) {
			throw error(e?.statusCode || 500, e?.message || e);
		}
	};

	const deleteProduct = async (productId) => {
		try {
			await fetch(`${VITE_PRODUCTS_BASE_URL}/${productId}`, {
				method: 'DELETE'
			});
			invalidateAll();
		} catch (e) {
			throw error(e?.statusCode || 500, e?.message || e);
		}
	};
</script>

<h1>Price Tracker</h1>

<div>
	<label>
		URL
		<input type="text" bind:value={productUrl} />
	</label>
	<button on:click={addProduct}>Add</button>
</div>

<table style="text-align:left; margin-top:1rem;">
	<tr>
		<th>Date Added</th>
		<th>Title</th>
		<th>Price</th>
		<th />
	</tr>
	{#each sortedProducts as product}
		<tr>
			<td>{new Date(product.createdAt).toLocaleDateString()}</td>
			<td>{product.title}</td>
			<td>{parseFloat(product.priceCurrent).toFixed(2)}</td>
			<td>
				<button
					on:click={() => {
						deleteProduct(product.productId);
					}}
				>
					Delete
				</button>
			</td>
		</tr>
	{/each}
</table>
