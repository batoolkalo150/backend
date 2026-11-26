import React from "react";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Store, UtensilsCrossed, Plus, Search, MapPin, Phone, Star, Trash2, ArrowUpRight, ChefHat, CircleDollarSign, Activity, RefreshCw, X, Menu } from "lucide-react";

const API = "http://localhost:5000/api";
const money = n => `$${Number(n || 0).toFixed(2)}`;

function App() {
  const [page, setPage] = useState("dashboard");
  const [token, setToken] = useState(localStorage.getItem("gastroluxe_token") || "");
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("gastroluxe_user") || "null"); } catch { return null; } });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({name:"",email:"",password:"",role:"restaurant_owner"});
  const [restaurants, setRestaurants] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const emptyRestaurant = {name:"",description:"",cuisine:"",street:"",city:"",state:"",zipCode:"",country:"",phone:"",contactEmail:""};
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const emptyMeal = {name:"",description:"",category:"main course",price:"",restaurant:"",ingredients:"",preparationTime:"",calories:"",isVegetarian:false,isVegan:false,isGlutenFree:false,isSpicy:false};
  const [mealForm, setMealForm] = useState(emptyMeal);

  async function loadData() {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const clientMode = user?.role === "client";
      const restaurantUrl = user?.role === "restaurant_owner" ? `${API}/restaurants/owner/my-restaurants` : clientMode ? `${API}/client/restaurants` : `${API}/restaurants`;
      const mealsUrl = clientMode ? `${API}/client/meals` : `${API}/meals`;
      const [rRes, mRes] = await Promise.all([fetch(restaurantUrl,{headers:authHeaders}), fetch(mealsUrl,{headers:authHeaders})]);
      if (!rRes.ok || !mRes.ok) throw new Error("Could not connect to the API. Check the backend and your MongoDB connection.");
      const [rData, mData] = await Promise.all([rRes.json(), mRes.json()]);
      if (!rData.success || !mData.success) throw new Error("The API returned an unexpected response.");
      const ownedRestaurants = rData.restaurants || [];
      const allMeals = mData.meals || [];
      const visibleMeals = user?.role === "restaurant_owner" ? allMeals.filter(m => ownedRestaurants.some(r => r._id === (m.restaurant?._id || m.restaurant))) : allMeals;
      setRestaurants(ownedRestaurants); setMeals(visibleMeals);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (token) loadData(); else setLoading(false); }, [token]);

  async function authenticate(e) {
    e.preventDefault(); setError("");
    try { const endpoint = authMode === "login" ? "login" : "register"; const res = await fetch(`${API}/auth/${endpoint}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(authForm)}); const data=await res.json(); if(!res.ok || !data.success) throw new Error(data.message || "Authentication failed"); localStorage.setItem("gastroluxe_token",data.token); localStorage.setItem("gastroluxe_user",JSON.stringify(data.user)); setToken(data.token); setUser(data.user); } catch(err) { setError(err.message); }
  }
  function logout(){localStorage.removeItem("gastroluxe_token");localStorage.removeItem("gastroluxe_user");setToken("");setUser(null);setRestaurants([]);setMeals([]);}
  const authHeaders = {"Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{})};
  const canManage = user && ["admin","restaurant_owner"].includes(user.role);

  const filteredRestaurants = useMemo(() => restaurants.filter(r => `${r.name} ${r.address?.city || ""} ${(r.cuisine || []).join(" ")}`.toLowerCase().includes(search.toLowerCase())), [restaurants, search]);
  const filteredMeals = useMemo(() => meals.filter(m => `${m.name} ${m.category}`.toLowerCase().includes(search.toLowerCase())), [meals, search]);

  function editRestaurant(item) {
    setEditTarget({type:"restaurant",id:item._id});
    setRestaurantForm({name:item.name||"",description:item.description||"",cuisine:(item.cuisine||[]).join(", "),street:item.address?.street||"",city:item.address?.city||"",state:item.address?.state||"",zipCode:item.address?.zipCode||"",country:item.address?.country||"",phone:item.contact?.phone||"",contactEmail:item.contact?.email||""});
    setModal("restaurant");
  }
  function editMeal(item) {
    setEditTarget({type:"meal",id:item._id});
    setMealForm({name:item.name||"",description:item.description||"",category:item.category||"main course",price:String(item.price??""),restaurant:item.restaurant?._id||item.restaurant||"",ingredients:(item.ingredients||[]).join(", "),preparationTime:String(item.preparationTime??""),calories:item.calories==null?"":String(item.calories),isVegetarian:!!item.isVegetarian,isVegan:!!item.isVegan,isGlutenFree:!!item.isGlutenFree,isSpicy:!!item.isSpicy});
    setModal("meal");
  }
  async function submitRestaurant(e) {
    e.preventDefault();
    try {
      const payload={name:restaurantForm.name,description:restaurantForm.description,cuisine:restaurantForm.cuisine.split(",").map(x=>x.trim()).filter(Boolean),address:{street:restaurantForm.street,city:restaurantForm.city,state:restaurantForm.state,zipCode:restaurantForm.zipCode,country:restaurantForm.country},contact:{phone:restaurantForm.phone,email:restaurantForm.contactEmail}};
      const editing=editTarget?.type==="restaurant";
      const res = await fetch(`${API}/restaurants${editing?`/${editTarget.id}`:""}`, { method:editing?"PUT":"POST", headers:authHeaders, body:JSON.stringify(payload) });
      const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.message || "Could not save restaurant");
      setRestaurantForm(emptyRestaurant); setEditTarget(null); setModal(""); await loadData();
    } catch(e) { alert(e.message); }
  }
  async function submitMeal(e) {
    e.preventDefault();
    try {
      const editing=editTarget?.type==="meal";
      const res = await fetch(`${API}/meals${editing?`/${editTarget.id}`:""}`, { method:editing?"PUT":"POST", headers:authHeaders, body:JSON.stringify({...mealForm,price:Number(mealForm.price),ingredients:mealForm.ingredients.split(",").map(x=>x.trim()).filter(Boolean),preparationTime:Number(mealForm.preparationTime),calories:mealForm.calories===""?undefined:Number(mealForm.calories)}) });
      const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.message || "Could not save meal");
      setMealForm(emptyMeal); setEditTarget(null); setModal(""); await loadData();
    } catch(e) { alert(e.message); }
  }
  async function removeItem(type, id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API}/${type}/${id}`, { method:"DELETE", headers:authHeaders });
      const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      await loadData();
    } catch(e) { alert(e.message); }
  }

  const nav = [
    { id:"dashboard", label:"Overview", icon:LayoutDashboard },
    { id:"restaurants", label:"Restaurants", icon:Store },
    { id:"meals", label:"Menu & Meals", icon:UtensilsCrossed }
  ];
  const title = nav.find(n => n.id === page)?.label || "Overview";

  if (!token || !user) return <div className="auth-screen"><form className="auth-card" onSubmit={authenticate}><div className="brand-mark"><ChefHat size={25}/></div><div className="eyebrow">GASTROLUXE MANAGEMENT SUITE</div><h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1><p>Connect securely to your restaurant workspace.</p>{error && <div className="error-banner">{error}</div>}{authMode === "register" && <><label>Full name<input required minLength="2" maxLength="50" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})}/></label><label>Account role<select value={authForm.role} onChange={e=>setAuthForm({...authForm,role:e.target.value})}><option value="restaurant_owner">Restaurant Owner</option><option value="client">Client</option></select></label></>}<label>Email<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})}/></label><label>Password<input required type="password" minLength="6" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/></label><button className="primary-btn" type="submit">{authMode === "login" ? "Sign in" : "Create account"}</button><button className="text-link" type="button" onClick={()=>{setAuthMode(authMode === "login" ? "register" : "login");setError("");}}>{authMode === "login" ? "New here? Create an account" : "Already registered? Sign in"}</button></form></div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><ChefHat size={23}/></div><div><b>GASTRO<span>LUXE</span></b><small>MANAGEMENT SUITE</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={page===item.id?"nav-item active":"nav-item"} onClick={()=>{setPage(item.id);setMobileNav(false);setSearch("");}}><item.icon size={18}/><span>{item.label}</span>{page===item.id&&<i/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="online-dot"/> <span>System operational</span><small>VERSION 1.0.0</small></div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu/></button>
        <div><div className="eyebrow">GASTROLUXE / WORKSPACE</div><h1>{title}</h1></div>
        <div className="top-actions"><div className="today-pill"><span/> {user.name} · {user.role.replace("_"," ")}</div><button className="ghost-btn" onClick={logout}>Sign out</button></div>
      </header>
      <section className="content">
        {error && <div className="error-banner"><span>{error}</span><button onClick={loadData}><RefreshCw size={15}/> Retry</button></div>}
        {loading ? <div className="loading-panel"><div className="spinner"/><p>Preparing your workspace...</p></div> : <>
          {page==="dashboard" && <Dashboard restaurants={restaurants} meals={meals} setPage={setPage} setModal={setModal} canManage={canManage}/>}
          {page==="restaurants" && <><div className="section-toolbar"><div><div className="eyebrow">YOUR VENUE PORTFOLIO</div><h2>All Restaurants <span className="count">{restaurants.length}</span></h2></div>{canManage && <button className="primary-btn" onClick={()=>setModal("restaurant")}><Plus size={17}/> Add restaurant</button>}</div><SearchBox value={search} onChange={setSearch} placeholder="Search restaurants, city or cuisine..."/><div className="restaurant-grid">{filteredRestaurants.map(r=><RestaurantCard key={r._id} item={r} onEdit={canManage?()=>editRestaurant(r):undefined} onDelete={canManage?()=>removeItem("restaurants",r._id):undefined}/>)}</div>{filteredRestaurants.length===0&&<Empty title="No restaurants found" text="Add your first restaurant or try another search."/>}</>}
          {page==="meals" && <><div className="section-toolbar"><div><div className="eyebrow">CURATED FOOD & DRINK</div><h2>Menu Collection <span className="count">{meals.length}</span></h2></div>{canManage && <button className="primary-btn" onClick={()=>setModal("meal")}><Plus size={17}/> Add menu item</button>}</div><SearchBox value={search} onChange={setSearch} placeholder="Search meals or categories..."/><div className="meal-grid">{filteredMeals.map(m=><MealCard key={m._id} item={m} onEdit={canManage?()=>editMeal(m):undefined} onDelete={canManage?()=>removeItem("meals",m._id):undefined}/>)}</div>{filteredMeals.length===0&&<Empty title="Your menu is waiting" text="Add your first meal to start building your collection."/>}</>}
        </>}
      </section>
      <footer className="footer"><span>© 2026 GASTROLUXE. ALL RIGHTS RESERVED.</span><span>CRAFTED FOR EXCEPTIONAL HOSPITALITY</span></footer>
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal("");}}><div className="modal"><div className="modal-head"><div><div className="eyebrow">EXPAND YOUR COLLECTION</div><h2>{editTarget ? (modal==="restaurant"?"Edit restaurant":"Edit menu item") : (modal==="restaurant"?"Add restaurant":"Add menu item")}</h2></div><button className="icon-btn" onClick={()=>setModal("")}><X/></button></div>
      {modal==="restaurant" ? <form onSubmit={submitRestaurant} className="form-grid">
        <label className="wide">Restaurant name<input required minLength="2" maxLength="100" value={restaurantForm.name} onChange={e=>setRestaurantForm({...restaurantForm,name:e.target.value})}/></label>
        <label className="wide">Description<textarea required minLength="10" maxLength="500" value={restaurantForm.description} onChange={e=>setRestaurantForm({...restaurantForm,description:e.target.value})}/></label>
        <label className="wide">Cuisine (comma separated)<input required value={restaurantForm.cuisine} onChange={e=>setRestaurantForm({...restaurantForm,cuisine:e.target.value})} placeholder="Arabic, Italian"/></label>
        <label>Street<input required value={restaurantForm.street} onChange={e=>setRestaurantForm({...restaurantForm,street:e.target.value})}/></label><label>City<input required value={restaurantForm.city} onChange={e=>setRestaurantForm({...restaurantForm,city:e.target.value})}/></label>
        <label>State<input required value={restaurantForm.state} onChange={e=>setRestaurantForm({...restaurantForm,state:e.target.value})}/></label><label>ZIP code<input required value={restaurantForm.zipCode} onChange={e=>setRestaurantForm({...restaurantForm,zipCode:e.target.value})}/></label>
        <label>Country<input required value={restaurantForm.country} onChange={e=>setRestaurantForm({...restaurantForm,country:e.target.value})}/></label><label>Phone<input required value={restaurantForm.phone} onChange={e=>setRestaurantForm({...restaurantForm,phone:e.target.value})}/></label>
        <label className="wide">Contact email<input required type="email" value={restaurantForm.contactEmail} onChange={e=>setRestaurantForm({...restaurantForm,contactEmail:e.target.value})}/></label>
        <button className="primary-btn wide submit-btn" type="submit">Save restaurant <ArrowUpRight size={17}/></button>
      </form> : <form onSubmit={submitMeal} className="form-grid">
        <label className="wide">Meal name<input required minLength="2" value={mealForm.name} onChange={e=>setMealForm({...mealForm,name:e.target.value})} placeholder="e.g. Truffle Pasta"/></label>
        <label className="wide">Description<textarea required minLength="5" value={mealForm.description} onChange={e=>setMealForm({...mealForm,description:e.target.value})} placeholder="Describe the dish..."/></label>
        <label>Category<select value={mealForm.category} onChange={e=>setMealForm({...mealForm,category:e.target.value})}><option value="main course">Main Course</option><option value="appetizer">Appetizer</option><option value="dessert">Dessert</option><option value="beverage">Beverage</option><option value="side dish">Side Dish</option></select></label>
        <label>Price (USD)<input required type="number" min="0" step="0.01" value={mealForm.price} onChange={e=>setMealForm({...mealForm,price:e.target.value})} placeholder="12.50"/></label>
        <label className="wide">Ingredients (comma separated)<input required value={mealForm.ingredients} onChange={e=>setMealForm({...mealForm,ingredients:e.target.value})} placeholder="Rice, chicken, spices"/></label><label>Preparation time (minutes)<input required type="number" min="0" value={mealForm.preparationTime} onChange={e=>setMealForm({...mealForm,preparationTime:e.target.value})}/></label><label>Calories<input type="number" min="0" value={mealForm.calories} onChange={e=>setMealForm({...mealForm,calories:e.target.value})}/></label><label className="wide">Restaurant<select required value={mealForm.restaurant} onChange={e=>setMealForm({...mealForm,restaurant:e.target.value})}><option value="">Not assigned</option>{restaurants.map(r=><option key={r._id} value={r._id}>{r.name}</option>)}</select></label>
        <div className="wide"><label><input type="checkbox" checked={mealForm.isVegetarian} onChange={e=>setMealForm({...mealForm,isVegetarian:e.target.checked})}/> Vegetarian</label> <label><input type="checkbox" checked={mealForm.isVegan} onChange={e=>setMealForm({...mealForm,isVegan:e.target.checked})}/> Vegan</label> <label><input type="checkbox" checked={mealForm.isGlutenFree} onChange={e=>setMealForm({...mealForm,isGlutenFree:e.target.checked})}/> Gluten free</label> <label><input type="checkbox" checked={mealForm.isSpicy} onChange={e=>setMealForm({...mealForm,isSpicy:e.target.checked})}/> Spicy</label></div><button className="primary-btn wide submit-btn" type="submit">Save menu item <ArrowUpRight size={17}/></button>
      </form>}
    </div></div>}
  </div>;
}

function Dashboard({restaurants,meals,setPage,setModal,canManage}) {
  const active = restaurants.filter(r=>r.isActive!==false).length;
  const totalValue = meals.reduce((sum,m)=>sum+Number(m.price||0),0);
  <div className="dashboard-bottom">
  <div className="panel recent-panel">
    <div className="panel-heading">
      <div>
        <div className="eyebrow">YOUR VENUES</div>
        <h3>Recent restaurants</h3>
      </div>
      <button className="text-link" onClick={() => setPage("restaurants")}>
        View all <ArrowUpRight size={15} />
      </button>
    </div>

    {restaurants.slice(0, 4).map(r => (
      <div className="recent-row" key={r._id}>
        <div className="mini-restaurant"><Store size={17} /></div>
        <div className="recent-name">
          <b>{r.name}</b>
          <span>{r.address?.city || "Location not set"}</span>
        </div>
        <span className={r.isActive === false ? "status closed" : "status"}>
          {r.isActive === false ? "INACTIVE" : "ACTIVE"}
        </span>
      </div>
    ))}

    {restaurants.length === 0 && (
      <p className="muted">No venues added yet.</p>
    )}
  </div>

  {canManage && (
    <div className="panel quick-panel">
      <div className="eyebrow">QUICK ACTIONS</div>
      <h3>Make it happen.</h3>

      <button onClick={() => setModal("restaurant")}>
        <span className="quick-icon"><Store size={18} /></span>
        <span>
          <b>Register a venue</b>
          <small>Add a new restaurant</small>
        </span>
        <ArrowUpRight size={17} />
      </button>

      <button onClick={() => setModal("meal")}>
        <span className="quick-icon"><UtensilsCrossed size={18} /></span>
        <span>
          <b>Create menu item</b>
          <small>Expand your food collection</small>
        </span>
        <ArrowUpRight size={17} />
      </button>
    </div>
  )}
</div>
}
function Stat({icon:Icon,label,value,note,live}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><Icon size={18}/></div><div className="stat-value">{value}</div><div className="stat-note">{live&&<i/>}{note}</div></div>; }
function RestaurantCard({item,onDelete,onEdit}) { return <article className="restaurant-card"><div className="restaurant-cover"><div className="cover-pattern"><ChefHat size={48}/></div><span className={item.isActive===false?"status-badge inactive":"status-badge"}>{item.isActive===false?"INACTIVE":"OPEN FOR BUSINESS"}</span><div className="card-actions">{onEdit && <button className="edit-btn" onClick={onEdit}>Edit</button>}{onDelete && <button className="delete-btn" title="Delete" onClick={onDelete}><Trash2 size={16}/></button>}</div><span className="cover-number">G / VENUE</span></div><div className="restaurant-card-body"><div className="cuisine">{(item.cuisine||[]).join(" · ")||"RESTAURANT"}</div><h3>{item.name}</h3><p>{item.description||"A distinctive dining destination."}</p><div className="restaurant-meta"><span><MapPin size={14}/>{item.address?.city||"Location not set"}{item.address?.country?`, ${item.address.country}`:""}</span><span><Star size={14}/>{item.rating??0}</span></div>{item.contact?.phone&&<div className="phone-line"><Phone size={14}/>{item.contact.phone}</div>}</div></article>; }
function MealCard({item,onDelete,onEdit}) { return <article className="meal-card"><div className="meal-art"><div className="plate"><UtensilsCrossed size={33}/></div><span>{item.category||"MENU ITEM"}</span><div className="card-actions">{onEdit && <button className="edit-btn" onClick={onEdit}>Edit</button>}{onDelete && <button className="delete-btn" onClick={onDelete}><Trash2 size={16}/></button>}</div></div><div className="meal-info"><div><h3>{item.name}</h3><p>{item.description||"Freshly prepared with care."}</p></div><b>{money(item.price)}</b></div></article>; }
function SearchBox({value,onChange,placeholder}) { return <div className="search-wrap"><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>; }
function Empty({title,text}) { return <div className="empty-state"><div><UtensilsCrossed size={26}/></div><h3>{title}</h3><p>{text}</p></div>; }
export default App;