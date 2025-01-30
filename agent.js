const openai = require('@livekit/agents-plugin-openai');
const { cli, WorkerOptions } = require('@livekit/agents');

const validateLocationParam = (location) => {
  if (typeof location !== 'string' || location.trim() === '') {
    throw new Error('Location must be a non-empty string');
  }
  return location;
};

const agentEntry = async (ctx) => {
  await ctx.connect();
  console.log('waiting for participant');
  const participant = await ctx.waitForParticipant();
  console.log(`starting assistant example agent for ${participant.identity}`);

  const model = new openai.realtime.RealtimeModel({
    instructions: 'You are a helpful assistant.',
  });

  const agent = new openai.multimodal.MultimodalAgent({ model, });

  agent.on('agent_started_speaking', () => {
   console.log('Agent started speaking.');
  });
  agent.on('agent_stopped_speaking', () => {
   console.log('agent stopped speaking')
  })

  const session = await agent
    .start(ctx.room, participant)
    .then(session => {
      console.log(session);
    })
  

  session.conversation.item.create({
    role: 'assistant',
    text: 'How can I help you today?'
  });

  session.response.create();
};

const workerOptions = new WorkerOptions({ 
  agent: __filename,
});
cli.runApp(workerOptions);

module.exports = agentEntry