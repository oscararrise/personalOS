import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookOpen, Check, ChevronRight, CircleCheck, ClipboardList, Home, LayoutGrid, LogOut, Plus, Sparkles, Trash2, Waves, X } from 'lucide-react'
import { initializeSession, request, today, type Category, type Habit, type HabitEntry, type Note, type Session, type Task } from './api'

type Screen = 'hoy' | 'tareas' | 'notas' | 'habitos'
const navigation: { id: Screen; name: string; icon: typeof Home }[] = [
  { id: 'hoy', name: 'Hoy', icon: Home },
  { id: 'tareas', name: 'Pendientes', icon: LayoutGrid },
  { id: 'notas', name: 'Notas', icon: BookOpen },
  { id: 'habitos', name: 'Hábitos', icon: CircleCheck },
]
const categories: { id: Category; label: string; color: string; description: string }[] = [
  { id: 'urgente', label: 'Urgente', color: '#ef6b62', description: 'Lo que no puede esperar' },
  { id: 'importante', label: 'Importante', color: '#7a78d5', description: 'Lo que te hace avanzar' },
  { id: 'hogar', label: 'Hogar', color: '#50a994', description: 'Tu espacio y tranquilidad' },
  { id: 'algun_dia', label: 'Algún día', color: '#d49c50', description: 'Ideas para después' },
]
const fmt = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' })

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>('hoy')
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [entries, setEntries] = useState<HabitEntry[]>([])
  const [error, setError] = useState('')
  const [composer, setComposer] = useState<'task' | 'note' | 'habit' | null>(null)
  const [draft, setDraft] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [category, setCategory] = useState<Category>('importante')
  const [working, setWorking] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function refresh() {
    const [t, n, h, e] = await Promise.all([
      request<Task[]>('tasks/'), request<Note[]>('notes/'),
      request<Habit[]>('habits/'), request<HabitEntry[]>('habit-entries/'),
    ])
    setTasks(t); setNotes(n); setHabits(h); setEntries(e)
  }
  useEffect(() => {
    initializeSession().then(async user => {
      setSession(user)
      if (user) await refresh()
    }).catch(e => setError(String(e))).finally(() => setLoading(false))
  }, [])
  async function signIn(event: FormEvent) {
    event.preventDefault(); setWorking(true); setError('')
    try {
      const result = await request<Session>('auth/login/', 'POST', { username, password })
      await request('auth/csrf/')
      setSession({ authenticated: true, username: result.username })
      setPassword('')
      await refresh()
    } catch (e) { setError(String(e)) } finally { setWorking(false) }
  }
  async function signOut() {
    try { await request('auth/logout/', 'POST'); setSession(null); setTasks([]); setNotes([]); setHabits([]); setEntries([]) }
    catch (e) { setError(String(e)) }
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || !composer) return
    setWorking(true); setError('')
    try {
      if (composer === 'task') await request('tasks/', 'POST', { title: draft.trim(), category })
      else if (composer === 'note') await request('notes/', 'POST', { title: draft.trim(), content: noteContent })
      else await request('habits/', 'POST', { title: draft.trim() })
      setComposer(null); setDraft(''); setNoteContent(''); await refresh()
    } catch (e) { setError(String(e)) } finally { setWorking(false) }
  }
  async function toggleTask(task: Task) {
    setError('')
    try { await request('tasks/' + task.id + '/', 'PATCH', { done: !task.done }); await refresh() }
    catch (e) { setError(String(e)) }
  }
  async function remove(type: 'tasks' | 'notes' | 'habits', id: number) {
    setError('')
    try { await request(type + '/' + id + '/', 'DELETE'); await refresh() }
    catch (e) { setError(String(e)) }
  }
  async function toggleHabit(habit: Habit) {
    const date = today()
    const entry = entries.find(e => e.habit === habit.id && e.date === date)
    setError('')
    try {
      if (entry) await request('habit-entries/' + entry.id + '/', 'DELETE')
      else await request('habit-entries/', 'POST', { habit: habit.id, date, completed: true })
      await refresh()
    } catch (e) { setError(String(e)) }
  }
  function openComposer(type: 'task' | 'note' | 'habit') { setError(''); setDraft(''); setNoteContent(''); setComposer(type) }
  const remaining = useMemo(() => tasks.filter(t => !t.done), [tasks])
  const completedToday = habits.filter(h => entries.some(e => e.habit === h.id && e.date === today() && e.completed)).length
  if (loading) return <div className="loading"><Waves size={30} /><span>Preparando tu espacio…</span></div>
  if (!session) return <main className="login-shell"><section className="login-card">
    <div className="app-mark"><Waves size={25} /></div>
    <h1>Tu espacio, en orden.</h1>
    <p>Lo importante, en un solo lugar.</p>
    <form onSubmit={signIn}>
      <label>Usuario<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tu usuario" /></label>
      <label>Contraseña<input required autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" /></label>
      <button type="submit" disabled={working} className="button primary">{working ? 'Entrando…' : 'Entrar'} <ChevronRight size={18} /></button>
    </form>
    {error && <p className="error">{error}</p>}
    <small>Acceso privado · PersonalOS</small>
  </section></main>

  const taskRow = (task: Task) => <div className="item-row" key={task.id}>
    <button aria-label={task.done ? 'Marcar pendiente' : 'Completar tarea'} className={'check-circle ' + (task.done ? 'checked' : '')} onClick={() => toggleTask(task)}>{task.done && <Check size={13}/>}</button>
    <div className="item-body"><div className={task.done ? 'done' : ''}>{task.title}</div>{task.due_date && <small>Para {task.due_date}</small>}</div>
    <button className="icon-button subdued" aria-label="Eliminar tarea" onClick={() => remove('tasks', task.id)}><Trash2 size={15}/></button>
  </div>
  const habitRow = (habit: Habit) => {
    const done = entries.some(e => e.habit === habit.id && e.date === today() && e.completed)
    return <div className="item-row" key={habit.id}>
      <button aria-label="Registrar hábito" className={'check-circle ' + (done ? 'checked' : '')} onClick={() => toggleHabit(habit)}>{done && <Check size={13}/>}</button>
      <div className="item-body">{habit.title}</div>
      <span className={'status ' + (done ? 'success' : '')}>{done ? 'Listo' : 'Pendiente'}</span>
      <button className="icon-button subdued" aria-label="Eliminar hábito" onClick={() => remove('habits', habit.id)}><Trash2 size={15}/></button>
    </div>
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="logo"><span className="app-mark small"><Waves size={20}/></span> personal<span>OS</span></div>
      <div className="nav-caption">TU ESPACIO</div>
      <nav>{navigation.map(item => <button key={item.id} className={'nav-item ' + (screen === item.id ? 'active' : '')} onClick={() => setScreen(item.id)}><item.icon size={19}/>{item.name}</button>)}</nav>
      <div className="sidebar-bottom"><div className="avatar">{session.username.charAt(0).toUpperCase()}</div><div className="sidebar-user"><b>{session.username}</b><small>Espacio personal</small></div><button aria-label="Cerrar sesión" className="icon-button" onClick={signOut}><LogOut size={17}/></button></div>
    </aside>
    <main className="main">
      <div className="main-header"><div className="eyebrow">PERSONAL OS · TU DÍA A DÍA</div><button className="button add-top" onClick={() => openComposer('task')}><Plus size={17}/> Nueva tarea</button></div>
      {screen === 'hoy' && <div>
        <header className="page-intro"><div className="eyebrow accent">UN DÍA A LA VEZ</div><h1>Hoy, a tu ritmo<span className="period">.</span></h1><p>{fmt.format(new Date())}. Aquí tienes lo que importa.</p></header>
        <div className="stats"><article className="stat"><ClipboardList size={20}/><small>Tareas pendientes</small><strong>{remaining.length}</strong><span>En tu lista</span></article><article className="stat"><CircleCheck size={20}/><small>Hábitos de hoy</small><strong>{completedToday}<span className="stat-total"> / {habits.length}</span></strong><span>Completados</span></article><article className="stat"><BookOpen size={20}/><small>Notas guardadas</small><strong>{notes.length}</strong><span>Tus ideas</span></article></div>
        <div className="home-columns">
          <section className="panel"><div className="panel-head"><div><h2>En tu radar</h2><p>Tus próximos pendientes</p></div><button onClick={() => setScreen('tareas')}>Ver todos <ChevronRight size={15}/></button></div>{remaining.length ? remaining.slice(0, 4).map(taskRow) : <div className="empty">Sin pendientes por ahora. Disfruta ese espacio.</div>}<button className="text-action" onClick={() => openComposer('task')}><Plus size={15}/> Añadir pendiente</button></section>
          <section className="panel"><div className="panel-head"><div><h2>Pequeños avances</h2><p>Los hábitos de hoy</p></div><button onClick={() => setScreen('habitos')}>Ver todos <ChevronRight size={15}/></button></div>{habits.length ? habits.slice(0, 4).map(habitRow) : <div className="empty">Crea tu primer hábito para empezar.</div>}<button className="text-action" onClick={() => openComposer('habit')}><Plus size={15}/> Crear hábito</button></section>
        </div>
        <div className="tip"><Sparkles size={20}/><div><b>Una cosa a la vez</b><p>Elige tu pendiente más importante y empieza por ahí.</p></div></div>
      </div>}
      {screen === 'tareas' && <div><header className="page-intro"><div className="eyebrow accent">ORGANIZA TU MENTE</div><h1>Tus pendientes<span className="period">.</span></h1><p>Todo tiene su lugar. Concéntrate en lo que sigue.</p></header>
        <div className="section-toolbar"><span>{remaining.length} sin completar</span><button className="button primary" onClick={() => openComposer('task')}><Plus size={16}/> Nueva tarea</button></div>
        <div className="matrix">{categories.map(cat => <section className="panel category-panel" key={cat.id}><div className="category-head"><span className="category-dot" style={{backgroundColor:cat.color}}/><div><h2>{cat.label}</h2><p>{cat.description}</p></div><span className="count">{tasks.filter(t => t.category === cat.id && !t.done).length}</span></div>{tasks.filter(t => t.category === cat.id).length ? tasks.filter(t => t.category === cat.id).map(taskRow) : <div className="empty">Sin tareas aquí todavía.</div>}</section>)}</div>
      </div>}
      {screen === 'notas' && <div><header className="page-intro"><div className="eyebrow accent">IDEAS QUE IMPORTAN</div><h1>Tus notas<span className="period">.</span></h1><p>Un espacio tranquilo para pensar y recordar.</p></header><div className="section-toolbar"><span>{notes.length} notas guardadas</span><button className="button primary" onClick={() => openComposer('note')}><Plus size={16}/> Nueva nota</button></div><div className="note-grid">{notes.length ? notes.map(note => <article className="panel note-card" key={note.id}><div className="note-card-head"><BookOpen size={19}/><button aria-label="Eliminar nota" className="icon-button subdued" onClick={() => remove('notes', note.id)}><Trash2 size={16}/></button></div><h2>{note.title}</h2><p>{note.content || 'Sin contenido'}</p><small>{new Date(note.created_at).toLocaleDateString('es-CO')}</small></article>) : <div className="panel empty">Aquí vivirán tus ideas. Crea tu primera nota.</div>}</div></div>}
      {screen === 'habitos' && <div><header className="page-intro"><div className="eyebrow accent">CONSTANCIA, NO PERFECCIÓN</div><h1>Tus hábitos<span className="period">.</span></h1><p>Los pequeños pasos también cuentan.</p></header><div className="section-toolbar"><span>{completedToday} de {habits.length} completados hoy</span><button className="button primary" onClick={() => openComposer('habit')}><Plus size={16}/> Nuevo hábito</button></div><section className="panel habit-panel">{habits.length ? habits.map(habitRow) : <div className="empty">Aún no hay hábitos. Puedes empezar con uno pequeño.</div>}</section></div>}
      {error && <div className="alert" role="alert">{error}<button aria-label="Cerrar alerta" onClick={() => setError('')}><X size={16}/></button></div>}
    </main>
    <nav className="bottom-nav">{navigation.map(item => <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => setScreen(item.id)}><item.icon size={20}/><small>{item.name}</small></button>)}</nav>
    {composer && <div className="modal-overlay" role="presentation" onMouseDown={() => setComposer(null)}><div className="modal" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}><div className="modal-head"><h2>{composer === 'task' ? 'Nueva tarea' : composer === 'note' ? 'Nueva nota' : 'Nuevo hábito'}</h2><button className="icon-button" aria-label="Cerrar" onClick={() => setComposer(null)}><X size={19}/></button></div><form onSubmit={save}><label>{composer === 'task' ? '¿Qué necesitas hacer?' : composer === 'note' ? 'Título' : 'Nombre del hábito'}<input value={draft} onChange={e => setDraft(e.target.value)} autoFocus maxLength={240} required placeholder={composer === 'task' ? 'Ej. Estudiar inglés 30 minutos' : 'Escribe aquí…'}/></label>{composer === 'task' && <label>Organizar en<select value={category} onChange={e => setCategory(e.target.value as Category)}>{categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}{composer === 'note' && <label>Contenido<textarea rows={5} placeholder="Escribe tus ideas…" value={noteContent} onChange={e => setNoteContent(e.target.value)}/></label>}<button className="button primary modal-submit" type="submit" disabled={working}>{working ? 'Guardando…' : 'Guardar'} <Check size={16}/></button></form></div></div>}
  </div>
}
