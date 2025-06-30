import {
  findAllMarkets,
  MarketAccount,
  BookSideAccount,
  OPENBOOK_PROGRAM_ID,
  OpenBookV2Client,
} from "@openbook-dex/openbook-v2";
import { PublicKey } from "@solana/web3.js";
import {
  useOpenbookClient,
  useHookConnection,
  useFakeProvider,
} from "../hooks/useOpenbookClient";
import * as anchor from "@coral-xyz/anchor";

// MAINNET
// export const RPC = "https://misty-wcb8ol-fast-mainnet.helius-rpc.com/";
// DEVNET
// export const RPC = "https://aimil-f4d13p-fast-devnet.helius-rpc.com/";
// LOCALNET
export const RPC = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8899";

console.log("RPC URL:", RPC);

export const fetchData = async () => {
  const connection = useHookConnection();
  const provider = useFakeProvider();
  console.log(OPENBOOK_PROGRAM_ID.toBase58());

  const accounts = await connection.getProgramAccounts(OPENBOOK_PROGRAM_ID);
  const marketAccountDiscriminator =
    anchor.BorshAccountsCoder.accountDiscriminator("market");

  const marketAccounts = accounts
    .filter((account) => {
      // 계정 데이터 앞 8바이트가 Market 식별자와 일치하는지 확인
      return Buffer.from(account.account.data.slice(0, 8)).equals(
        marketAccountDiscriminator
      );
    })
    .map((account) => {
      const marketAddress = account.pubkey.toBase58();
      // 필터링된 계정 정보를 UI가 사용하기 좋은 형태로 변환
      // 필요하다면 여기서 MarketAccount.decode(account.account.data)를 사용할 수도 있습니다.
      return {
        key: marketAddress, // 1. React 테이블 렌더링을 위한 Key
        address: marketAddress, // 2. (아마도) 화면 표시에 사용될 주소
        market: marketAddress, // 3. useEffect 로직에서 사용할 마켓 주소
      };
    });

  console.log(
    `Found ${marketAccounts.length} market accounts after filtering.`
  );
  return marketAccounts;

  let markets = await findAllMarkets(connection, OPENBOOK_PROGRAM_ID, provider);
  return markets;
};

export const getMarket = async (
  client: OpenBookV2Client,
  publicKey: string
): Promise<MarketAccount> => {
  let market = await client.program.account.market.fetch(
    new PublicKey(publicKey)
  );
  return market ? market : ({} as MarketAccount);
};
