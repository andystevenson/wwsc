<script lang="ts">
	import type maplibregl from 'maplibre-gl';

	import { MapLibre, type LngLatLike } from 'svelte-maplibre';
	import { DefaultMarker } from 'svelte-maplibre';
	import { Popup } from 'svelte-maplibre';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let center: LngLatLike = [data.center[0], data.center[1]];
	let geo = data.geo;
	let markers = data.geo.map((g) => {
		let lngLat: LngLatLike = [g.longitude, g.latitude];
		return {
			lngLat,
			label: g.postcode,
			name: g.postcode
		};
	});

	let map: maplibregl.Map | undefined = $state();
	let loaded = $state(false);
	let flying = $derived.by(() => {
		if (map && loaded) {
			map?.flyTo({ center, zoom: 12 });
			return true;
		}
		return false;
	});
</script>

<MapLibre
	bind:map
	bind:loaded
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
	class={'map-wwsc'}
	standardControls
	zoom={1}
	{center}
>
	{#if flying}
		{#each markers as { lngLat, name }}
			<DefaultMarker {lngLat} class="marker">
				<Popup offset={[0, -10]}>
					<div class="marker">{name}</div>
				</Popup>
			</DefaultMarker>
		{/each}
	{/if}
</MapLibre>

<style>
	:global(.map-wwsc) {
		position: relative;
		inline-size: 100%;
		block-size: 100%;
		aspect-ratio: var(--ratio-golden, 16/9);
	}

	.marker {
		display: grid;
		place-content: center;
		background-color: var(--accent);
		border-radius: var(--radius-round);
		height: 3rem;
		width: 3rem;
		color: black;
		font-weight: bold;
		white-space: nowrap;
	}
</style>
