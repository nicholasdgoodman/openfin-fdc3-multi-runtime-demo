export async function patchIab() {
    const anyIdentity = { uuid: '*' }
    const { defaultChannel } = fdc3;
    const systemChannels = await fdc3.getSystemChannels();
    const initialChannel = await fdc3.getCurrentChannel();

    for(let channel of [defaultChannel, ...systemChannels]) {
        const contextTopic = `openfin/fdc3/channel/${channel.id}/context`;
        const state = {};

        function receiveRemoteState(evt) {
            if(evt.rev > 0 && evt.rev >= state.rev) {
                acceptRemoteState(evt);
            } else if (evt.rev < state.rev) {
                updateRemoteState();
            }
        }

        function acceptRemoteState(evt) {
            trySaveState(evt);
            channel.broadcast(evt.ctx);
        }

        function updateRemoteState() {
            fin.InterApplicationBus.publish(contextTopic, state);
        }

        function applyContextChange(ctx) {
            trySaveState({ 
                ctx, 
                rev: Date.now()
            });
            updateRemoteState();
        }

        function trySaveState(evt) {
            if(state.joined) {
                Object.assign(state, evt);
            }
        }

        function join() {
            state.joined = true;
            updateRemoteState();
        }

        function resetState() {
            Object.assign(state, {
                ctx: undefined,
                rev: 0,
                joined: false
            });
        }

        async function updateMembership() {
            const hasMembers = (await channel.getMembers()).length > 0;

            if(hasMembers && !state.joined) {
                join();
            } else if(!hasMembers && state.joined) {
                resetState();
            }
        }

        fin.InterApplicationBus.subscribe(anyIdentity, contextTopic, receiveRemoteState);
        channel.addContextListener(applyContextChange);

        channel.addEventListener('window-added',   updateMembership);
        channel.addEventListener('window-removed', updateMembership);

        resetState();
        if(channel.id === initialChannel.id) {
            join();
        }
    }
}