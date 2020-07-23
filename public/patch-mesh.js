export async function patchMesh() {
    // Multi-Runtime Mesh

    const anyIdentity = { uuid: '*' };
    const discoveryTopic = 'fdc3-service-mesh/channel-discovery';
    const providerName = `fdc3-service-mesh/${fin.desktop.getVersion()}`;

    const meshProvider = await fin.InterApplicationBus.Channel.create(providerName);

    const meshClients = { };

    fin.InterApplicationBus.subscribe(anyIdentity, discoveryTopic, async(clientName) => {
        if(clientName !== providerName && !meshClients[clientName]) {
            let meshClient = await fin.InterApplicationBus.Channel.connect(clientName);
            meshClients[clientName] = meshClient;
            registerFdc3Topics(meshClient);
            fin.InterApplicationBus.publish(discoveryTopic, providerName);
        }
    });

    fin.InterApplicationBus.publish(discoveryTopic, providerName);

    // FDC3 Implementations

    // TODO...
}