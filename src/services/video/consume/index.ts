import voteConsume from "./vote-consume";

const videoServiceConsume = async () => {
  const voteConsumer = voteConsume();
  //...Other consumer
  await Promise.all([voteConsumer]);
};

export { videoServiceConsume };
