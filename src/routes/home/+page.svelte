<script>
	import { onMount } from 'svelte';

	const { VITE_PRODUCTS_BASE_URL } = import.meta.env;
	let products = [];
	let productUrl = '';
	let loading = null;

	const getSortedProducts = (products) => {
		return products.sort((a, b) => {
			const dateA = new Date(a.dateCreated);
			const dateB = new Date(b.dateCreated);
			return dateB.getTime() - dateA.getTime();
		});
	};

	const loadProducts = async () => {
		loading = 'GET';
		try {
			const res = await fetch(VITE_PRODUCTS_BASE_URL);
			const resJson = await res.json();
			if (resJson.products.length) {
				products = getSortedProducts(resJson.products);
			}
		} catch (e) {
			throw error(e?.statusCode || 500, e?.message || e);
		} finally {
			loading = null;
		}
	};

	const addProduct = async () => {
		loading = 'POST';
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
			productUrl = '';
		} catch (e) {
			throw error(e?.statusCode || 500, e?.message || e);
		} finally {
			loading = null;
		}
		await loadProducts();
	};

	const deleteProduct = async (productId) => {
		loading = 'DELETE';
		try {
			await fetch(`${VITE_PRODUCTS_BASE_URL}/${productId}`, {
				method: 'DELETE'
			});
		} catch (e) {
			throw error(e?.statusCode || 500, e?.message || e);
		} finally {
			loading = null;
		}
		await loadProducts();
	};

	onMount(async () => {
		await loadProducts();
	});

	const twoDays = 2 * 24 * 60 * 60 * 1000;
	const now = new Date().getTime();

	const getPriceColor = (productUpdatedAt) => {
		if (!productUpdatedAt) return 'black';
		const updatedAtDate = new Date(productUpdatedAt).getTime();
		return now - updatedAtDate < twoDays ? 'red' : 'black';
	};
</script>

<h1>Price Tracker</h1>

<div>
	<label>
		URL
		<input type="text" bind:value={productUrl} />
	</label>
	<button on:click={addProduct}>Add</button>
	{#if loading === 'GET'}
		<span>loading products...</span>
	{:else if loading === 'POST'}
		<span>adding product...</span>
	{:else if loading === 'DELETE'}
		<span>deleting product...</span>
	{/if}
</div>

<table style="text-align:left; margin-top:1rem;">
	<tr>
		<th>Date Added</th>
		<th>Title</th>
		<th>Price</th>
		<th />
	</tr>
	{#each products as product}
		<tr>
			<td>{new Date(product.dateCreated).toLocaleDateString()}</td>
			<td>
				<a href={`https://www.amazon.com/dp/${product.productId}`} target="_blank">
					{product.title.length < 50 ? product.title : `${product.title.substring(0, 50)}...`}
				</a>
			</td>
			<td style={`color:${getPriceColor(product.dateUpdated)};`}>
				{parseFloat(product.priceCurrent).toFixed(2)}
			</td>
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
