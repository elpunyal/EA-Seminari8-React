import { atom } from 'nanostores';

// ids dels llibres favorits, els agafo del localStorage
export const favourites = atom<string[]>(JSON.parse(localStorage.getItem('favourites') || '[]'));

// quan canvia la llista la guardo
favourites.listen((ids) => {
  localStorage.setItem('favourites', JSON.stringify(ids));
});

// si ja és favorit el trec, si no l'afegeixo
export function toggleFavourite(id: string) {
  const current = favourites.get();
  if (current.includes(id)) {
    favourites.set(current.filter((favId) => favId !== id));
  } else {
    favourites.set([...current, id]);
  }
}
