import Widget from './Widget.svelte'

try {
  const el = document.getElementById('stamp-widget')
  const address = document.querySelector('meta[name="hypar-author"]').content
  const code = document.querySelector('meta[name="hypar-asset-code"]').content
  const dataset = Object.assign({}, el.dataset, { address, code })

  // get contract
  if (!dataset.contract) {
    // get contract by address and code via stamp lib
  }

  new Widget({
    target: el,
    props: dataset
  })
} catch (e) {
  console.log('Could not initialize widget')
  console.log(e.message)
}