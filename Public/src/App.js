import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';//firebase database
import 'firebase/auth';//for user authentication
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//obtained from firbase site, projects setting and app registration
firebase.initializeApp({
  apiKey: "AIzaSyAl9uFAlgUgOCnDxK4Zew9SpYBdOkcfm6A",
  authDomain: "messaging-app-8faab.firebaseapp.com",
  projectId: "messaging-app-8faab",
  storageBucket: "messaging-app-8faab.appspot.com",
  messagingSenderId: "405767631975",
  appId: "1:405767631975:web:96287b94739d2c6dff90c2",
  measurementId: "G-JRT5G3VBBR"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);//used to define whether the user authenticated

  return (
    <div className="App">
      <header>
        <h1>Lets Talk!</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />} 
      </section>

    </div>
  );
}

//Used to create sign in button and sign in popup
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className="signInText">
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className="violateMessage">Do not violate the community guidelines or you will be banned for life!</p>
    </div>
  )

}

//checks to see if we have a current user and return a sign out button
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
