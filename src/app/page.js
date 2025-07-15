"use client";
import "./page.css";
import { signIn, getUser } from "./auth";
import { use, useEffect, useState } from "react";
import { getUserFragments, postFragmentData, getAllFragments } from "./api";
import FragmentCard from "./components/fragmentCard"; // adjust path if needed

export default function Home() {
  const [user, setUser] = useState();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUserName] = useState();
  const [contentType, setContentType] = useState("text/html");
  const [content, setContent] = useState("");
  const [fragments, setFragments] = useState("");
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

  async function fetchAllFragments(user, authenticated) {
    if (user && authenticated) {
      try {
        const response = await getAllFragments(user); // ["ok", { ownerHash: [fragments] }]
        const ownerMap = response.fragment;
        const allFragments = [];

        for (const ownerId in ownerMap) {
          if (Array.isArray(ownerMap[ownerId])) {
            for (const fragment of ownerMap[ownerId]) {
              allFragments.push(fragment);
            }
          }
        }

        setFragments(allFragments);
        console.log(response.fragment);
      } catch (err) {
        console.error("Failed to load fragments:", err);
      }
    }
  }
  useEffect(() => {
    fetchAllFragments(user, authenticated);
  }, [authenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await postFragmentData(user, content, contentType);
    await fetchAllFragments(user, authenticated);
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
      <section className="main-layout" hidden={!authenticated} id="user">
        <div className="left-panel">
          <h2>
            Hello <span className="username">{username}</span>!
          </h2>
          <br />
          <h2>Make a fragment</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="content-type">Content-Type:</label>
            <select
              name="content-type"
              id="content-type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="text/plain">text/plain (.txt)</option>
              <option value="text/html">text/html (.html)</option>
              <option value="text/markdown">text/markdown (.md)</option>
              <option value="text/csv">text/csv (.csv)</option>
              <option value="application/json">application/json (.json)</option>
            </select>
            <br />
            <label htmlFor="content">Content:</label>
            <textarea
              name="content"
              id="content"
              rows="6"
              cols="50"
              placeholder={`Write your ${contentType} content here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="right-panel fragments">
          {fragments.length === 0 ? (
            <p>No fragments found.</p>
          ) : (
            fragments.map((fragment) => (
              <FragmentCard key={fragment.id} fragment={fragment} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
