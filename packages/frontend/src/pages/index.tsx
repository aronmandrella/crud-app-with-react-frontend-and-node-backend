import { NextPage } from "next";
import { App } from "../components/App";

const HomePage: NextPage = () => {
  return <App />;
};

/*
  NOTE:

  In a real world application maybe there would be a
  getServerSideProps call. It would server-side pre-fetch events
  and pre-generate initial html for user.

  All next fetches (after create, delete or update) would be handled
  like there are handled right now.
*/

export default HomePage;
