<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	let addingProduct = false;
	let deletingProduct = false;
	let productIdToDelete = '';

	const getPriceColor = (productUpdatedAt) => {
		const twoDays = 2 * 24 * 60 * 60 * 1000;
		const now = new Date().getTime();
		if (!productUpdatedAt) return 'black';
		const updatedAtDate = new Date(productUpdatedAt).getTime();
		return now - updatedAtDate < twoDays ? 'red' : 'black';
	};

	const getSortedProducts = (products) => {
		return products.sort((a, b) => {
			const dateA = new Date(a.dateCreated);
			const dateB = new Date(b.dateCreated);
			return dateB.getTime() - dateA.getTime();
		});
	};
</script>

<h1>Price Tracker</h1>

{#if $page?.error?.message}
	<p>Error: {$page?.error?.message}</p>
{/if}

<form
	method="POST"
	action="?/addProduct"
	use:enhance={() => {
		addingProduct = true;
		if (form) {
			form.urlMissing = false;
		}
		return async ({ update }) => {
			addingProduct = false;
			update();
		};
	}}
>
	<label for="productUrl">URL</label>
	<input id="productUrl" name="productUrl" type="url" />
	<button type="submit" disabled={addingProduct}>
		{#if addingProduct}
			Adding...
		{:else}
			Add product
		{/if}
	</button>
	{#if form?.urlMissing}
		<span>Enter a URL</span>
	{/if}
</form>

<form
	method="POST"
	action="?/deleteProduct"
	use:enhance={({ formData }) => {
		deletingProduct = true;
		formData.append('productId', productIdToDelete);
		return async ({ update }) => {
			deletingProduct = false;
			update();
		};
	}}
>
	<table style="text-align:left; margin-top:1rem;">
		<tr>
			<th>Date Added</th>
			<th>Title</th>
			<th>Price</th>
			<th />
		</tr>
		{#each data.products as product}
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
							productIdToDelete = product.productId;
						}}
						disabled={deletingProduct}
					>
						{#if deletingProduct}
							Deleting...
						{:else}
							Delete
						{/if}
					</button>
				</td>
			</tr>
		{/each}
	</table>
</form>
