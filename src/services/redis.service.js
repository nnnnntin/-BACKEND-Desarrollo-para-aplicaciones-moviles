const { Redis } = require('@upstash/redis')

const ENVIRONMENT = process.env.ENVIRONMENT
const REDIS_URL = process.env.REDIS_URL
const REDIS_TOKEN = process.env.REDIS_TOKEN

const connectToRedis = async() =>{
    const connectionOpts ={
        url: REDIS_URL,
    };
    if(ENVIRONMENT!="development"){
        connectionOpts.token = REDIS_TOKEN;
    }
    const redis = new Redis(connectionOpts);
    await redis.set('foo', 'bar');
    return redis;
}

module.exports = connectToRedis;

// await redis.set('foo', 'bar');
// const data = await redis.get('foo');