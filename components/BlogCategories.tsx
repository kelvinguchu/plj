'use client';
import { useQuery } from '@tanstack/react-query';
import { getCategories, Category } from '@/lib/blogService';

interface BlogCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function BlogCategories({ selectedCategory, onCategoryChange }: BlogCategoriesProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
          selectedCategory === ''
            ? 'bg-[#F56E0F] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((category: Category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
            selectedCategory === category.id
              ? 'bg-[#F56E0F] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
} 