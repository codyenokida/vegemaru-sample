import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import TokenBalance from "../components/TokenBalance";
import useContract from "../hooks/useContract";
import useEagerConnect from "../hooks/useEagerConnect";
import VegemaruABI from "../contracts/Vegemaru.json";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

function Home() {
  const { account, library, chainId } = useWeb3React();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [totalSupply, setTotalSupply] = useState(0);

  const contract = useContract(
    "0x3128e7E5c5772C7BF0914D34b30CCCE0BbA78f72",
    VegemaruABI
  );

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  useEffect(() => {
    if (contract) {
      (async () => {
        const ts: ethers.BigNumber = await contract.totalSupply();
        setTotalSupply(ts.toNumber());
      })();
    }
  }, [contract]);

  const mint = async () => {
    try {
      if (account) {
        setSuccess(false);
        setLoading(true);
        const tx = await contract.devMint(account, 1);
        console.log(tx);
        setTransactionHash(tx.hash);
        await tx.wait();
        setLoading(false);
        setSuccess(true);
      }
    } catch (e) {
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Vegemaru Sample</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <Link href="/">
            <a>Vegemaru Sample</a>
          </Link>

          <Account triedToEagerConnect={triedToEagerConnect} />
        </nav>
      </header>

      <main>
        <h1>VegemaruサンプルNFTサイトへようこそ。</h1>
        <p>Please connect to Rinkeby Testnet. {chainId === 4 ? "✅" : "❌"}</p>
        {isConnected && (
          <section>
            <ETHBalance />
          </section>
        )}
        <button onClick={() => mint()} disabled={loading}>
          Mint NFT
        </button>
        <p>
          {loading ? (
            transactionHash ? (
              <span>
                loading...
                <br />
                <a
                  href={`https://rinkeby.etherscan.io/tx/${transactionHash}`}
                  style={{ color: "blue" }}
                  target="_blank"
                  rel="noopener"
                >
                  check transaction
                </a>
              </span>
            ) : (
              "loading..."
            )
          ) : success ? (
            <span>
              Success!! <br />
              <a
                href={`https://testnets.opensea.io/assets/0x3128e7e5c5772c7bf0914d34b30ccce0bba78f72/${totalSupply}`}
                style={{ color: "blue" }}
                target="_blank"
                rel="noopener"
              >
                View NFT Here
              </a>
            </span>
          ) : (
            ""
          )}
        </p>
      </main>

      <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default Home;
