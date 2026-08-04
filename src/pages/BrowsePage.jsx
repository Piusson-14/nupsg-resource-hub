import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ResourceCard } from '../components/ResourceCard';
import { downloadResource, fetchResources, saveDownload, SEMESTERS, UPSA_DEPARTMENTS } from '../lib/resourceService';

export function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [resources,setResources]=useState([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState(''); const [filters,setFilters]=useState({ level:searchParams.get('level') || '',semester:'',category:'',department:'' }); const [notice,setNotice]=useState('');
  useEffect(()=>{fetchResources().then(setResources).catch(()=>setNotice('The library could not be loaded. Please try again later.')).finally(()=>setLoading(false))},[]);
  const visible=useMemo(()=>resources.filter(r=>{const q=query.toLowerCase();return (!q||[r.title,r.course_code,r.course_name,r.department].join(' ').toLowerCase().includes(q))&&Object.entries(filters).every(([k,v])=>!v||r[k]===v)}),[resources,query,filters]);
  const download=async r=>{try{const {downloadUrl,fileName}=await downloadResource(r);setResources(items=>items.map(x=>x.id===r.id?{...x,downloads:x.downloads+1}:x));saveDownload(downloadUrl,fileName)}catch{setNotice('Download could not be started.')}};
  const filterOptions = { level: ['100', '200', '300', '400'], semester: SEMESTERS, department: UPSA_DEPARTMENTS, category: ['slides', 'past_questions'] };
  return <main className='page-shell browse-page'><div className='page-intro'><p className='eyebrow'>The library</p><h1>Resources for every <span>study session.</span></h1><p>Search by course, then filter the collection to find exactly what you need.</p></div><section className='filters'><div className='search-box'><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search course code, title or department' /></div><div className='filter-row'><span><SlidersHorizontal size={16}/> Filter</span>{[['level','Level'],['semester','Semester'],['department','Department'],['category','Type']].map(([key,label])=><select key={key} value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))}><option value=''>All {label}s</option>{filterOptions[key].map(x=><option key={x} value={x}>{x.replace('_',' ')}</option>)}</select>)}</div></section><div className='results-head'><p><b>{visible.length}</b> resources found</p>{notice&&<p className='notice'>{notice}</p>}</div><section className='resource-grid'>{loading?Array.from({length:6}).map((_,i)=><div key={i} className='skeleton'/>):visible.length?visible.map(r=><ResourceCard key={r.id} resource={r} onDownload={download}/>):<div className='empty-state'><h2>No resources match that search.</h2><p>Try a different course code or remove a filter.</p></div>}</section></main>;
}
