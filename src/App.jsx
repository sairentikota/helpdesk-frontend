import React,{useEffect,useState}from'react';import{request,login,register}from'./api';import{LifeBuoy,LogOut,LayoutDashboard,Ticket,PlusCircle,Users,RefreshCw,CheckCircle2,Clock3,AlertCircle,MessageSquare,ArrowRight}from'lucide-react';
const statuses=['OPEN','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'],priorities=['LOW','MEDIUM','HIGH','URGENT'];
const tone={OPEN:'bg-sky-100 text-sky-800',ASSIGNED:'bg-violet-100 text-violet-800',IN_PROGRESS:'bg-amber-100 text-amber-800',RESOLVED:'bg-emerald-100 text-emerald-800',CLOSED:'bg-slate-200 text-slate-700'};
function Badge({children}){return <span className={'rounded-full px-2.5 py-1 text-xs font-bold '+(tone[children]||'bg-slate-100 text-slate-700')}>{children}</span>}
function Field({label,...p}){return <label className="block text-sm font-semibold text-slate-700">{label}<input className="field mt-1.5" {...p}/></label>}
function App(){const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('profile'))}catch{return null}}),[mode,setMode]=useState('login'),[page,setPage]=useState('dashboard'),[tickets,setTickets]=useState([]),[stats,setStats]=useState({}),[cats,setCats]=useState([]),[users,setUsers]=useState([]),[selected,setSelected]=useState(null),[comments,setComments]=useState([]),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[search,setSearch]=useState('');
const admin=user?.role==='ADMIN',agent=user?.role==='AGENT';
async function refresh(){if(!user)return;setBusy(true);try{const[t,s,c]=await Promise.all([request('/tickets?page=0&size=100'),request('/dashboard/stats'),request('/categories')]);setTickets(t.content||[]);setStats(s);setCats(c);if(admin)setUsers(await request('/admin/users'))}catch(e){setError(e.message)}finally{setBusy(false)}}
useEffect(()=>{refresh()},[user]);
function nav(p){setPage(p);setSelected(null);setError('');setNotice('')}
async function open(t){try{setSelected(await request('/tickets/'+t.id));setComments(await request('/tickets/'+t.id+'/comments'));setPage('detail')}catch(e){setError(e.message)}}
async function submitAuth(e){e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);try{const u=mode==='login'?await login({email:f.get('email'),password:f.get('password')}):await register({name:f.get('name'),email:f.get('email'),password:f.get('password')});localStorage.setItem('token',u.token);localStorage.setItem('profile',JSON.stringify(u));setUser(u)}catch(e){setError(e.message)}finally{setBusy(false)}}
async function create(e){e.preventDefault();const f=new FormData(e.currentTarget);try{const t=await request('/tickets',{method:'POST',body:JSON.stringify({title:f.get('title'),description:f.get('description'),categoryId:+f.get('categoryId'),priority:f.get('priority')})});setNotice('Ticket created.');await refresh();open(t)}catch(e){setError(e.message)}}
async function status(s){try{const t=await request(`/tickets/${selected.id}/status`,{method:'PATCH',body:JSON.stringify({status:s,resolutionNotes:document.getElementById('notes')?.value||null})});setSelected(t);setNotice('Status updated.');refresh()}catch(e){setError(e.message)}}
async function comment(e){e.preventDefault();const f=new FormData(e.currentTarget);try{await request(`/tickets/${selected.id}/comments`,{method:'POST',body:JSON.stringify({body:f.get('body')})});setComments(await request(`/tickets/${selected.id}/comments`));e.currentTarget.reset()}catch(e){setError(e.message)}}
async function assign(id,aid){try{await request(`/tickets/${id}/assign/${aid}`,{method:'POST'});setNotice('Ticket assigned.');refresh()}catch(e){setError(e.message)}}
async function newUser(e){e.preventDefault();const f=new FormData(e.currentTarget);try{await request('/admin/users',{method:'POST',body:JSON.stringify({name:f.get('name'),email:f.get('email'),password:f.get('password'),role:f.get('role')})});setUsers(await request('/admin/users'));setNotice('Account created.');e.currentTarget.reset()}catch(e){setError(e.message)}}
async function deleteUser(id){if(!confirm('Are you sure you want to delete this user?'))return;try{await request('/admin/users/'+id,{method:'DELETE'});setUsers(await request('/admin/users'));setNotice('User deleted.');}catch(e){setError(e.message)}}
if (!user) {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-3 text-blue-700 font-bold text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <LifeBuoy size={24} />
            </div>
            HelpDesk
          </div>
          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {mode === 'login' ? 'Not a member? ' : 'Already registered? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <div className="mt-10">
            <div>
              {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 font-medium">{error}</div>}
              <form onSubmit={submitAuth} className="space-y-6">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Full name</label>
                    <div className="mt-2">
                      <input name="name" required className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                  <div className="mt-2">
                    <input name="email" type="email" required className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                  <div className="mt-2">
                    <input name="password" type="password" minLength="8" required className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={busy} className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all">
                    {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          alt="Office workspace"
        />
        <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
const navs=[['dashboard','Dashboard',LayoutDashboard],['tickets','Tickets',Ticket],['create','Create ticket',PlusCircle],...(agent?[['assigned','Assigned to me',CheckCircle2]]:[]),...(admin?[['users','User management',Users]]:[])];
const shown=tickets.filter(t=>(t.title+' '+t.description).toLowerCase().includes(search.toLowerCase())).filter(t=>page!=='assigned'||t.assignedAgent?.id===user.id);
return <div className="app"><header><button className="brand" onClick={()=>nav('dashboard')}><span className="brand-mark"><LifeBuoy/></span><span><b>HelpDesk</b><small>Support portal</small></span></button><div className="account"><span>{user.name}<small>{user.role}</small></span><button className="secondary" onClick={()=>{localStorage.clear();setUser(null)}}><LogOut size={16}/> Log out</button></div></header><div className="layout"><aside><p className="eyebrow">WORKSPACE</p>{navs.map(([p,l,I])=><button key={p} className={'nav '+(page===p?'active':'')} onClick={()=>nav(p)}><I size={18}/>{l}</button>)}<div className="help-card"><b>Need assistance?</b><p>Create a ticket and our support team will follow up.</p></div></aside><main>{error&&<div className="error"><AlertCircle size={18}/>{error}<button onClick={()=>setError('')}>×</button></div>}{notice&&<div className="success"><CheckCircle2 size={18}/>{notice}<button onClick={()=>setNotice('')}>×</button></div>}
{page==='dashboard'&&<><div className="hero"><div><p className="eyebrow">OVERVIEW</p><h1>Good to see you, {user.name.split(' ')[0]}</h1><p className="muted">Here’s what’s happening with your support queue.</p></div><button className="primary" onClick={()=>nav('create')}><PlusCircle size={17}/> New ticket</button></div><div className="stats">{[['Open',stats.open??0],['Assigned',stats.assigned??0],['In progress',stats.in_progress??0],['Resolved',stats.resolved??0]].map(([n,v])=><div className="stat" key={n}><span>{n}</span><strong>{v}</strong><small>Current ticket count</small></div>)}</div><section className="panel"><div className="panel-head"><h2>Recent tickets</h2><button className="link" onClick={()=>nav('tickets')}>View all →</button></div><Tickets items={shown.slice(0,5)} open={open} busy={busy}/></section></>}
{(page==='tickets'||page==='assigned')&&<section className="panel"><div className="panel-head"><div><p className="eyebrow">SUPPORT QUEUE</p><h1>{page==='assigned'?'Assigned to me':admin?'All tickets':agent?'Assigned tickets':'My tickets'}</h1></div><button className="secondary" onClick={refresh}><RefreshCw size={16}/> Refresh</button></div><input className="field search" placeholder="Search tickets..." value={search} onChange={e=>setSearch(e.target.value)}/><Tickets items={shown} open={open} busy={busy} admin={admin} agents={users.filter(u=>u.role==='AGENT')} assign={assign}/></section>}
{page==='create'&&<section className="panel form-panel"><p className="eyebrow">NEW REQUEST</p><h1>Create a support ticket</h1><p className="muted">Tell us what’s wrong and we’ll get the right person on it.</p><form className="stack" onSubmit={create}><Field label="Ticket title" name="title" required maxLength="180" placeholder="e.g. Unable to access my account"/><label>Description<textarea className="field" name="description" required maxLength="10000" rows="5" placeholder="Describe the issue and what you tried…"/></label><label>Category<select className="field" name="categoryId" required><option value="">Choose category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Priority<select className="field" name="priority"><option>MEDIUM</option>{priorities.filter(p=>p!=='MEDIUM').map(p=><option key={p}>{p}</option>)}</select></label><button className="primary">Submit ticket <ArrowRight size={16}/></button></form></section>}
{page==='detail'&&selected&&<><section className="panel"><button className="link" onClick={()=>nav('tickets')}>← Back to tickets</button><div className="panel-head"><div><p className="eyebrow">TICKET #{selected.id}</p><h1>{selected.title}</h1></div><Badge>{selected.status}</Badge></div><p className="description">{selected.description}</p><div className="meta"><div><small>Category</small><b>{selected.category?.name}</b></div><div><small>Requester</small><b>{selected.requester?.name}</b></div><div><small>Agent</small><b>{selected.assignedAgent?.name||'Unassigned'}</b></div><div><small>Priority</small><b>{selected.priority}</b></div></div>{(agent||admin)&&<div className="status-tools"><label>Update status<select className="field" value={selected.status} onChange={e=>status(e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><label>Resolution notes<input id="notes" className="field" defaultValue={selected.resolutionNotes||''}/></label><button className="primary" onClick={()=>status(selected.status)}>Save update</button></div>}{user.role==='USER'&&selected.status==='RESOLVED'&&<button className="primary" onClick={()=>status('CLOSED')}>Confirm resolution & close</button>}</section><section className="panel"><h2><MessageSquare size={18}/> Conversation</h2>{comments.map(c=><div className="comment" key={c.id}><b>{c.author?.name||'Team member'}</b><p>{c.body}</p></div>)}{!comments.length&&<p className="muted">No comments yet.</p>}<form className="comment-form" onSubmit={comment}><input className="field" name="body" required placeholder="Write a comment…"/><button className="primary">Send comment</button></form></section></>}
{page==='users'&&admin&&<section className="panel"><p className="eyebrow">ADMINISTRATION</p><h1>User management</h1><form className="user-form" onSubmit={newUser}><input className="field" name="name" placeholder="Full name" required/><input className="field" name="email" type="email" placeholder="Email" required/><input className="field" name="password" type="password" minLength="8" placeholder="Temp password" required/><select className="field" name="role"><option>AGENT</option><option>USER</option><option>ADMIN</option></select><button className="primary">Create</button></form><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><button className="text-red-600 hover:underline" onClick={()=>deleteUser(u.id)}>Delete</button></td></tr>)}</tbody></table></div></section>}</main></div><footer>HelpDesk Support Portal · Technical-training demonstration</footer></div>}
function Tickets({items,open,busy,admin=false,agents=[],assign=()=>{}}){return <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned agent</th><th></th></tr></thead><tbody>{items.map(t=><tr key={t.id}><td><button className="ticket-title" onClick={()=>open(t)}>HD-{String(t.id).padStart(4,'0')}<b>{t.title}</b></button></td><td>{t.category?.name}</td><td>{t.priority}</td><td><Badge>{t.status}</Badge></td><td>{admin?<select className="field compact" value={t.assignedAgent?.id||''} onChange={e=>e.target.value&&assign(t.id,e.target.value)}><option value="">Unassigned</option>{agents.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>:t.assignedAgent?.name||'—'}</td><td><button className="link" onClick={()=>open(t)}>Open →</button></td></tr>)}</tbody></table>{busy&&<p className="empty">Loading tickets…</p>}{!busy&&!items.length&&<p className="empty">No tickets found. Try creating a ticket or adjusting your search.</p>}</div>}
export default App;
