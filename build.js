import esbuild from 'esbuild'
import sveltePlugin from 'esbuild-svelte'

esbuild
  .build({
    entryPoints: ['src/main.js'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    bundle: true,
    outfile: 'example/widget.js',
    plugins: [sveltePlugin({ compilerOptions: { css: true } })],
    logLevel: 'info',
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    }
  })
  .then(() => console.log('watching...'))
  .catch(() => process.exit(1))