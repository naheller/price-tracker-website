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
	let productIdHovering = '';

	let searchTerm = '';
	let displayMode = 'grid';

	let filteredProducts = data.products;

	$: searchTerm,
		(filteredProducts = data.products.filter((product) => {
			if (!!searchTerm) {
				return product.title.toLowerCase().includes(searchTerm);
			}
			return product;
		}));

	const getPriceColor = (productUpdatedAt) => {
		const twoDays = 2 * 24 * 60 * 60 * 1000;
		const now = new Date().getTime();
		if (!productUpdatedAt) return 'black';
		const updatedAtDate = new Date(productUpdatedAt).getTime();
		return now - updatedAtDate < twoDays ? 'red' : 'black';
	};
</script>

<div style="max-width: 800px; margin: auto;">
	<div style="display: flex; justify-content: space-between; align-items: center;">
		<h1>Price Tracker</h1>
		<div>
			<button
				style="height: 2rem;"
				on:click={() => {
					displayMode = 'grid';
				}}
			>
				Grid
			</button>
			<button
				style="height: 2rem;"
				on:click={() => {
					displayMode = 'table';
				}}
			>
				Table
			</button>
		</div>
	</div>

	<form
		method="POST"
		action="?/addProduct"
		use:enhance={() => {
			addingProduct = true;
			return async ({ update }) => {
				addingProduct = false;
				update();
			};
		}}
	>
		<div style="display: flex; gap: 0.25rem; width: 100%;">
			<input
				id="productUrl"
				name="productUrl"
				type="url"
				placeholder="Product URL"
				style="flex: 1; line-height: 1.25rem;"
			/>
			<button type="submit" disabled={addingProduct}>
				{#if addingProduct}
					Adding...
				{:else}
					Add
				{/if}
			</button>
		</div>
	</form>

	<div style="display: flex; gap: 0.25rem; width: 100%; margin-top: 0.5rem;">
		<input
			id="searchTerm"
			bind:value={searchTerm}
			style="flex: 1; line-height: 1.25rem;"
			placeholder="Search term"
		/>
	</div>

	{#if form?.missing}
		<p style="color: red;">Product URL is required</p>
	{/if}

	{#if $page?.error?.message}
		<p style="color: red;">Error: {$page.error.message}</p>
	{/if}

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
		<p
			style="margin-bottom: 0; text-align: right; font-size: small; font-style: italic; color: gray;"
		>
			{`Showing ${filteredProducts.length} products`}
		</p>
		{#if displayMode === 'table'}
			<table style="width: 100%; text-align: left;">
				<tr>
					<!-- <th>Date Added</th> -->
					<th>Price</th>
					<th>Title</th>
					<th />
				</tr>
				{#each filteredProducts as product}
					<tr>
						<!-- <td>{new Date(product.dateCreated).toLocaleDateString()}</td> -->
						<td style={`color:${getPriceColor(product.dateUpdated)};`}>
							{parseFloat(product.priceCurrent).toFixed(2)}
						</td>
						<td>
							<a href={`https://www.amazon.com/dp/${product.productId}`} target="_blank">
								{product.title}
							</a>
						</td>
						<td>
							<button
								on:click={() => {
									productIdToDelete = product.productId;
								}}
								disabled={deletingProduct && productIdToDelete === product.productId}
							>
								{#if deletingProduct && productIdToDelete === product.productId}
									Deleting...
								{:else}
									Delete
								{/if}
							</button>
						</td>
					</tr>
				{/each}
			</table>
		{:else}
			<div class="product-grid">
				{#each filteredProducts as product}
					<div
						style="max-width: 200px; display: flex; flex-direction: column; justify-content: space-between;"
					>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							on:mouseenter={() => {
								productIdHovering = product.productId;
							}}
							on:mouseleave={() => {
								productIdHovering = '';
							}}
							style="position: relative;"
						>
							<img
								src={product.imageUrl}
								alt={product.title}
								style="width: 100%; display: block; border: 1px solid gray;"
							/>
							{#if productIdHovering === product.productId}
								<a href={`https://www.amazon.com/dp/${product.productId}`} target="_blank">
									<div
										style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; color: white; background: rgba(0, 0, 0, 0.5); padding: 0.75rem;"
									>
										<b>
											{product.title.length < 100
												? product.title
												: `${product.title.substring(0, 100)}...`}
										</b>
									</div>
								</a>
							{/if}
						</div>
						<div
							style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;"
						>
							<b style={`color:${getPriceColor(product.dateUpdated)};`}>
								${parseFloat(product.priceCurrent).toFixed(2)}
							</b>
							<button
								on:click={() => {
									productIdToDelete = product.productId;
								}}
								disabled={deletingProduct && productIdToDelete === product.productId}
							>
								{#if deletingProduct && productIdToDelete === product.productId}
									Deleting...
								{:else}
									Delete
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</form>
</div>

<style>
	* {
		font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue,
			helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif;
	}

	h1 {
		font-family: Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid Serif, Times,
			Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
	}

	.product-grid {
		margin-top: 0.5rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (min-width: 480px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 640px) {
		.product-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 1280px) {
		.product-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}
</style>
