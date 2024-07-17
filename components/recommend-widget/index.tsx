"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import CategoryRecommendation from '@/components/category-recommend';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const supabase = createClient();

const RecommendationWidget = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      rotateCategory();
    }, 10000); // 10초마다 카테고리 변경

    return () => clearInterval(timer);
  }, [currentCategoryIndex, categories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('id');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(shuffleArray(data));
      setIsLoading(false);
    }
  };

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const rotateCategory = () => {
    setCurrentCategoryIndex((prevIndex) =>
      (prevIndex + 1) % categories.length
    );
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">이런건 어떨까요...</h2>
      {categories.length > 0 && (
        <CategoryRecommendation category={categories[currentCategoryIndex]} />
      )}
      <Button onClick={rotateCategory} className="mt-4">다음 추천</Button>
    </div>
  );
};

export default RecommendationWidget;