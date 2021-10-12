import React, { useRef, useState } from "react"
import "./App.css"

import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import "firebase/analytics"

import { useAuthState } from "react-firebase-hooks/auth"
import { useCollectionData } from "react-firebase-hooks/firestore"
import initializeAuthentication from "./Firebase/firebase.init"

initializeAuthentication()

const auth = firebase.auth()
const firestore = firebase.firestore()
const analytics = firebase.analytics()

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>টং</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        গুগল দি হান্দাও
      </button>
      <p>গাইল গুইল দিয়ো না, ভদ্দোরোতা বজায় রাখো</p>
    </>
  )
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        দূরে গিয়া মর
      </button>
    )
  )
}

function ChatRoom() {
  const dummy = useRef()
  const messagesRef = firestore.collection("messages")
  const query = messagesRef.orderBy("createdAt").limit(1000)

  const [messages] = useCollectionData(query, { idField: "id" })

  const [formValue, setFormValue] = useState("")

  const sendMessage = async (e) => {
    e.preventDefault()

    const { uid, photoURL } = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })

    setFormValue("")
    dummy.current.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="মনের কতা খুলি কও বদ্দা..."
        />

        <button type="submit" disabled={!formValue}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received"

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
          alt=""
        />
        <p>{text}</p>
      </div>
    </>
  )
}

export default App
