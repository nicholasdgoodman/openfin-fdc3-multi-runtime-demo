<script>
	let { fin } = window;
	let { fdc3 } = window;

	let context = '';
	let channel = fdc3.defaultChannel.id;

	let channels = [ ];

	let platform = fin.Platform.getCurrentSync();
	let platformApp = fin.Application.wrapSync(platform.identity);	

	fdc3.getSystemChannels().then(c => {
		channels = [ fdc3.defaultChannel, ...c ];
	});

	fdc3.addContextListener(ctx => {
		console.log('context event', ctx);
		context = ctx.data;
	});

	function setContext() {
		fdc3.broadcast({ type: 'openfin.test', data: context });
	}

	function setChannel() {
		console.log('set channel to', channel);
		context = '';
		channels.find(c => c.id === channel).join();
	}

	function reloadProvider() {
		platformApp.getWindow().then(win => win.reload());
	}

	function debugProvider() {
		platformApp.getWindow().then(win =>win.showDeveloperTools());
	}
</script>

<svelte:head>
	<title>Custom Title</title>
</svelte:head>

<main>
<h1>{fin && fin.desktop.getVersion()}</h1>
<small>
	<button on:click={reloadProvider}>Reload</button>
	<button on:click={debugProvider}>Debug</button>	
</small>
<h2>Context</h2>
<div>
	<label for="channel">Channel</label>
	<select name="channel" bind:value={channel} on:change={setChannel}>
		{#each channels as channel}
		<option value={channel.id}>{channel.id}</option>
		{/each}
	</select>
	<label for="context">Context</label>
	<input type="text" name="context" bind:value={context} />
	<button on:click={setContext}>Update</button>
</div>
</main>
