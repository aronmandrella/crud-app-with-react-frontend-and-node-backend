import "../theme/globalStyles.scss";

import type { AppProps } from "next/app";
import Head from "next/head";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>CRUD app with react frontend and node backend</title>
        <meta name="author" content="Aron Mandrella" />
        <meta name="description" content="CRUD app with react frontend and node backend" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
