import Profile from "./Profile";
import Wantlist from './Wantlist';
import Messenger from './Messenger';
import Replies from "./Replies";
import DiscogsLookup from './DiscogsLookup';
import React, { useState, useEffect, useMemo } from 'react';
import {db} from './backend';
import {
  Disc, Radio, MessageSquare, Users, Search, Bell, Plus, ArrowBigUp, ArrowBigDown,
  Award, Check, X, Send, Play, Pause, Volume2, VolumeX, Share2,
  ArrowLeftRight, Music, Headphones, Hash, Mic, MicOff,
  Eye, EyeOff, Barcode, ChevronRight, ChevronDown, ChevronLeft,
  Star, UserCheck, UserPlus, SkipForward, FolderOpen, Sparkles, Home, ShoppingBag
} from 'lucide-react';

// ============================================================================
// RETRO 2000s CSS & BEVELED UTILITY STYLES
// ============================================================================
const RETRO_STYLES = `
  @keyframes marqueeScroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes eqBounce1 {
    0%, 100% { height: 25%; }
    50% { height: 95%; }
  }
  @keyframes eqBounce2 {
    0%, 100% { height: 80%; }
    40% { height: 20%; }
    75% { height: 100%; }
  }
  @keyframes eqBounce3 {
    0%, 100% { height: 40%; }
    35% { height: 90%; }
    70% { height: 30%; }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .winamp-marquee {
    display: inline-block;
    white-space: nowrap;
    animation: marqueeScroll 16s linear infinite;
  }
  .winamp-marquee:hover {
    animation-play-state: paused;
  }
  .bevel-out {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #7f8c9a;
    border-bottom: 2px solid #7f8c9a;
  }
  .bevel-in {
    border-top: 2px solid #7f8c9a;
    border-left: 2px solid #7f8c9a;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
  }
  .bevel-btn {
    background: linear-gradient(180deg, #ffffff 0%, #e4e8ee 52%, #cfd6df 100%);
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #64748b;
    border-bottom: 1px solid #64748b;
    box-shadow: 0 1px 0 rgba(0,0,0,0.08);
  }
  .bevel-btn:active {
    border-top: 1px solid #64748b;
    border-left: 1px solid #64748b;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    background: #d5dce4;
  }
  .aqua-btn {
    background: linear-gradient(180deg, #7dd3fc 0%, #0284c7 50%, #0369a1 51%, #38bdf8 100%);
    border: 1px solid #075985;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 2px rgba(0,0,0,0.2);
  }
  .forum-header-bar {
    background: linear-gradient(180deg, #486581 0%, #334e68 50%, #243b53 100%);
    border-top: 1px solid #829ab1;
    border-bottom: 1px solid #102a43;
  }
  .aim-header-bar {
    background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 65%, #93c5fd 100%);
    border-bottom: 1px solid #1e3a8a;
  }
  .jewel-ridges {
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.22) 0px,
      rgba(255,255,255,0.22) 2px,
      rgba(0,0,0,0.65) 2px,
      rgba(0,0,0,0.65) 4px
    );
  }
  .binder-pocket-sheen {
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.42) 0%,
      rgba(255,255,255,0.08) 38%,
      rgba(255,255,255,0.28) 62%,
      rgba(255,255,255,0.05) 100%
    );
  }
`;

// ============================================================================
// TACTILE PLASTIC CD JEWEL CASE & SLEEVE ARTWORK COMPONENT
// ============================================================================
const JewelCaseArtwork = ({
  seed = 'loveless',
  size = 'md',
  spinning = false,
  format = 'CD',
  binderMode = false,
  className = ''
}) => {
  const palettes = {
    loveless: ['#e11d48', '#be185d', '#4c0519', '#fda4af'],
    okcomputer: ['#0284c7', '#e0f2fe', '#1e3a8a', '#38bdf8'],
    madvillainy: ['#52525b', '#18181b', '#d97706', '#e4e4e7'],
    dummy: ['#1e3a8a', '#0f172a', '#60a5fa', '#dbeafe'],
    saw8592: ['#f4f4f5', '#27272a', '#71717a', '#18181b'],
    souvlaki: ['#3730a3', '#1e1b4b', '#818cf8', '#e0e7ff'],
    default: ['#b45309', '#451a03', '#f59e0b', '#fef3c7']
  };

  const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const keys = Object.keys(palettes);
  const colors = palettes[seed.toLowerCase().replace(/[^a-z0-9]/g, '')] || palettes[keys[hash % keys.length]];

  const dims = {
    xs: 'w-11 h-10',
    sm: 'w-16 h-14',
    md: 'w-28 h-24',
    lg: 'w-40 h-36'
  };

  if (binderMode) {
    return (
      <div className={`relative select-none shrink-0 ${dims[size] || dims.md} ${className}`}>
        <div className="w-full h-full rounded-b-xl rounded-t-sm bg-[#eef2f6] border border-[#94a3b8] shadow-inner p-1.5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 rounded-full bg-[#27272a] border border-[#64748b]" />
          <div
            className={`w-[86%] aspect-square rounded-full border border-slate-500 shadow-md relative flex items-center justify-center transition-transform duration-700
              ${spinning ? 'animate-[spinSlow_5s_linear_infinite]' : 'group-hover:rotate-90'}`}
            style={{
              background: `conic-gradient(from 25deg, #e2e8f0, #bae6fd, #fef08a, #fecdd3, #cbd5e1, #a5f3fc, #e2e8f0)`
            }}
          >
            <div
              className="w-[78%] h-[78%] rounded-full border border-black/30 flex items-center justify-center opacity-90"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]})`
              }}
            >
              <div className="w-[34%] h-[34%] rounded-full bg-slate-200/90 border border-slate-500 flex items-center justify-center">
                <div className="w-[46%] h-[46%] rounded-full bg-[#27272a] border border-slate-600" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 binder-pocket-sheen pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative select-none shrink-0 ${dims[size] || dims.md} ${className}`}>
      <div
        className={`absolute top-1/2 -translate-y-1/2 right-0 w-[88%] aspect-square rounded-full transition-transform duration-500 ease-out pointer-events-none
          ${spinning ? 'translate-x-6 rotate-180' : 'group-hover:translate-x-6 group-hover:rotate-180'}
          ${format === 'Vinyl'
            ? 'bg-zinc-900 border border-zinc-700 shadow-md'
            : 'border border-slate-400 shadow-md'
          }`}
        style={
          format !== 'Vinyl'
            ? {
                background:
                  'conic-gradient(from 40deg, #e2e8f0, #7dd3fc, #fde047, #fda4af, #cbd5e1, #67e8f9, #e2e8f0)'
              }
            : undefined
        }
      >
        {format === 'Vinyl' ? (
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <div className="w-[36%] h-[36%] rounded-full flex items-center justify-center" style={{ backgroundColor: colors[0] }}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <div className="w-[33%] h-[33%] rounded-full bg-white/85 border border-slate-400 flex items-center justify-center">
              <div className="w-[45%] h-[45%] rounded-full bg-[#f4f1ea] border border-slate-500" />
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 w-full h-full rounded-[3px] bg-white/75 p-[2px] border border-[#64748b] shadow-[2px_2px_0px_rgba(30,41,59,0.22)] flex overflow-hidden">
        {format === 'CD' && (
          <div className="w-[13%] h-full bg-[#1e293b] jewel-ridges border-r border-slate-500 shrink-0 flex flex-col justify-between py-1 items-center">
            <div className="w-1 h-1 rounded-full bg-slate-400/50" />
            <div className="w-1 h-1 rounded-full bg-slate-400/50" />
          </div>
        )}

        <div
          className="relative flex-1 h-full overflow-hidden flex flex-col justify-between p-1.5"
          style={{
            background: `radial-gradient(circle at ${25 + (hash % 50)}% ${25 + (hash % 45)}%, ${colors[0]}, ${colors[1]} 75%, ${colors[2]})`
          }}
        >
          {format === 'Cassette' && (
            <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 h-4 rounded-xs bg-zinc-900/85 border border-slate-300 flex items-center justify-around px-1.5">
              <div className="w-2 h-2 rounded-full border border-white" />
              <div className="w-3 h-1.5 bg-amber-300/70" />
              <div className="w-2 h-2 rounded-full border border-white" />
            </div>
          )}

          <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
            <circle cx={32 + (hash % 35)} cy={35 + (hash % 30)} r={20 + (hash % 15)} fill={colors[3]} fillOpacity="0.35" />
            <rect
              x={16 + (hash % 22)}
              y={16 + (hash % 22)}
              width="44"
              height="44"
              rx={hash % 2 === 0 ? '22' : '2'}
              stroke={colors[3]}
              strokeWidth="2.5"
              fill="none"
              opacity="0.6"
            />
          </svg>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(125deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.05) 35%, transparent 60%)'
            }}
          />

          <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold uppercase px-1 bg-white/90 text-slate-900 border border-slate-500 leading-tight">
            {format}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SEED DATA
// ============================================================================
const BARCODE_PRESETS = [
  { barcode: '5017556300602', catalogNo: 'CRECD 060', releaseId: 'rel-loveless', title: 'Loveless', artist: 'My Bloody Valentine', year: 1991, format: 'CD', pressing: '1991 UK Creation First Press', condition: 'NM', value: 48, seed: 'loveless' },
  { barcode: '724385522925', catalogNo: '7243 8 55229 2 5', releaseId: 'rel-okcomputer', title: 'OK Computer', artist: 'Radiohead', year: 1997, format: 'CD', pressing: '1997 UK Parlophone First Press', condition: 'VG+', value: 24, seed: 'okcomputer' },
  { barcode: '659457206512', catalogNo: 'STH2065', releaseId: 'rel-madvillainy', title: 'Madvillainy', artist: 'Madvillain', year: 2004, format: 'Vinyl', pressing: '2004 US Stones Throw 2xLP', condition: 'NM', value: 85, seed: 'madvillainy' }
];

const INITIAL_RELEASES = {
  'rel-loveless': {
    id: 'rel-loveless',
    title: 'Loveless',
    artist: 'My Bloody Valentine',
    year: 1991,
    label: 'Creation Records',
    catalogNo: 'CRECD 060',
    genre: 'Shoegaze / Noise Pop',
    seed: 'loveless',
    avgRating: 9.6,
    ratingsCount: 1428,
    pressingNotes: 'Matrix: CRECD 060 MPO 01. Early UK Creation CD pressings retain full analog warmth.',
    tracks: [
      { num: 1, title: 'Only Shallow', duration: '4:17', rating: 9.7, lyricsSnippet: 'Sleep like a pillow, comforta-ble...', comments: [{ id: 'tc1', user: 'kev_shields_fan', time: '00:14', text: 'Snare hit sounds like a cannon.', likes: 42 }] },
      { num: 2, title: 'Loomer', duration: '2:38', rating: 9.3, lyricsSnippet: 'Tap the glass and turn your head...', comments: [{ id: 'tc2', user: 'velvet_static', time: '00:48', text: 'Melting brass on a radiator.', likes: 18 }] },
      { num: 3, title: 'When You Sleep', duration: '4:11', rating: 9.9, lyricsSnippet: 'When I look at you...', comments: [{ id: 'tc3', user: 'crate_digger_99', time: '01:05', text: 'Bubblegum pop inside a pink tornado.', likes: 51 }] }
    ]
  },
  'rel-okcomputer': {
    id: 'rel-okcomputer',
    title: 'OK Computer',
    artist: 'Radiohead',
    year: 1997,
    label: 'Parlophone',
    catalogNo: '7243 8 55229 2 5',
    genre: 'Art Rock / Alternative',
    seed: 'okcomputer',
    avgRating: 9.5,
    ratingsCount: 2104,
    pressingNotes: '1997 Parlophone UK CD features original pre-loudness dynamic range.',
    tracks: [
      { num: 1, title: 'Airbag', duration: '4:44', rating: 9.4, lyricsSnippet: 'In the next world war...', comments: [{ id: 'tc4', user: 'subterranean_cd', time: '00:08', text: 'Sleigh bells + distorted cello.', likes: 38 }] },
      { num: 2, title: 'Paranoid Android', duration: '6:23', rating: 9.9, lyricsSnippet: 'Ambition makes you look pretty ugly...', comments: [{ id: 'tc5', user: 'analog_soul', time: '03:36', text: 'Rain down choral harmony.', likes: 91 }] }
    ]
  },
  'rel-madvillainy': {
    id: 'rel-madvillainy',
    title: 'Madvillainy',
    artist: 'Madvillain',
    year: 2004,
    label: 'Stones Throw Records',
    catalogNo: 'STH2065',
    genre: 'Underground Hip-Hop',
    seed: 'madvillainy',
    avgRating: 9.7,
    ratingsCount: 1890,
    pressingNotes: 'Produced by Madlib in a hotel room on an SP-303 sampler.',
    tracks: [
      { num: 1, title: 'Accordion', duration: '1:58', rating: 9.8, lyricsSnippet: 'Living off borrowed time...', comments: [{ id: 'tc6', user: 'crate_digger_99', time: '00:12', text: 'Accordion sample looped to perfection.', likes: 67 }] }
    ]
  }
};

const INITIAL_SHELF = [
  { id: 'sh-1', releaseId: 'rel-loveless', title: 'Loveless', artist: 'My Bloody Valentine', year: 1991, format: 'CD', pressing: '1991 UK Creation First Press', condition: 'NM', value: 48, openToTrade: false, seed: 'loveless', notes: 'Original glossy booklet.' },
  { id: 'sh-2', releaseId: 'rel-okcomputer', title: 'OK Computer', artist: 'Radiohead', year: 1997, format: 'CD', pressing: '1997 UK Parlophone First Press', condition: 'VG+', value: 24, openToTrade: true, seed: 'okcomputer', notes: 'Original master.' },
  { id: 'sh-3', releaseId: 'rel-madvillainy', title: 'Madvillainy', artist: 'Madvillain', year: 2004, format: 'Vinyl', pressing: '2004 US Stones Throw 2xLP', condition: 'NM', value: 85, openToTrade: false, seed: 'madvillainy', notes: 'Heavyweight press.' }
];

const INITIAL_WANTLIST = [
  { id: 'wl-1', releaseId: 'rel-okcomputer', title: 'OK Computer', artist: 'Radiohead', year: 1997, preferredFormat: 'CD', targetPressing: 'Japan Obi', maxBudget: 50, seed: 'okcomputer' }
];

const INITIAL_POSTS = [
  {
    id: 'post-1',
    crate: 'c/Digging',
    tagType: 'HOT',
    type: 'standard',
    author: 'obi_hunter',
    authorTitle: 'Senior Crate Digger',
    authorSig: 'Hunting: 90s Japan CDs w/ Obi | Deck: Marantz CD6000',
    joinedDate: 'Sep 2003',
    postCount: 1429,
    timestamp: 'Today at 10:14 AM',
    title: 'Scored a pristine 1991 UK Creation CD of Loveless in a thrift bin!!',
    body: 'Matrix code matches the MPO first run, jewel case has original smooth edges, and booklet is pristine.',
    releaseId: 'rel-loveless',
    releaseTag: 'My Bloody Valentine — Loveless (1991) [CRECD 060]',
    upvotes: 184,
    userVote: 0,
    comments: [
      { id: 'c1', author: 'crate_digger_99', sig: '100% lossless FLAC/CD rips only', time: 'Today at 10:42 AM', text: 'Unreal score!!', upvotes: 34, replies: [] }
    ]
  },
  {
    id: 'post-2',
    crate: 'c/Albums',
    tagType: 'STICKY',
    type: 'aotw',
    author: 'velvet_static',
    authorTitle: 'Crate Moderator',
    authorSig: 'NP: MBV - To Here Knows When',
    joinedDate: 'Jan 2003',
    postCount: 3810,
    timestamp: 'Yesterday',
    title: 'ALBUM OF THE WEEK: Radiohead — OK Computer (1997)',
    body: 'Drop your favorite track and pressing comparisons below!',
    releaseId: 'rel-okcomputer',
    releaseTag: 'Radiohead — OK Computer (1997) [7243 8 55229 2 5]',
    upvotes: 246,
    userVote: 1,
    comments: []
  }
];

const INITIAL_FRIENDS = [
  {
    id: 'fr-1',
    username: 'obi_hunter',
    displayName: 'Kenji T.',
    status: 'online',
    awayMsg: 'Spinning: Portishead - Dummy [1994 CD]',
    shelfMatch: 94,
    tradeInventory: [
      { releaseId: 'rel-okcomputer', title: 'OK Computer', artist: 'Radiohead', year: 1997, format: 'CD', pressing: 'Japan Obi', condition: 'Mint', value: 62 }
    ],
    messages: [
      { id: 'm1', sender: 'them', text: 'yo! saw your wantlist match on OK Computer. down to trade?', time: '11:12 AM' }
    ]
  },
  {
    id: 'fr-2',
    username: 'velvet_static',
    displayName: 'Maya L.',
    status: 'online',
    awayMsg: 'Listening Party: MBV - When You Sleep',
    shelfMatch: 89,
    tradeInventory: [],
    messages: [
      { id: 'm2', sender: 'them', text: 'hey are u joining the listening party tonight?', time: '10:05 AM' }
    ]
  }
];

const CRATES = [
  { id: 'all', name: 'All Crates', desc: 'Main indie CD, vinyl & discussion board', posts: 412 },
  { id: 'c/Albums', name: 'c/Albums', desc: 'Full-length reviews & Album of the Week', posts: 148 },
  { id: 'c/Songs', name: 'c/Songs', desc: 'Track breakdowns & lyric threads', posts: 94 },
  { id: 'c/Shoegaze', name: 'c/Shoegaze', desc: 'Glide guitar, reverse reverb & Creation Records', posts: 76 },
  { id: 'c/Digging', name: 'c/Digging', desc: 'Thrift store scores & matrix codes', posts: 112 },
  { id: 'c/Lyrics', name: 'c/Lyrics', desc: 'Songmeanings & hot take polls', posts: 63 }
];

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
function useLocalState(key, initial) {
  const [value,setValue]=useState(()=>{try{return JSON.parse(localStorage.getItem('spindle:'+key)||'null') ?? initial}catch{return initial}});
  useEffect(()=>{try{localStorage.setItem('spindle:'+key,JSON.stringify(value))}catch{}},[key,value]);
  return [value,setValue];
}
export default function App({account=null,onProfileSave}:any) {
  const [activeView, setActiveView] = useState('feed'); // 'feed' | 'shelf' | 'trade' | 'release' | 'room' | 'aim'
  const [selectedCrate, setSelectedCrate] = useState('all');
  const [selectedReleaseId, setSelectedReleaseId] = useState('rel-loveless');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = {
    username: account?.username || 'vinyl_archivist',
    displayName: account?.username || 'Alex R.',
    rank: account ? 'Member' : 'Gold Disc Archivist',
    sig: account?.now_spinning || '',
    joined: account ? new Date(account.joined_at).toLocaleDateString() : 'Oct 2003',
    scrobbles: '54,920'
  };

  const [winampTrack, setWinampTrack] = useState({
    title: 'My Bloody Valentine - Only Shallow [1991 UK CD]',
    playing: true
  });

  const [releases, setReleases] = useState(INITIAL_RELEASES);
  const [shelf, setShelf] = useLocalState(account ? account.id+':shelf' : 'demo:shelf', account ? [] : INITIAL_SHELF);
  const [wantlist, setWantlist] = useLocalState(account ? account.id+':wantlist' : 'demo:wantlist', account ? [] : INITIAL_WANTLIST);
  const [posts, setPosts] = useLocalState(account ? account.id+':posts' : 'demo:posts', account ? [] : INITIAL_POSTS);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);

  // Shelf UI State
  const [shelfViewMode, setShelfViewMode] = useState('jewel'); // 'jewel' | 'binder'
  const [binderPage, setBinderPage] = useState(0);

  // Modals & Popups
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [activeAimFriendId, setActiveAimFriendId] = useState('fr-1');
  const [aimInput, setAimInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Post form state
  const [postForm, setPostForm] = useState({ crate: 'c/Albums', title: '', body: '', releaseId: 'rel-loveless' });

  // Add CD form state
  const [addForm, setAddForm] = useState({ title: '', artist: '', year: 1998, format: 'CD', pressing: 'Original First Press', condition: 'NM', value: 30, openToTrade: false, seed: 'loveless' });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCrate = selectedCrate === 'all' || p.crate === selectedCrate;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
      return matchCrate && matchSearch;
    });
  }, [posts, selectedCrate, searchQuery]);

  useEffect(()=>{
    if(!db||!account)return;
    const load=async()=>{
      const [a,b]=await Promise.all([db.from('shelf_items').select('payload').eq('user_id',account.id),db.from('threads').select('payload').order('created_at',{ascending:false})]);
      if(a.error||b.error){triggerToast(a.error?.message||b.error?.message);return}
      setShelf(a.data.map(r=>r.payload));setPosts(b.data.map(r=>r.payload));
    };
    load();
    const channel=db.channel('spindle-threads').on('postgres_changes',{event:'*',schema:'public',table:'threads'},load).subscribe();
    return ()=>{db.removeChannel(channel)};
  },[account?.id]);
  const [editingCopy,setEditingCopy]=useState(null);
  const [copyError,setCopyError]=useState('');
  const [copyBusy,setCopyBusy]=useState(false);
  function openCopy(item){
    setCopyError('');
    setEditingCopy({original:item,condition:item.condition,value:item.value??'',notes:item.notes||''});
  }
  async function saveCopy(event){
    event.preventDefault();
    if(copyBusy || !editingCopy)return;
    const {original,condition,value,notes}=editingCopy;
    const updated={...original,condition,value:value===''?null:Number(value),notes:notes.trim()};
    setCopyBusy(true);
    try{
      if(account){
        const {data,error}=await db.from('shelf_items').update({condition,payload:updated})
          .eq('id',original.id).eq('user_id',account.id).eq('payload',JSON.stringify(original)).select('id');
        if(error)throw error;
        if(!data.length)throw new Error('This copy changed. Refresh the shelf and reopen it to edit.');
      }
      setShelf(previous=>previous.map(row=>row.id===original.id?updated:row));
      setEditingCopy(null);triggerToast('Copy details saved.');
    }catch(error){setCopyError(error.message)}finally{setCopyBusy(false)}
  }
  const [tradePeer,setTradePeer]=useState(null);
  async function toggleTrade(item){
    const updated={...item,openToTrade:!item.openToTrade};
    const {error}=await db.from('shelf_items').update({open_to_trade:updated.openToTrade,payload:updated}).eq('id',item.id).eq('user_id',account.id).select('id').single();
    if(error){triggerToast(error.message);return}
    setShelf(previous=>previous.map(row=>row.id===item.id?updated:row));
  }
  const [crateRows,setCrateRows]=useState(CRATES);
  useEffect(()=>{
    if(!account)return;
    db.from('crates').select('*').order('id').then(({data})=>{if(data?.length)setCrateRows([CRATES[0],...data])});
    const heartbeat=()=>{if(document.visibilityState==='visible')db.from('profiles').update({last_active_at:new Date().toISOString()}).eq('id',account.id).then(()=>{})};
    heartbeat(); const timer=setInterval(heartbeat,60000);
    return ()=>clearInterval(timer);
  },[account?.id]);
  const crates=crateRows.map(c=>({...c,posts:posts.filter(p=>c.id==='all'||p.crate===c.id).length}));
  const addShelfItem=async(item)=>{
    if(db&&account){
      const {error}=await db.from('shelf_items').insert({id:item.id,user_id:account.id,artist:item.artist,album:item.title,format:item.format,condition:item.condition,open_to_trade:item.openToTrade,payload:item});
      if(error){triggerToast(error.message);return false}
    }
    setShelf(prev=>[item,...prev.filter(p=>p.id!==item.id)]);return true;
  };
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) return;
    const rel = releases[postForm.releaseId] || shelf.find(item=>item.id===postForm.releaseId);
    const newPost = {
      id: crypto.randomUUID(),
      crate: postForm.crate,
      tagType: 'NEW',
      type: 'standard',
      author: currentUser.username,
      authorTitle: currentUser.rank,
      authorSig: currentUser.sig,
      joinedDate: currentUser.joined,
      postCount: 500,
      timestamp: 'Just now',
      title: postForm.title.trim(),
      body: postForm.body.trim() || 'New topic created in crate.',
      discogsId:rel?.discogsId,
      releaseId: postForm.releaseId,
      releaseTag: rel ? `${rel.artist} — ${rel.title} (${rel.year})` : undefined,
      upvotes: 1,
      userVote: 1,
      comments: []
    };
    if(db&&account){
      const {error}=await db.from('threads').insert({id:newPost.id,user_id:account.id,crate:newPost.crate,title:newPost.title,body:newPost.body,payload:newPost});
      if(error){triggerToast(error.message);return}
    }
    setPosts(prev=>[newPost,...prev.filter(p=>p.id!==newPost.id)]);
    setShowNewPostModal(false);
    setPostForm({ crate: 'c/Albums', title: '', body: '', releaseId: 'rel-loveless' });
    setActiveView('feed');
    triggerToast('Topic posted successfully to crate!');
  };

  const handleAddDisc = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.artist.trim()) return;
    const newDisc = {
      id: crypto.randomUUID(),
      discogsId: addForm.discogsId, cover: addForm.cover, tracks: addForm.tracks,
      releaseId: addForm.discogsId ? 'discogs-'+addForm.discogsId : 'rel-loveless',
      title: addForm.title.trim(),
      artist: addForm.artist.trim(),
      year: Number(addForm.year) || null,
      format: addForm.format,
      pressing: addForm.pressing,
      condition: addForm.condition,
      value: addForm.value==='' ? null : Number(addForm.value),
      openToTrade: addForm.openToTrade,
      seed: addForm.seed || 'loveless',
      notes: 'Added via quick catalog.'
    };
    if(!(await addShelfItem(newDisc)))return;
    setAddForm({title:"",artist:"",year:"",format:"CD",pressing:"",condition:"NM",value:0,openToTrade:false,seed:"disc"});
    setShowAddModal(false);
    triggerToast(`Added "${newDisc.title}" to your CD Shelf!`);
  };

  const handleSendAim = () => {
    if(account){triggerToast('Live messaging is not connected yet.');return;}
    if (!aimInput.trim() || !activeAimFriendId) return;
    const msg = { id: `m-${Date.now()}`, sender: 'me', text: aimInput.trim(), time: 'Just now' };
    setFriends((prev) =>
      prev.map((f) => (f.id === activeAimFriendId ? { ...f, messages: [...f.messages, msg] } : f))
    );
    setAimInput('');
    setTimeout(() => {
      setFriends((prev) =>
        prev.map((f) =>
          f.id === activeAimFriendId
            ? { ...f, messages: [...f.messages, { id: `r-${Date.now()}`, sender: 'them', text: 'sounds awesome! let me check my CD rack rn.', time: 'Just now' }] }
            : f
        )
      );
    }, 1000);
  };

  const activeAimFriend = friends.find((f) => f.id === activeAimFriendId) || friends[0];
  const activeRelease = releases[selectedReleaseId] || releases['rel-loveless'];

  const [shelfQuery, setShelfQuery] = useState('');
  const [shelfFormat, setShelfFormat] = useState('');
  const [tradeOnly, setTradeOnly] = useState(false);
  const formats = [...new Set(shelf.map(item=>item.format).filter(Boolean))].sort();
  const terms = shelfQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visibleShelf = shelf.filter(item=>{
    if (shelfFormat && item.format !== shelfFormat) return false;
    if (tradeOnly && !item.openToTrade) return false;
    const searchable = [item.artist,item.title,item.pressing,item.discogsId].join(' ').toLowerCase();
    return terms.every(term=>searchable.includes(term));
  });
  const totalBinderPages = Math.max(1, Math.ceil(visibleShelf.length / 4));
  const pageIndex = Math.min(binderPage,totalBinderPages-1);
  const binderSlots = visibleShelf.slice(pageIndex * 4, (pageIndex + 1) * 4);

  return (
    <div
      className="min-h-screen bg-[#e7e2d8] text-[#1e293b] flex flex-col selection:bg-[#334e68] selection:text-white"
      style={{ fontFamily: 'Tahoma, Verdana, "Trebuchet MS", sans-serif' }}
    >
      <style>{RETRO_STYLES}</style>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#fef9c3] text-[#1e293b] bevel-out shadow-xl flex items-center gap-2 text-xs font-bold">
          <Disc className="w-4 h-4 text-[#b45309] animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          TOP NAVIGATION BAR (SUPER EASY TO NAVIGATE)
      ==================================================================== */}
      <header className="bg-[#d9e2ec] border-b-2 border-[#627d98] sticky top-0 z-40 shadow-md">
        {/* Top Info Strip */}
        <div className="bg-[#243b53] text-[#d9e2ec] px-4 py-1 text-[11px] flex items-center justify-between border-b border-[#102a43]">
          <div className="font-mono flex items-center gap-2">
            <span className="text-[#fbbf24] font-bold">★ SPINDLE 2003-2007</span>
            <span className="hidden sm:inline text-[#829ab1]">|</span>
            <span className="hidden sm:inline">The Ultimate CD Collector Community & Trade Hub</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            {account ? <button onClick={()=>db.auth.signOut()} className="underline">Sign out</button> : <span>Demo mode • local data</span>}
            <button onClick={()=>setActiveView("profile")} className="underline">Profile · @{currentUser.username}</button>
            <button
              onClick={() => setActiveView('aim')}
              className="text-[#7dd3fc] underline font-bold cursor-pointer"
            >
              AIM Chat
            </button>
          </div>
        </div>

        {/* Winamp Bar + Logo */}
        <div className="max-w-[1300px] mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <button
              onClick={() => setActiveView('feed')}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-[#334e68] shadow flex items-center justify-center group-hover:rotate-180 transition-transform duration-700 shrink-0"
                style={{ background: 'conic-gradient(from 30deg, #f8fafc, #7dd3fc, #fde047, #fda4af, #cbd5e1, #67e8f9, #f8fafc)' }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[#d9e2ec] border border-[#334e68]" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#102a43] tracking-tight" style={{ textShadow: '1px 1px #fff' }}>
                  SPINDLE
                </h1>
                <div className="text-[10px] text-[#486581] font-bold uppercase">Indie Music Zine & Crates</div>
              </div>
            </button>

            {/* Quick Add CD button on mobile */}
            <button
              onClick={() => setShowAddModal(true)}
              className="md:hidden aqua-btn text-white font-bold text-xs px-3 py-1.5 rounded-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add CD
            </button>
          </div>

          {/* Winamp 2.91 Player */}
          <div className="bg-[#23272e] text-[#00ff41] bevel-out p-1.5 flex items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] font-mono font-bold text-[#cbd5e1] px-1">WINAMP</span>
            <div className="bg-[#090d0a] bevel-in px-2 py-1 flex items-center gap-2 w-56 sm:w-72 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shrink-0" />
              <div className="winamp-marquee font-mono text-[11px] text-[#00ff41]">
                *** NOW SPINNING: {winampTrack.title} ***
              </div>
            </div>
            <button
              onClick={() => setWinampTrack((p) => ({ ...p, playing: !p.playing }))}
              className="bevel-btn px-2 py-1 text-black text-xs font-bold"
            >
              {winampTrack.playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex aqua-btn text-white font-bold text-xs px-4 py-2 rounded-sm items-center gap-1.5 shadow cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add CD to Shelf</span>
          </button>
        </div>

        {/* PRIMARY NAVIGATION TABS (Super Clear & Prominent) */}
        <div className="bg-[#bcccdc] border-t border-[#9fb3c8] px-4">
          <div className="max-w-[1300px] mx-auto flex flex-wrap items-center gap-1.5 py-2">
            {[
              { id: 'feed', label: '1. Dashboard & Forums (Crates)', icon: MessageSquare },
              { id: 'shelf', label: '2. My CD Shelf & Binder', icon: Disc, count: shelf.length },
              { id: 'trade', label: '3. Wantlist & Trades', icon: ShoppingBag, count: wantlist.length },
              { id: 'release', label: '4. Release & Lyrics Hub', icon: Music },
              { id: 'room', label: '5. Listening Party Room', icon: Headphones, badge: 'LIVE' },
              { id: 'aim', label: '6. AIM Friends & IM', icon: Users, badge: account ? null : friends.filter(f=>f.status==='online').length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#f4f1ea] text-[#102a43] border-t-2 border-x border-[#334e68] shadow-sm font-black'
                      : 'bevel-btn text-[#243b53] hover:text-[#0369a1]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#334e68]" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#d9e2ec] border border-[#829ab1] text-[#102a43]">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="font-mono text-[9px] px-1 py-0.2 bg-[#dc2626] text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN APP CONTENT CONTAINER
      ==================================================================== */}
      <div className="flex-1 max-w-[1300px] w-full mx-auto px-4 py-4">

        {/* ================================================================
            VIEW 1: DASHBOARD & FORUM CRATES
        ================================================================ */}
        {activeView === 'profile' && account && <Profile account={account} onSave={onProfileSave}/>}
        {activeView === 'feed' && (
          <div className="space-y-4">
            {/* Top Bar with Crate Selector & New Post Button */}
            <div className="bg-[#f4f1ea] border border-[#627d98] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-[#102a43]">phpBB Music Forums & Crates</h2>
                <p className="text-xs text-[#486581]">
                  Browse discussions on albums, rare pressing matrix numbers, and underground songs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCrate}
                  onChange={(e) => setSelectedCrate(e.target.value)}
                  className="bg-white bevel-in px-3 py-1.5 text-xs font-bold text-[#102a43]"
                >
                  {crates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.posts})</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="aqua-btn text-white font-bold text-xs px-4 py-2 rounded-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Topic</span>
                </button>
              </div>
            </div>

            {/* Crate Quick Pills */}
            <div className="flex flex-wrap gap-2">
              {crates.map((crate) => (
                <button
                  key={crate.id}
                  onClick={() => setSelectedCrate(crate.id)}
                  className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    selectedCrate === crate.id
                      ? 'bg-[#334e68] text-white border border-[#102a43]'
                      : 'bevel-btn text-[#243b53]'
                  }`}
                >
                  {crate.name}
                </button>
              ))}
            </div>

            {/* Posts List */}
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-[#f4f1ea] border border-[#627d98] shadow-sm overflow-hidden">
                  <div className="forum-header-bar text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
                    <span className="font-mono text-[#fbbf24]">{post.crate}</span>
                    <span className="font-mono text-[10px] text-[#bcccdc]">{post.timestamp}</span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="w-32 bg-[#e6ecf2] border border-[#bcccdc] p-2 text-center shrink-0">
                      <div className="w-10 h-10 bg-[#334e68] text-white font-bold text-sm mx-auto flex items-center justify-center mb-1">
                        {post.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-xs font-bold text-[#0369a1] underline truncate">@{post.author}</div>
                      <div className="text-[10px] text-[#486581]">{post.authorTitle}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#102a43] mb-1">{post.title}</h3>
                      <p className="text-xs text-[#1e293b] leading-relaxed mb-3">{post.body}</p>
                      {post.releaseTag && post.crate==="c/BlindRatings" && <details><summary>Reveal mystery pressing</summary>{post.releaseTag}</details>}
                      {post.releaseTag && post.crate!=="c/BlindRatings" && (
                        <button
                          onClick={() => { if(post.discogsId){window.open('https://www.discogs.com/release/'+post.discogsId,'_blank','noopener');return;} setSelectedReleaseId(post.releaseId); setActiveView('release'); }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fef9c3] border border-[#ca8a04] text-xs font-mono font-bold text-[#713f12] cursor-pointer"
                        >
                          <Disc className="w-3.5 h-3.5 text-[#b45309]" />
                          <span>{post.releaseTag}</span>
                          <span>»</span>
                        </button>
                      )}
                    </div>
                  </div>
                {account && <Replies threadId={post.id} userId={account.id}/>}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            VIEW 2: MY CD SHELF & BINDER (SIMPLIFIED NAVIGATION)
        ================================================================ */}
        {activeView === 'shelf' && (
          <div className="space-y-4">
            <div className="bg-[#f4f1ea] border border-[#627d98] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-[#102a43]">My CD Shelf & Binder Collection</h2>
                <p className="text-xs text-[#486581]">
                  Manage your physical CDs, vinyl records, and cassettes. Hover cases to slide out media.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShelfViewMode('jewel')}
                  className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    shelfViewMode === 'jewel' ? 'bg-[#fef08a] border border-[#ca8a04] text-[#713f12]' : 'bevel-btn text-[#334e68]'
                  }`}
                >
                  💿 Jewel Case Rack
                </button>
                <button
                  onClick={() => setShelfViewMode('binder')}
                  className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    shelfViewMode === 'binder' ? 'bg-[#fef08a] border border-[#ca8a04] text-[#713f12]' : 'bevel-btn text-[#334e68]'
                  }`}
                >
                  📓 Zip Binder
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="aqua-btn text-white font-bold text-xs px-4 py-2 rounded-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add CD</span>
                </button>
              </div>
            </div>

            <section aria-label="Shelf filters" className="flex flex-wrap items-end gap-3 bg-[#e6ecf2] bevel-out p-3 text-sm">
              <label>Search shelf<input type="search" className="block bg-white bevel-in px-2 py-1" placeholder="Artist, album or pressing" value={shelfQuery} onChange={e=>{setShelfQuery(e.target.value);setBinderPage(0)}}/></label>
              <label>Format<select className="block bg-white bevel-in px-2 py-1" value={shelfFormat} onChange={e=>{setShelfFormat(e.target.value);setBinderPage(0)}}><option value="">All formats</option>{formats.map(format=><option key={format}>{format}</option>)}</select></label>
              <label><input type="checkbox" checked={tradeOnly} onChange={e=>{setTradeOnly(e.target.checked);setBinderPage(0)}}/> Open to trade only</label>
              <span role="status">{visibleShelf.length} of {shelf.length} copies</span>
              {(shelfQuery || shelfFormat || tradeOnly) && <button className="bevel-btn px-2" onClick={()=>{setShelfQuery('');setShelfFormat('');setTradeOnly(false);setBinderPage(0)}}>Clear filters</button>}
            </section>
            {!visibleShelf.length && <p>{shelf.length?'No copies match these filters.':'Your shelf is empty. Select Add CD to catalog your first copy.'}</p>}
            {/* JEWEL CASE VIEW */}
            {shelfViewMode === 'jewel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleShelf.map((item) => (
                  <div key={item.id} className="group bg-[#f4f1ea] border border-[#627d98] p-4 flex gap-4 shadow-sm hover:bg-white transition">
                    <div onClick={() => { if(item.discogsId){window.open('https://www.discogs.com/release/'+item.discogsId,'_blank','noopener');return;} setSelectedReleaseId(item.releaseId); setActiveView('release'); }} className="cursor-pointer">
                      {item.cover?<img src={item.cover} alt={item.title} width="80" height="80"/>:<JewelCaseArtwork seed={item.seed} size="md" format={item.format} />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3
                            onClick={() => { if(item.discogsId){window.open('https://www.discogs.com/release/'+item.discogsId,'_blank','noopener');return;} setSelectedReleaseId(item.releaseId); setActiveView('release'); }}
                            className="text-sm font-bold text-[#0369a1] underline cursor-pointer truncate"
                          >
                            {item.title}
                          </h3>
                          <span className="font-mono text-xs font-bold text-[#15803d] bg-[#dcfce7] border border-[#86efac] px-1.5">
                            {item.value==null?'Unpriced':'$'+item.value}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#334e68]">{item.artist} ({item.year})</div>
                        <div className="mt-1 text-[10px] font-mono bg-[#e6ecf2] border border-[#bcccdc] px-1 py-0.5 text-[#102a43] truncate">
                          {item.pressing}
                        </div>
                      </div>
                      <button className="bevel-btn px-2 py-1 mt-2 text-xs" onClick={()=>openCopy(item)}>Copy details</button>
                      {account && item.discogsId && <button className="bevel-btn px-2 py-1 mt-2 text-xs" aria-pressed={!!item.openToTrade} onClick={()=>toggleTrade(item)}>{item.openToTrade?'Open to trade · Turn off':'Mark open to trade'}</button>}
                      <div className="mt-3 pt-2 border-t border-dashed border-[#9fb3c8] flex items-center justify-between">
                        <span className="font-mono text-[10px] px-1.5 bg-white border border-[#94a3b8] font-bold">
                          {item.condition}
                        </span>
                        <button
                          onClick={() => {
                            setWinampTrack({ title: `${item.artist} - ${item.title} [${item.pressing}]`, playing: true });
                            triggerToast(`Now playing "${item.title}" in Winamp!`);
                          }}
                          className="bevel-btn px-2.5 py-1 text-xs font-bold text-[#102a43] cursor-pointer"
                        >
                          ▶ Play
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ZIP BINDER VIEW */}
            {shelfViewMode === 'binder' && visibleShelf.length>0 && (
              <div className="bg-[#27272a] border-4 border-[#18181b] rounded-lg p-5 shadow-xl">
                <div className="flex items-center justify-between text-white pb-3 mb-4 border-b-2 border-dashed border-[#52525b]">
                  <span className="px-2.5 py-1 bg-[#f59e0b] text-black font-mono text-xs font-bold">
                    64-CD NYLON BINDER POCKETS (Page {pageIndex + 1} of {totalBinderPages})
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={pageIndex === 0}
                      onClick={() => setBinderPage((p) => Math.max(0, p - 1))}
                      className="bevel-btn px-3 py-1 text-xs font-bold text-black disabled:opacity-40 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      disabled={pageIndex + 1 >= totalBinderPages}
                      onClick={() => setBinderPage((p) => Math.min(totalBinderPages - 1, p + 1))}
                      className="bevel-btn px-3 py-1 text-xs font-bold text-black disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {binderSlots.map((disc) => (
                    <div key={disc.id} className="bg-[#3f3f46] border border-[#71717a] rounded-md p-3 flex items-center gap-3">
                      <div onClick={() => { openCopy(disc); }} className="cursor-pointer">
                        <JewelCaseArtwork seed={disc.seed} size="md" binderMode={true} format={disc.format} />
                      </div>
                      <div className="min-w-0 flex-1 text-white">
                        <div className="text-xs font-bold text-[#fde047] truncate">{disc.title}</div>
                        <div className="text-[11px] text-[#e4e4e7] truncate">{disc.artist}</div>
                        <div className="text-[10px] font-mono text-[#a1a1aa] mt-1 truncate">{disc.pressing}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 3: WANTLIST & TRADES
        ================================================================ */}
        {activeView === 'trade' && account && <Wantlist userId={account.id} items={wantlist} setItems={setWantlist} onMessage={id=>{setTradePeer(id);setActiveView('aim')}}/>}
        {activeView === 'trade' && !account && (
          <div className="space-y-4">
            <div className="bg-[#f4f1ea] border border-[#627d98] p-4 shadow-sm">
              <h2 className="text-lg font-black text-[#102a43]">Wantlist & Friend Trade Matches</h2>
              <p className="text-xs text-[#486581]">Discs you are hunting for and automatic matches from your AIM buddies.</p>
            </div>

            <div className="space-y-3">
              {wantlist.map((w) => (
                <div key={w.id} className="bg-[#f4f1ea] border border-[#627d98] p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <JewelCaseArtwork seed={w.seed} size="sm" format={w.preferredFormat} />
                    <div>
                      <h3 className="text-sm font-bold text-[#0369a1]">{w.artist} — {w.title} ({w.year})</h3>
                      <p className="text-xs font-mono text-[#334e68]">Target Pressing: {w.targetPressing} • Max Budget: ${w.maxBudget}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveView('aim');  }}
                    className="bevel-btn px-3 py-1.5 text-xs font-bold text-[#15803d] shrink-0 cursor-pointer"
                  >
                    ⇄ Match Found! Trade via AIM
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            VIEW 4: RELEASE & LYRICS HUB
        ================================================================ */}
        {activeView === 'release' && (
          <div className="space-y-4">
            {/* Release Selector Bar */}
            <div className="bg-[#d9e2ec] border border-[#829ab1] p-2 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-[#243b53] shrink-0">Select Release:</span>
              {Object.values(releases).map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => setSelectedReleaseId(rel.id)}
                  className={`px-3 py-1 text-xs whitespace-nowrap cursor-pointer ${
                    rel.id === activeRelease.id ? 'bg-[#334e68] text-white font-bold' : 'bevel-btn text-[#102a43]'
                  }`}
                >
                  {rel.artist} - {rel.title}
                </button>
              ))}
            </div>

            {/* Release Banner */}
            <div className="bg-[#f4f1ea] border border-[#627d98] p-5 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-sm">
              <JewelCaseArtwork seed={activeRelease.seed} size="lg" spinning={true} format="CD" />
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs font-mono font-bold text-[#b45309]">{activeRelease.label} • Cat#: {activeRelease.catalogNo} • {activeRelease.year}</div>
                <h2 className="text-2xl font-black text-[#102a43]">{activeRelease.title}</h2>
                <div className="text-sm font-bold text-[#334e68]">{activeRelease.artist}</div>
                <p className="mt-2 text-xs font-mono text-[#1e293b] bg-[#e6ecf2] p-2 border border-[#bcccdc]">
                  <strong>Pressing & Matrix Notes:</strong> {activeRelease.pressingNotes}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-[#fef9c3] border border-[#ca8a04] text-xs font-mono font-bold text-[#713f12]">
                    ★ Board Rating: {activeRelease.avgRating}/10
                  </span>
                  <button
                    onClick={async () => {
                      if(!(await addShelfItem({ id: crypto.randomUUID(), releaseId: activeRelease.id, title: activeRelease.title, artist: activeRelease.artist, year: activeRelease.year, format: 'CD', pressing: activeRelease.catalogNo, condition: 'NM', value: 35, openToTrade: false, seed: activeRelease.seed, notes: '' })))return;
                      triggerToast(`Added "${activeRelease.title}" to your CD Shelf!`);
                    }}
                    className="aqua-btn text-white font-bold text-xs px-4 py-1.5 rounded-sm cursor-pointer"
                  >
                    + Add to My CD Shelf
                  </button>
                </div>
              </div>
            </div>

            {/* Tracklist & Lyric Annotations */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 bg-[#f4f1ea] border border-[#627d98]">
                <div className="forum-header-bar text-white px-3 py-2 text-xs font-bold">:: TRACKLISTING</div>
                <div className="divide-y divide-[#cbd5e1]">
                  {activeRelease.tracks.map((tr) => (
                    <div key={tr.num} className="p-3 text-xs flex justify-between items-center hover:bg-[#e6ecf2]">
                      <div>
                        <span className="font-mono text-[#627d98] mr-2">{tr.num}.</span>
                        <span className="font-bold text-[#102a43]">{tr.title}</span>
                      </div>
                      <span className="font-mono text-[#486581]">{tr.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-7 bg-[#f4f1ea] border border-[#627d98] p-4 space-y-3">
                <div className="forum-header-bar text-white px-3 py-2 text-xs font-bold -mx-4 -mt-4 mb-3">:: TIMESTAMPED LYRIC & MIX DECODER</div>
                <div className="p-3 bg-white border-l-4 border-[#334e68] font-serif italic text-xs text-[#1e293b]">
                  “{activeRelease.tracks[0].lyricsSnippet}”
                </div>
                <div className="space-y-2">
                  {activeRelease.tracks[0].comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-white border border-[#cbd5e1] text-xs">
                      <div className="flex justify-between font-mono text-[10px] text-[#64748b] mb-1">
                        <strong className="text-[#0369a1]">@{c.user}</strong>
                        <span>[{c.time}]</span>
                      </div>
                      <p className="text-[#1e293b]">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            VIEW 5: LISTENING PARTY ROOM
        ================================================================ */}
        {activeView === 'room' && (
          <div className="space-y-4">
            <div className="bg-[#f4f1ea] border border-[#627d98] p-4 shadow-sm">
              <h2 className="text-lg font-black text-[#102a43]">Synchronized Album Listening Party Room</h2>
              <p className="text-xs text-[#486581]">Press play together with indie collectors around the world with live chat.</p>
            </div>

            <div className="bg-[#f4f1ea] border border-[#627d98] p-5 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <JewelCaseArtwork seed="loveless" size="lg" spinning={true} format="CD" />
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="text-xs font-mono font-bold text-[#dc2626] mb-1">● LIVE NOW: Shoegaze Late Night Session</div>
                <h3 className="text-lg font-bold text-[#102a43]">My Bloody Valentine — Loveless [1991 Creation CD]</h3>
                <div className="mt-3 h-3 bg-white bevel-in p-[2px]">
                  <div className="h-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] w-2/3" />
                </div>
                <div className="mt-4 flex justify-center sm:justify-start">
                  <button
                    onClick={() => triggerToast('Synced playhead with room!')}
                    className="aqua-btn text-white font-bold text-xs px-4 py-2 rounded-sm cursor-pointer"
                  >
                    ▶ Press Play Together
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            VIEW 6: AIM FRIENDS & IM CHAT
        ================================================================ */}
        {activeView === 'aim' && account && <Messenger me={account.id} initialPeer={tradePeer}/>}
        {activeView === 'aim' && !account && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Buddy List Sidebar */}
            <div className="md:col-span-4 bg-[#ece9d8] bevel-out p-3 space-y-3 shadow-md">
              <div className="aim-header-bar text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
                <span>AIM Buddy List (demo contacts)</span>
                <span className="font-mono text-[10px]">v5.9</span>
              </div>
              <div className="bg-white bevel-in p-2 space-y-2">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveAimFriendId(f.id)}
                    className={`w-full text-left p-2 border cursor-pointer transition ${
                      activeAimFriendId === f.id ? 'bg-[#dbeafe] border-[#2563eb]' : 'border-transparent hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-[#1e293b]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                        @{f.username}
                      </span>
                      <span className="font-mono text-[10px] text-[#15803d]">{f.shelfMatch}% Match</span>
                    </div>
                    <div className="text-[10px] italic text-[#475569] truncate pl-4 mt-0.5">{f.awayMsg}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active IM Conversation Window */}
            <div className="md:col-span-8 bg-[#ece9d8] bevel-out p-3 space-y-3 shadow-md">
              <div className="aim-header-bar text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
                <span>Instant Message with @{activeAimFriend.username}</span>
                <span className="font-mono text-[10px]">Shelf Match: {activeAimFriend.shelfMatch}%</span>
              </div>

              <div className="bg-white bevel-in p-3 h-72 overflow-y-auto space-y-2 text-xs">
                {activeAimFriend.messages.map((m) => (
                  <div key={m.id} className="leading-snug">
                    <strong className={m.sender === 'me' ? 'text-[#dc2626]' : 'text-[#1d4ed8]'}>
                      {m.sender === 'me' ? currentUser.username : activeAimFriend.username}
                    </strong>{' '}
                    <span className="text-[10px] font-mono text-[#64748b]">({m.time}):</span>{' '}
                    <span className="text-[#1e293b]">{m.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aimInput}
                  onChange={(e) => setAimInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAim()}
                  placeholder={`Type IM to @${activeAimFriend.username}...`}
                  className="flex-1 bg-white bevel-in px-3 py-2 text-xs outline-none"
                />
                <button
                  onClick={handleSendAim}
                  className="aqua-btn text-white font-bold text-xs px-5 py-2 rounded-sm cursor-pointer"
                >
                  Send IM
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ====================================================================
          MODAL 1: ADD CD TO SHELF
      ==================================================================== */}
      {editingCopy && <dialog open aria-label="Copy details" className="fixed inset-0 z-50 m-auto w-[min(92vw,30rem)] max-h-[85vh] overflow-auto bg-[#ece9d8] bevel-out shadow-xl p-4">
        <h2 className="font-bold">{editingCopy.original.artist} — {editingCopy.original.title}</h2>
        <p className="text-sm">{editingCopy.original.format} · {editingCopy.original.pressing}</p>
        {editingCopy.original.tracks?.length>0 && <details className="my-2"><summary>Tracklist ({editingCopy.original.tracks.length})</summary><ol>{editingCopy.original.tracks.map((t,i)=><li key={i}>{t.position} {t.title} {t.duration}</li>)}</ol></details>}
        <form onSubmit={saveCopy} className="space-y-3 mt-3">
          <label className="block">Condition <select value={editingCopy.condition} onChange={e=>setEditingCopy({...editingCopy,condition:e.target.value})}>{["M","NM","VG+","VG","G+","G","F","P"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="block">Estimated value ($) <input type="number" step="0.01" min="0" className="bg-white bevel-in p-1" value={editingCopy.value} onChange={e=>setEditingCopy({...editingCopy,value:e.target.value})}/></label>
          <label className="block">Notes about this copy<textarea maxLength={4000} className="block w-full bg-white bevel-in p-2" value={editingCopy.notes} onChange={e=>setEditingCopy({...editingCopy,notes:e.target.value})}/></label>
          {copyError&&<p role="alert">{copyError}</p>}
          <button disabled={copyBusy} type="button" className="bevel-btn px-3 py-1" onClick={()=>setEditingCopy(null)}>Cancel</button> <button disabled={copyBusy} className="aqua-btn text-white px-3 py-1">Save copy</button>
        </form></dialog>}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-md bg-[#ece9d8] bevel-out shadow-2xl">
            <div className="forum-header-bar text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
              <span>:: CATALOG CD / VINYL TO SHELF</span>
              <button onClick={() => setShowAddModal(false)} className="bevel-btn px-1.5 text-black font-bold cursor-pointer">X</button>
            </div>

            <form onSubmit={handleAddDisc} className="p-4 space-y-3 text-xs">
              <div>
                <DiscogsLookup onImport={data=>setAddForm(prev=>({...prev,...data,seed:data.title}))}/>
                <label className="block font-bold mb-1">Sample presets</label>
                <div className="flex flex-wrap gap-1">
                  {BARCODE_PRESETS.map((p) => (
                    <button
                      key={p.barcode}
                      type="button"
                      onClick={() => setAddForm({ title: p.title, artist: p.artist, year: p.year, format: p.format, pressing: p.pressing, condition: p.condition, value: p.value, openToTrade: false, seed: p.seed })}
                      className="bevel-btn px-2 py-1 text-[10px] font-mono font-bold text-[#0369a1] cursor-pointer"
                    >
                      {p.title} ({p.year})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Album Title *</label>
                <input
                  required
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Souvlaki"
                  className="w-full bg-white bevel-in px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Artist *</label>
                <input
                  required
                  type="text"
                  value={addForm.artist}
                  onChange={(e) => setAddForm((p) => ({ ...p, artist: e.target.value }))}
                  placeholder="e.g. Slowdive"
                  className="w-full bg-white bevel-in px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Format</label>
                  <select
                    value={addForm.format}
                    onChange={(e) => setAddForm((p) => ({ ...p, format: e.target.value }))}
                    className="w-full bg-white bevel-in px-2 py-1.5"
                  >
                    <option value="CD">CD</option>
                    {!["CD","Vinyl","Cassette"].includes(addForm.format) && <option>{addForm.format}</option>}
                    <option value="Vinyl">Vinyl</option>
                    <option value="Cassette">Cassette</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Year</label>
                  <input
                    type="number"
                    value={addForm.year}
                    onChange={(e) => setAddForm((p) => ({ ...p, year: e.target.value }))}
                    className="w-full bg-white bevel-in px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={addForm.value}
                    onChange={(e) => setAddForm((p) => ({ ...p, value: e.target.value }))}
                    className="w-full bg-white bevel-in px-2.5 py-1.5"
                  />
                </div>
              </div>

              <label className="block">Copy condition<select className="ml-2 bg-white p-1" value={addForm.condition} onChange={e=>setAddForm(p=>({...p,condition:e.target.value}))}>{["M","NM","VG+","VG","G+","G","F","P"].map(c=><option key={c}>{c}</option>)}</select></label>
              <label className="block"><input type="checkbox" checked={addForm.openToTrade} onChange={e=>setAddForm(p=>({...p,openToTrade:e.target.checked}))}/> Open to trade</label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="bevel-btn px-4 py-1.5 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="aqua-btn text-white px-4 py-1.5 font-bold cursor-pointer">Save to Shelf</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: NEW FORUM TOPIC
      ==================================================================== */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-md bg-[#ece9d8] bevel-out shadow-2xl">
            <div className="forum-header-bar text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
              <span>:: POST NEW PHPBB FORUM TOPIC</span>
              <button onClick={() => setShowNewPostModal(false)} className="bevel-btn px-1.5 text-black font-bold cursor-pointer">X</button>
            </div>

            <form onSubmit={handleCreatePost} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Choose Crate</label>
                <select
                  value={postForm.crate}
                  onChange={(e) => setPostForm((p) => ({ ...p, crate: e.target.value }))}
                  className="w-full bg-white bevel-in px-2.5 py-1.5 font-bold"
                >
                  {crates.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Featured pressing<select className="block bg-white p-2" value={postForm.releaseId} onChange={e=>setPostForm(p=>({...p,releaseId:e.target.value}))}>{[...Object.values(releases),...shelf.filter(item=>item.discogsId)].map(r=><option key={r.id} value={r.id}>{r.artist} — {r.title}</option>)}</select></label>
                <label className="block font-bold mb-1">Subject Title *</label>
                <input
                  required
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Best mastering for 90s shoegaze CDs?"
                  className="w-full bg-white bevel-in px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={postForm.body}
                  onChange={(e) => setPostForm((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Write your thoughts..."
                  className="w-full bg-white bevel-in px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewPostModal(false)} className="bevel-btn px-4 py-1.5 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="aqua-btn text-white px-4 py-1.5 font-bold cursor-pointer">Post Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}