"use client";
import { signIn, getUser } from "./auth";
import { useEffect, useState } from "react";
import { getUserFragments, postFragmentData } from "./api";
export default function Home() {
  const [user, setUser] = useState();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUserName] = useState();
  const [contentType, setContentType] = useState("text/html");
  const [content, setContent] = useState("");
  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      setUser(user);
      const userFragments = await getUserFragments(user);
      if (user) {
        setUserName(user.username);
        setAuthenticated(true);
      }
    }
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    postFragmentData(user, content, contentType);
  };

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
        <br></br>
        <h2>Make a fragment</h2>
        <form onSubmit={handleSubmit}>
          <label for="content-type">Content-Type:</label>
          <select
            name="content-type"
            id="content-type"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="text/html">text/html</option>
          </select>
          <br></br>
          <label for="content">Content:</label>

          <textarea
            name="content"
            id="content"
            rows="6"
            cols="50"
            placeholder="Write your HTML content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <br></br>
          <button type="submit">Submit</button>
        </form>
      </section>
    </div>
  );
}
