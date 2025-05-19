"use client";
import { signIn, getUser } from "./auth";
import { useEffect, useState } from "react";
export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUserName] = useState();
  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      if (user) {
        setUserName(user.username);
        setAuthenticated(true);
      }
    }
    fetchUser();
  }, []);
  return (
    <div>
      <h1>Fragment UI</h1>
      <section>
        <nav>
          <button disabled={authenticated} onClick={signIn}>
            Login
          </button>
        </nav>
      </section>
      <section hidden={!authenticated} id="user">
        <h2>
          Hello <span className="username">{username}</span>!
        </h2>
      </section>
    </div>
  );
}
