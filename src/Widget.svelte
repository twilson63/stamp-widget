<script>
  import { getCount, stamp } from "./lib/stamps.js";

  export let contract;
  export let address;

  let cardVisible = false;
  function toggleCard() {
    cardVisible = !cardVisible;
  }

  async function doStamp() {
    stampCount = await stamp(contract, address).then(() => getCount(contract));
  }

  let stampCount = getCount(contract);
</script>

{#await stampCount then count}
  <div class="container" on:click={toggleCard}>
    <div id="heading1">stamps</div>
    <div id="count">{count}</div>
  </div>
  {#if cardVisible}
    <div class="card">
      <div class="card-title">Stamps</div>
      <div class="card-body">{count}</div>
      <div class="card-buttons">
        <button class="btn" on:click={doStamp}>STAMP</button>
        <button class="btn">LEARN MORE</button>
      </div>
    </div>
  {/if}
{/await}

<style>
  .card {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
      "Noto Color Emoji";
    height: 250px;
    width: 200px;
    background-color: rebeccapurple;
    color: white;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    margin-top: 8px;
    align-items: center;
  }
  .card-title {
    font-size: 2em;
    margin-top: 16px;
  }
  .card-body {
    font-size: 3em;
    margin-top: 16px;
    margin-bottom: 16px;
  }
  .card-buttons {
    display: flex;
    flex-direction: column;
  }
  .btn {
    display: inline-flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    background-color: black;
    color: white;
    border-radius: 8px;
    padding: 4px 12px;
    cursor: pointer;
    border-color: rebeccapurple;
    height: 32px;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    font-weight: 600;
  }
  .container {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
      "Noto Color Emoji";
    border: 2px solid;
    border-radius: 8px;
    display: flex;
    width: 200px;
    align-items: center;
    justify-items: center;
    height: 24px;
  }
  div #heading1 {
    margin: 0px;
    height: 100%;
    flex: 1 1 auto;
    background-color: rebeccapurple;
    color: white;
    text-align: center;
  }
  div #count {
    flex: 1 1 auto;
    text-align: center;
    font-weight: 700;
  }
</style>
