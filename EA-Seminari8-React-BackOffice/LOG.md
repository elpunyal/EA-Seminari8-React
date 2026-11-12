# LOG
Aquest document és la bitàcola del projecte: serveix per registrar el que s'ha fet i quins prompts d'IA s'han fet servir per fer-ho.

## Eines i models d'IA utilitzats
- **Google Gemini**: Model Gemini 3 Flash.
- **Claude Code (Anthropic)**: Assistent d'escriptori i revisió de codi.
- **GitHub Copilot**: Suport i autocompletat a l'editor.

## Registre d'usos de la IA

### Ús 1
**Prompt literal:**
"Com puc crear un store global amb Nanostores per desar una llista de llibres favorits persistida a localStorage en una app de React?"

**Resposta de la IA:** Va proposar utilitzar un `atom` guardant la llista d'objectes complets dels llibres (`Book[]`) i va suggerir crear un custom hook amb `useEffect` que sincronitzés l'estat amb `localStorage` cada cop que canviés el component.

**Incoherències detectades:** Guardar l'objecte `Book` sencer a `localStorage` és una mala pràctica, ja que si es modifiquen dades al servidor (preu, títol o descripció), els favorits locals queden desactualitzats; cal desar només els identificadors (`string[]`). A més, fer la persistència amb un `useEffect` vincula innecessàriament la sincronització al cicle de vida d'un component de React en lloc de fer-ho fora dels components amb els mètodes natius de Nanostores.

**Solució/adaptació manual:** Vam crear `src/stores/favourites.ts` amb un `atom<string[]>` que guarda només els IDs. Per a la inicialització vam llegir directament de `localStorage` amb `JSON.parse(localStorage.getItem('favourites') || '[]')`, i vam fer servir el listener natiu `favourites.listen(...)` per desar els canvis automàticament, seguint el mateix patró (atom + listen) que ja utilitzava `src/stores/viewMode.ts`.

---

### Ús 2
**Prompt literal:**
"Com faig una funció per afegir o treure un ID d'un atom de Nanostores de tipus string[]?"

**Resposta de la IA:** Va proposar una funció que obtenia l'array amb `favourites.get()`, hi feia un `.push(id)` o un `.splice()` directament modificant l'array existent, i després cridava `favourites.set(...)`.

**Incoherències detectades:** Modificar l'array existent directament trenca la immutabilitat. Nanostores i React necessiten una nova referència d'array per detectar que l'estat ha canviat i disparar el re-renderitzat dels components subscrits; si es muta l'array in situ, la interfície pot no actualitzar-se.

**Solució/adaptació manual:** Vam implementar `toggleFavourite(id: string)` assegurant la immutabilitat: si l'ID ja hi és, es genera un nou array filtrat amb `current.filter((favId) => favId !== id)`; si no hi és, es crea un array nou amb l'spread operator `[...current, id]`.

---

### Ús 3
**Prompt literal:**
"Com creo el component FavouriteButton en React amb TypeScript que faci servir Nanostores i alterni entre l'estrella buida i plena?"

**Resposta de la IA:** Va suggerir un component que rebia com a props `isFavourite: boolean` i una funció `onToggle: () => void`, i a més hi afegia un estat local `useState` duplicat i atributs d'accessibilitat com `aria-pressed` i `title`.

**Incoherències detectades:** Passar `isFavourite` per props obliga el component pare a conèixer l'estat dels favorits i fer *prop drilling*, desaprofitant l'avantatge de Nanostores de tenir un estat global accessible des de qualsevol lloc. A més, duplicar l'estat amb `useState` pot generar inconsistències si el llibre es desmarca des d'un altre component. Finalment, afegia complexitat innecessària que l'enunciat no demanava.

**Solució/adaptació manual:** Vam fer que `src/components/FavouriteButton.tsx` rebi únicament `bookId: string`. Dins del component fem `const ids = useStore(favourites)` de `@nanostores/react` per subscriure'l al store global, calculem directament `const isFavourite = ids.includes(bookId)` i cridem `toggleFavourite(bookId)` a l'esdeveniment `onClick`.

---

### Ús 4
**Prompt literal:**
"Com faig la pantalla FavouritesList per mostrar només els llibres favorits? He de crear un endpoint nou a l'API del backend?"

**Resposta de la IA:** Va indicar que calia modificar el backend Express afegint una ruta tipus `GET /books/favourites?ids=...` per carregar de la base de dades MongoDB únicament els llibres seleccionats.

**Incoherències detectades:** Modificar el backend era innecessari i inadequat: com que l'aplicació no disposa d'autenticació ni gestió d'usuaris a la base de dades, els favorits han de residir com a estat al client del navegador. A més, a nivell de frontend no cal cap endpoint nou perquè el hook existent `useApiList(bookService.getBooks)` ja s'encarrega de carregar la llista de llibres, permetent filtrar directament en memòria.

**Solució/adaptació manual:** Vam crear `src/components/FavouritesList.tsx` reutilitzant el hook existent `useApiList(bookService.getBooks)` i vam filtrar els llibres en memòria al client amb `books.filter((book) => ids.includes(book._id))`. Vam aprofitar l'estructura de taula existent amb la fila de missatge buit (`colSpan={6}`) quan no hi ha cap llibre favorit.

---

### Ús 5
**Prompt literal:**
"Com afegeixo la ruta nova de favorits a App.tsx amb React Router i l'enllaç al menú de Navbar.tsx?"

**Resposta de la IA:** Va indicar afegir `<Route path="/favourites" element={<FavouritesList />} />` al final de la llista de rutes a `App.tsx` (després de la ruta comodí) i va proposar utilitzar un component `<Link to="/favourites">Favoritos</Link>` estàndard per a la barra de navegació a `Navbar.tsx`.

**Incoherències detectades:** A React Router v6+, el router puntua les rutes per especificitat (el comodí `*` sempre té la prioritat més baixa), de manera que `/favourites` hauria funcionat tècnicament fins i tot darrere del comodí; situar-la abans no és un requisit d'execució sinó una qüestió de claredat i ordre al fitxer. La incoherència real de la IA va ser proposar un component `<Link>` estàndard per al Navbar en lloc d'un `<NavLink>`, la qual cosa impedia que l'element de menú mostrés l'estil actiu en visitar la pàgina.

**Solució/adaptació manual:** Vam declarar la ruta `/favourites` just abans de `path="*"` a `src/App.tsx` per claredat i bona pràctica, i vam utilitzar `<NavLink to="/favourites">Favoritos</NavLink>` a `src/components/Navbar.tsx` perquè React Router marqui automàticament la pestanya com a activa.

---

### Ús 6
**Prompt literal:**
"Com col·loco el botó FavouriteButton a la taula i a la vista de targetes de BooksList.tsx?"

**Resposta de la IA:** Va proposar afegir la cel·la `<td><FavouriteButton bookId={book._id} /></td>` a cada fila del cos de la taula, però va oblidar afegir la columna buida `<th></th>` a la capçalera (`<thead>`) i no va modificar el `colSpan` de la fila buida.

**Incoherències detectades:** Si s'afegeix un `<td>` a les files sense afegir el corresponent `<th>` a la capçalera, les columnes queden desalineades respecte als títols. A més, en passar la taula de 9 a 10 columnes, el missatge quan no hi ha llibres (`colSpan={9}`) quedava curt i no ocupava l'amplada completa de la taula.

**Solució/adaptació manual:** Vam afegir una capçalera buida `<th></th>` a la segona posició de la taula (després de la portada), vam col·locar el botó a la segona cel·la de cada fila (després de la portada), vam actualitzar el `colSpan` de 9 a 10 per a la fila buida, i vam afegir també el `<FavouriteButton bookId={book._id} />` dins del contenidor `card-actions` per a la vista de targetes.

---

### Ús 7
**Prompt literal:**
"Quin CSS puc aplicar a un botó per mostrar una estrella groga (★/☆) sense fons ni vora, i que canviï suaument el fons quan es passa el ratolí per sobre?"

**Resposta de la IA:** Va proporcionar les regles CSS bàsiques definint `background: transparent`, `border-color: transparent`, `color: #e0a800`, `font-size: 1.2rem` i la pseudoclasse `:hover:not(:disabled)` amb un fons subtil groc clar `#fff6d6`.

**Incoherències detectades:** Cap incoherència detectada. La resposta era correcta, utilitzava propietats estàndard coherents amb els selectors de la resta de botons de l'aplicació i tenia en compte l'estat `:not(:disabled)`.

**Solució/adaptació manual:** Vam afegir directament les regles a `src/index.css` sota la classe `button.favourite` afegint-hi un `padding: 0.1rem 0.4rem` perquè l'estrella quedés visualment centrada tant a les cel·les de la taula com a les targetes de llibres sense augmentar l'alçada de les files.


