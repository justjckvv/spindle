import React, { useEffect, useRef, useState } from 'react';
import { Disc, Mail } from 'lucide-react';
import { db } from './backend';
import App from './App';
import PublicForum from './PublicForum';
import './auth.css';

export default function Auth() {
  const [browsing,setBrowsing]=useState(false);
  const [google,setGoogle]=useState(false);
  useEffect(()=>{if(db)fetch(import.meta.env.VITE_SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}}).then(r=>r.json()).then(s=>setGoogle(s.external?.google===true)).catch(()=>{})},[]);
  const [mode, setMode] = useState('signup');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(db));
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!db) return;
    const { data } = db.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) { setProfile(null); setLoading(false); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true);
    db.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      .then(({data, error}) => {
        if (!active) return;
        setProfile(data);
        setMessage(error?.message || '');
        setLoading(false);
      });
    return () => { active = false; };
  }, [session?.user.id]);

  function switchMode(next) {
    setMode(next);
    setMessage('');
    setPassword('');
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setMessage('');
    const address = email.trim();
    const options = { emailRedirectTo: window.location.origin };
    try {
      if (session) {
        const {data,error} = await db.from('profiles').insert({id:session.user.id,username:username.trim()}).select().single();
        if (error) throw error;
        setProfile(data);
      } else if (mode === 'confirm') {
        const {error} = await db.auth.resend({type:'signup',email:address,options});
        if (error) throw error;
        setMessage('Check your inbox for a fresh confirmation link.');
      } else if (mode === 'signin') {
        const {error} = await db.auth.signInWithPassword({email:address,password});
        if (error?.code === 'email_not_confirmed') switchMode('confirm');
        else if (error) throw error;
      } else {
        const {data,error} = await db.auth.signUp({email:address,password,options});
        if (error) {
          if (/database error saving new user|already registered/i.test(error.message)) {
            switchMode('confirm');
            setMessage('An earlier signup may already exist. Open your confirmation email or sign in if you already confirmed.');
          } else throw error;
        } else if (!data.session) switchMode('confirm');
      }
    } catch (error) {
      setMessage(error.code === '23505' ? 'That username is taken. Try another.' : error.message || 'Please try again.');
    } finally { lock.current = false; setPending(false); }
  }

  if (!db) return <App/>;
  if (session && profile) return <App key={session.user.id} account={profile} onProfileSave={setProfile}/>;
  if(!session && browsing)return <PublicForum onBack={()=>setBrowsing(false)}/>;
  const confirming = !session && mode === 'confirm';
  const title = session ? 'Choose your screen name' : confirming ? 'Check your inbox' : mode === 'signup' ? 'Join the crate' : 'Welcome back';
  return <main className="auth-stage"><section className="auth-window">
    <header><Disc size={22}/> SPINDLE <span>MEMBER ACCESS</span></header>
    <div className="auth-body"><div className="auth-disc" aria-hidden="true"/>
      <h1>{loading ? 'Opening Spindle…' : title}</h1>
      {!loading && <>
      <p>{session ? 'This name appears beside your posts.' : confirming ? 'Confirm your email, then come back here to sign in.' : mode === 'signup' ? 'Build your shelf and meet other music collectors.' : 'Sign in to your shelf and forum threads.'}</p>
      <form onSubmit={submit}>
        {session ? <label>Screen name<input required pattern="[A-Za-z0-9_]{3,32}" title="3–32 letters, numbers or underscores" value={username} onChange={e=>setUsername(e.target.value)}/></label> : <>
        <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
        {!confirming && <label>Password<input type="password" autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={mode==='signup'?8:1} placeholder={mode==='signup'?'At least 8 characters':undefined} value={password} onChange={e=>setPassword(e.target.value)}/></label>}</>}
        {message && <p role="status" className="auth-message">{message}</p>}
        <button disabled={pending}>{confirming && <Mail size={16}/>} {pending?'Please wait…':session?'Save screen name':confirming?'Resend confirmation email':mode==='signup'?'Create account':'Sign in'}</button>
      </form>
      {!session && google && <button type="button" className="auth-switch" onClick={async()=>{const {error}=await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});if(error)setMessage(error.message)}}>Continue with Google</button>}
      {!session && <p><button type="button" className="auth-switch" onClick={()=>setBrowsing(true)}>Browse public crates</button></p>}
      {!session && <button disabled={pending} className="auth-switch" onClick={()=>switchMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'New to Spindle? Create an account':'Already have an account? Sign in'}</button>}
      </>}
    </div></section></main>;
}
