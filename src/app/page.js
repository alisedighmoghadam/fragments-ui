"use client";
import "./page.css";
import { signIn, getUser } from "./auth";
import { use, useEffect, useState } from "react";
import {
  getUserFragments,
  postFragmentData,
  getAllFragments,
  putFragmentData,
  deleteFragment,
} from "./api";
import FragmentCard from "./components/fragmentCard"; // adjust path if needed

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
];

export default function Home() {
  const [user, setUser] = useState();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUserName] = useState();
  const [contentType, setContentType] = useState("text/html");
  const [content, setContent] = useState("");
  const [fragments, setFragments] = useState([]);
  const [fileRequired, setFileRequired] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editFragment, setEditFragment] = useState(false);
  const [fragment, setFragment] = useState(null);
  const [activeFragmentId, setActiveFragmentId] = useState();
  const [userFragments, setUserFragments] = useState(null);

  const isMine = (id) => {
    return userFragments?.fragments?.includes(id);
  };

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      setUser(user);
      setUserFragments(await getUserFragments(user));
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

    let bodyData = content;
    let mimeType = contentType;

    if (selectedFile) {
      // Use the file's actual MIME type (e.g., image/png)
      mimeType = selectedFile.type || mimeType;

      const isTextLike =
        mimeType.startsWith("text") ||
        mimeType === "application/json" ||
        mimeType === "text/markdown" ||
        mimeType === "text/csv";

      bodyData = isTextLike
        ? await selectedFile.text()
        : await selectedFile.arrayBuffer(); // raw binary for images, pdfs, etc.
    }

    editFragment
      ? await putFragmentData(user, bodyData, fragment)
      : await postFragmentData(user, bodyData, mimeType);
    await fetchAllFragments(user, authenticated);
    setUserFragments(await getUserFragments(user));
  };
  async function handleDeleteFragment(id) {
    try {
      await deleteFragment(user, id);
      // optimistically close focus state
      setActiveFragmentId(null);
      setFragment(null);
      setEditFragment(false);
      // refresh list
      await fetchAllFragments(user, authenticated);
      setUserFragments(await getUserFragments(user));
    } catch (e) {
      console.error("Failed to delete fragment", e);
      alert("Delete failed. Please try again.");
    }
  }

  return (
    <div>
      <h1>Fragment UI</h1>
      <section>
        <nav>
          <button hidden={authenticated} onClick={signIn}>
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
          <h2>
            {!editFragment
              ? "Make a fragment"
              : `Editing fragment with id: ${fragment.id}`}
          </h2>
          <form onSubmit={handleSubmit}>
            <div hidden={editFragment ? true : false}>
              <label htmlFor="content-type">Content-Type:</label>
              <select
                name="content-type"
                id="content-type"
                value={
                  editFragment
                    ? fragment.type.startsWith("image/")
                      ? "image"
                      : fragment.type
                    : contentType
                }
                onChange={(e) => {
                  setContentType(e.target.value);
                  e.target.value === "image"
                    ? setFileRequired(true)
                    : setFileRequired(false);
                }}
              >
                <option value="text/plain">text/plain (.txt)</option>
                <option value="text/markdown">text/markdown (.md)</option>
                <option value="text/html">text/html (.html)</option>
                <option value="text/csv">text/csv (.csv)</option>
                <option value="application/json">
                  application/json (.json)
                </option>
                <option value="application/yaml">
                  application/yaml (.yaml)
                </option>
                <option value={"image"}>image</option>
              </select>
            </div>
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
              hidden={fileRequired}
            ></textarea>
            <br />
            <label>Upload file {fileRequired ? "" : "(Optional)"}</label>
            <div className="file-row">
              <label htmlFor="avatar" className="upload-btn">
                Choose File
              </label>
              <span className="file-name">{fileName}</span>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept={fileRequired ? ALLOWED_IMAGE_TYPES : contentType}
                className="hidden-file"
                required={fileRequired}
                onChange={(e) => {
                  const name = e.target.files?.[0]?.name || "No file chosen";
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  setFileName(name);
                }}
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="right-panel fragments">
          {fragments.length === 0 ? (
            <p>No fragments found.</p>
          ) : (
            fragments.map((fragment) => (
              <FragmentCard
                user={user}
                key={fragment.id}
                fragment={fragment}
                isActive={activeFragmentId === fragment.id}
                onActivate={() => {
                  if (!isMine(fragment.id)) {
                    alert("You can only open your own fragments.");
                    return;
                  }
                  const next =
                    activeFragmentId === fragment.id ? null : fragment.id;
                  setActiveFragmentId(next);
                  if (next) {
                    setFragment(fragment);
                    setEditFragment(true);
                    if (
                      fragment.type.startsWith("text/") ||
                      fragment.type.startsWith("application/")
                    ) {
                      setFileRequired(false);
                      setContent(fragment.data);
                    } else {
                      setFileRequired(true);
                    }
                  } else {
                    setFragment(null);
                    setEditFragment(false);
                  }
                }}
                onClose={() => {
                  setActiveFragmentId(null);
                  setFragment(null);
                  setEditFragment(false);
                  setContent("");
                }}
                onDelete={() => handleDeleteFragment(fragment.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
