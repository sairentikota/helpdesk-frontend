const API=import.meta.env.VITE_API_URL||'https://helpdesk-backend-1-wgcd.onrender.com/api';
export async function request(path,opts={}){const token=localStorage.getItem('token');const res=await fetch(API+path,{...opts,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...(opts.headers||{})}});if(!res.ok){let msg=`Request failed (${res.status})`;try{msg=(await res.json()).error||msg}catch{}throw new Error(msg)}if(res.status===204)return null;return res.json()}
export const login=d=>request('/auth/login',{method:'POST',body:JSON.stringify(d)});
export const register=d=>request('/auth/register',{method:'POST',body:JSON.stringify(d)});
