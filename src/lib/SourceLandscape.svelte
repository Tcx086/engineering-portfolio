<script lang="ts">
  const sources = [
    ['Macro calendar', 'Economic releases, expectations and scheduled events.'],
    ['Official releases', 'Central bank, government and regulatory information.'],
    ['Financial news', 'Stories and narratives with their source identity.'],
    ['Market data', 'Prices, volatility and broader market context.'],
    ['Crypto markets', 'Crypto prices and exchange-related market information.'],
    ['Geopolitical context', 'Regional developments that can affect markets.']
  ];
</script>
<div class="source-landscape" aria-label="Public source categories">
  {#each sources as [title, description], i}<article><span class="source-number" aria-hidden="true">0{i + 1}</span><h3>{title}</h3><p>{description}</p></article>{/each}
</div>
