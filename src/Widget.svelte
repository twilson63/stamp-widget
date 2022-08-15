<script>
  import { getCount } from "./lib/stamps.js";
</script>

<h1>Stamp Count</h1>
{#await getCount("BA91BsbcwCQi2ZaL1p8TojAny-lfHYAbR3mRSIxYfjE") then count}
  <div>{count}</div>
{/await}

<style>
  h1 {
    color: green;
    background-color: lightyellow;
  }
  div {
    font-size: 6em;
  }
</style>
