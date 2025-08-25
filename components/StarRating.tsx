import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, count = 5 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex justify-center space-x-1">
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => onRatingChange(ratingValue)}
              className="sr-only"
            />
            <StarIcon
              className={`w-8 h-8 transition-colors ${
                ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
              fill={ratingValue <= (hover || rating) ? 'currentColor' : 'none'}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;