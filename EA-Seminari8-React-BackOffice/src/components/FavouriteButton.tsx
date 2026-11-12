import { useStore } from '@nanostores/react';

import { favourites, toggleFavourite } from '../stores/favourites';

interface Props {
  bookId: string;
}

export function FavouriteButton({ bookId }: Props) {
  const ids = useStore(favourites);
  const isFavourite = ids.includes(bookId);

  return (
    <button type="button" className="favourite" onClick={() => toggleFavourite(bookId)}>
      {isFavourite ? '★' : '☆'}
    </button>
  );
}
