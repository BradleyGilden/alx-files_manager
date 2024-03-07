import redisClient from '../utils/redis';

// A simple test for the redisClient object

const main = async () => {
  console.log(redisClient.isAlive());
  console.log(await redisClient.get('myKey'));
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey'));
  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));
  }, 6000);
};

setTimeout(() => {
  main();
}, 1000);
