export const RPC='https://rpc.mainnet.chain.robinhood.com';
export const STATE_VIEW='0xf3334192d15450cdd385c8b70e03f9a6bd9e673b';
export const POOLS=['0x6042253a4cb13a33c83959ca75787197d7b211a4cd7d7ee0308140fbb52cbb58','0x4be9bdfcff70326169d9a871974f0e15d18d07ce424678c40aaeef295decb1ae'];
export function decodeSqrt(hex){if(typeof hex!=='string'||!/^0x[\da-f]{256}$/i.test(hex))throw Error('池状态编码不完整');const n=BigInt('0x'+hex.slice(2,66));if(n<=0n||n>=2n**160n)throw Error('池价格未初始化');return Number(n)/2**96;}
export async function readChainPrice(rpc,now=()=>Date.now()){
 const [chain,block]=await Promise.all([rpc('eth_chainId',[]),rpc('eth_getBlockByNumber',['latest',false])]);if(chain!=='0x1237')throw Error('节点链ID与Robinhood不匹配');if(!block||!/^0x[\da-f]+$/i.test(block.number)||!/^0x[\da-f]{64}$/i.test(block.hash))throw Error('无效区块');
 const timestamp=Number(BigInt(block.timestamp))*1000;const valid=()=>{const age=now()-timestamp;if(!Number.isFinite(age)||age>30000||age< -10000)throw Error('链上区块时间过期或本地时钟异常')};valid();
 const states=await Promise.all(POOLS.map(pool=>rpc('eth_call',[{to:STATE_VIEW,data:'0xc815641c'+pool.slice(2)},block.number])));const [a,b]=states.map(decodeSqrt);const hxPerWolf=a*a,usdgPerHx=1e12/(b*b),price=hxPerWolf*usdgPerHx;if(!Number.isFinite(price)||price<=0)throw Error('价格计算失败');
 const confirm=await rpc('eth_getBlockByNumber',[block.number,false]);if(confirm?.hash!==block.hash)throw Error('检测到区块重组，重新读取');valid();
 return {price,hxPerWolf,usdgPerHx,timestamp,block:Number(BigInt(block.number)),hash:block.hash,receivedAt:now()};
}
