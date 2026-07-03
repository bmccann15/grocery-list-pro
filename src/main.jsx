import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, ShoppingCart, Trash2, RotateCcw, CheckCircle2, Circle, Pencil, X, Sparkles, Search, Download, Upload } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'grocery-list-pro-v1';

const SECTION_ORDER = [
  'Produce', 'Bakery & Bread', 'Meat & Seafood', 'Dairy', 'Deli', 'Frozen',
  'Pantry', 'Mexican & International', 'Snacks', 'Drinks', 'Breakfast',
  'Condiments & Sauces', 'Baking', 'Household', 'Personal Care', 'Pet', 'Other'
];

const SECTION_COLORS = {
  'Produce': 'section-produce',
  'Bakery & Bread': 'section-bakery',
  'Meat & Seafood': 'section-meat',
  'Dairy': 'section-dairy',
  'Deli': 'section-deli',
  'Frozen': 'section-frozen',
  'Pantry': 'section-pantry',
  'Mexican & International': 'section-mexican',
  'Snacks': 'section-snacks',
  'Drinks': 'section-drinks',
  'Breakfast': 'section-breakfast',
  'Condiments & Sauces': 'section-condiments',
  'Baking': 'section-baking',
  'Household': 'section-household',
  'Personal Care': 'section-care',
  'Pet': 'section-pet',
  'Other': 'section-other'
};

const KEYWORDS = {
  'Produce': ['apple','apples','banana','bananas','berry','berries','strawberry','strawberries','blueberry','blueberries','raspberry','raspberries','grape','grapes','orange','oranges','lemon','lemons','lime','limes','avocado','avocados','lettuce','spinach','kale','arugula','broccoli','zucchini','squash','carrot','carrots','celery','cucumber','cucumbers','tomato','tomatoes','onion','onions','red onion','potato','potatoes','sweet potato','sweet potatoes','pepper','peppers','bell pepper','mushroom','mushrooms','corn','asparagus','green beans','garlic','ginger','cilantro','parsley','basil'],
  'Bakery & Bread': ['bread','sourdough','loaf','rolls','hamburger buns','hot dog buns','buns','bagel','bagels','english muffin','english muffins','tortilla wraps','wraps','pita','naan','croissant','croissants','muffin','muffins','donut','donuts','cake','cookies','bakery'],
  'Meat & Seafood': ['chicken','chicken breast','chicken thighs','ground beef','beef','steak','pork','pork chops','bacon','sausage','chicken sausage','turkey','ground turkey','ham','salmon','cod','shrimp','tuna steak','fish','seafood','burger','burgers','meatballs','ribs'],
  'Dairy': ['milk','cream','half and half','half & half','cheese','cheddar','mozzarella','parmesan','yogurt','greek yogurt','butter','eggs','egg whites','sour cream','cottage cheese','cream cheese','ricotta','feta','goat cheese','oat milk','almond milk'],
  'Deli': ['deli','deli meat','turkey slices','ham slices','roast beef slices','salami','pepperoni','prosciutto','buffalo chicken','prepared chicken salad','potato salad','coleslaw'],
  'Frozen': ['frozen','ice cream','popsicles','waffles','frozen pizza','pizza rolls','frozen fruit','frozen vegetables','nuggets','french fries','fries','tater tots'],
  'Pantry': ['pasta','rice','beans','black beans','kidney beans','chickpeas','lentils','cereal','oats','oatmeal','granola','flour','sugar','olive oil','oil','vinegar','broth','stock','soup','canned','tomato sauce','crushed tomatoes','peanut butter','jelly','jam','honey','maple syrup','protein powder','crackers'],
  'Mexican & International': ['taco','tacos','tortilla','tortillas','salsa','queso','enchilada','fajita','burrito','guacamole','refried beans','taco shells','jalapeno','jalapeño','soy sauce','teriyaki','ramen','curry','naan','sriracha','hoisin','sushi','kimchi'],
  'Snacks': ['chips','pretzels','popcorn','granola bars','protein bar','protein bars','fruit snacks','cookies','crackers','goldfish','trail mix','nuts','almonds','cashews','candy','chocolate'],
  'Drinks': ['water','seltzer','sparkling water','soda','juice','orange juice','apple juice','coffee','tea','sports drink','gatorade','lemonade','iced tea'],
  'Breakfast': ['pancake','pancake mix','waffle mix','syrup','cereal','oatmeal','granola','bacon','breakfast sausage','english muffins'],
  'Condiments & Sauces': ['ketchup','mustard','mayo','mayonnaise','bbq','barbecue sauce','hot sauce','buffalo sauce','ranch','dressing','salad dressing','marinade','pickles','relish','pesto'],
  'Baking': ['baking powder','baking soda','vanilla','vanilla extract','chocolate chips','yeast','frosting','cake mix','brownie mix','sprinkles'],
  'Household': ['paper towels','toilet paper','napkins','plates','cups','trash bags','dish soap','detergent','laundry','sponges','foil','plastic wrap','ziplock','ziploc','cleaner','wipes','batteries'],
  'Personal Care': ['toothpaste','toothbrush','shampoo','conditioner','soap','body wash','deodorant','razor','shaving cream','medicine','tylenol','advil','band aids','sunscreen'],
  'Pet': ['dog food','cat food','treats','dog treats','cat treats','litter','poop bags','pet']
};

function guessSection(raw) {
  const item = raw.toLowerCase().trim();
  let best = { section: 'Other', score: 0 };
  for (const [section, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      const w = word.toLowerCase();
      let score = 0;
      if (item === w) score = 100;
      else if (item.includes(w)) score = w.length + 20;
      else if (w.includes(item) && item.length > 3) score = item.length;
      if (score > best.score) best = { section, score };
    }
  }
  return best.section;
}

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function App() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSection, setEditSection] = useState('Other');
  const fileRef = useRef(null);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(items)), [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter(i => i.done).length;
    return { total, done, left: total - done };
  }, [items]);

  const visibleItems = useMemo(() => items.filter(item => {
    if (filter === 'active' && item.done) return false;
    if (filter === 'checked' && !item.done) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, filter, search]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const section of SECTION_ORDER) groups[section] = [];
    visibleItems.forEach(item => (groups[item.section] || groups.Other).push(item));
    return SECTION_ORDER.map(section => ({ section, items: groups[section] })).filter(g => g.items.length);
  }, [visibleItems]);

  function addItems(event) {
    event?.preventDefault();
    const parts = input.split(/[,\n]/).map(cleanText).filter(Boolean);
    if (!parts.length) return;
    const newItems = parts.map(name => ({
      id: crypto.randomUUID(),
      name,
      section: guessSection(name),
      done: false,
      createdAt: Date.now()
    }));
    setItems(prev => [...newItems, ...prev]);
    setInput('');
  }

  function toggleItem(id) { setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i)); }
  function removeItem(id) { setItems(prev => prev.filter(i => i.id !== id)); }
  function clearChecked() { setItems(prev => prev.filter(i => !i.done)); }
  function resetList() { if (confirm('Clear the entire grocery list?')) setItems([]); }

  function startEdit(item) {
    setEditing(item.id); setEditName(item.name); setEditSection(item.section);
  }
  function saveEdit(id) {
    const nextName = cleanText(editName);
    if (!nextName) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: nextName, section: editSection } : i));
    setEditing(null);
  }

  function exportList() {
    const payload = { app: 'Grocery List Pro', version: '1.0.0', exportedAt: new Date().toISOString(), items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'grocery-list-pro.json'; link.click(); URL.revokeObjectURL(url);
  }

  async function importList(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.items)) throw new Error('Invalid file');
      setItems(data.items.map(i => ({ ...i, id: i.id || crypto.randomUUID(), section: i.section || guessSection(i.name || '') })));
    } catch { alert('That file could not be imported.'); }
    event.target.value = '';
  }

  return <div className="app-shell">
    <header className="hero">
      <div className="hero-top">
        <div className="app-mark" aria-hidden="true"><ShoppingCart size={30}/></div>
        <div><p className="eyebrow">McCann Apps</p><h1>Grocery List Pro</h1></div>
      </div>
      <p className="hero-copy">Add groceries naturally. The app sorts each item by store section and remembers your list on this device.</p>
      <div className="stats">
        <div><strong>{stats.left}</strong><span>left</span></div>
        <div><strong>{stats.done}</strong><span>checked</span></div>
        <div><strong>{stats.total}</strong><span>total</span></div>
      </div>
    </header>

    <main>
      <section className="card add-card">
        <form onSubmit={addItems}>
          <label htmlFor="item-input">Add item or paste several separated by commas</label>
          <div className="add-row">
            <input id="item-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Milk, tortillas, bananas, chicken sausage…" autoComplete="off" />
            <button className="primary" type="submit"><Plus size={20}/>Add</button>
          </div>
        </form>
        <div className="hint"><Sparkles size={16}/> Smart sorting is built in. You can edit any section afterward.</div>
      </section>

      <section className="toolbar">
        <div className="search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search list" /></div>
        <div className="filters">
          {['active','all','checked'].map(f => <button key={f} className={filter===f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
      </section>

      {grouped.length === 0 ? <section className="empty card"><ShoppingCart size={42}/><h2>Your list is ready.</h2><p>Add groceries above and they’ll automatically land in the right aisle.</p></section> :
      <section className="groups">
        {grouped.map(group => <div className="section-card" key={group.section}>
          <div className="section-header"><span className={`dot ${SECTION_COLORS[group.section]}`}></span><h2>{group.section}</h2><span>{group.items.length}</span></div>
          <div className="items">
            {group.items.map(item => <div className={`item ${item.done ? 'done' : ''}`} key={item.id}>
              <button className="check" onClick={() => toggleItem(item.id)} aria-label="Toggle item">{item.done ? <CheckCircle2/> : <Circle/>}</button>
              {editing === item.id ? <div className="edit-panel">
                <input value={editName} onChange={e => setEditName(e.target.value)} />
                <select value={editSection} onChange={e => setEditSection(e.target.value)}>{SECTION_ORDER.map(s => <option key={s}>{s}</option>)}</select>
                <button onClick={() => saveEdit(item.id)}>Save</button><button onClick={() => setEditing(null)}><X size={16}/></button>
              </div> : <>
                <button className="item-name" onClick={() => toggleItem(item.id)}>{item.name}</button>
                <button className="icon-btn" onClick={() => startEdit(item)} aria-label="Edit"><Pencil size={17}/></button>
                <button className="icon-btn danger" onClick={() => removeItem(item.id)} aria-label="Delete"><Trash2 size={17}/></button>
              </>}
            </div>)}
          </div>
        </div>)}
      </section>}

      <section className="actions card">
        <button onClick={clearChecked}><CheckCircle2 size={18}/>Clear checked</button>
        <button onClick={resetList}><RotateCcw size={18}/>Reset list</button>
        <button onClick={exportList}><Download size={18}/>Export</button>
        <button onClick={() => fileRef.current?.click()}><Upload size={18}/>Import</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={importList} hidden />
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
